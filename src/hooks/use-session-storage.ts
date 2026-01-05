import { useState, useCallback } from 'react';

/**
 * Custom hook for synchronizing state with sessionStorage.
 *
 * @param key - The sessionStorage key.
 * @param initialValue - The initial value if no value exists in storage.
 * @returns A stateful value and a function to update it.
 */
export function useSessionStorage<T>(key: string, initialValue: T) {
  // Get from session storage then
  // parse stored json or return initialValue
  const readValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading sessionStorage key “${key}”:`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        setStoredValue((prev) => {
          const valueToStore = value instanceof Function ? value(prev) : value;
          if (typeof window !== 'undefined') {
            window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
          }
          return valueToStore;
        });
      } catch (error) {
        console.warn(`Error setting sessionStorage key “${key}”:`, error);
      }
    },
    [key]
  );

  return [storedValue, setValue] as const;
}
