import type { Category } from '../types/schedule';

export const MIN_STUDY_HOURS = 3;

export const STORAGE_KEY_SCHEDULE = 'daily-study-planner-schedule';
export const STORAGE_KEY_CATEGORIES = 'daily-study-planner-categories';

export const COLOR_PALETTE: string[] = [
  '#22c55e',  // green-500
  '#3b82f6',  // blue-500
  '#a855f7',  // purple-500
  '#ef4444',  // red-500
  '#f59e0b',  // amber-500
  '#06b6d4',  // cyan-500
  '#ec4899',  // pink-500
  '#8b5cf6',  // violet-500
  '#14b8a6',  // teal-500
  '#f97316',  // orange-500
  '#6366f1',  // indigo-500
  '#6b7280',  // gray-500
];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'english', name: '英語学習', color: '#22c55e' },
  { id: 'work', name: '仕事', color: '#3b82f6' },
  { id: 'rest', name: '休憩', color: '#a855f7' },
  { id: 'other', name: 'その他', color: '#6b7280' },
];

export const TYPE_LABELS: Record<string, string> = {
  doing: '予定',
  available: '空き時間',
};

export const HOURS_IN_DAY = 24;
export const MINUTES_IN_HOUR = 60;
