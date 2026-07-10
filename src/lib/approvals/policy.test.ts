import { describe, expect, it } from "vitest";
import { createApproval, decideApproval, requiresApproval } from "./policy";
import { scenarios } from "@/lib/fixtures/scenarios";
describe("approval policy", () => {
  it("gates state-changing tools", () => { expect(requiresApproval({ name: "send", description: "send", readOnly: false })).toBe(true); expect(requiresApproval({ name: "read", description: "read", readOnly: true })).toBe(false); });
  it("records an explicit decision", () => { const request = createApproval(scenarios[0].proposal); expect(decideApproval(request, "approved").status).toBe("approved"); });
});
