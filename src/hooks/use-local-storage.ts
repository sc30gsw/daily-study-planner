import { useState, useEffect } from "react";
import { Result } from "better-result";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    const result = Result.try(() => {
      const item = window.localStorage.getItem(key);

      if (item) {
        return JSON.parse(item) as T;
      }

      return initialValue;
    });

    return result.match({
      ok: (value) => value,
      err: (error) => {
        console.error("Error reading from localStorage:", error);

        return initialValue;
      },
    });
  });

  useEffect(
    function syncToLocalStorage() {
      const result = Result.try(() => {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      });

      if (Result.isError(result)) {
        console.error("Error writing to localStorage:", result.error);
      }
    },
    [key, storedValue],
  );

  return [storedValue, setStoredValue] as const;
}
