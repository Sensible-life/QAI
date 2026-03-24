// QAI 전역에서 공유하는 핵심 데이터 계약이다.
// 서버, 오케스트레이터, 브라우저 실행기, 프론트가 모두 이 타입을 기준으로 통신한다.
export type FunnelType = "login" | "checkout" | "form";
export type EnvironmentType = "preview" | "staging" | "production";
export type RunStatus = "queued" | "running" | "completed" | "failed";
export type RunPhase =
  | "queued"
  | "discovering"
  | "planning"
  | "executing"
  | "investigating"
  | "verifying"
  | "reporting"
  | "done"
  | "failed";

export type RunInput = {
  url: string;
  account: string;
  password: string;
  environment: EnvironmentType;
  funnel: FunnelType;
  priorityNote: string;
};

export type LogEntry = {
  at: string;
  message: string;
};

export type PlanStep = {
  id: string;
  label: string;
  goal: string;
  successCriteria: string;
  fallbackActions: string[];
  priorityHint?: string;
};

export type DiscoveryArtifact = {
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

export type ConsoleIssue = {
  level: string;
  message: string;
};

export type ResponseIssue = {
  url: string;
  status: number;
  statusText: string;
};

export type RequestFailure = {
  url: string;
  method: string;
  failureText: string;
};

export type Observation = {
  stepId: string;
  url: string;
  screenshotPath?: string;
  consoleIssues: ConsoleIssue[];
  responseIssues: ResponseIssue[];
  requestFailures: RequestFailure[];
  durationMs: number;
  notes: string[];
};

export type Finding = {
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

export type RunReport = {
  title: string;
  risk: string;
  requestSummary: string | null;
  verdictReason: string;
  stats: Array<{
    label: string;
    value: string;
  }>;
  steps: string[];
  findings: Finding[];
};

export type RunRecord = {
  id: string;
  createdAt: string;
  input: RunInput;
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

export type RunSummary = {
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
