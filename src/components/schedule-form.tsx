import { useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import * as v from 'valibot';
import type { ScheduleItem, ScheduleType, Category } from '../types/schedule';
import { TYPE_LABELS } from '../constants/app-constants';

const titleSchema = v.pipe(
  v.string(),
  v.trim(),
  v.minLength(1, 'タイトルを入力してください')
);

const timeSchema = v.pipe(
  v.string(),
  v.regex(/^([01]\d|2[0-3]):([0-5]\d)$/, '正しい時間形式で入力してください')
);

interface ScheduleFormProps {
  categories: Category[];
  onSubmit: (item: Omit<ScheduleItem, 'id'>) => void;
  editingItem?: ScheduleItem | null;
  onCancel?: () => void;
}

export function ScheduleForm({ categories, onSubmit, editingItem, onCancel }: ScheduleFormProps): React.ReactNode {
  const defaultCategoryId = categories[0]?.id ?? '';

  const form = useForm({
    defaultValues: {
      title: editingItem?.title ?? '',
      startTime: editingItem?.startTime ?? '09:00',
      endTime: editingItem?.endTime ?? '10:00',
      type: (editingItem?.type ?? 'doing') as ScheduleType,
      categoryId: editingItem?.categoryId ?? defaultCategoryId,
    },
    onSubmit: function handleFormSubmit({ value }) {
      onSubmit(value);
      if (!editingItem) {
        form.reset();
      }
    },
  });

  useEffect(function syncEditingItem() {
    if (editingItem) {
      form.setFieldValue('title', editingItem.title);
      form.setFieldValue('startTime', editingItem.startTime);
      form.setFieldValue('endTime', editingItem.endTime);
      form.setFieldValue('type', editingItem.type);
      form.setFieldValue('categoryId', editingItem.categoryId);
    } else {
      form.reset();
    }
  }, [editingItem]);

  return (
    <form
      onSubmit={function handleSubmit(e) {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="p-4 bg-white rounded-lg shadow-sm border border-gray-200"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        {editingItem ? '予定を編集' : '新しい予定'}
      </h3>

      <div className="space-y-4">
        {/* タイトル */}
        <form.Field
          name="title"
          validators={{
            onBlur: titleSchema,
            onSubmit: titleSchema,
          }}
        >
          {function renderTitleField(field) {
            const errors = field.state.meta.errors;
            const hasError = errors && errors.length > 0;
            const errorMessage = hasError ? (typeof errors[0] === 'string' ? errors[0] : errors[0]?.message) : null;
            return (
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  タイトル
                </label>
                <input
                  id="title"
                  type="text"
                  value={field.state.value}
                  onChange={function handleChange(e) { field.handleChange(e.target.value); }}
                  onBlur={field.handleBlur}
                  placeholder="例: 英語リーディング"
                  className={`w-full px-3 py-2 bg-white text-gray-900 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 ${hasError ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errorMessage && (
                  <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
                )}
              </div>
            );
          }}
        </form.Field>

        {/* 時間 */}
        <div className="grid grid-cols-2 gap-4">
          <form.Field
            name="startTime"
            validators={{
              onBlur: timeSchema,
              onSubmit: timeSchema,
            }}
          >
            {function renderStartTimeField(field) {
              const errors = field.state.meta.errors;
              const hasError = errors && errors.length > 0;
              const errorMessage = hasError ? (typeof errors[0] === 'string' ? errors[0] : errors[0]?.message) : null;
              return (
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                    開始時間
                  </label>
                  <input
                    id="startTime"
                    type="time"
                    value={field.state.value}
                    onChange={function handleChange(e) { field.handleChange(e.target.value); }}
                    onBlur={field.handleBlur}
                    className={`w-full px-3 py-2 bg-white text-gray-900 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:light] ${hasError ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errorMessage && (
                    <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
                  )}
                </div>
              );
            }}
          </form.Field>

          <form.Field
            name="endTime"
            validators={{
              onBlur: timeSchema,
              onSubmit: timeSchema,
            }}
          >
            {function renderEndTimeField(field) {
              const errors = field.state.meta.errors;
              const hasError = errors && errors.length > 0;
              const errorMessage = hasError ? (typeof errors[0] === 'string' ? errors[0] : errors[0]?.message) : null;
              return (
                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                    終了時間
                  </label>
                  <input
                    id="endTime"
                    type="time"
                    value={field.state.value}
                    onChange={function handleChange(e) { field.handleChange(e.target.value); }}
                    onBlur={field.handleBlur}
                    className={`w-full px-3 py-2 bg-white text-gray-900 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:light] ${hasError ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errorMessage && (
                    <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
                  )}
                </div>
              );
            }}
          </form.Field>
        </div>

        {/* 種類 */}
        <form.Field name="type">
          {function renderTypeField(field) {
            return (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  種類
                </label>
                <div className="flex gap-4">
                  {(Object.entries(TYPE_LABELS) as [ScheduleType, string][]).map(function renderOption([value, label]) {
                    return (
                      <label key={value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="type"
                          value={value}
                          checked={field.state.value === value}
                          onChange={function handleChange() { field.handleChange(value); }}
                          className="w-4 h-4 text-blue-600 bg-white border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          }}
        </form.Field>

        {/* カテゴリ */}
        <form.Field name="categoryId">
          {function renderCategoryField(field) {
            return (
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                  カテゴリ
                </label>
                <select
                  id="categoryId"
                  value={field.state.value}
                  onChange={function handleChange(e) { field.handleChange(e.target.value); }}
                  onBlur={field.handleBlur}
                  className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(function renderOption(category) {
                    return (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            );
          }}
        </form.Field>

        {/* ボタン */}
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium"
          >
            {editingItem ? '更新' : '追加'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              キャンセル
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
