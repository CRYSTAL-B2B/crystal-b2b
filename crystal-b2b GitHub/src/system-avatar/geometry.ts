export type Edge = 'left' | 'right' | 'top' | 'bottom';
export type Dock = { edge: Edge; offset: number };
export type Point = { x: number; y: number };
export type Size = { width: number; height: number };
export type Bounds = { left: number; top: number; right: number; bottom: number };
export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(Math.max(lo, hi), v));
export function parseDock(raw: string | null): Dock | null {
  try {
    const value = JSON.parse(raw || 'null');
    if (!value || !['left', 'right', 'top', 'bottom'].includes(value.edge) || typeof value.offset !== 'number' || !Number.isFinite(value.offset)) return null;
    return { edge: value.edge, offset: clamp(value.offset, 0, 1) };
  } catch { return null; }
}
export function constrain(point: Point, size: Size, bounds: Bounds): Point {
  return { x: clamp(point.x, bounds.left, bounds.right - size.width), y: clamp(point.y, bounds.top, bounds.bottom - size.height) };
}
export function dockPosition(dock: Dock, size: Size, b: Bounds): Point {
  const horizontal = b.right - b.left - size.width, vertical = b.bottom - b.top - size.height;
  return constrain({
    x: dock.edge === 'left' ? b.left : dock.edge === 'right' ? b.right - size.width : b.left + Math.max(0, horizontal) * dock.offset,
    y: dock.edge === 'top' ? b.top : dock.edge === 'bottom' ? b.bottom - size.height : b.top + Math.max(0, vertical) * dock.offset,
  }, size, b);
}
export function snapDock(point: Point, size: Size, b: Bounds, edge?: Edge): Dock {
  const p = constrain(point, size, b), cx = p.x + size.width / 2, cy = p.y + size.height / 2;
  const distances: [Edge, number][] = [['left', cx - b.left], ['right', b.right - cx], ['top', cy - b.top], ['bottom', b.bottom - cy]];
  const selected = edge ?? distances.sort((a, z) => a[1] - z[1])[0][0];
  const vertical = selected === 'left' || selected === 'right';
  const travel = vertical ? b.bottom - b.top - size.height : b.right - b.left - size.width;
  return { edge: selected, offset: travel > 0 ? clamp(((vertical ? p.y - b.top : p.x - b.left) / travel), 0, 1) : 0 };
}
