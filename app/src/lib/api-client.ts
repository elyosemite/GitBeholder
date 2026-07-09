// Mockoon mock server (see features/repositories/api.ts etc. for the
// endpoints it's expected to serve).
const API_BASE_URL = "http://localhost:3000";

export async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitBeholder API error ${response.status}: ${body}`);
  }

  return response.json() as Promise<T>;
}
