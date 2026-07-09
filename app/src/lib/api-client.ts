const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitBeholder API error ${response.status}: ${body}`);
  }

  return response.json() as Promise<T>;
}
