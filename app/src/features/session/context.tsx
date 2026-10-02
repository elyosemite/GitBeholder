import { createContext } from "react";
import type { SessionStore } from "./store";
import type { SessionActions } from "./types";

// Both fields are created once per provider and never change, so the
// context itself never triggers re-renders; components subscribe to the
// store instead.
export const SessionContext = createContext<{
  store: SessionStore;
  actions: SessionActions;
} | null>(null);
