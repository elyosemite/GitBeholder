import { getHighlighterOptions, preloadHighlighter } from "@pierre/diffs";

/**
 * Warms up @pierre/diffs' shared syntax highlighter while the app is idle.
 * Otherwise its first-use load runs when the first diff opens, freezing
 * that click for ~150 ms. Same options PatchDiff resolves by default, so
 * the diff view reuses this instance; per-file languages still load on
 * demand.
 */
export function preloadDiffHighlighter() {
  requestIdleCallback(() => {
    void preloadHighlighter(getHighlighterOptions(undefined, {})).catch(() => {
      // Best effort: PatchDiff loads it on demand if this fails.
    });
  });
}
