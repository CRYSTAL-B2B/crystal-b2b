import { clamp, type Bounds, type Edge, type Point, type Size } from './geometry';
export type Side = 'right' | 'left' | 'above' | 'below';
const preferences: Record<Edge, Side[]> = { left: ['right','below','above','left'], right:['left','below','above','right'], top:['below','right','left','above'], bottom:['above','right','left','below'] };
export function placeBubble(avatar: Point & Size, bubble: Size, b: Bounds, edge: Edge, gap: number) {
  const cx = avatar.x + avatar.width / 2, cy = avatar.y + avatar.height / 2;
  const points: Record<Side, Point> = {
    right: { x: avatar.x+avatar.width+gap, y:cy-bubble.height/2 },
    left: { x:avatar.x-bubble.width-gap, y:cy-bubble.height/2 },
    below: { x:cx-bubble.width/2, y:avatar.y+avatar.height+gap },
    above: { x:cx-bubble.width/2, y:avatar.y-bubble.height-gap },
  };
  const candidates = preferences[edge].map((side,index) => {
    const p = points[side], x = clamp(p.x,b.left,b.right-bubble.width), y = clamp(p.y,b.top,b.bottom-bubble.height);
    const overlapX = Math.max(0,Math.min(x+bubble.width,avatar.x+avatar.width)-Math.max(x,avatar.x));
    const overlapY = Math.max(0,Math.min(y+bubble.height,avatar.y+avatar.height)-Math.max(y,avatar.y));
    return {side,x,y,score:overlapX*overlapY*100 + Math.abs(x-p.x)+Math.abs(y-p.y)+index*.01};
  });
  // Prefer the dock's side whenever clamping only the perpendicular axis suffices.
  const clean = candidates.find(c => c.score < .1 || (c.side==='right' && c.x>=avatar.x+avatar.width+gap-.1) || (c.side==='left' && c.x+bubble.width<=avatar.x-gap+.1) || (c.side==='below' && c.y>=avatar.y+avatar.height+gap-.1) || (c.side==='above' && c.y+bubble.height<=avatar.y-gap+.1));
  const result = clean ?? candidates.sort((a,z)=>a.score-z.score)[0];
  return { ...result, tailX:clamp(cx-result.x,18,bubble.width-18),tailY:clamp(cy-result.y,18,bubble.height-18) };
}
export function heroReveal(centerY: number, bottomY: number, viewportHeight: number, thresholds: {revealStart:number;revealEnd:number;exitStart:number;exitEnd:number}) {
  const reveal = clamp((thresholds.revealStart*viewportHeight-centerY)/((thresholds.revealStart-thresholds.revealEnd)*viewportHeight),0,1);
  const exit = clamp((bottomY-thresholds.exitEnd*viewportHeight)/((thresholds.exitStart-thresholds.exitEnd)*viewportHeight),0,1);
  return Math.min(reveal,exit);
}
