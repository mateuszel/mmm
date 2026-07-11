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
    expect(scenarios.retail.durationMs).toBe(22_500);
    expect(scenarios.private.durationMs).toBe(21_500);
    expect(scenarios.foreign.durationMs).toBeCloseTo(37_132.514, 3);
  });

  it("narrows eight retail sources to the two captured finalists", () => {
    expect(retailSources).toHaveLength(8);
    expect(retailSources.filter((source) => source.tone === "candidate").map((source) => source.name)).toEqual(["adidas", "eobuwie"]);
  });

  it("keeps the five-line call transcript inside 32.132514 seconds", () => {
    expect(callLines).toHaveLength(5);
    expect(callLines[0].startMs).toBe(0);
    expect(callLines.at(-1)?.endMs).toBeCloseTo(32_132.514, 3);
    expect(callLines.filter((line) => line.risk)).toHaveLength(2);
    expect(callLines.map((line) => line.audio)).toHaveLength(5);
    expect(new Set(callLines.map((line) => line.audio)).size).toBe(5);
  });

  it("keeps price history optional for future scenarios", () => {
    expect(scenarios.retail.priceHistory).toBeUndefined();
  });
});
