import { useCallback, useState } from "react";

/**
 * Drag-to-resize height for a panel anchored to the *top* of its
 * container — the handle sits on the panel's bottom edge, so dragging
 * down grows it and dragging up shrinks it. Mirrors useResizableWidth.
 */
export function useResizableHeight(defaultHeight: number, min: number, max: number) {
  const [height, setHeight] = useState(defaultHeight);

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      event.preventDefault();
      const startY = event.clientY;
      const startHeight = height;

      const onPointerMove = (moveEvent: PointerEvent) => {
        const delta = moveEvent.clientY - startY;
        setHeight(Math.min(max, Math.max(min, startHeight + delta)));
      };

      const onPointerUp = () => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    },
    [height, min, max],
  );

  return { height, onPointerDown };
}
