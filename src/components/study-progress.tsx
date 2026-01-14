import type { ScheduleItem } from '../types/schedule';
import { calculateTotalHoursByCategory } from '../utils/time-utils';
import { MIN_STUDY_HOURS } from '../constants/app-constants';

interface StudyProgressProps {
  items: ScheduleItem[];
}

const ENGLISH_CATEGORY_ID = 'english';

export function StudyProgress({ items }: StudyProgressProps): React.ReactNode {
  const totalHours = calculateTotalHoursByCategory(items, ENGLISH_CATEGORY_ID);
  const progressPercent = Math.min((totalHours / MIN_STUDY_HOURS) * 100, 100);
  const isGoalMet = totalHours >= MIN_STUDY_HOURS;

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          今日の英語学習
        </span>
        <span className={`text-sm font-bold ${isGoalMet ? 'text-green-600' : 'text-gray-600'}`}>
          {totalHours.toFixed(1)}h / {MIN_STUDY_HOURS}h
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isGoalMet ? 'bg-green-500' : 'bg-blue-500'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="mt-2 text-xs text-gray-500">
        {isGoalMet ? (
          <span className="text-green-600">✅ 目標達成！</span>
        ) : (
          <span>あと {(MIN_STUDY_HOURS - totalHours).toFixed(1)} 時間</span>
        )}
      </div>
    </div>
  );
}
