import { useCallback } from "react";
import { useSessionActions } from "@/features/session";
import { updateCurrentUser } from "../api";
import type { UpdateUserPayload } from "../types";

export function useUpdateCurrentUser() {
  const { invalidate } = useSessionActions();

  return useCallback(
    async (payload: UpdateUserPayload) => {
      const user = await updateCurrentUser(payload);
      invalidate("me");
      return user;
    },
    [invalidate],
  );
}
