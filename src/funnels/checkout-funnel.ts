import type { PlanStep } from "../domain/contracts";

// 체크아웃 퍼널에서 반드시 밟아야 할 경로를 정적 계획으로 정의한다.
export function buildCheckoutPlan(): PlanStep[] {
  return [
    {
      id: "checkout-entry",
      label: "Enter checkout page",
      goal: "Reach the checkout surface from the provided entry point",
      successCriteria: "Checkout page loads successfully",
      fallbackActions: ["Search for checkout CTA on the landing page", "Navigate directly to a checkout route"],
    },
    {
      id: "checkout-validation",
      label: "Inspect address validation",
      goal: "Trigger required-field validation and verify the user sees it",
      successCriteria: "ZIP validation message is visible after invalid submit",
      fallbackActions: ["Inspect aria-invalid state", "Inspect helper text visibility"],
    },
    {
      id: "checkout-payment",
      label: "Submit payment",
      goal: "Submit the checkout form and inspect the payment confirmation request",
      successCriteria: "Payment completes or redirect to a success state occurs",
      fallbackActions: ["Wait for API response", "Inspect payment request failures"],
    },
    {
      id: "checkout-policy",
      label: "Open policy link",
      goal: "Verify legal and policy links point to a valid destination",
      successCriteria: "Policy page opens successfully",
      fallbackActions: ["Inspect href directly"],
    },
  ];
}
