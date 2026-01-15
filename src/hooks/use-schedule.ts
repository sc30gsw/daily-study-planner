import { useCallback } from "react";
import type { ScheduleItem } from "~/types/schedule";
import { useLocalStorage } from "~/hooks/use-local-storage";
import { generateId } from "~/utils/time-utils";
import { STORAGE_KEY_SCHEDULE } from "~/constants";

export function useSchedule() {
  const [items, setItems] = useLocalStorage<ScheduleItem[]>(STORAGE_KEY_SCHEDULE, []);

  const addItem = useCallback(
    function addItemCallback(item: Omit<ScheduleItem, "id">) {
      const newItem = {
        ...item,
        id: generateId(),
      } as const satisfies ScheduleItem;

      setItems((prev) => [...prev, newItem]);
    },
    [setItems],
  );

  const updateItem = useCallback(
    function updateItemCallback(id: ScheduleItem["id"], updates: Partial<ScheduleItem>) {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
    },
    [setItems],
  );

  const deleteItem = useCallback(
    function deleteItemCallback(id: ScheduleItem["id"]) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    },
    [setItems],
  );

  const clearAll = useCallback(
    function clearAllCallback() {
      setItems([]);
    },
    [setItems],
  );

  return {
    items,
    addItem,
    updateItem,
    deleteItem,
    clearAll,
  } as const;
}
