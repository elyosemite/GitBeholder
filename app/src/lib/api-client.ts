// Use 127.0.0.1 explicitly rather than "localhost": on machines where
// something else is already listening on the IPv6 loopback for this port,
// resolving "localhost" can silently connect to the wrong service.
const API_BASE_URL = "http://127.0.0.1:4000/api/v1";

export async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitBeholder API error ${response.status}: ${body}`);
  }

  return response.json() as Promise<T>;
}
