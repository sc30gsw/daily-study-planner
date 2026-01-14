import type { ScheduleItem } from '../types/schedule';
import { STORAGE_KEY_SCHEDULE } from '../constants/app-constants';

export function saveScheduleToStorage(items: ScheduleItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SCHEDULE, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save schedule to storage:', error);
  }
}

export function loadScheduleFromStorage(): ScheduleItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_SCHEDULE);
    if (data) {
      return JSON.parse(data) as ScheduleItem[];
    }
  } catch (error) {
    console.error('Failed to load schedule from storage:', error);
  }
  return [];
}

export function clearScheduleFromStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_SCHEDULE);
  } catch (error) {
    console.error('Failed to clear schedule from storage:', error);
  }
}
