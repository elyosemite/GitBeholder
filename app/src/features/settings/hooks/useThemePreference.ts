import { useSyncExternalStore } from "react";
import {
  getThemePreference,
  setThemePreference,
  subscribeThemePreference,
  type ThemePreference,
} from "../theme";

export function useThemePreference(): [ThemePreference, (next: ThemePreference) => void] {
  const preference = useSyncExternalStore(subscribeThemePreference, getThemePreference);
  return [preference, setThemePreference];
}
