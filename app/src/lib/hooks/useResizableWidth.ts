import { useCallback, useState } from "react";

/**
 * Drag-to-resize width for a panel anchored on the *right* edge of the
 * screen — the handle sits on the panel's left side, so dragging left
 * (negative clientX delta) grows it and dragging right shrinks it.
 */
export function useResizableWidth(defaultWidth: number, min: number, max: number) {
  const [width, setWidth] = useState(defaultWidth);

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      event.preventDefault();
      const startX = event.clientX;
      const startWidth = width;

      const onPointerMove = (moveEvent: PointerEvent) => {
        const delta = startX - moveEvent.clientX;
        setWidth(Math.min(max, Math.max(min, startWidth + delta)));
      };

      const onPointerUp = () => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    },
    [width, min, max],
  );

  return { width, onPointerDown };
}
