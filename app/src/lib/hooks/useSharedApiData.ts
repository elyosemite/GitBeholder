import { startTransition, useEffect, useRef, useState } from "react";

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
 *
 * Results land as a transition, so rendering a long list for freshly
 * arrived data can yield to input instead of freezing the UI — unlike
 * useSyncExternalStore, which always renders synchronously.
 */
export function useSharedApiData<T>(key: string, fetcher: () => Promise<T>): AsyncState<T> {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [state, setState] = useState<AsyncState<unknown>>(() => entries.get(key)?.state ?? LOADING);

  useEffect(() => {
    const entry = entryFor(key);
    const sync = () => startTransition(() => setState(entry.state));

    entry.listeners.add(sync);
    // Catch up with whatever the entry holds now: another component may
    // already have fetched it, or this is a new key still loading.
    setState(entry.state);

    if (!entry.started) {
      entry.started = true;
      fetcherRef.current().then(
        (data) => publish(key, { data, error: null, loading: false }),
        (err) => publish(key, { data: null, error: String(err), loading: false }),
      );
    }

    return () => {
      entry.listeners.delete(sync);
      // Deferred so StrictMode's immediate unmount/remount, or a
      // sibling mounting in the same commit, keeps the entry alive.
      setTimeout(() => {
        if (entry.listeners.size === 0 && entries.get(key) === entry) entries.delete(key);
      }, 0);
    };
  }, [key]);

  // Keep the previous data on screen while a new key loads, as
  // useApiData does, instead of blanking the list on every refetch.
  const lastData = useRef<T | null>(null);
  const data = state.data as T | null;
  if (data !== null) lastData.current = data;

  return { data: data ?? lastData.current, error: state.error, loading: state.loading };
}
