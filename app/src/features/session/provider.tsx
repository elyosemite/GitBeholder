import { useMemo, useState } from "react";
import type { Repository } from "@/features/repositories";
import { useOnWindowFocus } from "@/lib/hooks/useOnWindowFocus";
import { SessionContext } from "./context";
import { createSessionStore } from "./store";
import type { DataScope, MainView, SessionActions } from "./types";
import { bump, bumpAll, initialRevisions } from "./revisions";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(() =>
    createSessionStore({
      repository: null,
      branch: null,
      inspectedCommit: null,
      diffFile: null,
      mainView: "commits",
      revisions: initialRevisions,
    }),
  );

  const actions = useMemo<SessionActions>(
    () => ({
      selectRepository(repository: Repository) {
        store.setState((s) => ({
          repository,
          branch: null,
          inspectedCommit: null,
          diffFile: null,
          mainView: "commits",
          revisions: bumpAll(s.revisions),
        }));
      },

      setBranch(branch: string) {
        store.setState((s) => ({
          ...s,
          branch,
          inspectedCommit: null,
          diffFile: null,
          revisions: bump(s.revisions, "commits", "status", "sync", "branches", "tags"),
        }));
      },

      selectCommit(hash: string) {
        store.setState((s) => ({ ...s, inspectedCommit: hash, diffFile: null }));
      },

      openDiff(path: string) {
        store.setState((s) => ({ ...s, diffFile: path }));
      },

      closeDiff() {
        store.setState((s) => ({ ...s, diffFile: null }));
      },

      setMainView(view: MainView) {
        store.setState((s) => ({ ...s, mainView: view }));
      },

      invalidate(...scopes: DataScope[]) {
        store.setState((s) => ({ ...s, revisions: bump(s.revisions, ...scopes) }));
      },
    }),
    [store],
  );

  // Editing files outside the app (or fetching/pulling from elsewhere)
  // doesn't touch our state — catch up whenever the window regains focus
  // instead of polling on a timer.
  useOnWindowFocus(() => {
    if (store.getState().repository) {
      actions.invalidate("status", "branches", "sync", "stashes", "tags");
    }
  });

  const value = useMemo(() => ({ store, actions }), [store, actions]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
