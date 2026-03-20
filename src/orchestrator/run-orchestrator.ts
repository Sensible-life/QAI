import { chromium } from "playwright";
import { DiscoveryAgent } from "../agents/discovery-agent";
import { JudgeAgent } from "../agents/judge-agent";
import { PlannerAgent } from "../agents/planner-agent";
import { ReporterAgent } from "../agents/reporter-agent";
import type { RunInput, RunPhase, RunRecord } from "../domain/contracts";
import { ArtifactStore } from "../evidence/artifact-store";
import { EvidenceCollector } from "../evidence/evidence-collector";
import { BrowserExecutor, getBrowserExecutable } from "../executor/browser-executor";
import { RunStore } from "../store/run-store";
import { Verifier } from "../verification/verifier";

// 오케스트레이터는 QAI의 중심 상태 머신이다.
// 각 agent를 순서대로 호출하고 run store에 단계별 상태를 반영한다.
export class RunOrchestrator {
  constructor(
    private readonly runStore: RunStore,
    private readonly discoveryAgent = new DiscoveryAgent(),
    private readonly plannerAgent = new PlannerAgent(),
    private readonly browserExecutor = new BrowserExecutor(),
    private readonly judgeAgent = new JudgeAgent(),
    private readonly verifier = new Verifier(),
    private readonly reporterAgent = new ReporterAgent(),
  ) {}

  private createRun(input: RunInput): RunRecord {
    return {
      id: `run_${Date.now()}`,
      createdAt: new Date().toISOString(),
      input,
      status: "queued",
      phase: "queued",
      progress: 0,
      logs: [],
      discovery: null,
      plan: [],
      observations: [],
      report: null,
      error: null,
    };
  }

  private pushLog(run: RunRecord, message: string): void {
    run.logs.push({ at: new Date().toISOString(), message });
    this.runStore.upsert(run);
  }

  private transition(run: RunRecord, phase: RunPhase, progress: number): void {
    // phase와 status를 항상 함께 갱신해 프론트가 polling만으로 상태를 그릴 수 있게 한다.
    run.status = phase === "done" ? "completed" : phase === "failed" ? "failed" : "running";
    run.phase = phase;
    run.progress = progress;
    this.runStore.upsert(run);
  }

  async start(input: RunInput): Promise<RunRecord> {
    const run = this.createRun(input);
    this.runStore.upsert(run);

    // 비동기 실행으로 바로 run id를 반환하고, 실제 브라우저 작업은 뒤에서 계속 진행한다.
    this.execute(run).catch((error: Error) => {
      run.error = error.message;
      this.transition(run, "failed", 100);
      this.pushLog(run, `Run failed: ${error.message}`);
    });

    return run;
  }

  private async runDiscovery(run: RunRecord): Promise<void> {
    const executablePath = getBrowserExecutable();
    if (!executablePath) {
      throw new Error("Could not find a local Chrome or Edge executable for discovery.");
    }

    const browser = await chromium.launch({ executablePath, headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1080 } });
    const page = await context.newPage();
    try {
      run.discovery = await this.discoveryAgent.discover(page, run.input.url, run.input.funnel);
      this.runStore.upsert(run);
    } finally {
      await context.close();
      await browser.close();
    }
  }

  private async execute(run: RunRecord): Promise<void> {
    // v1의 agent workflow: discovery -> planning -> execution -> judging -> verifying -> reporting
    const hostname = new URL(run.input.url).hostname;
    const artifactStore = new ArtifactStore();

    this.transition(run, "discovering", 10);
    this.pushLog(run, "Discovery Agent is scanning the entry page.");
    await this.runDiscovery(run);

    this.transition(run, "planning", 24);
    run.plan = this.plannerAgent.buildPlan(run.input.funnel, run.discovery!);
    this.pushLog(run, "Planner Agent built the target funnel plan.");
    this.runStore.upsert(run);

    this.transition(run, "executing", 48);
    this.pushLog(run, "Browser Executor started the live browser session.");
    const evidenceCollector = new EvidenceCollector(run.id, artifactStore);
    const execution = await this.browserExecutor.execute(run.input, run.plan, evidenceCollector);
    run.observations = execution.observations;
    this.runStore.upsert(run);

    this.transition(run, "investigating", 68);
    this.pushLog(run, "Judge Agent is classifying findings from the collected evidence.");
    const judgedFindings = this.judgeAgent.judge(
      run.input.funnel,
      run.plan,
      run.observations,
      execution.runtimeFacts,
    );

    this.transition(run, "verifying", 82);
    this.pushLog(run, "Verifier is confirming high-confidence issues.");
    const verifiedFindings = this.verifier.verify(judgedFindings);

    this.transition(run, "reporting", 92);
    this.pushLog(run, "Reporter Agent is generating the final release verdict.");
    run.report = this.reporterAgent.createReport(
      run.input.funnel,
      run.input.environment,
      hostname,
      run.plan,
      verifiedFindings,
    );
    this.runStore.upsert(run);

    this.transition(run, "done", 100);
  }
}
