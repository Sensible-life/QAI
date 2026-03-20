import type { EnvironmentType, Finding, PlanStep, RunReport } from "../domain/contracts";

// Reporter는 내부 판정 결과를 최종 보고서 형태로 묶는다.
function funnelLabel(funnel: string): string {
  if (funnel === "checkout") return "Checkout";
  if (funnel === "login") return "Login";
  return "Form Submission";
}

export class ReporterAgent {
  createReport(
    funnel: string,
    environment: EnvironmentType,
    hostname: string,
    plan: PlanStep[],
    findings: Finding[],
  ): RunReport {
    // 심각도 높은 이슈가 하나라도 있으면 v1에서는 바로 release hold로 본다.
    const highCount = findings.filter((item) => item.severity === "high").length;
    const risk = highCount > 0 ? "Hold release" : findings.length > 0 ? "Review before ship" : "Ready to ship";
    const verdict =
      highCount > 0
        ? `${funnelLabel(funnel)} flow failed`
        : findings.length > 0
          ? `${funnelLabel(funnel)} flow needs review`
          : `${funnelLabel(funnel)} flow passed`;

    return {
      title: `${funnelLabel(funnel)} QA Report · ${environment.toUpperCase()} · ${hostname}`,
      risk,
      stats: [
        { label: "Findings", value: `${findings.length}` },
        { label: "High severity", value: `${highCount}` },
        { label: "Verdict", value: verdict },
      ],
      steps: plan.map((step) => step.label),
      findings,
    };
  }
}
