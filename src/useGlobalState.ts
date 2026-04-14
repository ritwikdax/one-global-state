import { useSyncExternalStore, useCallback } from "react";

// Global store: key -> current value
const store = new Map<string, unknown>();

// Per-key subscriber sets for useSyncExternalStore
const listeners = new Map<string, Set<() => void>>();

function getListeners(key: string): Set<() => void> {
  if (!listeners.has(key)) {
    listeners.set(key, new Set());
  }
  return listeners.get(key)!;
}

function notifyListeners(key: string): void {
  getListeners(key).forEach((cb) => cb());
}

export function setGlobalState<T>(
  key: string,
  value: T | ((prev: T) => T),
): void {
  const current = store.get(key) as T;
  const next =
    typeof value === "function" ? (value as (prev: T) => T)(current) : value;
  store.set(key, next);
  notifyListeners(key);
}

export function useGlobalState<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  // Initialise the store entry only once (first caller wins)
  if (!store.has(key)) {
    store.set(key, initialValue);
  }

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      getListeners(key).add(onStoreChange);
      return () => {
        getListeners(key).delete(onStoreChange);
      };
    },
    [key],
  );

  const getSnapshot = useCallback(() => store.get(key) as T, [key]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setState = useCallback(
    (value: T | ((prev: T) => T)) => {
      setGlobalState(key, value);
    },
    [key],
  );

  return [value, setState];
}
