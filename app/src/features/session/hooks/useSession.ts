import { useContext } from "react";
import { SessionContext } from "../context";

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession requer <SessionProvider>");
  return ctx;
}
