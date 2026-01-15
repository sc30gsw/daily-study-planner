import { useState } from "react";
import type { ViewMode, ScheduleItem } from "~/types/schedule";
import { useSchedule } from "~/hooks/use-schedule";
import { useCategories } from "~/hooks/use-categories";
import { formatDuration } from "~/utils/time-utils";
import { ClockView } from "~/components/clock-view";
import { CalendarView } from "~/components/calendar-view";
import { ScheduleForm } from "~/components/schedule-form";
import { ViewToggle } from "~/components/view-toggle";
import { StudyProgress } from "~/components/study-progress";
import { CategoryManager } from "~/components/category-manager";
import { ScheduleModal } from "~/components/schedule-modal";

export function App() {
  const [currentView, setCurrentView] = useState<ViewMode>("clock");
  const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null);
  const [clickPosition, setClickPosition] = useState<Record<"x" | "y", number> | undefined>(
    undefined,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const { items, addItem, updateItem, deleteItem } = useSchedule();
  const { categories, addCategory, updateCategory, deleteCategory, getCategoryById } =
    useCategories();

  function handleItemClick(item: ScheduleItem, position: Record<"x" | "y", number>) {
    setSelectedItem(item);
    setClickPosition(position);
    setIsModalOpen(true);
  }

  function handleFormSubmit(itemData: Omit<ScheduleItem, "id">) {
    addItem(itemData);
  }

  function handleModalSave(itemData: Omit<ScheduleItem, "id">) {
    if (selectedItem) {
      updateItem(selectedItem.id, itemData);
      setIsModalOpen(false);
      setSelectedItem(null);
    }
  }

  function handleModalClose() {
    setIsModalOpen(false);
    setSelectedItem(null);
    setClickPosition(undefined);
  }

  function handleModalDelete() {
    if (selectedItem) {
      deleteItem(selectedItem.id);
      setIsModalOpen(false);
      setSelectedItem(null);
      setClickPosition(undefined);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl p-4 sm:p-6">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Daily Study Planner</h1>
              <p className="mt-1 text-sm text-gray-600">英語学習スケジュールを管理しましょう</p>
            </div>
            <button
              onClick={function handleToggle() {
                setShowCategoryManager(!showCategoryManager);
              }}
              className="rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200"
            >
              {showCategoryManager ? "閉じる" : "カテゴリ管理"}
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
        <div className="mb-6 flex justify-center">
          <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Schedule View */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              {currentView === "clock" ? "24時間時計" : "カレンダー"}
            </h2>
            <div className="max-h-[600px] overflow-auto">
              {currentView === "clock" ? (
                <ClockView items={items} categories={categories} onItemClick={handleItemClick} />
              ) : (
                <CalendarView items={items} categories={categories} onItemClick={handleItemClick} />
              )}
            </div>
          </div>

          {/* Schedule Form & Item List */}
          <div className="space-y-6">
            <ScheduleForm categories={categories} onSubmit={handleFormSubmit} />

            {/* Schedule List */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-800">
                予定一覧 ({items.length})
              </h2>
              {items.length === 0 ? (
                <p className="text-sm text-gray-500">
                  まだ予定がありません。上のフォームから追加してください。
                </p>
              ) : (
                <ul className="max-h-64 space-y-2 overflow-auto">
                  {items
                    .sort(function sortByStartTime(a, b) {
                      return a.startTime.localeCompare(b.startTime);
                    })
                    .map(function renderListItem(item) {
                      const category = getCategoryById(item.categoryId);
                      return (
                        <li
                          key={item.id}
                          className="cursor-pointer rounded-md border border-transparent p-2 transition-colors hover:border-gray-200 hover:bg-gray-50"
                          onClick={function handleListItemClick(e) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            handleItemClick(item, {
                              x: rect.left + rect.width / 2,
                              y: rect.top + rect.height / 2,
                            });
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-800">{item.title}</span>
                            <div className="text-right">
                              <span className="text-xs text-gray-500">
                                {item.startTime} - {item.endTime}
                              </span>
                              <span className="ml-2 text-xs font-medium text-blue-600">
                                ({formatDuration(item.startTime, item.endTime)})
                              </span>
                            </div>
                          </div>
                          <div className="mt-1 flex gap-2">
                            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                              {item.type === "doing" ? "予定" : "空き時間"}
                            </span>
                            {category && (
                              <span
                                className="rounded px-2 py-0.5 text-xs text-white"
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

      {/* Schedule Edit Popover */}
      <ScheduleModal
        item={selectedItem}
        categories={categories}
        isOpen={isModalOpen}
        position={clickPosition}
        onClose={handleModalClose}
        onSave={handleModalSave}
        onDelete={handleModalDelete}
      />
    </div>
  );
}
