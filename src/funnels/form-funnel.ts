import type { PlanStep } from "../domain/contracts";

// 폼 퍼널은 제출 자체보다도 성공 피드백의 가시성을 확인한다.
export function buildFormPlan(): PlanStep[] {
  return [
    {
      id: "form-entry",
      label: "Enter form page",
      goal: "Reach the form and inspect field structure",
      successCriteria: "Required inputs are available",
      fallbackActions: ["Search for form CTA", "Navigate directly to a contact route"],
    },
    {
      id: "form-submit",
      label: "Submit form",
      goal: "Submit the form and verify visible success feedback",
      successCriteria: "Toast or success state remains visible after submission",
      fallbackActions: ["Wait for toast longer", "Inspect form reset state"],
    },
  ];
}
