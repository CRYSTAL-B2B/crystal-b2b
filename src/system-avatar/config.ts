export const SYSTEM_AVATAR_CONFIG = {
  enabled: true,
  audioDefault: false,
  maxDesktopDpr: 1.75,
  maxMobileDpr: 1.25,
  maxFullScansPerSession: 6,
  scanCooldownMs: 4500,
  hoverDwellMs: 220,
  proximityPx: 42,
  sleepMs: 15000,
  atlasEnabled: true,
  timings: { lock: .16, charge: .26, scan: .48, reveal: .28, confirm: .4 },
} as const;
export type PerformanceMode = "FULL" | "LITE" | "REDUCED" | "DISABLED";
