import { useEffect, useRef } from "react";

const MIN_INTERVAL_MS = 200;

/**
 * Fires `callback` when the app window regains focus or becomes visible
 * again (alt-tab back in, or un-minimize) — focus and visibilitychange
 * often both fire for the same transition, so a short window suppresses
 * the duplicate.
 */
export function useOnWindowFocus(callback: () => void) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    let lastFiredAt = 0;

    const fire = () => {
      const now = Date.now();
      if (now - lastFiredAt < MIN_INTERVAL_MS) return;
      lastFiredAt = now;
      callbackRef.current();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") fire();
    };

    window.addEventListener("focus", fire);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", fire);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
}
