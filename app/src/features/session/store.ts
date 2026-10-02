import type { SessionState } from "./types";

/**
 * Session state lives in a tiny external store instead of a context value,
 * so components subscribe to the fields they read (useSessionValue) — a
 * click that selects a commit no longer re-renders every component that
 * only needs the repository or a revision counter.
 */
export interface SessionStore {
  getState: () => SessionState;
  setState: (update: (state: SessionState) => SessionState) => void;
  subscribe: (listener: () => void) => () => void;
}

export function createSessionStore(initial: SessionState): SessionStore {
  let state = initial;
  const listeners = new Set<() => void>();

  return {
    getState: () => state,
    setState(update) {
      const next = update(state);
      if (next === state) return;
      state = next;
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
