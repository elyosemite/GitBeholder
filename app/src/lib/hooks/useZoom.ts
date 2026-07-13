import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "gitbeholder:zoom";
const DEFAULT_ZOOM = 100;
const MIN_ZOOM = 50;
const MAX_ZOOM = 200;
const STEP = 10;

function readStoredZoom() {
  const stored = Number(localStorage.getItem(STORAGE_KEY));
  return Number.isFinite(stored) && stored >= MIN_ZOOM && stored <= MAX_ZOOM ? stored : DEFAULT_ZOOM;
}

/**
 * Zoom level (%) for the main content area, persisted across sessions.
 * Applied via CSS `zoom` rather than a scaled root font-size because the
 * theme's spacing and type scale are defined in px, not rem.
 */
export function useZoom() {
  const [zoom, setZoom] = useState(readStoredZoom);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(zoom));
  }, [zoom]);

  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(MAX_ZOOM, z + STEP));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((z) => Math.max(MIN_ZOOM, z - STEP));
  }, []);

  return {
    zoom,
    zoomIn,
    zoomOut,
    canZoomIn: zoom < MAX_ZOOM,
    canZoomOut: zoom > MIN_ZOOM,
  };
}
