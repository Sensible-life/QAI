import type { PlanStep } from "../domain/contracts";

// 로그인 퍼널은 인증 성공 여부와 계정 복구 경로를 함께 본다.
export function buildLoginPlan(): PlanStep[] {
  return [
    {
      id: "login-entry",
      label: "Enter login page",
      goal: "Reach the login form",
      successCriteria: "Email and password fields are available",
      fallbackActions: ["Search for login CTA", "Navigate directly to a login route"],
    },
    {
      id: "login-submit",
      label: "Submit login form",
      goal: "Submit valid credentials and verify session creation",
      successCriteria: "Session cookie is set or user reaches authenticated screen",
      fallbackActions: ["Inspect response code", "Inspect visible error banner"],
    },
    {
      id: "login-reset",
      label: "Open password reset path",
      goal: "Verify the password reset path is reachable",
      successCriteria: "Reset page loads successfully",
      fallbackActions: ["Inspect href directly"],
    },
  ];
}
