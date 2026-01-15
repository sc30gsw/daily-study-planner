import { diffMinutes } from "@formkit/tempo";
import type { ScheduleItem, Category } from "~/types/schedule";
import { MINUTES_IN_HOUR } from "~/constants";

function timeStringToDate(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date;
}

export function formatDuration(startTime: string, endTime: string) {
  const startDate = timeStringToDate(startTime);
  let endDate = timeStringToDate(endTime);

  // Handle overnight (endTime < startTime)
  if (endDate <= startDate) {
    endDate.setDate(endDate.getDate() + 1);
  }

  const totalMinutes = diffMinutes(endDate, startDate);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}分`;
  }

  if (minutes === 0) {
    return `${hours}時間`;
  }

  return `${hours}時間${minutes}分`;
}

export function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * MINUTES_IN_HOUR + minutes;
}

export function minutesToTime(minutes: number) {
  const hours = Math.floor(minutes / MINUTES_IN_HOUR);
  const mins = minutes % MINUTES_IN_HOUR;

  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

export function calculateDurationInHours(startTime: string, endTime: string) {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const durationMinutes =
    endMinutes >= startMinutes
      ? endMinutes - startMinutes
      : 24 * MINUTES_IN_HOUR - startMinutes + endMinutes;

  return durationMinutes / MINUTES_IN_HOUR;
}

export function calculateTotalHoursByCategory(items: ScheduleItem[], categoryId: Category["id"]) {
  return items
    .filter(function filterItems(item) {
      return item.categoryId === categoryId && item.type === "doing";
    })
    .reduce(function sumHours(total, item) {
      return total + calculateDurationInHours(item.startTime, item.endTime);
    }, 0);
}

export function timeToAngle(time: string) {
  const minutes = timeToMinutes(time);

  // 0:00 is at the top (12 o'clock position), so we start from -90 degrees
  return (minutes / (24 * MINUTES_IN_HOUR)) * 360 - 90;
}

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function formatTime(time: string) {
  return time;
}

export function isOverlapping(item1: ScheduleItem, item2: ScheduleItem) {
  const start1 = timeToMinutes(item1.startTime);
  const end1 = timeToMinutes(item1.endTime);
  const start2 = timeToMinutes(item2.startTime);
  const end2 = timeToMinutes(item2.endTime);

  return (start1 < end2 && end1 > start2) || (start2 < end1 && end2 > start1);
}
