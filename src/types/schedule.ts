export type ScheduleType = 'doing' | 'available';

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  startTime: string; // "HH:mm" format
  endTime: string;   // "HH:mm" format
  type: ScheduleType;
  categoryId: string;
}

export type ViewMode = 'clock' | 'calendar';

export interface AppState {
  scheduleItems: ScheduleItem[];
  categories: Category[];
  currentView: ViewMode;
}
