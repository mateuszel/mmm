export function estimateRecoveredValue(volume: number, baselineRate: number, currentRate: number, capture = 0.72): number {
  return Math.max(0, volume * (baselineRate - currentRate) * capture);
}
