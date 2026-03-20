import type { Page } from "playwright";
import type { DiscoveryArtifact, FunnelType } from "../domain/contracts";

// Discovery 단계는 목표 퍼널에 들어가기 전 페이지의 구조적 단서를 수집한다.
export class DiscoveryAgent {
  async discover(page: Page, baseUrl: string, _funnel: FunnelType): Promise<DiscoveryArtifact> {
    await page.goto(baseUrl);
    await page.waitForLoadState("domcontentloaded").catch(() => undefined);
    await page.waitForTimeout(1000);

    return {
      pageTitle: await page.title(),
      visibleTextSnippet: (await page.locator("body").innerText().catch(() => "")).slice(0, 320),
      links: await page
        .locator("a")
        .evaluateAll((anchors) =>
          anchors
            .map((anchor) => anchor.getAttribute("href"))
            .filter((href): href is string => Boolean(href))
            .slice(0, 12),
        ),
      forms: await page.locator("form").evaluateAll((nodes) =>
        nodes.map((node) => ({
          action: node.getAttribute("action"),
          method: node.getAttribute("method"),
          fieldCount: node.querySelectorAll("input, textarea, select").length,
        })),
      ),
      ctaLabels: await page.locator("button, a").evaluateAll((nodes) =>
        nodes
          .map((node) => node.textContent?.trim() ?? "")
          .filter((text) => text.length > 0)
          .slice(0, 15),
      ),
    };
  }
}
