import type { ScheduleItem, Category } from '../types/schedule';
import { timeToMinutes } from '../utils/time-utils';
import { HOURS_IN_DAY, MINUTES_IN_HOUR } from '../constants/app-constants';

interface CalendarViewProps {
  items: ScheduleItem[];
  categories: Category[];
  onItemClick?: (item: ScheduleItem) => void;
}

const HOUR_HEIGHT = 48; // pixels per hour
const TOTAL_MINUTES = HOURS_IN_DAY * MINUTES_IN_HOUR;

export function CalendarView({ items, categories, onItemClick }: CalendarViewProps): React.ReactNode {
  const hours = Array.from({ length: HOURS_IN_DAY }, function createHour(_, i) { return i; });

  function getCategoryColor(categoryId: string): string {
    const category = categories.find(function findCat(c) { return c.id === categoryId; });
    return category?.color ?? '#6b7280';
  }

  function calculateItemPosition(item: ScheduleItem): { top: number; height: number } {
    const startMinutes = timeToMinutes(item.startTime);
    let endMinutes = timeToMinutes(item.endTime);

    // Handle overnight items
    if (endMinutes <= startMinutes) {
      endMinutes += TOTAL_MINUTES;
    }

    const top = (startMinutes / MINUTES_IN_HOUR) * HOUR_HEIGHT;
    const height = ((endMinutes - startMinutes) / MINUTES_IN_HOUR) * HOUR_HEIGHT;

    return { top, height: Math.max(height, 24) };
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="relative flex" style={{ height: HOURS_IN_DAY * HOUR_HEIGHT }}>
        {/* Time labels column */}
        <div className="shrink-0 border-r border-gray-200 bg-gray-50 w-16">
          {hours.map(function renderHourLabel(hour) {
            return (
              <div
                key={hour}
                className="relative"
                style={{ height: HOUR_HEIGHT }}
              >
                <span className="absolute -top-2 right-2 text-xs text-gray-500">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
            );
          })}
        </div>

        {/* Schedule content area */}
        <div className="flex-1 relative">
          {/* Hour grid lines */}
          {hours.map(function renderGridLine(hour) {
            return (
              <div
                key={hour}
                className="absolute w-full border-t border-gray-100"
                style={{ top: hour * HOUR_HEIGHT }}
              />
            );
          })}

          {/* Schedule items */}
          {items.map(function renderScheduleItem(item) {
            const { top, height } = calculateItemPosition(item);
            const color = getCategoryColor(item.categoryId);
            const opacity = item.type === 'doing' ? 1 : 0.6;

            return (
              <div
                key={item.id}
                className="absolute left-1 right-1 rounded-md px-2 py-1 overflow-hidden cursor-pointer hover:brightness-90 transition-all"
                style={{
                  top,
                  height,
                  backgroundColor: color,
                  opacity,
                }}
                onClick={function handleItemClick() { onItemClick?.(item); }}
              >
                <div className="text-white text-sm font-medium truncate">
                  {item.title}
                </div>
                <div className="text-white text-xs opacity-80">
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

function CurrentTimeIndicator(): React.ReactNode {
  const now = new Date();
  const currentMinutes = now.getHours() * MINUTES_IN_HOUR + now.getMinutes();
  const top = (currentMinutes / MINUTES_IN_HOUR) * HOUR_HEIGHT;

  return (
    <div
      className="absolute left-0 right-0 flex items-center pointer-events-none z-10"
      style={{ top }}
    >
      <div className="w-2 h-2 bg-red-500 rounded-full" />
      <div className="flex-1 h-0.5 bg-red-500" />
    </div>
  );
}
