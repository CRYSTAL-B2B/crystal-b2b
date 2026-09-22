import { SYSTEM_AVATAR_CONFIG as config } from "./config";
export type Point = { x: number; y: number };
export class HeroTargetRegistry {
  readonly id = "hero-profit";
  readonly trigger = "hover";
  readonly priority = "high";
  readonly reveal = "accent-word";
  readonly cooldown = config.scanCooldownMs;
  readonly allowedModes = ["FULL", "LITE", "REDUCED"];
  rect: DOMRect | null = null;
  origin: Point = { x: 0, y: 0 };
  target: Point = { x: 0, y: 0 };
  dirty = true;
  scanned = false;
  constructor(readonly element: HTMLElement, private anchor: HTMLElement) {
    try { this.scanned = sessionStorage.getItem("system-avatar:hero-profit") === "1"; } catch { /* memory only */ }
  }
  measure() {
    if (!this.dirty) return;
    this.dirty = false;
    this.rect = this.element.getBoundingClientRect();
    const eye = this.anchor.getBoundingClientRect();
    this.origin = { x: eye.left + eye.width / 2, y: eye.top + eye.height / 2 };
    this.target = { x: this.rect.left + this.rect.width * .52, y: this.rect.top + this.rect.height * .52 };
  }
  get visible() {
    this.measure();
    return !!this.rect && this.rect.top > 70 && this.rect.bottom < innerHeight && this.rect.right > 0 && this.rect.left < innerWidth;
  }
  nearby(point: Point) {
    this.measure();
    const r = this.rect;
    return !!r && this.visible && point.x >= r.left - config.proximityPx && point.x <= r.right + config.proximityPx && point.y >= r.top - config.proximityPx && point.y <= r.bottom + config.proximityPx;
  }
  markScanned() {
    this.scanned = true;
    try { sessionStorage.setItem("system-avatar:hero-profit", "1"); } catch { /* memory only */ }
  }
}
