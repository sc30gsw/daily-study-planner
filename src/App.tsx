import { useState } from 'react';
import type { ViewMode, ScheduleItem } from './types/schedule';
import { useSchedule } from './hooks/use-schedule';
import { useCategories } from './hooks/use-categories';
import { formatDuration } from './utils/time-utils';
import { ClockView } from './components/clock-view';
import { CalendarView } from './components/calendar-view';
import { ScheduleForm } from './components/schedule-form';
import { ViewToggle } from './components/view-toggle';
import { StudyProgress } from './components/study-progress';
import { CategoryManager } from './components/category-manager';

export function App(): React.ReactNode {
  const [currentView, setCurrentView] = useState<ViewMode>('clock');
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const { items, addItem, updateItem, deleteItem } = useSchedule();
  const { categories, addCategory, updateCategory, deleteCategory, getCategoryById } = useCategories();

  function handleItemClick(item: ScheduleItem): void {
    setEditingItem(item);
  }

  function handleFormSubmit(itemData: Omit<ScheduleItem, 'id'>): void {
    if (editingItem) {
      updateItem(editingItem.id, itemData);
      setEditingItem(null);
    } else {
      addItem(itemData);
    }
  }

  function handleFormCancel(): void {
    setEditingItem(null);
  }

  function handleDeleteItem(): void {
    if (editingItem) {
      deleteItem(editingItem.id);
      setEditingItem(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Daily Study Planner
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                英語学習スケジュールを管理しましょう
              </p>
            </div>
            <button
              onClick={function handleToggle() { setShowCategoryManager(!showCategoryManager); }}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              {showCategoryManager ? '閉じる' : 'カテゴリ管理'}
            </button>
          </div>
        </header>

        {/* Category Manager */}
        {showCategoryManager && (
          <div className="mb-6">
            <CategoryManager
              categories={categories}
              onAdd={addCategory}
              onUpdate={updateCategory}
              onDelete={deleteCategory}
            />
          </div>
        )}

        {/* Study Progress */}
        <div className="mb-6">
          <StudyProgress items={items} />
        </div>

        {/* View Toggle */}
        <div className="flex justify-center mb-6">
          <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Schedule View */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {currentView === 'clock' ? '24時間時計' : 'カレンダー'}
            </h2>
            <div className="overflow-auto max-h-[600px]">
              {currentView === 'clock' ? (
                <ClockView items={items} categories={categories} onItemClick={handleItemClick} />
              ) : (
                <CalendarView items={items} categories={categories} onItemClick={handleItemClick} />
              )}
            </div>
          </div>

          {/* Schedule Form & Item List */}
          <div className="space-y-6">
            <ScheduleForm
              categories={categories}
              onSubmit={handleFormSubmit}
              editingItem={editingItem}
              onCancel={editingItem ? handleFormCancel : undefined}
            />

            {/* Delete Button (when editing) */}
            {editingItem && (
              <button
                onClick={handleDeleteItem}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                この予定を削除
              </button>
            )}

            {/* Schedule List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                予定一覧 ({items.length})
              </h2>
              {items.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  まだ予定がありません。上のフォームから追加してください。
                </p>
              ) : (
                <ul className="space-y-2 max-h-64 overflow-auto">
                  {items
                    .sort(function sortByStartTime(a, b) {
                      return a.startTime.localeCompare(b.startTime);
                    })
                    .map(function renderListItem(item) {
                      const category = getCategoryById(item.categoryId);
                      return (
                        <li
                          key={item.id}
                          className={`p-2 rounded-md cursor-pointer hover:bg-gray-50 border ${
                            editingItem?.id === item.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-transparent'
                          }`}
                          onClick={function handleListItemClick() { handleItemClick(item); }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-800">
                              {item.title}
                            </span>
                            <div className="text-right">
                              <span className="text-xs text-gray-500">
                                {item.startTime} - {item.endTime}
                              </span>
                              <span className="text-xs text-blue-600 font-medium ml-2">
                                ({formatDuration(item.startTime, item.endTime)})
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                              {item.type === 'doing' ? '予定' : '空き時間'}
                            </span>
                            {category && (
                              <span
                                className="text-xs px-2 py-0.5 rounded text-white"
                                style={{ backgroundColor: category.color }}
                              >
                                {category.name}
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
