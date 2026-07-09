import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Repository } from "@/features/repositories";

export type DataScope = "commits" | "status" | "branches" | "stashes" | "tags";

interface SessionState {
  repository: Repository | null;
  branch: string | null;
  revisions: Record<DataScope, number>;
}

interface SessionApi extends SessionState {
  selectRepository: (repo: Repository) => void;
  setBranch: (branch: string) => void;
  invalidate: (...scopes: DataScope[]) => void;
}

const SessionContext = createContext<SessionApi | null>(null);

const initialRevisions: SessionState["revisions"] = {
  commits: 0,
  status: 0,
  branches: 0,
  stashes: 0,
  tags: 0,
};

function bump(revisions: SessionState["revisions"], ...scopes: DataScope[]) {
  const next = { ...revisions };
  for (const scope of scopes) next[scope] += 1;
  return next;
}

function bumpAll(revisions: SessionState["revisions"]) {
  return bump(revisions, ...(Object.keys(revisions) as DataScope[]));
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SessionState>({
    repository: null,
    branch: null,
    revisions: initialRevisions,
  });

  const selectRepository = useCallback((repository: Repository) => {
    setState((s) => ({
      repository,
      branch: null,
      revisions: bumpAll(s.revisions),
    }));
  }, []);

  const setBranch = useCallback((branch: string) => {
    setState((s) => ({
      ...s,
      branch,
      revisions: bump(s.revisions, "commits", "status"),
    }));
  }, []);

  const invalidate = useCallback((...scopes: DataScope[]) => {
    setState((s) => ({ ...s, revisions: bump(s.revisions, ...scopes) }));
  }, []);

  const value = useMemo(
    () => ({ ...state, selectRepository, setBranch, invalidate }),
    [state, selectRepository, setBranch, invalidate],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession requer <SessionProvider>");
  return ctx;
}
