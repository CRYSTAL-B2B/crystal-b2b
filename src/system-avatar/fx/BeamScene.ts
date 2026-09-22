import { Mesh, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, Vector2, WebGLRenderer } from 'three';
import { SYSTEM_AVATAR_CONFIG as config, type PerformanceMode } from '../config';
import type { Point } from '../targetRegistry';
import { vertexShader, fragmentShader } from './beamShader';
import { FrameBudget } from '../performanceMode';
export type BeamValues = { progress: number; intensity: number; opacity: number; contact: number; afterglow: number };
export class BeamScene {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new OrthographicCamera(-1, 1, 1, -1, 0, 2);
  private geometry = new PlaneGeometry(2, 2);
  private material: ShaderMaterial;
  private disposed = false;
  private budget = new FrameBudget();
  private frameCount = 0;
  private width = 0;
  private height = 0;
  private dpr = 0;
  constructor(private canvas: HTMLCanvasElement, private mode: PerformanceMode, private fail: () => void, private degrade: () => void) {
    const context = canvas.getContext('webgl2', { alpha: true, antialias: false, depth: false, stencil: false, premultipliedAlpha: true, powerPreference: 'low-power' });
    if (!context) throw new Error('WebGL2 unavailable');
    this.renderer = new WebGLRenderer({ canvas, context, alpha: true, antialias: false });
    this.renderer.setClearColor(0, 0);
    this.camera.position.z = 1;
    this.material = new ShaderMaterial({ transparent: true, depthTest: false, depthWrite: false, vertexShader, fragmentShader, uniforms: {
      uResolution: { value: new Vector2() }, uOrigin: { value: new Vector2() }, uTarget: { value: new Vector2() },
      uTime: { value: 0 }, uIntensity: { value: 0 }, uProgress: { value: 0 }, uWidth: { value: 1.1 },
      uNoiseScale: { value: .027 }, uNoiseSpeed: { value: .75 }, uFlicker: { value: .035 },
      uOpacity: { value: 0 }, uContactIntensity: { value: 0 }, uChromaticShift: { value: .7 },
      uAfterglow: { value: 0 }, uLite: { value: mode === 'LITE' ? 1 : 0 },
    } });
    this.scene.add(new Mesh(this.geometry, this.material));
    let shaderFailed = false;
    this.renderer.debug.onShaderError = () => {
      shaderFailed = true;
      // Three may link/check a program on the first render, after compile().
      queueMicrotask(() => { if (!this.disposed) this.fail(); });
    };
    this.resize();
    this.renderer.compile(this.scene, this.camera);
    if (shaderFailed) { this.dispose(); throw new Error('Beam shader unavailable'); }
    canvas.addEventListener('webglcontextlost', this.contextLost);
  }
  private contextLost = (event: Event) => { event.preventDefault(); this.fail(); };
  setMode(mode: PerformanceMode) { this.mode = mode; this.material.uniforms.uLite.value = mode === 'LITE' ? 1 : 0; this.resize(); }
  setPoints(origin: Point, target: Point) {
    this.material.uniforms.uOrigin.value.set(origin.x, origin.y);
    this.material.uniforms.uTarget.value.set(target.x, target.y);
    this.canvas.dataset.origin = `${origin.x},${origin.y}`;
    this.canvas.dataset.target = `${target.x},${target.y}`;
  }
  resize() {
    if (this.disposed) return;
    const cap = this.mode === 'FULL' ? config.maxDesktopDpr : config.maxMobileDpr;
    const dpr = Math.min(devicePixelRatio || 1, cap);
    if (this.width === innerWidth && this.height === innerHeight && this.dpr === dpr) return;
    this.width = innerWidth; this.height = innerHeight; this.dpr = dpr;
    this.renderer.setPixelRatio(dpr); this.renderer.setSize(innerWidth, innerHeight, false);
    this.material.uniforms.uResolution.value.set(innerWidth, innerHeight);
    this.canvas.dataset.dpr = String(dpr);
  }
  draw(values: BeamValues) {
    if (this.disposed || document.hidden) return;
    const now = performance.now();
    if (this.budget.record(now, this.mode === 'FULL' ? 900 : 1400)) {
      this.degrade(); if (this.disposed) return;
    }
    const u = this.material.uniforms;
    u.uTime.value = now / 1000; u.uProgress.value = values.progress; u.uIntensity.value = values.intensity;
    u.uOpacity.value = values.opacity; u.uContactIntensity.value = values.contact; u.uAfterglow.value = values.afterglow;
    try { this.renderer.render(this.scene, this.camera); } catch { this.fail(); return; }
    this.canvas.dataset.frames = String(++this.frameCount);
    this.canvas.dataset.progress = values.progress.toFixed(3);
  }
  clear() { if (!this.disposed) this.renderer.clear(); this.budget.reset(); }
  dispose() {
    if (this.disposed) return;
    this.clear(); this.disposed = true;
    this.canvas.removeEventListener('webglcontextlost', this.contextLost);
    this.geometry.dispose(); this.material.dispose(); this.scene.clear(); this.renderer.dispose();
  }
}
