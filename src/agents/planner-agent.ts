import type { DiscoveryArtifact, FunnelType, PlanStep } from "../domain/contracts";
import { buildCheckoutPlan } from "../funnels/checkout-funnel";
import { buildFormPlan } from "../funnels/form-funnel";
import { buildLoginPlan } from "../funnels/login-funnel";

// Planner는 discovery 결과와 선택된 funnel을 바탕으로 실행 계획을 결정한다.
export class PlannerAgent {
  buildPlan(funnel: FunnelType, _discovery: DiscoveryArtifact): PlanStep[] {
    if (funnel === "login") {
      return buildLoginPlan();
    }
    if (funnel === "form") {
      return buildFormPlan();
    }
    return buildCheckoutPlan();
  }
}
