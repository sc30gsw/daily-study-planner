import { Result } from "better-result";
import type { ScheduleItem } from "~/types/schedule";
import { STORAGE_KEY_SCHEDULE } from "~/constants";

export function saveScheduleToStorage(items: readonly ScheduleItem[]) {
  const result = Result.try(() => {
    localStorage.setItem(STORAGE_KEY_SCHEDULE, JSON.stringify(items));
  });

  if (Result.isError(result)) {
    console.error("Failed to save schedule to storage:", result.error);
  }
}

export function loadScheduleFromStorage() {
  const result = Result.try(() => {
    const data = localStorage.getItem(STORAGE_KEY_SCHEDULE);

    if (data) {
      return JSON.parse(data) as readonly ScheduleItem[];
    }

    return [] as const satisfies readonly ScheduleItem[];
  });

  return result.match({
    ok: (value) => value,
    err: (error) => {
      console.error("Failed to load schedule from storage:", error);

      return [] as const satisfies readonly ScheduleItem[];
    },
  });
}

export function clearScheduleFromStorage() {
  const result = Result.try(() => {
    localStorage.removeItem(STORAGE_KEY_SCHEDULE);
  });

  if (Result.isError(result)) {
    console.error("Failed to clear schedule from storage:", result.error);
  }
}
