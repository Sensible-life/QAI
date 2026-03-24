import type { EnvironmentType, Finding, FunnelType, PlanStep, RunReport } from "../domain/contracts";
import { collectFocusAreas } from "../domain/focus-map";

// Reporter는 내부 판정 결과를 최종 보고서 형태로 묶는다.
function funnelLabel(funnel: string): string {
  if (funnel === "checkout") return "Checkout";
  if (funnel === "login") return "Login";
  return "Form Submission";
}

export class ReporterAgent {
  createReport(
    funnel: FunnelType,
    environment: EnvironmentType,
    hostname: string,
    plan: PlanStep[],
    findings: Finding[],
    priorityNote: string,
  ): RunReport {
    // 심각도 높은 이슈가 하나라도 있으면 v1에서는 바로 release hold로 본다.
    const highCount = findings.filter((item) => item.severity === "high").length;
    const focusAreas = collectFocusAreas(funnel, priorityNote);
    const focusMatchedFindings = findings.filter((finding) => finding.matchesRequestedFocus);
    const risk = highCount > 0 ? "Hold release" : findings.length > 0 ? "Review before ship" : "Ready to ship";
    const verdict =
      highCount > 0
        ? `${funnelLabel(funnel)} flow failed`
        : findings.length > 0
          ? `${funnelLabel(funnel)} flow needs review`
          : `${funnelLabel(funnel)} flow passed`;
    const verdictReason = priorityNote.trim()
      ? focusMatchedFindings.length > 0
        ? `Requested focus "${priorityNote.trim()}" surfaced ${focusMatchedFindings.length} matching finding${focusMatchedFindings.length > 1 ? "s" : ""}.`
        : focusAreas.length > 0
          ? `Requested focus "${priorityNote.trim()}" did not surface a direct matching finding, but the full funnel still requires ${risk.toLowerCase()}.`
          : `Requested focus "${priorityNote.trim()}" was recorded and the full funnel verdict is based on the observed evidence.`
      : "The verdict is based on verified funnel evidence collected during the run.";

    return {
      title: `${funnelLabel(funnel)} QA Report · ${environment.toUpperCase()} · ${hostname}`,
      risk,
      requestSummary: priorityNote.trim() || null,
      verdictReason,
      stats: [
        { label: "Findings", value: `${findings.length}` },
        { label: "High severity", value: `${highCount}` },
        { label: "Verdict", value: verdict },
        ...(priorityNote.trim() ? [{ label: "Focus matches", value: `${focusMatchedFindings.length}` }] : []),
        ...(priorityNote.trim() ? [{ label: "Requested focus", value: priorityNote.trim() }] : []),
      ],
      steps: plan.map((step) => step.label),
      findings,
    };
  }
}
