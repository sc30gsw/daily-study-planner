import type { AnyFieldApi } from "@tanstack/react-form";
import { IconX } from "@tabler/icons-react";
import type { ScheduleItem, ScheduleType, Category } from "~/types/schedule";
import { TYPE_LABELS } from "~/constants";
import { formatDuration } from "~/utils/time-utils";
import { useScheduleModal } from "~/hooks/use-schedule-modal";

function FieldInfo({ field }: Record<"field", AnyFieldApi>) {
  return (
    <>
      {field.state.meta.isTouched && !field.state.meta.isValid ? (
        <p className="mt-1 text-sm text-red-600">
          {field.state.meta.errors.map((err) => err.message).join(", ")}
        </p>
      ) : null}
    </>
  );
}

interface ScheduleModalProps {
  item: ScheduleItem | null;
  categories: readonly Category[];
  isOpen: boolean;
  position?: { x: number; y: number };
  onClose: () => void;
  onSave: (itemData: Omit<ScheduleItem, "id">) => void;
  onDelete: () => void;
}

export function ScheduleModal({
  item,
  categories,
  isOpen,
  position,
  onClose,
  onSave,
  onDelete,
}: ScheduleModalProps) {
  const { popoverRef, popoverPosition, form, getCategoryColor } = useScheduleModal({
    item,
    categories,
    isOpen,
    position,
    onClose,
    onSave,
  });

  if (!item || !isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      {/* Popover */}
      <div
        ref={popoverRef}
        className="fixed z-50 w-full max-w-lg rounded-lg border border-gray-200 bg-white shadow-xl"
        style={{
          top: `${popoverPosition.top}px`,
          left: `${popoverPosition.left}px`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="relative">
            {/* Header with color bar */}
            <form.Field
              name="categoryId"
              children={(field) => (
                <div
                  className="h-2 rounded-t-lg"
                  style={{ backgroundColor: getCategoryColor(field.state.value) }}
                />
              )}
            />

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <IconX size={20} />
            </button>

            {/* Content */}
            <div className="p-6 pt-4">
              {/* Title */}
              <form.Field
                name="title"
                children={(field) => (
                  <div className="mb-4">
                    <input
                      type="text"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="タイトルを追加"
                      className={`w-full border-b-2 bg-transparent pb-2 text-xl font-semibold text-gray-800 transition-colors placeholder:text-gray-400 focus:outline-none ${
                        field.state.meta.isTouched && !field.state.meta.isValid
                          ? "border-red-500"
                          : "border-transparent focus:border-blue-500"
                      }`}
                    />
                    <FieldInfo field={field} />
                  </div>
                )}
              />

              {/* Time */}
              <div className="mb-4 flex items-center gap-4">
                <form.Field
                  name="startTime"
                  children={(field) => (
                    <div className="flex-1">
                      <label className="mb-1 block text-sm text-gray-600">開始</label>
                      <input
                        type="time"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className={`w-full rounded-md border bg-white px-3 py-2 text-gray-900 [color-scheme:light] focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                          field.state.meta.isTouched && !field.state.meta.isValid
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      <FieldInfo field={field} />
                    </div>
                  )}
                />

                <form.Field
                  name="endTime"
                  children={(field) => (
                    <div className="flex-1">
                      <label className="mb-1 block text-sm text-gray-600">終了</label>
                      <input
                        type="time"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className={`w-full rounded-md border bg-white px-3 py-2 text-gray-900 [color-scheme:light] focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                          field.state.meta.isTouched && !field.state.meta.isValid
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      <FieldInfo field={field} />
                    </div>
                  )}
                />
              </div>

              {/* Duration display */}
              <form.Subscribe
                selector={(state) => [state.values.startTime, state.values.endTime]}
                children={([startTime, endTime]) => (
                  <div className="mb-4 text-sm text-gray-600">
                    所要時間:{" "}
                    <span className="font-medium text-blue-600">
                      {formatDuration(startTime, endTime)}
                    </span>
                  </div>
                )}
              />

              {/* Type */}
              <form.Field
                name="type"
                children={(field) => (
                  <div className="mb-4">
                    <label className="mb-2 block text-sm text-gray-600">種類</label>
                    <div className="flex gap-4">
                      {(Object.entries(TYPE_LABELS) as [ScheduleType, string][]).map(
                        function renderOption([value, label]) {
                          return (
                            <label key={value} className="flex cursor-pointer items-center gap-2">
                              <input
                                type="radio"
                                name="type"
                                value={value}
                                checked={field.state.value === value}
                                onChange={function handleChange() {
                                  field.handleChange(value as ScheduleType);
                                }}
                                className="h-4 w-4 border-gray-300 bg-white text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{label}</span>
                            </label>
                          );
                        },
                      )}
                    </div>
                  </div>
                )}
              />

              {/* Category */}
              <form.Field
                name="categoryId"
                children={(field) => (
                  <div className="mb-6">
                    <label className="mb-2 block text-sm text-gray-600">カテゴリ</label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(function renderCategory(category) {
                        const isSelected = field.state.value === category.id;
                        return (
                          <button
                            key={category.id}
                            type="button"
                            onClick={function handleClick() {
                              field.handleChange(category.id);
                            }}
                            className={`flex items-center gap-2 rounded-full border-2 px-3 py-1.5 transition-all ${
                              isSelected
                                ? "border-gray-800 bg-gray-100"
                                : "border-transparent bg-gray-50 hover:bg-gray-100"
                            }`}
                          >
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="text-sm text-gray-700">{category.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              />

              {/* Actions */}
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <div className="flex gap-2 border-t border-gray-200 pt-2">
                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className="flex-1 rounded-md bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      {isSubmitting ? "保存中..." : "保存"}
                    </button>
                    <button
                      type="button"
                      onClick={onDelete}
                      className="rounded-md border border-red-300 bg-white px-4 py-2 font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                      削除
                    </button>
                  </div>
                )}
              />
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
