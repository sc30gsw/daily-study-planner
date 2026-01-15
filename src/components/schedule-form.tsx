import type { AnyFieldApi } from "@tanstack/react-form";
import type { ScheduleItem, ScheduleType, Category } from "~/types/schedule";
import { TYPE_LABELS } from "~/constants";
import { useScheduleForm } from "~/hooks/use-schedule-form";

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

interface ScheduleFormProps {
  categories: readonly Category[];
  onSubmit: (item: Omit<ScheduleItem, "id">) => void;
}

export function ScheduleForm({ categories, onSubmit }: ScheduleFormProps) {
  const { form } = useScheduleForm({ categories, onSubmit });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
    >
      <h3 className="mb-4 text-lg font-semibold text-gray-800">新しい予定</h3>

      <div className="space-y-4">
        {/* タイトル */}
        <form.Field
          name="title"
          children={(field) => (
            <div>
              <label htmlFor={field.name} className="mb-1 block text-sm font-medium text-gray-700">
                タイトル
              </label>
              <input
                id={field.name}
                name={field.name}
                type="text"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="例: 英語リーディング"
                className={`w-full rounded-md border bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  field.state.meta.isTouched && !field.state.meta.isValid
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              <FieldInfo field={field} />
            </div>
          )}
        />

        {/* 時間 */}
        <div className="grid grid-cols-2 gap-4">
          <form.Field
            name="startTime"
            children={(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  開始時間
                </label>
                <input
                  id={field.name}
                  name={field.name}
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
              <div>
                <label
                  htmlFor={field.name}
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  終了時間
                </label>
                <input
                  id={field.name}
                  name={field.name}
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

        {/* 種類 */}
        <form.Field
          name="type"
          children={(field) => (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">種類</label>
              <div className="flex gap-4">
                {(Object.entries(TYPE_LABELS) as [ScheduleType, string][]).map(([value, label]) => (
                  <label key={value} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name={field.name}
                      value={value}
                      checked={field.state.value === value}
                      onChange={() => field.handleChange(value as ScheduleType)}
                      className="h-4 w-4 border-gray-300 bg-white text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        />

        {/* カテゴリ */}
        <form.Field
          name="categoryId"
          children={(field) => (
            <div>
              <label htmlFor={field.name} className="mb-1 block text-sm font-medium text-gray-700">
                カテゴリ
              </label>
              <select
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        />

        {/* ボタン */}
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <div className="pt-2">
              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full rounded-md bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isSubmitting ? "追加中..." : "追加"}
              </button>
            </div>
          )}
        />
      </div>
    </form>
  );
}
