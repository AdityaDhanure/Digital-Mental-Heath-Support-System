'use client';

import { Dispatch, SetStateAction, useEffect, useState } from 'react';

type StorageType = 'local' | 'session';

interface PersistentStateOptions<T> {
  storage?: StorageType;
  validate?: (value: unknown) => value is T;
}

const getStorage = (type: StorageType): Storage | null => {
  if (typeof window === 'undefined') return null;
  return type === 'session' ? window.sessionStorage : window.localStorage;
};

const resolveInitialValue = <T>(initialValue: T | (() => T)): T => {
  return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
};

const isCompatibleValue = <T>(value: unknown, fallback: T): value is T => {
  if (Array.isArray(fallback)) return Array.isArray(value);
  if (fallback === null) return true;
  return typeof value === typeof fallback;
};

export function usePersistentState<T>(
  key: string,
  initialValue: T | (() => T),
  options: PersistentStateOptions<T> = {}
): [T, Dispatch<SetStateAction<T>>] {
  const storageType = options.storage ?? 'local';

  const [value, setValue] = useState<T>(() => {
    const fallback = resolveInitialValue(initialValue);
    const storage = getStorage(storageType);
    if (!storage) return fallback;

    try {
      const saved = storage.getItem(key);
      if (!saved) return fallback;

      const parsed = JSON.parse(saved);
      if (options.validate) {
        return options.validate(parsed) ? parsed : fallback;
      }

      return isCompatibleValue(parsed, fallback) ? parsed : fallback;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    const storage = getStorage(storageType);
    if (!storage) return;

    try {
      storage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage quota/private-mode failures; the UI should continue to work.
    }
  }, [key, storageType, value]);

  return [value, setValue];
}
