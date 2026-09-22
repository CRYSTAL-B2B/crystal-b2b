import { FrameBudget } from './performanceMode';
import { describe, expect, it } from 'vitest';
import { DEFAULT_MANIFEST, parseManifest, validFrame } from './avatarManifest';
import { AvatarStateMachine, VISUALS } from './stateMachine';
describe('avatar asset contract', () => {
  it.each([null, [], { version: 12 }, { ...DEFAULT_MANIFEST, basePath: 'https://other.test' }])('rejects malformed manifests without throwing', value => {
    expect(parseManifest(value)).toEqual(DEFAULT_MANIFEST);
  });
  it('sanitizes paths and invalid eye coordinates', () => {
    const result = parseManifest({ ...DEFAULT_MANIFEST, states: { idle: 'states/idle.png', scan: '../../remote' }, anchors: { eye: { x: 5, y: NaN } } });
    expect(result.states.scan).toBeUndefined();
    expect(result.anchors).toEqual(DEFAULT_MANIFEST.anchors);
  });
  it('rejects out-of-bounds or corrupt atlas cells', () => {
    expect(validFrame({ x: 2048, y: 512, w: 512, h: 512 }, 2560, 1024)).toBe(true);
    expect(validFrame({ x: 2049, y: 512, w: 512, h: 512 }, 2560, 1024)).toBe(false);
    expect(validFrame({ x: NaN, y: 0, w: 512, h: 512 }, 2560, 1024)).toBe(false);
  });
  it('keeps all states mapped and reports busy only through scan/cooldown', () => {
    const seen: string[] = []; const machine = new AvatarStateMachine(s => seen.push(s));
    machine.set('TRACK'); expect(machine.busy).toBe(false);
    machine.set('LOCK'); machine.set('LOCK'); expect(machine.busy).toBe(true);
    machine.set('COOLDOWN'); expect(machine.busy).toBe(true);
    machine.set('DISABLED'); expect(machine.busy).toBe(false);
    expect(seen).toEqual(['TRACK', 'LOCK', 'COOLDOWN', 'DISABLED']);
    expect(Object.values(VISUALS).every(s => s.sprite && s.intensity >= 0 && s.intensity <= 1)).toBe(true);
  });
});

it('degrades sustained stalls, tolerates isolated stalls and resets when paused', () => {
  const budget = new FrameBudget();
  expect(budget.record(100)).toBe(false);
  expect(budget.record(400)).toBe(false);
  expect(budget.record(700)).toBe(false);
  expect(budget.record(1000)).toBe(true);
  budget.reset();
  expect(budget.record(5000)).toBe(false);
  for (let t = 5016; t < 5400; t += 16) expect(budget.record(t)).toBe(false);
});
