import type { ScheduleItem, Category } from "~/types/schedule";
import { timeToMinutes } from "~/utils/time-utils";
import { HOURS_IN_DAY, MINUTES_IN_HOUR, HOUR_HEIGHT_CALENDAR } from "~/constants";

interface CalendarViewProps {
  items: ScheduleItem[];
  categories: readonly Category[];
  onItemClick?: (item: ScheduleItem, position: Record<"x" | "y", number>) => void;
}
const TOTAL_MINUTES = HOURS_IN_DAY * MINUTES_IN_HOUR;

export function CalendarView({ items, categories, onItemClick }: CalendarViewProps) {
  const hours = Array.from({ length: HOURS_IN_DAY }, function createHour(_, i) {
    return i;
  });

  function getCategoryColor(categoryId: Category["id"]) {
    const category = categories.find(function findCat(c) {
      return c.id === categoryId;
    });

    return category?.color ?? "#6b7280";
  }

  function calculateItemPosition(item: ScheduleItem) {
    const startMinutes = timeToMinutes(item.startTime);
    let endMinutes = timeToMinutes(item.endTime);

    // Handle overnight items
    if (endMinutes <= startMinutes) {
      endMinutes += TOTAL_MINUTES;
    }

    const top = (startMinutes / MINUTES_IN_HOUR) * HOUR_HEIGHT_CALENDAR;
    const height = ((endMinutes - startMinutes) / MINUTES_IN_HOUR) * HOUR_HEIGHT_CALENDAR;

    return { top, height: Math.max(height, 24) };
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="relative flex" style={{ height: HOURS_IN_DAY * HOUR_HEIGHT_CALENDAR }}>
        {/* Time labels column */}
        <div className="w-16 shrink-0 border-r border-gray-200 bg-gray-50">
          {hours.map(function renderHourLabel(hour) {
            return (
              <div key={hour} className="relative" style={{ height: HOUR_HEIGHT_CALENDAR }}>
                <span className="absolute -top-2 right-2 text-xs text-gray-500">
                  {hour.toString().padStart(2, "0")}:00
                </span>
              </div>
            );
          })}
        </div>

        {/* Schedule content area */}
        <div className="relative flex-1">
          {/* Hour grid lines */}
          {hours.map(function renderGridLine(hour) {
            return (
              <div
                key={hour}
                className="absolute w-full border-t border-gray-100"
                style={{ top: hour * HOUR_HEIGHT_CALENDAR }}
              />
            );
          })}

          {/* Schedule items */}
          {items.map(function renderScheduleItem(item) {
            const { top, height } = calculateItemPosition(item);
            const color = getCategoryColor(item.categoryId);
            const opacity = item.type === "doing" ? 1 : 0.6;

            return (
              <div
                key={item.id}
                className="absolute right-1 left-1 cursor-pointer overflow-hidden rounded-md px-2 py-1 transition-all hover:brightness-90"
                style={{
                  top,
                  height,
                  backgroundColor: color,
                  opacity,
                }}
                onClick={function handleItemClick(e) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  onItemClick?.(item, {
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2,
                  });
                }}
              >
                <div className="truncate text-sm font-medium text-white">{item.title}</div>
                <div className="text-xs text-white opacity-80">
                  {item.startTime} - {item.endTime}
                </div>
              </div>
            );
          })}

          {/* Current time indicator */}
          <CurrentTimeIndicator />
        </div>
      </div>
    </div>
  );
}

function CurrentTimeIndicator() {
  const currentTime = new Date();
  const currentMinutes = currentTime.getHours() * MINUTES_IN_HOUR + currentTime.getMinutes();
  const top = (currentMinutes / MINUTES_IN_HOUR) * HOUR_HEIGHT_CALENDAR;

  return (
    <div
      className="pointer-events-none absolute right-0 left-0 z-10 flex items-center"
      style={{ top }}
    >
      <div className="h-2 w-2 rounded-full bg-red-500" />
      <div className="h-0.5 flex-1 bg-red-500" />
    </div>
  );
}
