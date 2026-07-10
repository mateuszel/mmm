import { describe, expect, it } from "vitest";
import { estimateRecoveredValue } from "./impact";
describe("impact estimate", () => { it("estimates recoverable value and never returns negative value", () => { expect(estimateRecoveredValue(1_000_000, .8, .7)).toBeCloseTo(72_000); expect(estimateRecoveredValue(100, .7, .8)).toBe(0); }); });
