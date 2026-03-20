import { z } from "zod";

// 외부에서 들어오는 run 생성 요청을 가장 먼저 검증하는 스키마다.
export const runInputSchema = z.object({
  url: z.string().url(),
  account: z.string().default(""),
  password: z.string().default(""),
  environment: z.enum(["preview", "staging", "production"]).default("staging"),
  funnel: z.enum(["login", "checkout", "form"]).default("checkout"),
});
