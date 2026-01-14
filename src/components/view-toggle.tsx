import type { ViewMode } from '../types/schedule';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps): React.ReactNode {
  return (
    <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
      <button
        onClick={function handleClockClick() { onViewChange('clock'); }}
        className={`px-4 py-2 rounded-md transition-colors ${
          currentView === 'clock'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        🕐 時計
      </button>
      <button
        onClick={function handleCalendarClick() { onViewChange('calendar'); }}
        className={`px-4 py-2 rounded-md transition-colors ${
          currentView === 'calendar'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        📅 カレンダー
      </button>
    </div>
  );
}
