import { useEffect } from "react";
import { useSessionValue } from "@/features/session";
import { markRepositoryOpened } from "../api";

/**
 * Records every repository the app opens — from the launcher, the header
 * picker, open-local or clone — so the launcher lists it first and the
 * next launch reopens it. Mounted once at the app root.
 */
export function useTrackRepositoryOpened() {
  const repository = useSessionValue((s) => s.repository);

  useEffect(() => {
    if (!repository) return;
    // Best effort: a failure only means it won't be first next time.
    markRepositoryOpened(repository).catch(() => {});
  }, [repository]);
}
