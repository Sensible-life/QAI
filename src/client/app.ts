// 브라우저에서 API를 호출하고, 실행 상태/결과를 UI에 그리는 프론트 엔트리 파일이다.
// 서버와 분리된 별도 프레임워크 없이도 v1 데모가 동작하도록 단일 모듈로 유지한다.
type FunnelType = "login" | "checkout" | "form";
type EnvironmentType = "preview" | "staging" | "production";
type RunStatus = "queued" | "running" | "completed" | "failed";
type RunPhase =
  | "queued"
  | "discovering"
  | "planning"
  | "executing"
  | "investigating"
  | "verifying"
  | "reporting"
  | "done"
  | "failed";

type LogEntry = {
  at: string;
  message: string;
};

type DiscoveryArtifact = {
  pageTitle: string;
  visibleTextSnippet: string;
  links: string[];
  forms: Array<{
    action: string | null;
    method: string | null;
    fieldCount: number;
  }>;
  ctaLabels: string[];
};

type PlanStep = {
  id: string;
  label: string;
  goal: string;
  successCriteria: string;
  fallbackActions: string[];
  priorityHint?: string;
};

type Observation = {
  stepId: string;
  url: string;
  screenshotPath?: string;
  consoleIssues: Array<{ level: string; message: string }>;
  responseIssues: Array<{ url: string; status: number; statusText: string }>;
  requestFailures: Array<{ url: string; method: string; failureText: string }>;
  durationMs: number;
  notes: string[];
};

type Finding = {
  title: string;
  severity: "high" | "medium";
  summary: string;
  location: string;
  evidence: string;
  flow: string[];
  confidence: number;
  verified: boolean;
  verificationNotes?: string[];
  matchesRequestedFocus?: boolean;
  matchedFocusAreas?: string[];
};

type RunReport = {
  title: string;
  risk: string;
  requestSummary: string | null;
  verdictReason: string;
  stats: Array<{ label: string; value: string }>;
  steps: string[];
  findings: Finding[];
};

type RunRecord = {
  id: string;
  createdAt: string;
  input: {
    url: string;
    account: string;
    password: string;
    environment: EnvironmentType;
    funnel: FunnelType;
    priorityNote: string;
  };
  status: RunStatus;
  phase: RunPhase;
  progress: number;
  logs: LogEntry[];
  discovery: DiscoveryArtifact | null;
  plan: PlanStep[];
  observations: Observation[];
  report: RunReport | null;
  error: string | null;
};

type RunSummary = {
  id: string;
  createdAt: string;
  status: RunStatus;
  phase: RunPhase;
  progress: number;
  funnel: FunnelType;
  environment: EnvironmentType;
  url: string;
  verdict: string | null;
  title: string | null;
};

type RunResponse = {
  items: RunSummary[];
};

type RunCreateResponse = {
  id: string;
};

type GridItem = {
  eyebrow: string;
  title: string;
  body: string;
};

const marketInsights: GridItem[] = [
  {
    eyebrow: "Pain",
    title: "Local success does not mean deploy safety",
    body: "The buyer is not asking for more test code. They want to know whether a preview build is safe to ship.",
  },
  {
    eyebrow: "Wedge",
    title: "Own the last ten minutes before release",
    body: "Checkout, login, and form submission are narrow enough to automate well and painful enough to justify budget.",
  },
  {
    eyebrow: "Trust",
    title: "Evidence matters more than chatty AI output",
    body: "Screenshots, console errors, request failures, and verification are what make an autonomous result usable.",
  },
  {
    eyebrow: "Positioning",
    title: "Release gate, not general test automation",
    body: "That framing avoids a head-on fight with broad testing platforms and keeps the product message sharp.",
  },
];

const investorQuestions: GridItem[] = [
  {
    eyebrow: "Buyer",
    title: "Who pays first?",
    body: "Teams shipping fast without dedicated QA. The pain is immediate and the purchase path is short.",
  },
  {
    eyebrow: "Defensibility",
    title: "Why are open source agents not enough?",
    body: "The moat is orchestration quality, low false positives, evidence packaging, and integration into release decisions.",
  },
  {
    eyebrow: "Reliability",
    title: "How do you avoid hallucinated failures?",
    body: "Low-level actions stay deterministic. High-severity findings need evidence and verification before they reach the report.",
  },
  {
    eyebrow: "Expansion",
    title: "What comes after v1?",
    body: "More funnels, more integrations, and more adaptive planning. The first product still stays narrow around release risk.",
  },
];

const specSections: GridItem[] = [
  {
    eyebrow: "Input",
    title: "URL, account, environment, and requested focus",
    body: "v1 keeps setup small, but now accepts one-line guidance so the run can emphasize the risk area the team actually cares about.",
  },
  {
    eyebrow: "Workflow",
    title: "Discovery, Planning, Execution, Judge, Verify, Report",
    body: "The system acts like a constrained agent, with deterministic browser actions and agentic orchestration on top.",
  },
  {
    eyebrow: "Output",
    title: "Findings plus deploy or hold verdict",
    body: "Every run returns reproducible evidence, a prioritized risk summary, and a clear recommendation for the release.",
  },
  {
    eyebrow: "Trust Boundary",
    title: "Verification before escalation",
    body: "High-severity failures are verified before the verdict is finalized to keep the product usable in real release workflows.",
  },
];

const form = document.querySelector<HTMLFormElement>("#qa-form");
const urlInput = document.querySelector<HTMLInputElement>("#url-input");
const accountInput = document.querySelector<HTMLInputElement>("#account-input");
const passwordInput = document.querySelector<HTMLInputElement>("#password-input");
const environmentInput = document.querySelector<HTMLSelectElement>("#environment-input");
const funnelInput = document.querySelector<HTMLSelectElement>("#funnel-input");
const priorityNoteInput = document.querySelector<HTMLTextAreaElement>("#priority-note-input");
const sampleLink = document.querySelector<HTMLAnchorElement>("#sample-link");
const submitButton = document.querySelector<HTMLButtonElement>("#submit-button");
const runNote = document.querySelector<HTMLElement>("#run-note");
const reportTitle = document.querySelector<HTMLElement>("#report-title");
const reportSummary = document.querySelector<HTMLElement>("#report-summary");
const riskPill = document.querySelector<HTMLElement>("#risk-pill");
const statsGrid = document.querySelector<HTMLElement>("#stats-grid");
const timeline = document.querySelector<HTMLElement>("#timeline");
const findingList = document.querySelector<HTMLElement>("#finding-list");
const logList = document.querySelector<HTMLElement>("#log-list");
const historyList = document.querySelector<HTMLElement>("#history-list");
const observationList = document.querySelector<HTMLElement>("#observation-list");
const insightGrid = document.querySelector<HTMLElement>("#insight-grid");
const qaGrid = document.querySelector<HTMLElement>("#qa-grid");
const specGrid = document.querySelector<HTMLElement>("#spec-grid");

let pollingHandle: number | null = null;

function requireElement<T>(value: T | null, label: string): T {
  if (!value) {
    throw new Error(`Missing required element: ${label}`);
  }
  return value;
}

const dom = {
  form: requireElement(form, "qa-form"),
  urlInput: requireElement(urlInput, "url-input"),
  accountInput: requireElement(accountInput, "account-input"),
  passwordInput: requireElement(passwordInput, "password-input"),
  environmentInput: requireElement(environmentInput, "environment-input"),
  funnelInput: requireElement(funnelInput, "funnel-input"),
  priorityNoteInput: requireElement(priorityNoteInput, "priority-note-input"),
  sampleLink: requireElement(sampleLink, "sample-link"),
  submitButton: requireElement(submitButton, "submit-button"),
  runNote: requireElement(runNote, "run-note"),
  reportTitle: requireElement(reportTitle, "report-title"),
  reportSummary: requireElement(reportSummary, "report-summary"),
  riskPill: requireElement(riskPill, "risk-pill"),
  statsGrid: requireElement(statsGrid, "stats-grid"),
  timeline: requireElement(timeline, "timeline"),
  findingList: requireElement(findingList, "finding-list"),
  logList: requireElement(logList, "log-list"),
  historyList: requireElement(historyList, "history-list"),
  observationList: requireElement(observationList, "observation-list"),
  insightGrid: requireElement(insightGrid, "insight-grid"),
  qaGrid: requireElement(qaGrid, "qa-grid"),
  specGrid: requireElement(specGrid, "spec-grid"),
};

// 문자열은 모두 escape해서 evidence나 로그가 그대로 HTML에 주입되지 않게 한다.
function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isMostlyAscii(value: string | null | undefined): value is string {
  return Boolean(value && /^[\x00-\x7F\s.\-]+$/.test(value));
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString("ko-KR", {
    hour12: false,
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function funnelLabel(funnel: FunnelType): string {
  if (funnel === "checkout") return "Checkout";
  if (funnel === "login") return "Login";
  return "Form";
}

function phaseLabel(phase: RunPhase): string {
  switch (phase) {
    case "discovering":
      return "Discovery";
    case "planning":
      return "Planning";
    case "executing":
      return "Execution";
    case "investigating":
      return "Judge";
    case "verifying":
      return "Verify";
    case "reporting":
      return "Report";
    case "done":
      return "Completed";
    case "failed":
      return "Failed";
    default:
      return "Queued";
  }
}

function renderCards(container: HTMLElement, items: GridItem[], className: string): void {
  container.innerHTML = items
    .map(
      (item) => `
        <article class="${className}">
          <p class="eyebrow">${escapeHtml(item.eyebrow)}</p>
          <h4>${escapeHtml(item.title)}</h4>
          <p>${escapeHtml(item.body)}</p>
        </article>
      `,
    )
    .join("");
}

// 요약 카드가 비어 있을 때도 레이아웃이 흔들리지 않도록 기본값을 넣어 둔다.
function renderStats(run: RunRecord): void {
  const stats = run.report?.stats ?? [
    { label: "Phase", value: phaseLabel(run.phase) },
    { label: "Progress", value: `${run.progress}%` },
    { label: "Funnel", value: funnelLabel(run.input.funnel) },
  ];

  dom.statsGrid.innerHTML = stats
    .map(
      (stat) => `
        <article class="stat-card">
          <span class="eyebrow">${escapeHtml(stat.label)}</span>
          <strong>${escapeHtml(stat.value)}</strong>
        </article>
      `,
    )
    .join("");
}

function renderTimeline(run: RunRecord): void {
  const items = (run.report?.steps.length ? run.report.steps : run.plan.map((step) => step.label)).slice();
  if (!items.length) {
    dom.timeline.innerHTML = `<span class="muted">No plan generated yet.</span>`;
    return;
  }

  dom.timeline.innerHTML = items
    .map(
      (item, index) => `
        <span class="step-chip">${escapeHtml(item)}</span>
        ${index < items.length - 1 ? '<span class="step-arrow">&rarr;</span>' : ""}
      `,
    )
    .join("");
}

// finding은 최종 리포트의 핵심이므로 severity, confidence, repro flow를 한 카드에 묶는다.
function renderFindings(run: RunRecord): void {
  const findings = run.report?.findings ?? [];
  if (!findings.length) {
    dom.findingList.innerHTML = `
      <article class="finding-card">
        <div class="finding-header">
          <div class="finding-title-wrap">
            <h5>No blocking findings yet</h5>
            <span class="tag medium">Waiting</span>
          </div>
        </div>
        <p class="finding-copy">Run the agent to generate verified findings and release guidance.</p>
      </article>
    `;
    return;
  }

  dom.findingList.innerHTML = findings
    .map(
      (finding) => `
        <article class="finding-card">
          <div class="finding-header">
            <div class="finding-title-wrap">
              <h5>${escapeHtml(finding.title)}</h5>
              <span class="tag ${escapeHtml(finding.severity)}">${escapeHtml(finding.severity.toUpperCase())}</span>
              <span class="tag">${finding.verified ? "Verified" : "Candidate"}</span>
              ${finding.matchesRequestedFocus ? '<span class="tag safe">Requested focus</span>' : ""}
            </div>
          </div>
          <p class="finding-copy">${escapeHtml(finding.summary)}</p>
          <p class="finding-meta">${escapeHtml(finding.location)}</p>
          <p class="finding-meta">Confidence: ${Math.round(finding.confidence * 100)}%</p>
          ${
            finding.matchedFocusAreas?.length
              ? `<p class="finding-meta">Focus match: ${escapeHtml(finding.matchedFocusAreas.join(", "))}</p>`
              : ""
          }
          ${
            finding.verificationNotes?.length
              ? `<p class="finding-meta">Verification: ${escapeHtml(finding.verificationNotes.join(" "))}</p>`
              : ""
          }
          <p class="finding-meta">${escapeHtml(finding.evidence)}</p>
          <div class="flow-box">
            <h6>Reproduction flow</h6>
            <div class="flow-row">
              ${finding.flow.map((step) => `<span class="chip">${escapeHtml(step)}</span>`).join("")}
            </div>
          </div>
        </article>
      `,
    )
    .join("");
}

// observation은 각 실행 step의 근거 패킷이다.
function renderObservations(run: RunRecord): void {
  if (!run.observations.length) {
    dom.observationList.innerHTML =
      `<div class="list-item"><strong>No evidence yet</strong><p>Evidence will appear as the agent executes each step.</p></div>`;
    return;
  }

  const discovery = run.discovery
    ? `
      <article class="observation-card">
        <div class="observation-head">
          <div>
            <p class="eyebrow">Discovery</p>
            <h5>${escapeHtml(run.discovery.pageTitle || "Untitled page")}</h5>
          </div>
          <span class="tag">Entry scan</span>
        </div>
        <p class="finding-copy">${escapeHtml(run.discovery.visibleTextSnippet)}</p>
        <p class="finding-meta">Links: ${escapeHtml(run.discovery.links.join(", ") || "none")}</p>
        <p class="finding-meta">CTA labels: ${escapeHtml(run.discovery.ctaLabels.join(", ") || "none")}</p>
      </article>
    `
    : "";

  const observations = run.observations
    .map((observation) => {
      const notes = observation.notes.map((note) => `<span class="chip">${escapeHtml(note)}</span>`).join("");
      const consoleItems = observation.consoleIssues.map((issue) => `<li>${escapeHtml(issue.message)}</li>`).join("");
      const responseItems = observation.responseIssues
        .map((issue) => `<li>${issue.status} ${escapeHtml(issue.statusText)} - ${escapeHtml(issue.url)}</li>`)
        .join("");
      const requestItems = observation.requestFailures
        .map((issue) => `<li>${escapeHtml(issue.method)} ${escapeHtml(issue.url)} - ${escapeHtml(issue.failureText)}</li>`)
        .join("");

      return `
        <article class="observation-card">
          <div class="observation-head">
            <div>
              <p class="eyebrow">${escapeHtml(observation.stepId)}</p>
              <h5>${escapeHtml(observation.url)}</h5>
            </div>
            <span class="tag">${escapeHtml(`${observation.durationMs} ms`)}</span>
          </div>
          <div class="flow-row">${notes || '<span class="muted">No notes</span>'}</div>
          ${
            observation.screenshotPath
              ? `<a class="observation-link" href="${escapeHtml(observation.screenshotPath)}" target="_blank" rel="noreferrer">
                  <img class="observation-image" src="${escapeHtml(observation.screenshotPath)}" alt="${escapeHtml(observation.stepId)} screenshot" />
                </a>`
              : ""
          }
          <div class="observation-grid">
            <div class="observation-box">
              <strong>Console</strong>
              ${consoleItems ? `<ul>${consoleItems}</ul>` : `<p>No console errors.</p>`}
            </div>
            <div class="observation-box">
              <strong>Responses</strong>
              ${responseItems ? `<ul>${responseItems}</ul>` : `<p>No error responses.</p>`}
            </div>
            <div class="observation-box">
              <strong>Requests</strong>
              ${requestItems ? `<ul>${requestItems}</ul>` : `<p>No failed requests.</p>`}
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  dom.observationList.innerHTML = `${discovery}${observations}`;
}

// 로그는 사람이 "에이전트가 지금 뭘 하는지" 파악하기 위한 진행창 역할을 한다.
function renderLogs(run: RunRecord): void {
  if (!run.logs.length) {
    dom.logList.innerHTML = `<div class="list-item"><strong>No run log yet</strong><p>Agent messages will stream here.</p></div>`;
    return;
  }

  dom.logList.innerHTML = run.logs
    .map(
      (log) => `
        <div class="list-item">
          <strong>${escapeHtml(formatDate(log.at))}</strong>
          <p>${escapeHtml(log.message)}</p>
        </div>
      `,
    )
    .join("");
}

// history는 이전 실행을 다시 열어 같은 evidence를 재검토할 수 있게 해 준다.
function renderHistory(items: RunSummary[]): void {
  if (!items.length) {
    dom.historyList.innerHTML = `<div class="list-item"><strong>No previous runs</strong><p>Your completed runs will appear here.</p></div>`;
    return;
  }

  dom.historyList.innerHTML = items
    .map((item) => {
      const title = isMostlyAscii(item.title) ? item.title : `${funnelLabel(item.funnel)} run`;
      const verdict = isMostlyAscii(item.verdict) ? item.verdict : phaseLabel(item.phase);

      return `
        <button class="history-item" data-run-id="${escapeHtml(item.id)}" type="button">
          <strong>${escapeHtml(title)}</strong>
          <span>${escapeHtml(formatDate(item.createdAt))}</span>
          <span>${escapeHtml(item.environment.toUpperCase())} · ${escapeHtml(phaseLabel(item.phase))} · ${escapeHtml(verdict)}</span>
        </button>
      `;
    })
    .join("");
}

function renderRun(run: RunRecord): void {
  const title = run.report?.title ?? `${funnelLabel(run.input.funnel)} run in progress`;
  const risk = run.report?.risk ?? phaseLabel(run.phase);
  const riskClass = run.report?.risk.includes("Ready")
    ? "safe"
    : run.report?.risk.includes("Review")
      ? "warning"
      : run.status === "failed"
        ? "danger"
        : run.status === "completed"
          ? "danger"
          : "progress";

  dom.reportTitle.textContent = title;
  dom.reportSummary.textContent = run.report?.verdictReason ?? "The verdict will explain how the run maps to release risk.";
  dom.riskPill.textContent = risk;
  dom.riskPill.className = `status-pill ${riskClass}`;
  dom.runNote.textContent =
    run.status === "running"
      ? `${phaseLabel(run.phase)} in progress · ${run.progress}%${run.input.priorityNote ? ` · Focus: ${run.input.priorityNote}` : ""}`
      : run.status === "failed"
        ? `Run failed: ${run.error ?? "unknown error"}`
        : `Run completed · ${run.report?.risk ?? "No verdict"}`;

  renderStats(run);
  renderTimeline(run);
  renderFindings(run);
  renderObservations(run);
  renderLogs(run);
}

async function requestJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? `Request failed with ${response.status}`);
  }
  return (await response.json()) as T;
}

// 이력과 상세 조회는 분리해 두어 목록은 가볍게, 상세는 필요할 때만 가져온다.
async function fetchHistory(): Promise<RunSummary[]> {
  const payload = await requestJson<RunResponse>("/api/test-runs");
  renderHistory(payload.items);
  return payload.items;
}

async function fetchRun(runId: string): Promise<RunRecord> {
  const run = await requestJson<RunRecord>(`/api/test-runs/${runId}`);
  renderRun(run);
  return run;
}

// polling은 백엔드의 상태 머신을 그대로 UI에 반영하는 가장 단순한 방식이다.
function stopPolling(): void {
  if (pollingHandle !== null) {
    window.clearTimeout(pollingHandle);
    pollingHandle = null;
  }
}

function startPolling(runId: string): void {
  stopPolling();

  const tick = async () => {
    try {
      const run = await fetchRun(runId);
      if (run.status === "queued" || run.status === "running") {
        pollingHandle = window.setTimeout(tick, 1000);
      } else {
        stopPolling();
        dom.submitButton.disabled = false;
        await fetchHistory();
      }
    } catch (error) {
      stopPolling();
      dom.submitButton.disabled = false;
      dom.runNote.textContent = `Polling failed: ${error instanceof Error ? error.message : String(error)}`;
    }
  };

  pollingHandle = window.setTimeout(tick, 300);
}

async function createRun(): Promise<void> {
  dom.submitButton.disabled = true;
  dom.runNote.textContent = "Creating run...";

  const payload = {
    url: dom.urlInput.value.trim(),
    account: dom.accountInput.value.trim(),
    password: dom.passwordInput.value,
    environment: dom.environmentInput.value as EnvironmentType,
    funnel: dom.funnelInput.value as FunnelType,
    priorityNote: dom.priorityNoteInput.value.trim(),
  };

  try {
    const created = await requestJson<RunCreateResponse>("/api/test-runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    dom.runNote.textContent = "Run created. Waiting for discovery to start...";
    startPolling(created.id);
  } catch (error) {
    dom.submitButton.disabled = false;
    dom.runNote.textContent = `Run creation failed: ${error instanceof Error ? error.message : String(error)}`;
  }
}

function attachEvents(): void {
  dom.form.addEventListener("submit", (event) => {
    event.preventDefault();
    void createRun();
  });

  dom.historyList.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const button = target.closest<HTMLButtonElement>("[data-run-id]");
    if (!button?.dataset.runId) {
      return;
    }

    stopPolling();
    dom.submitButton.disabled = false;
    void fetchRun(button.dataset.runId);
  });
}

// 진입 시 설명 카드와 기본 상태를 먼저 채워 두고, 이후 이력/상세 데이터를 덮어쓴다.
async function bootstrap(): Promise<void> {
  renderCards(dom.insightGrid, marketInsights, "insight-card");
  renderCards(dom.qaGrid, investorQuestions, "question-card");
  renderCards(dom.specGrid, specSections, "panel");

  const sampleUrl = `${window.location.origin}/sample-app/`;
  dom.urlInput.value = sampleUrl;
  dom.sampleLink.href = sampleUrl;

  const emptyRun: RunRecord = {
    id: "",
    createdAt: new Date().toISOString(),
    input: {
      url: sampleUrl,
      account: dom.accountInput.value,
      password: "",
      environment: "staging",
      funnel: "checkout",
      priorityNote: "Focus on payment reliability and visible validation.",
    },
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

  renderStats(emptyRun);
  renderTimeline(emptyRun);
  renderFindings(emptyRun);
  renderObservations(emptyRun);
  renderLogs(emptyRun);

  attachEvents();
  const history = await fetchHistory();
  if (history[0]?.id) {
    await fetchRun(history[0].id);
  }
}

void bootstrap();
