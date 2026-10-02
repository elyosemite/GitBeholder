import { recordRequest } from "./perf";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface RequestOptions {
  method?: string;
  body?: unknown;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const startedAt = performance.now();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method,
    headers: options.body === undefined ? undefined : { "Content-Type": "application/json" },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const headersAt = performance.now();

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitBeholder API error ${response.status}: ${body}`);
  }

  const data = response.status === 204 ? undefined : await response.json();
  recordRequest(
    options.method ?? "GET",
    path,
    startedAt,
    headersAt,
    performance.now(),
    response.headers.get("server-timing"),
  );

  return data as T;
}
