import { useSessionValue } from "@/features/session";
import { useApiData } from "@/lib/hooks/useApiData";
import { listRecentRepositories } from "../api";

export function useRecentRepositories(limit = 10) {
  const revision = useSessionValue((s) => s.revisions.repositories);

  return useApiData(() => listRecentRepositories(limit), [limit, revision]);
}
