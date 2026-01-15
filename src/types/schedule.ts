export type ScheduleType = "doing" | "available";

export type TimeString = `${string}:${string}`;

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  startTime: TimeString;
  endTime: TimeString;
  type: ScheduleType;
  categoryId: Category["id"];
}

export type ViewMode = "clock" | "calendar";

export interface AppState {
  scheduleItems: ScheduleItem[];
  categories: Category[];
  currentView: ViewMode;
}
