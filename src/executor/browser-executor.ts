import fs from "node:fs";
import { chromium, type BrowserContext, type Page } from "playwright";
import type { FunnelType, Observation, PlanStep, RunInput } from "../domain/contracts";
import { EvidenceCollector } from "../evidence/evidence-collector";

// Executor는 실제 브라우저 조작을 담당한다.
// 저수준 동작은 deterministic하게 유지하고, agent는 상위 orchestration만 맡는다.
type ExecutionResult = {
  observations: Observation[];
  runtimeFacts: string[];
};

const browserCandidates = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/microsoft-edge",
  "/snap/bin/chromium",
];

export function getBrowserExecutable(): string | undefined {
  const override = process.env.PLAYWRIGHT_BROWSER_PATH;
  if (override && fs.existsSync(override)) {
    return override;
  }

  return browserCandidates.find((candidate) => fs.existsSync(candidate));
}

// 샘플 앱 데모에서는 funnel마다 명확한 진입 페이지가 있다.
function resolveTargetUrl(baseUrl: string, funnel: FunnelType): string {
  if (!baseUrl.includes("/sample-app/")) {
    return baseUrl;
  }
  if (funnel === "login") {
    return new URL("/sample-app/login.html", baseUrl).toString();
  }
  if (funnel === "form") {
    return new URL("/sample-app/contact.html", baseUrl).toString();
  }
  return new URL("/sample-app/checkout.html", baseUrl).toString();
}

async function executeCheckout(
  page: Page,
  plan: PlanStep[],
  evidenceCollector: EvidenceCollector,
  input: RunInput,
): Promise<ExecutionResult> {
  // 체크아웃은 v1의 대표 퍼널이라 validation, payment, legal link까지 모두 본다.
  const observations: Observation[] = [];
  const runtimeFacts: string[] = [];
  const targetUrl = resolveTargetUrl(input.url, "checkout");

  for (const step of plan) {
    const startedAt = Date.now();
    const notes: string[] = [];

    if (step.id === "checkout-entry") {
      await page.goto(targetUrl);
      await page.waitForLoadState("domcontentloaded").catch(() => undefined);
      await page.waitForTimeout(1200);
      notes.push("Entered checkout page");
    }

    if (step.id === "checkout-validation") {
      await page.fill("#name", "QA Tester");
      await page.fill("#address", "Seoul QA Street 101");
      await page.fill("#zip", "");
      await page.click("#checkout-submit");
      await page.waitForTimeout(1000);
      const isHidden = await page.evaluate(() => {
        const node = document.querySelector("#zip-error");
        return node ? window.getComputedStyle(node).display === "none" : true;
      });
      runtimeFacts.push(isHidden ? "zip-error-hidden" : "zip-error-visible");
      notes.push("Checked ZIP validation visibility");
    }

    if (step.id === "checkout-payment") {
      await page.fill("#zip", "06011");
      await page.click("#checkout-submit");
      await page.waitForTimeout(1800);
      notes.push("Checked payment confirmation response");
    }

    if (step.id === "checkout-policy") {
      await page.click("#policy-link");
      await page.waitForTimeout(800);
      const latestPage = page.context().pages().slice(-1)[0] ?? page;
      await latestPage.waitForTimeout(800);
      runtimeFacts.push(`policy-url-${latestPage.url()}`);
      notes.push("Checked policy link destination");
    }

    observations.push(
      await evidenceCollector.captureObservation(page, step.id, notes, Date.now() - startedAt),
    );
  }

  return { observations, runtimeFacts };
}

async function executeLogin(
  page: Page,
  plan: PlanStep[],
  evidenceCollector: EvidenceCollector,
  input: RunInput,
): Promise<ExecutionResult> {
  const observations: Observation[] = [];
  const runtimeFacts: string[] = [];
  const targetUrl = resolveTargetUrl(input.url, "login");

  for (const step of plan) {
    const startedAt = Date.now();
    const notes: string[] = [];

    if (step.id === "login-entry") {
      await page.goto(targetUrl);
      await page.waitForLoadState("domcontentloaded").catch(() => undefined);
      await page.waitForTimeout(1000);
      notes.push("Entered login page");
    }

    if (step.id === "login-submit") {
      await page.fill("#email", input.account || "qa@sample.app");
      await page.fill("#password", input.password || "demo1234!");
      await page.click("#login-submit");
      await page.waitForTimeout(1600);
      const cookies = await page.context().cookies();
      runtimeFacts.push(cookies.some((cookie) => cookie.name.includes("session")) ? "session-set" : "session-missing");
      runtimeFacts.push(`login-url-${page.url()}`);
      notes.push("Checked session state after login submit");
    }

    if (step.id === "login-reset") {
      // 텍스트 대신 href 기반 선택자를 쓰면 로케일이 달라도 덜 깨진다.
      await page.click("a[href='./reset-pasword.html']");
      await page.waitForTimeout(800);
      runtimeFacts.push(`reset-url-${page.url()}`);
      notes.push("Checked password reset link");
    }

    observations.push(
      await evidenceCollector.captureObservation(page, step.id, notes, Date.now() - startedAt),
    );
  }

  return { observations, runtimeFacts };
}

async function executeForm(
  page: Page,
  plan: PlanStep[],
  evidenceCollector: EvidenceCollector,
  input: RunInput,
): Promise<ExecutionResult> {
  const observations: Observation[] = [];
  const runtimeFacts: string[] = [];
  const targetUrl = resolveTargetUrl(input.url, "form");

  for (const step of plan) {
    const startedAt = Date.now();
    const notes: string[] = [];

    if (step.id === "form-entry") {
      await page.goto(targetUrl);
      await page.waitForLoadState("domcontentloaded").catch(() => undefined);
      await page.waitForTimeout(1000);
      notes.push("Entered contact form");
    }

    if (step.id === "form-submit") {
      await page.fill("#phone", "01012");
      await page.click("#contact-submit");
      await page.waitForTimeout(700);
      runtimeFacts.push(`toast-initial-${await page.locator(".toast").count()}`);
      await page.waitForTimeout(900);
      runtimeFacts.push(`toast-after-${await page.locator(".toast").count()}`);
      notes.push("Checked success toast duration");
    }

    observations.push(
      await evidenceCollector.captureObservation(page, step.id, notes, Date.now() - startedAt),
    );
  }

  return { observations, runtimeFacts };
}

async function executeGeneric(
  page: Page,
  plan: PlanStep[],
  evidenceCollector: EvidenceCollector,
  input: RunInput,
): Promise<ExecutionResult> {
  // 아직 전용 퍼널 정의가 없는 URL은 최소한의 smoke run만 수행한다.
  const startedAt = Date.now();
  await page.goto(input.url);
  await page.waitForLoadState("domcontentloaded").catch(() => undefined);
  await page.waitForTimeout(1200);
  const observation = await evidenceCollector.captureObservation(
    page,
    plan[0]?.id ?? "generic-smoke",
    ["Ran generic smoke check"],
    Date.now() - startedAt,
  );
  return { observations: [observation], runtimeFacts: [] };
}

export class BrowserExecutor {
  async execute(
    input: RunInput,
    plan: PlanStep[],
    evidenceCollector: EvidenceCollector,
  ): Promise<ExecutionResult> {
    // 로컬 브라우저를 재사용해 별도 Playwright 브라우저 다운로드 없이 데모를 돌릴 수 있게 한다.
    const executablePath = getBrowserExecutable();
    if (!executablePath) {
      throw new Error("Could not find a local Chrome or Edge executable for Playwright.");
    }

    const browser = await chromium.launch({ executablePath, headless: true });
    const context: BrowserContext = await browser.newContext({
      viewport: { width: 1440, height: 1080 },
    });
    const page = await context.newPage();
    evidenceCollector.attach(page);

    try {
      if (input.url.includes("/sample-app/") && input.funnel === "checkout") {
        return await executeCheckout(page, plan, evidenceCollector, input);
      }
      if (input.url.includes("/sample-app/") && input.funnel === "login") {
        return await executeLogin(page, plan, evidenceCollector, input);
      }
      if (input.url.includes("/sample-app/") && input.funnel === "form") {
        return await executeForm(page, plan, evidenceCollector, input);
      }
      return await executeGeneric(page, plan, evidenceCollector, input);
    } finally {
      await context.close();
      await browser.close();
    }
  }
}
