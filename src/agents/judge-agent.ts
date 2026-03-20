import type { Finding, FunnelType, Observation, PlanStep } from "../domain/contracts";

// Judge는 raw evidence를 사람이 읽을 수 있는 finding으로 승격한다.
export class JudgeAgent {
  judge(funnel: FunnelType, _plan: PlanStep[], observations: Observation[], runtimeFacts: string[]): Finding[] {
    if (funnel === "checkout") {
      return this.judgeCheckout(observations, runtimeFacts);
    }
    if (funnel === "login") {
      return this.judgeLogin(observations, runtimeFacts);
    }
    if (funnel === "form") {
      return this.judgeForm(observations, runtimeFacts);
    }
    return [];
  }

  private judgeCheckout(observations: Observation[], runtimeFacts: string[]): Finding[] {
    // 체크아웃은 입력 검증, 결제 API, 약관 링크처럼 실패 비용이 큰 신호를 우선 본다.
    const findings: Finding[] = [];
    const validationObservation = observations.find((item) => item.stepId === "checkout-validation");
    const paymentObservation = observations.find((item) => item.stepId === "checkout-payment");
    const policyObservation = observations.find((item) => item.stepId === "checkout-policy");
    const paymentIssue = paymentObservation?.responseIssues.find((issue) =>
      issue.url.includes("/sample-api/payments/confirm"),
    );

    if (runtimeFacts.includes("zip-error-hidden") && validationObservation?.screenshotPath) {
      findings.push({
        title: "Address validation is not visible to the user",
        severity: "medium",
        summary: "Submitting checkout with a missing ZIP code does not expose a visible validation message.",
        location: "Sample App -> Checkout Address",
        evidence: `Validation message stayed hidden. Screenshot: ${validationObservation.screenshotPath}`,
        flow: ["Checkout", "Fill address", "Leave ZIP empty", "Submit", "No visible guidance"],
        confidence: 0.82,
        verified: false,
      });
    }

    if (paymentIssue && paymentObservation?.screenshotPath) {
      findings.push({
        title: "Payment confirmation API returns 500",
        severity: "high",
        summary: "The checkout flow breaks at the final payment confirmation step.",
        location: "Sample App -> Checkout Payment",
        evidence: `${paymentIssue.url} returned ${paymentIssue.status} ${paymentIssue.statusText}. Screenshot: ${paymentObservation.screenshotPath}`,
        flow: ["Checkout", "Enter address", "Submit payment", "Receive 500 response"],
        confidence: 0.96,
        verified: false,
      });
    }

    const policyUrl = runtimeFacts.find((item) => item.startsWith("policy-url-"));
    if (policyUrl?.includes("checkot-terms") && policyObservation?.screenshotPath) {
      findings.push({
        title: "Policy link points to the wrong path",
        severity: "medium",
        summary: "The legal or policy link on checkout routes the user to an invalid destination.",
        location: "Sample App -> Checkout Policy",
        evidence: `Policy URL resolved to ${policyUrl.replace("policy-url-", "")}. Screenshot: ${policyObservation.screenshotPath}`,
        flow: ["Checkout", "Open policy link", "Land on invalid page"],
        confidence: 0.78,
        verified: false,
      });
    }

    return findings;
  }

  private judgeLogin(observations: Observation[], runtimeFacts: string[]): Finding[] {
    // 로그인은 세션 생성 여부와 계정 복구 경로의 정상 동작을 핵심으로 본다.
    const findings: Finding[] = [];
    const submitObservation = observations.find((item) => item.stepId === "login-submit");
    const resetObservation = observations.find((item) => item.stepId === "login-reset");

    if (runtimeFacts.includes("session-missing") && submitObservation?.screenshotPath) {
      findings.push({
        title: "Login submit does not create a session",
        severity: "high",
        summary: "Submitting valid credentials does not create a session cookie or transition into an authenticated state.",
        location: "Sample App -> Login",
        evidence: `Session cookie was missing after login submit. Screenshot: ${submitObservation.screenshotPath}`,
        flow: ["Login page", "Enter credentials", "Submit", "Session check fails"],
        confidence: 0.92,
        verified: false,
      });
    }

    const resetUrl = runtimeFacts.find((item) => item.startsWith("reset-url-"));
    if (resetUrl?.includes("reset-pasword") && resetObservation?.screenshotPath) {
      findings.push({
        title: "Password reset link routes to a 404 path",
        severity: "medium",
        summary: "The password reset link is broken and does not lead to a valid recovery page.",
        location: "Sample App -> Forgot Password",
        evidence: `Broken reset URL: ${resetUrl.replace("reset-url-", "")}. Screenshot: ${resetObservation.screenshotPath}`,
        flow: ["Login page", "Open forgot password", "404 path appears"],
        confidence: 0.79,
        verified: false,
      });
    }

    return findings;
  }

  private judgeForm(observations: Observation[], runtimeFacts: string[]): Finding[] {
    // 폼은 성공 여부보다도 사용자가 성공을 인지할 수 있는 피드백을 중요하게 본다.
    const findings: Finding[] = [];
    const observation = observations.find((item) => item.stepId === "form-submit");

    if (
      runtimeFacts.includes("toast-initial-1") &&
      runtimeFacts.includes("toast-after-0") &&
      observation?.screenshotPath
    ) {
      findings.push({
        title: "Success toast disappears too quickly",
        severity: "medium",
        summary: "The form succeeds, but the user feedback disappears so fast that success is hard to confirm.",
        location: "Sample App -> Contact Form",
        evidence: `Toast count dropped to zero within the observation window. Screenshot: ${observation.screenshotPath}`,
        flow: ["Contact form", "Submit", "Toast appears", "Toast disappears immediately"],
        confidence: 0.75,
        verified: false,
      });
    }

    return findings;
  }
}
