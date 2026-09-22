export type AvatarState = "BOOT" | "IDLE" | "TRACK" | "ALERT" | "LOCK" | "CHARGE" | "SCAN" | "REVEAL" | "CONFIRM" | "COOLDOWN" | "SLEEP" | "MOBILE_LITE" | "REDUCED_MOTION" | "DISABLED";
export type Sprite = "idle" | "track-left" | "track-right" | "alert" | "lock" | "charge" | "scan" | "confirm" | "cooldown" | "sleep";
export const VISUALS: Record<AvatarState, { sprite: Sprite; intensity: number; reticle: number }> = {
  BOOT: { sprite: "idle", intensity: .25, reticle: 0 },
  IDLE: { sprite: "idle", intensity: .18, reticle: 0 },
  TRACK: { sprite: "track-right", intensity: .28, reticle: 0 },
  ALERT: { sprite: "alert", intensity: .38, reticle: .2 },
  LOCK: { sprite: "lock", intensity: .52, reticle: 1 },
  CHARGE: { sprite: "charge", intensity: .78, reticle: 1 },
  SCAN: { sprite: "scan", intensity: 1, reticle: 1 },
  REVEAL: { sprite: "scan", intensity: .82, reticle: .5 },
  CONFIRM: { sprite: "confirm", intensity: .48, reticle: .2 },
  COOLDOWN: { sprite: "cooldown", intensity: .24, reticle: 0 },
  SLEEP: { sprite: "sleep", intensity: .08, reticle: 0 },
  MOBILE_LITE: { sprite: "idle", intensity: .18, reticle: 0 },
  REDUCED_MOTION: { sprite: "idle", intensity: .18, reticle: 0 },
  DISABLED: { sprite: "idle", intensity: 0, reticle: 0 },
};
const sequence: AvatarState[] = ["LOCK", "CHARGE", "SCAN", "REVEAL", "CONFIRM", "COOLDOWN"];
export class AvatarStateMachine {
  state: AvatarState = "BOOT";
  constructor(private notify: (state: AvatarState) => void) {}
  get busy() { return sequence.includes(this.state); }
  set(state: AvatarState) {
    if (this.state === state) return;
    this.state = state;
    this.notify(state);
  }
}
