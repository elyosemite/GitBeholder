import { useCallback, useMemo, useState } from "react";
import type { Repository } from "@/features/repositories";
import { useOnWindowFocus } from "@/lib/hooks/useOnWindowFocus";
import { SessionContext } from "./context";
import type { DataScope, SessionApi, SessionState } from "./types";
import { bump, bumpAll, initialRevisions } from "./revisions";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SessionState>({
    repository: null,
    branch: null,
    inspectedCommit: null,
    diffFile: null,
    revisions: initialRevisions,
  });

  const selectRepository = useCallback((repository: Repository) => {
    setState((s) => ({
      repository,
      branch: null,
      inspectedCommit: null,
      diffFile: null,
      revisions: bumpAll(s.revisions),
    }));
  }, []);

  const setBranch = useCallback((branch: string) => {
    setState((s) => ({
      ...s,
      branch,
      inspectedCommit: null,
      diffFile: null,
      revisions: bump(s.revisions, "commits", "status", "sync", "branches", "tags"),
    }));
  }, []);

  const selectCommit = useCallback((hash: string) => {
    setState((s) => ({ ...s, inspectedCommit: hash, diffFile: null }));
  }, []);

  const openDiff = useCallback((path: string) => {
    setState((s) => ({ ...s, diffFile: path }));
  }, []);

  const closeDiff = useCallback(() => {
    setState((s) => ({ ...s, diffFile: null }));
  }, []);

  const invalidate = useCallback((...scopes: DataScope[]) => {
    setState((s) => ({ ...s, revisions: bump(s.revisions, ...scopes) }));
  }, []);

  // Editing files outside the app (or fetching/pulling from elsewhere)
  // doesn't touch our state — catch up whenever the window regains focus
  // instead of polling on a timer.
  useOnWindowFocus(() => {
    if (state.repository) invalidate("status", "branches", "sync", "stashes", "tags");
  });

  const value = useMemo<SessionApi>(
    () => ({
      ...state,
      selectRepository,
      setBranch,
      selectCommit,
      openDiff,
      closeDiff,
      invalidate,
    }),
    [state, selectRepository, setBranch, selectCommit, openDiff, closeDiff, invalidate],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
