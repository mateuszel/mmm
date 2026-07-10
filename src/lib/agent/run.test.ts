import { describe, expect, it } from "vitest";
import { runDemoAgent } from "./run";
import { scenarios } from "@/lib/fixtures/scenarios";
describe("demo agent", () => { it("completes read-only work and stops for approval", () => { const result = runDemoAgent(scenarios[1]); expect(result.run.steps.at(-1)?.status).toBe("blocked"); expect(result.approval.status).toBe("pending"); expect(result.run.toolCalls.every((call) => call.status === "success")).toBe(true); }); });
