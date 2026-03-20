import fs from "node:fs";
import path from "node:path";
import { type RunRecord, type RunSummary } from "../domain/contracts";

// 실행 이력을 간단한 파일 저장소로 유지한다.
// v1에서는 DB 대신 JSON 파일을 써서 빠르게 상태를 복구할 수 있게 한다.
const dataDir = path.join(process.cwd(), "data");
const runFile = path.join(dataDir, "runs.json");

export class RunStore {
  private readonly runs = new Map<string, RunRecord>();

  constructor() {
    this.load();
  }

  private ensureFile(): void {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(runFile)) {
      fs.writeFileSync(runFile, "[]", "utf8");
    }
  }

  private load(): void {
    this.ensureFile();
    const raw = fs.readFileSync(runFile, "utf8");
    const items = JSON.parse(raw) as RunRecord[];
    items.forEach((item) => {
      this.runs.set(item.id, item);
    });
  }

  private persist(): void {
    this.ensureFile();
    // 최근 실행만 남겨 두어 파일이 무한히 커지는 것을 막는다.
    const items = Array.from(this.runs.values())
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
      .slice(0, 50);
    fs.writeFileSync(runFile, JSON.stringify(items, null, 2), "utf8");
  }

  upsert(run: RunRecord): RunRecord {
    this.runs.set(run.id, run);
    this.persist();
    return run;
  }

  get(id: string): RunRecord | null {
    return this.runs.get(id) ?? null;
  }

  list(): RunSummary[] {
    return Array.from(this.runs.values())
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
      .map((run) => ({
        id: run.id,
        createdAt: run.createdAt,
        status: run.status,
        phase: run.phase,
        progress: run.progress,
        funnel: run.input.funnel,
        environment: run.input.environment,
        url: run.input.url,
        verdict: run.report?.risk ?? null,
        title: run.report?.title ?? null,
      }));
  }
}
