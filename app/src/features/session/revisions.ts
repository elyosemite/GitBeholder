import type { DataScope, SessionState } from "./types";

export const initialRevisions: SessionState["revisions"] = {
  commits: 0,
  status: 0,
  branches: 0,
  stashes: 0,
  tags: 0,
  sync: 0,
  repositories: 0,
};

export function bump(revisions: SessionState["revisions"], ...scopes: DataScope[]) {
  const next = { ...revisions };
  for (const scope of scopes) next[scope] += 1;
  return next;
}

export function bumpAll(revisions: SessionState["revisions"]) {
  return bump(revisions, ...(Object.keys(revisions) as DataScope[]));
}
