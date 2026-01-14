import { useState } from 'react';
import type { ScheduleItem, Category } from '../types/schedule';
import { timeToMinutes, formatDuration } from '../utils/time-utils';
import { HOURS_IN_DAY, MINUTES_IN_HOUR } from '../constants/app-constants';

interface ClockViewProps {
  items: ScheduleItem[];
  categories: Category[];
  onItemClick?: (item: ScheduleItem) => void;
}

const CLOCK_SIZE = 300;
const CENTER = CLOCK_SIZE / 2;
const OUTER_RADIUS = 140;
const INNER_RADIUS = 60;

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number): { x: number; y: number } {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians)),
  };
}

function describeArc(x: number, y: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number): string {
  const startOuter = polarToCartesian(x, y, outerRadius, endAngle);
  const endOuter = polarToCartesian(x, y, outerRadius, startAngle);
  const startInner = polarToCartesian(x, y, innerRadius, startAngle);
  const endInner = polarToCartesian(x, y, innerRadius, endAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', startOuter.x, startOuter.y,
    'A', outerRadius, outerRadius, 0, largeArcFlag, 0, endOuter.x, endOuter.y,
    'L', startInner.x, startInner.y,
    'A', innerRadius, innerRadius, 0, largeArcFlag, 1, endInner.x, endInner.y,
    'Z',
  ].join(' ');
}

function timeToAngle(time: string): number {
  const minutes = timeToMinutes(time);
  return (minutes / (HOURS_IN_DAY * MINUTES_IN_HOUR)) * 360;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  item: ScheduleItem | null;
}

export function ClockView({ items, categories, onItemClick }: ClockViewProps): React.ReactNode {
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, item: null });
  const hourMarkers = Array.from({ length: HOURS_IN_DAY }, function createHour(_, i) { return i; });

  function getCategoryColor(categoryId: string): string {
    const category = categories.find(function findCat(c) { return c.id === categoryId; });
    return category?.color ?? '#6b7280';
  }

  function getCategoryName(categoryId: string): string {
    const category = categories.find(function findCat(c) { return c.id === categoryId; });
    return category?.name ?? '不明';
  }

  function handleMouseEnter(event: React.MouseEvent, item: ScheduleItem): void {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top,
      item,
    });
  }

  function handleMouseLeave(): void {
    setTooltip({ visible: false, x: 0, y: 0, item: null });
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg
          width={CLOCK_SIZE}
          height={CLOCK_SIZE}
          viewBox={`0 0 ${CLOCK_SIZE} ${CLOCK_SIZE}`}
          className="drop-shadow-lg"
        >
        {/* Background circle */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={OUTER_RADIUS}
          fill="#f3f4f6"
          stroke="#e5e7eb"
          strokeWidth="2"
        />

        {/* Inner circle (empty space) */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={INNER_RADIUS}
          fill="white"
          stroke="#e5e7eb"
          strokeWidth="1"
        />

        {/* Schedule items as arcs */}
        {items.map(function renderScheduleArc(item) {
          const startAngle = timeToAngle(item.startTime);
          let endAngle = timeToAngle(item.endTime);

          // Handle overnight items
          if (endAngle <= startAngle) {
            endAngle += 360;
          }

          const color = getCategoryColor(item.categoryId);
          const opacity = item.type === 'doing' ? 1 : 0.5;

          return (
            <path
              key={item.id}
              d={describeArc(CENTER, CENTER, INNER_RADIUS + 5, OUTER_RADIUS - 5, startAngle, endAngle)}
              fill={color}
              fillOpacity={opacity}
              stroke={color}
              strokeWidth="1"
              className="cursor-pointer hover:brightness-90 transition-all"
              onClick={function handleArcClick() { onItemClick?.(item); }}
              onMouseEnter={function handleEnter(e) { handleMouseEnter(e, item); }}
              onMouseLeave={handleMouseLeave}
            />
          );
        })}

        {/* Hour markers */}
        {hourMarkers.map(function renderHourMarker(hour) {
          const angle = (hour / HOURS_IN_DAY) * 360;
          const isMainHour = hour % 6 === 0;
          const outerPoint = polarToCartesian(CENTER, CENTER, OUTER_RADIUS - 2, angle);
          const innerPoint = polarToCartesian(CENTER, CENTER, OUTER_RADIUS - (isMainHour ? 15 : 8), angle);
          const labelPoint = polarToCartesian(CENTER, CENTER, INNER_RADIUS + 25, angle);

          return (
            <g key={hour}>
              <line
                x1={outerPoint.x}
                y1={outerPoint.y}
                x2={innerPoint.x}
                y2={innerPoint.y}
                stroke={isMainHour ? '#374151' : '#9ca3af'}
                strokeWidth={isMainHour ? 2 : 1}
              />
              {isMainHour && (
                <text
                  x={labelPoint.x}
                  y={labelPoint.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-medium fill-gray-600"
                >
                  {hour}
                </text>
              )}
            </g>
          );
        })}

        {/* Center label */}
        <text
          x={CENTER}
          y={CENTER}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-sm font-medium fill-gray-700"
        >
          24h
        </text>
      </svg>

      </div>

      {/* Tooltip - fixed position to render above everything */}
      {tooltip.visible && tooltip.item && (
        <div
          className="fixed z-[9999] bg-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{ left: tooltip.x, top: tooltip.y - 8 }}
        >
          <div className="font-semibold mb-1">{tooltip.item.title}</div>
          <div className="text-gray-300">
            {tooltip.item.startTime} - {tooltip.item.endTime}
          </div>
          <div className="text-gray-300">
            {formatDuration(tooltip.item.startTime, tooltip.item.endTime)}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getCategoryColor(tooltip.item.categoryId) }}
            />
            <span>{getCategoryName(tooltip.item.categoryId)}</span>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800" />
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        {categories.map(function renderLegend(category) {
          return (
            <div key={category.id} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-xs text-gray-600">{category.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
