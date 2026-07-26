import { useCallback, useState } from "react";

const MIN_SCALE = 0.2;
const MAX_SCALE = 4;

export interface Transform {
  x: number;
  y: number;
  k: number;
}

export interface Point {
  x: number;
  y: number;
}

/**
 * Pan/zoom transform for the graph canvas, independent of node
 * positions. `point` arguments are expected in the SVG root's own
 * coordinate space (pre-transform) — see ForceGraph's `toSvgPoint`,
 * which already cancels out any CSS zoom on ancestors via
 * `getScreenCTM()`. Keeping that conversion separate from this hook
 * means the zoom-to-point math here never has to think about it.
 */
export function usePanZoom() {
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, k: 1 });

  const panBy = useCallback((dx: number, dy: number) => {
    setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }));
  }, []);

  const zoomAt = useCallback((point: Point, scaleFactor: number) => {
    setTransform((t) => {
      const nextK = Math.min(MAX_SCALE, Math.max(MIN_SCALE, t.k * scaleFactor));
      const worldX = (point.x - t.x) / t.k;
      const worldY = (point.y - t.y) / t.k;

      return {
        k: nextK,
        x: point.x - worldX * nextK,
        y: point.y - worldY * nextK,
      };
    });
  }, []);

  const toWorld = useCallback(
    (point: Point): Point => ({
      x: (point.x - transform.x) / transform.k,
      y: (point.y - transform.y) / transform.k,
    }),
    [transform],
  );

  return { transform, panBy, zoomAt, toWorld };
}
