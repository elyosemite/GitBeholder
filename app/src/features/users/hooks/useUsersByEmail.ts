import { useMemo } from "react";
import { useSessionValue } from "@/features/session";
import { useSharedApiData } from "@/lib/hooks/useSharedApiData";
import { listUsers } from "../api";
import type { User } from "../types";

/**
 * GitBeholder users keyed by lower-cased email, to put a photo (and team)
 * on commit authors. One shared request for the whole commit list and the
 * commit panel; refetched when the local profile is saved.
 */
export function useUsersByEmail(): Map<string, User> {
  const revision = useSessionValue((s) => s.revisions.me);
  const { data: users } = useSharedApiData(`users:${revision}`, listUsers);

  return useMemo(
    () => new Map((users ?? []).map((user) => [user.email.toLowerCase(), user])),
    [users],
  );
}
