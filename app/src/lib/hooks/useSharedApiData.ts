import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

interface AsyncState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

interface Entry {
  state: AsyncState<unknown>;
  listeners: Set<() => void>;
  started: boolean;
}

const LOADING: AsyncState<never> = { data: null, error: null, loading: true };

const entries = new Map<string, Entry>();

function entryFor(key: string): Entry {
  let entry = entries.get(key);
  if (!entry) {
    entry = { state: LOADING, listeners: new Set(), started: false };
    entries.set(key, entry);
  }
  return entry;
}

function publish(key: string, state: AsyncState<unknown>) {
  const entry = entries.get(key);
  if (!entry) return;
  entry.state = state;
  entry.listeners.forEach((listener) => listener());
}

/**
 * Like useApiData, but every component asking for the same `key` shares
 * one request and one result instead of each fetching on its own.
 *
 * The key must change whenever the data should be refetched — callers
 * fold the session revision into it (`stashes:<repoId>:<revision>`), the
 * same thing useApiData uses as a dependency. An entry is dropped once
 * no component reads it anymore, so a key seen again later fetches fresh.
 */
export function useSharedApiData<T>(key: string, fetcher: () => Promise<T>): AsyncState<T> {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const subscribe = useCallback(
    (listener: () => void) => {
      const entry = entryFor(key);
      entry.listeners.add(listener);

      return () => {
        entry.listeners.delete(listener);
        // Deferred so StrictMode's immediate unmount/remount, or a
        // sibling mounting in the same commit, keeps the entry alive.
        setTimeout(() => {
          if (entry.listeners.size === 0 && entries.get(key) === entry) entries.delete(key);
        }, 0);
      };
    },
    [key],
  );

  const getSnapshot = useCallback(
    () => (entries.get(key)?.state ?? LOADING) as AsyncState<T>,
    [key],
  );

  const state = useSyncExternalStore(subscribe, getSnapshot);

  useEffect(() => {
    const entry = entryFor(key);
    if (entry.started) return;
    entry.started = true;

    fetcherRef.current().then(
      (data) => publish(key, { data, error: null, loading: false }),
      (err) => publish(key, { data: null, error: String(err), loading: false }),
    );
  }, [key]);

  // Keep the previous data on screen while a new key loads, as
  // useApiData does, instead of blanking the list on every refetch.
  const lastData = useRef<T | null>(null);
  if (state.data !== null) lastData.current = state.data;

  return { data: state.data ?? lastData.current, error: state.error, loading: state.loading };
}
