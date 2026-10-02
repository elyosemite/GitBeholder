import { useContext, useMemo, useSyncExternalStore } from "react";
import { SessionContext } from "../context";
import type { SessionActions, SessionApi, SessionState } from "../types";

function useSessionContext() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession requer <SessionProvider>");
  return ctx;
}

/**
 * One session field (or anything derived from it). The component
 * re-renders only when the selected value changes, so the selector must
 * return an existing value — `(s) => s.repository`, not a new object.
 */
export function useSessionValue<T>(selector: (state: SessionState) => T): T {
  const { store } = useSessionContext();
  return useSyncExternalStore(store.subscribe, () => selector(store.getState()));
}

/** The session actions; stable for the provider's lifetime, never re-render. */
export function useSessionActions(): SessionActions {
  return useSessionContext().actions;
}

/**
 * The whole session. Re-renders on any session change — prefer
 * useSessionValue + useSessionActions in anything rendered often.
 */
export function useSession(): SessionApi {
  const { store, actions } = useSessionContext();
  const state = useSyncExternalStore(store.subscribe, store.getState);
  return useMemo(() => ({ ...state, ...actions }), [state, actions]);
}
