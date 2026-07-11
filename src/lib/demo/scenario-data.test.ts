import { describe, expect, it } from "vitest";
import { callLines, retailSources, scenarios, stageAt } from "./scenario-data";

describe("deterministic demo timelines", () => {
  it("holds each scenario on an explicit final state", () => {
    for (const scenario of Object.values(scenarios)) {
      const final = stageAt(scenario, scenario.durationMs);
      expect(final.finalState).toBe(true);
      expect(final.durationMs).toBeNull();
      expect(final.startMs).toBe(scenario.durationMs);
    }
  });

  it("fits the pitch recording window", () => {
    expect(scenarios.retail.durationMs).toBe(20_000);
    expect(scenarios.private.durationMs).toBe(19_000);
    expect(scenarios.foreign.durationMs).toBe(35_000);
    expect(Object.values(scenarios).reduce((total, item) => total + item.durationMs, 0)).toBe(74_000);
  });

  it("narrows eight retail sources to the two captured finalists", () => {
    expect(retailSources).toHaveLength(8);
    expect(retailSources.filter((source) => source.tone === "candidate").map((source) => source.name)).toEqual(["adidas", "eobuwie"]);
  });

  it("keeps the call transcript and risk timestamps inside 31 seconds", () => {
    expect(callLines[0].startMs).toBe(0);
    expect(callLines.at(-1)?.endMs).toBe(31_000);
    expect(callLines.filter((line) => line.risk)).toHaveLength(4);
    expect(callLines.some((line) => line.risk?.includes("Critical risk"))).toBe(true);
  });

  it("keeps price history optional for future scenarios", () => {
    expect(scenarios.retail.priceHistory).toBeUndefined();
  });
});
