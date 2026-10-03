import { request } from "@/lib/api-client";
import type { UpdateUserPayload, User } from "./types";

/** The local user — created by the backend from the git identity on first call. */
export function getCurrentUser(): Promise<User> {
  return request<User>("/me");
}

export function updateCurrentUser(payload: UpdateUserPayload): Promise<User> {
  return request<User>("/me", { method: "PATCH", body: payload });
}

/** Every user with their team and photo — matched to commit authors by email. */
export function listUsers(): Promise<User[]> {
  return request<{ users: User[] }>("/users").then(({ users }) => users);
}
