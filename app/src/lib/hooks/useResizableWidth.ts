import { useCallback, useState } from "react";

/**
 * Drag-to-resize width for a side panel. `anchor` is the screen edge the
 * panel sits against: a "right" panel has its handle on its left side, so
 * dragging left (negative clientX delta) grows it; a "left" panel has its
 * handle on its right side, so dragging right grows it.
 */
export function useResizableWidth(
  defaultWidth: number,
  min: number,
  max: number,
  anchor: "left" | "right" = "right",
) {
  const [width, setWidth] = useState(defaultWidth);

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      event.preventDefault();
      const startX = event.clientX;
      const startWidth = width;
      const direction = anchor === "right" ? -1 : 1;

      const onPointerMove = (moveEvent: PointerEvent) => {
        const delta = (moveEvent.clientX - startX) * direction;
        setWidth(Math.min(max, Math.max(min, startWidth + delta)));
      };

      const onPointerUp = () => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    },
    [width, min, max, anchor],
  );

  return { width, onPointerDown };
}
