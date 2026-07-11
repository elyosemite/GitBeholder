import { createContext } from "react";
import type { SessionApi } from "./types";

export const SessionContext = createContext<SessionApi | null>(null);
