export interface Team {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  /** Uploaded image as a data URL, or a platform avatar URL once integrations fill it in. */
  avatar_url: string | null;
  /** The person using this installation (the header avatar). */
  is_local: boolean;
  team: Team;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  avatar_url?: string | null;
}
