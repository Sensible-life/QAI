import type { Finding, FunnelType, Observation, PlanStep, RunInput } from "../domain/contracts";
import { ArtifactStore } from "../evidence/artifact-store";
import { EvidenceCollector } from "../evidence/evidence-collector";
import { BrowserExecutor } from "../executor/browser-executor";

type VerificationRun = {
  runtimeFacts: string[];
  observations: Observation[];
};

function shouldReplay(finding: Finding): boolean {
  return finding.severity === "high" || finding.confidence >= 0.78;
}

function verificationStepIds(funnel: FunnelType, findingTitle: string): string[] {
  if (funnel === "checkout" && findingTitle === "Payment confirmation API returns 500") {
    return ["checkout-entry", "checkout-payment"];
  }
  if (funnel === "checkout" && findingTitle === "Address validation is not visible to the user") {
    return ["checkout-entry", "checkout-validation"];
  }
  if (funnel === "checkout" && findingTitle === "Policy link points to the wrong path") {
    return ["checkout-entry", "checkout-policy"];
  }
  if (funnel === "login" && findingTitle === "Login submit does not create a session") {
    return ["login-entry", "login-submit"];
  }
  if (funnel === "login" && findingTitle === "Password reset link routes to a 404 path") {
    return ["login-entry", "login-reset"];
  }
  if (funnel === "form" && findingTitle === "Success toast disappears too quickly") {
    return ["form-entry", "form-submit"];
  }
  return [];
}

function filterPlan(plan: PlanStep[], stepIds: string[]): PlanStep[] {
  const stepSet = new Set(stepIds);
  return plan.filter((step) => stepSet.has(step.id));
}

function confirmFinding(
  funnel: FunnelType,
  finding: Finding,
  verificationRun: VerificationRun,
): { confirmed: boolean; note: string } {
  const { runtimeFacts, observations } = verificationRun;

  if (funnel === "checkout" && finding.title === "Payment confirmation API returns 500") {
    const paymentObservation = observations.find((item) => item.stepId === "checkout-payment");
    const confirmed = Boolean(
      paymentObservation?.responseIssues.some(
        (issue) => issue.url.includes("/sample-api/payments/confirm") && issue.status >= 500,
      ),
    );
    return {
      confirmed,
      note: confirmed
        ? "Replay confirmed payment confirmation API failure."
        : "Replay did not reproduce the payment confirmation API failure.",
    };
  }

  if (funnel === "checkout" && finding.title === "Address validation is not visible to the user") {
    const confirmed = runtimeFacts.includes("zip-error-hidden");
    return {
      confirmed,
      note: confirmed
        ? "Replay confirmed that ZIP validation remained hidden."
        : "Replay showed visible ZIP validation, so the issue was not re-confirmed.",
    };
  }

  if (funnel === "checkout" && finding.title === "Policy link points to the wrong path") {
    const policyUrl = runtimeFacts.find((item) => item.startsWith("policy-url-")) ?? "";
    const confirmed = policyUrl.includes("checkot-terms");
    return {
      confirmed,
      note: confirmed
        ? "Replay confirmed the policy link still routes to the wrong destination."
        : "Replay did not reproduce the policy link routing issue.",
    };
  }

  if (funnel === "login" && finding.title === "Login submit does not create a session") {
    const confirmed = runtimeFacts.includes("session-missing");
    return {
      confirmed,
      note: confirmed
        ? "Replay confirmed that login submit still does not create a session."
        : "Replay showed a session was created, so the issue was not re-confirmed.",
    };
  }

  if (funnel === "login" && finding.title === "Password reset link routes to a 404 path") {
    const resetObservation = observations.find((item) => item.stepId === "login-reset");
    const confirmed = Boolean(
      resetObservation?.responseIssues.some(
        (issue) => issue.url.includes("reset-pasword.html") && issue.status === 404,
      ),
    );
    return {
      confirmed,
      note: confirmed
        ? "Replay confirmed the password reset path still returns 404."
        : "Replay did not reproduce the broken password reset path.",
    };
  }

  if (funnel === "form" && finding.title === "Success toast disappears too quickly") {
    const confirmed = runtimeFacts.includes("toast-initial-1") && runtimeFacts.includes("toast-after-0");
    return {
      confirmed,
      note: confirmed
        ? "Replay confirmed the success toast disappears within the observation window."
        : "Replay kept the success toast visible, so the issue was not re-confirmed.",
    };
  }

  return {
    confirmed: finding.confidence >= 0.9,
    note: "No targeted replay rule exists for this finding, so verification fell back to confidence only.",
  };
}

// v2 검증기는 고위험 finding을 최소 step replay로 재확인한다.
export class Verifier {
  constructor(private readonly browserExecutor = new BrowserExecutor()) {}

  async verify(runId: string, input: RunInput, plan: PlanStep[], findings: Finding[]): Promise<Finding[]> {
    const verifiedFindings: Finding[] = [];

    for (const [index, finding] of findings.entries()) {
      if (!shouldReplay(finding)) {
        verifiedFindings.push({
          ...finding,
          verified: false,
          verificationNotes: ["Replay verification was skipped because severity and confidence were below threshold."],
        });
        continue;
      }

      const stepIds = verificationStepIds(input.funnel, finding.title);
      const verificationPlan = filterPlan(plan, stepIds);

      if (!verificationPlan.length) {
        verifiedFindings.push({
          ...finding,
          verified: finding.confidence >= 0.9,
          verificationNotes: ["Replay verification plan was unavailable, so verification fell back to confidence only."],
        });
        continue;
      }

      try {
        const artifactStore = new ArtifactStore();
        const evidenceCollector = new EvidenceCollector(`${runId}-verify-${index + 1}`, artifactStore);
        const verificationRun = await this.browserExecutor.execute(input, verificationPlan, evidenceCollector);
        const confirmation = confirmFinding(input.funnel, finding, verificationRun);

        verifiedFindings.push({
          ...finding,
          verified: confirmation.confirmed,
          verificationNotes: [confirmation.note],
        });
      } catch (error) {
        verifiedFindings.push({
          ...finding,
          verified: false,
          verificationNotes: [
            `Replay verification failed: ${error instanceof Error ? error.message : String(error)}`,
          ],
        });
      }
    }

    return verifiedFindings;
  }
}
