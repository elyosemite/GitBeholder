import { useSessionValue } from "@/features/session";
import { useSharedApiData } from "@/lib/hooks/useSharedApiData";
import { getCurrentUser } from "../api";

export function useCurrentUser() {
  const revision = useSessionValue((s) => s.revisions.me);

  // Shared: the header avatar and the profile dialog read it together.
  return useSharedApiData(`me:${revision}`, getCurrentUser);
}
