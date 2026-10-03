import { useCallback, useState } from "react";

/**
 * Drag-to-resize height for a panel. `anchor` is the edge the panel sits
 * against: a "top" panel has its handle on its bottom edge, so dragging
 * down grows it; a "bottom" panel (e.g. the commit panel) has its handle
 * on its top edge, so dragging up grows it. Mirrors useResizableWidth.
 */
export function useResizableHeight(
  defaultHeight: number,
  min: number,
  max: number,
  anchor: "top" | "bottom" = "top",
) {
  const [height, setHeight] = useState(defaultHeight);

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      event.preventDefault();
      const startY = event.clientY;
      const startHeight = height;
      const direction = anchor === "top" ? 1 : -1;

      const onPointerMove = (moveEvent: PointerEvent) => {
        const delta = (moveEvent.clientY - startY) * direction;
        setHeight(Math.min(max, Math.max(min, startHeight + delta)));
      };

      const onPointerUp = () => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    },
    [height, min, max, anchor],
  );

  return { height, onPointerDown };
}
