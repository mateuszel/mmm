import { getScenario } from "@/lib/fixtures/scenarios";
import type { PartnerAdapter } from "./types";
import type { PartnerMode } from "@/types/domain";
export class MockPartnerAdapter implements PartnerAdapter {
  constructor(readonly mode: PartnerMode) {}
  async loadScenario() { return getScenario(this.mode); }
  async simulate(actionId: string) { return { ok: true as const, summary: `Simulated ${actionId}; no external call was made.` }; }
}
