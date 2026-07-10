import type { Scenario } from "@/types/domain";
export interface PartnerAdapter { readonly mode: Scenario["id"]; loadScenario(): Promise<Scenario>; simulate(actionId: string): Promise<{ ok: true; summary: string }> }
