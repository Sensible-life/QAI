import fs from "node:fs";
import http, { type IncomingMessage, type ServerResponse } from "node:http";
import path from "node:path";
import { runInputSchema } from "./domain/schemas";
import { RunOrchestrator } from "./orchestrator/run-orchestrator";
import { RunQueue } from "./queue/run-queue";
import { RunStore } from "./store/run-store";

// 별도 프레임워크 없이 정적 파일과 API를 함께 서빙하는 v1 엔트리 서버다.
const root = process.cwd();
const port = Number(process.env.PORT || 3000);
const runStore = new RunStore();
const runOrchestrator = new RunOrchestrator(runStore);
const runQueue = new RunQueue();

const mimeTypes: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
};

function sendJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function sendText(response: ServerResponse, statusCode: number, payload: string): void {
  response.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(payload);
}

function parseBody(request: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.on("data", (chunk: Buffer) => {
      raw += chunk.toString();
      // 데모 서버라 해도 과도하게 큰 payload는 초기에 차단한다.
      if (raw.length > 1_000_000) {
        reject(new Error("Request body too large"));
      }
    });
    request.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function resolveStaticPath(urlPath: string): string | null {
  // 루트 밖 경로로 빠져나가는 요청을 막기 위한 최소한의 정적 파일 가드다.
  const safePath = decodeURIComponent(urlPath.split("?")[0]);
  const target = safePath === "/" ? "/index.html" : safePath;
  let filePath = path.normalize(path.join(root, `.${target}`));
  if (!filePath.startsWith(root)) {
    return null;
  }
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }
  return filePath;
}

async function handleSampleApi(request: IncomingMessage, response: ServerResponse, pathname: string): Promise<boolean> {
  // 샘플 앱의 의도적 버그를 재현하기 위한 mock endpoint다.
  if (request.method === "POST" && pathname === "/sample-api/login") {
    response.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ ok: false, error: "session creation failed" }));
    return true;
  }
  if (request.method === "POST" && pathname === "/sample-api/payments/confirm") {
    response.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ ok: false, error: "payment confirm failed" }));
    return true;
  }
  if (request.method === "POST" && pathname === "/sample-api/contact") {
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ ok: true }));
    return true;
  }
  return false;
}

async function handleApi(request: IncomingMessage, response: ServerResponse, pathname: string): Promise<boolean> {
  // 실제 제품에서는 여기서 인증, 큐, 권한 체크가 추가될 수 있다.
  if (request.method === "POST" && pathname === "/api/test-runs") {
    const body = await parseBody(request);
    const parsed = runInputSchema.safeParse(body);
    if (!parsed.success) {
      sendJson(response, 400, { error: parsed.error.issues[0]?.message ?? "Invalid input" });
      return true;
    }
    const run = runOrchestrator.create(parsed.data);
    runQueue.enqueue({
      id: run.id,
      run: async () => {
        await runOrchestrator.process(run.id);
      },
    });
    sendJson(response, 201, { id: run.id });
    return true;
  }

  if (request.method === "GET" && pathname === "/api/test-runs") {
    sendJson(response, 200, { items: runStore.list() });
    return true;
  }

  if (request.method === "GET" && pathname === "/api/system/queue") {
    sendJson(response, 200, runQueue.getSnapshot());
    return true;
  }

  if (request.method === "GET" && pathname.startsWith("/api/test-runs/")) {
    const runId = pathname.split("/").pop() ?? "";
    const run = runStore.get(runId);
    if (!run) {
      sendJson(response, 404, { error: "Run not found" });
      return true;
    }
    sendJson(response, 200, run);
    return true;
  }

  return false;
}

http
  .createServer(async (request, response) => {
    const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host}`);
    const pathname = requestUrl.pathname;
    try {
      if (await handleSampleApi(request, response, pathname)) {
        return;
      }
      if (await handleApi(request, response, pathname)) {
        return;
      }
      const filePath = resolveStaticPath(pathname);
      if (!filePath) {
        sendText(response, 400, "Bad request");
        return;
      }
      fs.readFile(filePath, (error, buffer) => {
        if (error) {
          sendText(response, 404, "Not found");
          return;
        }
        response.writeHead(200, {
          "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] ?? "application/octet-stream",
        });
        response.end(buffer);
      });
    } catch (error) {
      sendJson(response, 500, { error: error instanceof Error ? error.message : String(error) });
    }
  })
  .listen(port, () => {
    console.log(`QAI v1 running at http://localhost:${port}`);
  });
