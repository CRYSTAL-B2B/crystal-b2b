import { describe, expect, it } from 'vitest';
import { constrain, dockPosition, parseDock, snapDock, type Edge } from './geometry';
const b = { left: 20, top: 92, right: 1420, bottom: 880 }, size = { width: 282, height: 282 };
describe('safe docking contract', () => {
  it.each(['left', 'right', 'top', 'bottom'] as Edge[])('round-trips %s normalized placement through orientation and reload', edge => {
    const stored = parseDock(JSON.stringify({ edge, offset: .42 }))!;
    for (const bounds of [b, { left: 14, top: 82, right: 376, bottom: 830 }, { left: 14, top: 82, right: 830, bottom: 376 }]) {
      const s = { width: 96, height: 96 }, p = dockPosition(stored, s, bounds);
      expect(p).toEqual(constrain(p, s, bounds));
      expect(snapDock(p, s, bounds, edge).offset).toBeCloseTo(.42);
    }
  });
  it('chooses all four nearest edges by center, preserving perpendicular position', () => {
    for (const [point, edge] of [[{x:20,y:300},'left'],[{x:1100,y:300},'right'],[{x:600,y:92},'top'],[{x:600,y:580},'bottom']] as const) expect(snapDock(point,size,b).edge).toBe(edge);
  });
  it('clamps extreme pointer positions and malformed storage', () => {
    expect(constrain({x:-10000,y:20000},size,b)).toEqual({x:20,y:598});
    for (const raw of ['null', '{}', '{"edge":"left","offset":".5"}', 'garbage', '{"edge":"unknown","offset":0}']) expect(parseDock(raw)).toBeNull();
    expect(parseDock('{"edge":"right","offset":20}')).toEqual({edge:'right',offset:1});
  });
});

import { heroReveal, placeBubble } from './bubblePlacement';
import { AVATAR_CONFIG } from './config';
it('fits bubble on all four docks, including corners and compact bounds', () => {
  for(const bounds of [b,{left:14,top:82,right:376,bottom:830},{left:14,top:82,right:830,bottom:376}]) {
    const s={width:96,height:96}, bubble={width:Math.min(310,bounds.right-bounds.left),height:Math.min(190,bounds.bottom-bounds.top)};
    for(const edge of ['left','right','top','bottom'] as Edge[]) for(const offset of [0,.25,.5,.75,1]) {
      const point=dockPosition({edge,offset},s,bounds), result=placeBubble({...point,...s},bubble,bounds,edge,18);
      expect(result.x).toBeGreaterThanOrEqual(bounds.left);expect(result.y).toBeGreaterThanOrEqual(bounds.top);
      expect(result.x+bubble.width).toBeLessThanOrEqual(bounds.right);expect(result.y+bubble.height).toBeLessThanOrEqual(bounds.bottom);
    }
  }
});
it('reveals at Hero 60→40%, then exits and recovers on backscroll', () => {
  const t=AVATAR_CONFIG.bubble;
  expect(heroReveal(650,1200,1000,t)).toBe(0);
  expect(heroReveal(500,1000,1000,t)).toBeCloseTo(.5);
  expect(heroReveal(400,900,1000,t)).toBe(1);
  expect(heroReveal(-600,100,1000,t)).toBe(0);
});
