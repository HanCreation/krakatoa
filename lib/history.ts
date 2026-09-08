export function terrainState(era: number, after: boolean, growth: number) {
  return {
    anak: era >= 2,
    ancient: era === 0,
    oldPeaks: era === 1 && !after,
    caldera: era > 1 || (era === 1 && after),
    anakHeight:
      era === 2
        ? 0.03 + Math.max(0, Math.min(100, growth)) / 100
        : era === 3
          ? after
            ? 0.3
            : 1
          : 0.68,
  };
}
