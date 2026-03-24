import type { DiscoveryArtifact, FunnelType, PlanStep } from "../domain/contracts";
import { collectFocusAreas } from "../domain/focus-map";
import { buildCheckoutPlan } from "../funnels/checkout-funnel";
import { buildFormPlan } from "../funnels/form-funnel";
import { buildLoginPlan } from "../funnels/login-funnel";

// Planner는 discovery 결과와 선택된 funnel을 바탕으로 실행 계획을 결정한다.
export class PlannerAgent {
  buildPlan(funnel: FunnelType, _discovery: DiscoveryArtifact, priorityNote = ""): PlanStep[] {
    const focusAreas = collectFocusAreas(funnel, priorityNote);
    const focusedStepIds = new Set(focusAreas.flatMap((focus) => focus.stepIds));
    const focusLabelsByStepId = new Map<string, string[]>();

    focusAreas.forEach((focus) => {
      focus.stepIds.forEach((stepId) => {
        const labels = focusLabelsByStepId.get(stepId) ?? [];
        labels.push(focus.label);
        focusLabelsByStepId.set(stepId, labels);
      });
    });

    const annotate = (steps: PlanStep[]): PlanStep[] =>
      steps.map((step) => {
        if (!focusedStepIds.has(step.id)) {
          return step;
        }

        const focusLabels = focusLabelsByStepId.get(step.id) ?? [];
        return {
          ...step,
          label: `${step.label} [Priority]`,
          goal: `${step.goal}. User requested extra attention on ${focusLabels.join(" and ")}.`,
          priorityHint: priorityNote.trim(),
        };
      });

    if (funnel === "login") {
      return annotate(buildLoginPlan());
    }
    if (funnel === "form") {
      return annotate(buildFormPlan());
    }
    return annotate(buildCheckoutPlan());
  }
}
