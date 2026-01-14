import { useCallback } from 'react';
import type { ScheduleItem } from '../types/schedule';
import { useLocalStorage } from './use-local-storage';
import { generateId } from '../utils/time-utils';
import { STORAGE_KEY_SCHEDULE } from '../constants/app-constants';

interface UseScheduleReturn {
  items: ScheduleItem[];
  addItem: (item: Omit<ScheduleItem, 'id'>) => void;
  updateItem: (id: string, updates: Partial<ScheduleItem>) => void;
  deleteItem: (id: string) => void;
  clearAll: () => void;
}

export function useSchedule(): UseScheduleReturn {
  const [items, setItems] = useLocalStorage<ScheduleItem[]>(STORAGE_KEY_SCHEDULE, []);

  const addItem = useCallback(function addItemCallback(item: Omit<ScheduleItem, 'id'>): void {
    const newItem: ScheduleItem = {
      ...item,
      id: generateId(),
    };
    setItems((prev) => [...prev, newItem]);
  }, [setItems]);

  const updateItem = useCallback(function updateItemCallback(id: string, updates: Partial<ScheduleItem>): void {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  }, [setItems]);

  const deleteItem = useCallback(function deleteItemCallback(id: string): void {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, [setItems]);

  const clearAll = useCallback(function clearAllCallback(): void {
    setItems([]);
  }, [setItems]);

  return {
    items,
    addItem,
    updateItem,
    deleteItem,
    clearAll,
  };
}

export type { UseScheduleReturn };
