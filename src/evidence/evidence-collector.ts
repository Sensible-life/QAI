import type { ConsoleMessage, Page, Request, Response } from "playwright";
import type { ConsoleIssue, Observation, RequestFailure, ResponseIssue } from "../domain/contracts";
import { ArtifactStore } from "./artifact-store";

// EvidenceCollector는 브라우저 실행 중 발생한 콘솔/네트워크 신호를 누적한다.
type TelemetrySnapshot = {
  consoleIssues: ConsoleIssue[];
  responseIssues: ResponseIssue[];
  requestFailures: RequestFailure[];
};

export class EvidenceCollector {
  private consoleIssues: ConsoleIssue[] = [];
  private responseIssues: ResponseIssue[] = [];
  private requestFailures: RequestFailure[] = [];

  constructor(
    private readonly runId: string,
    private readonly artifactStore: ArtifactStore,
  ) {}

  attach(page: Page): void {
    // 오류 로그만 따로 모아 Judge가 잡음보다 장애 신호에 집중할 수 있게 한다.
    page.on("console", (message: ConsoleMessage) => {
      if (message.type() === "error") {
        this.consoleIssues.push({ level: message.type(), message: message.text() });
      }
    });

    page.on("response", (response: Response) => {
      if (response.status() >= 400) {
        this.responseIssues.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
        });
      }
    });

    page.on("requestfailed", (request: Request) => {
      this.requestFailures.push({
        url: request.url(),
        method: request.method(),
        failureText: request.failure()?.errorText ?? "unknown request failure",
      });
    });
  }

  snapshot(): TelemetrySnapshot {
    return {
      consoleIssues: [...this.consoleIssues],
      responseIssues: [...this.responseIssues],
      requestFailures: [...this.requestFailures],
    };
  }

  async captureObservation(page: Page, stepId: string, notes: string[], durationMs: number): Promise<Observation> {
    // 각 step이 끝날 때의 화면과 누적 telemetry를 함께 저장한다.
    const fileName = `${this.runId}-${stepId}.png`;
    await page.screenshot({ path: this.artifactStore.getAbsolutePath(fileName), fullPage: true });
    const snapshot = this.snapshot();
    return {
      stepId,
      url: page.url(),
      screenshotPath: this.artifactStore.toPublicPath(fileName),
      consoleIssues: snapshot.consoleIssues,
      responseIssues: snapshot.responseIssues,
      requestFailures: snapshot.requestFailures,
      durationMs,
      notes,
    };
  }
}
