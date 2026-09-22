import type { Sprite } from "./stateMachine";
export type Frame = { x: number; y: number; w: number; h: number };
type Atlas = { meta: { size: { w: number; h: number } }; frames: Partial<Record<Sprite, Frame>> };
export type Manifest = {
  version: number; mode: "files" | "atlas"; basePath: string; master: string;
  states: Partial<Record<Sprite, string>>;
  atlas?: { image: string; data: string };
  anchors: { eye: { x: number; y: number } };
};
const names: Sprite[] = ["idle", "track-left", "track-right", "alert", "lock", "charge", "scan", "confirm", "cooldown", "sleep"];
export const DEFAULT_MANIFEST: Manifest = {
  version: 1, mode: "files", basePath: "/system-avatar", master: "source/avatar-master.png",
  states: Object.fromEntries(names.map(name => [name, `states/${name}.png`])),
  anchors: { eye: { x: .631, y: .465 } },
};
const localPath = (value: unknown): value is string => typeof value === "string" && /^[\w./-]+$/.test(value) && !value.includes("..");
export function parseManifest(value: unknown): Manifest {
  if (!value || typeof value !== "object") return DEFAULT_MANIFEST;
  const m = value as Manifest;
  if (m.version !== 1 || !["files", "atlas"].includes(m.mode) || m.basePath !== "/system-avatar" || !localPath(m.master) || !m.states || typeof m.states !== "object") return DEFAULT_MANIFEST;
  const states = Object.fromEntries(names.filter(n => localPath(m.states[n])).map(n => [n, m.states[n]]));
  const eye = m.anchors?.eye;
  return { ...DEFAULT_MANIFEST, mode: m.mode, master: m.master, states,
    atlas: m.atlas && localPath(m.atlas.image) && localPath(m.atlas.data) ? m.atlas : undefined,
    anchors: eye && Number.isFinite(eye.x) && Number.isFinite(eye.y) && eye.x >= 0 && eye.x <= 1 && eye.y >= 0 && eye.y <= 1 ? { eye } : DEFAULT_MANIFEST.anchors,
  };
}
export function validFrame(frame: Frame | undefined, width: number, height: number): frame is Frame {
  return !!frame && [frame.x, frame.y, frame.w, frame.h].every(Number.isFinite) && frame.x >= 0 && frame.y >= 0 && frame.w > 0 && frame.h > 0 && frame.x + frame.w <= width && frame.y + frame.h <= height;
}
export type SpriteStyle = { backgroundImage: string; backgroundSize: string; backgroundPosition: string };
export class AvatarAssets {
  manifest = DEFAULT_MANIFEST;
  masterOnly = false;
  private atlas: Atlas | null = null;
  private images = new Map<string, Promise<boolean>>();
  constructor(private signal: AbortSignal) {}
  private url(path: string) { return `${this.manifest.basePath}/${path}`; }
  private async json(path: string): Promise<unknown> {
    const response = await fetch(path, { signal: AbortSignal.any([this.signal, AbortSignal.timeout(5000)]) });
    if (!response.ok) throw new Error("Avatar asset unavailable");
    return response.json();
  }
  private image(path: string) {
    const url = this.url(path);
    if (!this.images.has(url)) this.images.set(url, new Promise<boolean>(resolve => {
      const img = new Image();
      const finish = (ok: boolean) => { clearTimeout(timer); img.onload = img.onerror = null; resolve(ok && !this.signal.aborted); };
      const timer = setTimeout(() => finish(false), 5000);
      img.onload = () => { img.decode().then(() => finish(true), () => finish(false)); };
      img.onerror = () => finish(false);
      img.src = url;
    }));
    return this.images.get(url)!;
  }
  async initialize() {
    try { this.manifest = parseManifest(await this.json("/system-avatar/avatar-manifest.json")); } catch { /* local default */ }
    return this.sprite("idle");
  }
  async preloadAtlas() {
    const entry = this.manifest.atlas;
    if (this.manifest.mode !== "atlas" || !entry || this.masterOnly) return;
    try {
      const atlas = await this.json(this.url(entry.data)) as Atlas;
      if (!atlas.meta?.size || !atlas.frames || !validFrame(atlas.frames.idle, atlas.meta.size.w, atlas.meta.size.h)) return;
      if (await this.image(entry.image)) this.atlas = atlas;
    } catch { /* individual PNGs remain available */ }
  }
  async sprite(name: Sprite): Promise<SpriteStyle | null> {
    const atlas = this.atlas;
    const frame = atlas?.frames[name];
    if (atlas && this.manifest.atlas && validFrame(frame, atlas.meta.size.w, atlas.meta.size.h)) {
      const { w, h } = atlas.meta.size;
      return { backgroundImage: `url("${this.url(this.manifest.atlas.image)}")`, backgroundSize: `${w / frame.w * 100}% ${h / frame.h * 100}%`, backgroundPosition: `${w === frame.w ? 0 : frame.x / (w - frame.w) * 100}% ${h === frame.h ? 0 : frame.y / (h - frame.h) * 100}%` };
    }
    for (const path of [...new Set([this.manifest.states[name], this.manifest.states.idle, this.manifest.master])]) {
      if (path && await this.image(path)) {
        if (name === "idle" && path === this.manifest.master) this.masterOnly = true;
        return { backgroundImage: `url("${this.url(path)}")`, backgroundSize: "100% 100%", backgroundPosition: "0 0" };
      }
    }
    return null;
  }
}
