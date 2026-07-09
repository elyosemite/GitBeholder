// Multi-segment SVG path data, ported from temp/GitClient.dc.html.
// Each value may contain multiple subpaths separated by " M".
export const ICON_PATHS = {
  down: "M12 4v13M6 11l6 6 6-6",
  up: "M12 20V7M6 13l6-6 6 6",
  check: "M20 6L9 17l-5-5",
  box: "M3 8l9-5 9 5v8l-9 5-9-5z M3 8l9 5 9-5 M12 13v8",
  pop: "M9 14l-4-4 4-4 M5 10h10a4 4 0 0 1 0 8h-3",
  merge: "M6 3v12 M6 15a3 3 0 0 0 3 3h6 M18 15a3 3 0 1 1 0 .01 M6 3a3 3 0 1 1 0 .01 M18 12V9a3 3 0 0 0-3-3H9",
  rebase: "M6 3v18 M6 6a3 3 0 1 0 0-.01 M18 12a3 3 0 1 0 0-.01 M6 12h9",
  cherry: "M11 20a4 4 0 1 1 0-8 M13 20a4 4 0 1 0 0-8 M12 12V6c0-2 2-3 4-3",
  sync: "M21 2v6h-6 M3 22v-6h6 M20 12a8 8 0 0 1-14 5.7L3 16 M4 12a8 8 0 0 1 14-5.7L21 8",
  chevronDown: "M6 9l6 6 6-6",
  gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V22a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 20.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H2a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 3.7 7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H8.4A1.7 1.7 0 0 0 9.5 2.9V2a2 2 0 1 1 4 0v.1A1.7 1.7 0 0 0 17 3.7l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.6 1.1H22a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z",
} as const;

export type IconName = keyof typeof ICON_PATHS;
