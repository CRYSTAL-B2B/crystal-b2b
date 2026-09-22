/** Accumulate sustained slow rendering time, independent of refresh rate. */
export class FrameBudget {
  private previous = 0;
  private slowMs = 0;
  record(now: number, threshold = 900) {
    const elapsed = this.previous ? now - this.previous : 0;
    this.previous = now;
    this.slowMs = elapsed > 42 ? this.slowMs + elapsed : Math.max(0, this.slowMs - 80);
    if (this.slowMs < threshold) return false;
    this.slowMs = 0;
    return true;
  }
  reset() { this.previous = 0; this.slowMs = 0; }
}
