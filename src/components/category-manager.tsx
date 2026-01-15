import type { AnyFieldApi } from "@tanstack/react-form";
import type { Category } from "~/types/schedule";
import { COLOR_PALETTE } from "~/constants";
import { useCategoryManager } from "~/hooks/use-category-manager";

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

interface CategoryManagerProps {
  categories: readonly Category[];
  onAdd: (name: Category["name"], color: Category["color"]) => void;
  onUpdate: (id: Category["id"], updates: Partial<Omit<Category, "id">>) => void;
  onDelete: (id: Category["id"]) => void;
}

export function CategoryManager({ categories, onAdd, onUpdate, onDelete }: CategoryManagerProps) {
  const {
    addDialogRef,
    editDialogRef,
    deleteDialogRef,
    addForm,
    editForm,
    deletingCategory,
    openAddDialog,
    closeAddDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
    handleConfirmDelete,
  } = useCategoryManager({
    onAdd,
    onUpdate,
    onDelete,
  });

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">カテゴリ管理</h3>
        <button
          onClick={openAddDialog}
          className="rounded-md bg-blue-500 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-600"
        >
          + 追加
        </button>
      </div>

      {/* カテゴリ一覧 */}
      <ul className="space-y-2">
        {categories.map(function renderCategory(category) {
          return (
            <li
              key={category.id}
              className="flex items-center justify-between rounded-md p-2 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full" style={{ backgroundColor: category.color }} />
                <span className="text-gray-800">{category.name}</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={function handleClick() {
                    openEditDialog(category);
                  }}
                  className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                >
                  編集
                </button>
                <button
                  onClick={function handleClick() {
                    openDeleteDialog(category);
                  }}
                  className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-red-50 hover:text-red-600"
                >
                  削除
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* 追加モーダル */}
      <dialog
        ref={addDialogRef}
        className="top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg p-0 shadow-xl backdrop:bg-black/50"
        onClick={function handleBackdropClick(e) {
          if (e.target === addDialogRef.current) closeAddDialog();
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addForm.handleSubmit();
          }}
          className="p-6"
        >
          <h4 className="mb-4 text-lg font-semibold text-gray-800">カテゴリを追加</h4>
          <div className="space-y-4">
            <addForm.Field
              name="name"
              children={(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    カテゴリ名
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type="text"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="例: 読書、運動"
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

            <addForm.Field
              name="color"
              children={(field) => (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">色を選択</label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PALETTE.map(function renderColor(color) {
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={function handleClick() {
                            field.handleChange(color);
                          }}
                          className={`h-8 w-8 rounded-full border-2 transition-all ${
                            field.state.value === color
                              ? "scale-110 border-gray-800"
                              : "border-transparent hover:scale-105"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            />

            <addForm.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="flex-1 rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {isSubmitting ? "追加中..." : "追加"}
                  </button>
                  <button
                    type="button"
                    onClick={closeAddDialog}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    キャンセル
                  </button>
                </div>
              )}
            />
          </div>
        </form>
      </dialog>

      {/* 編集モーダル */}
      <dialog
        ref={editDialogRef}
        className="top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg p-0 shadow-xl backdrop:bg-black/50"
        onClick={function handleBackdropClick(e) {
          if (e.target === editDialogRef.current) closeEditDialog();
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            editForm.handleSubmit();
          }}
          className="p-6"
        >
          <h4 className="mb-4 text-lg font-semibold text-gray-800">カテゴリを編集</h4>
          <div className="space-y-4">
            <editForm.Field
              name="name"
              children={(field) => (
                <div>
                  <label
                    htmlFor="edit-category-name"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    カテゴリ名
                  </label>
                  <input
                    id="edit-category-name"
                    name={field.name}
                    type="text"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={`w-full rounded-md border bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      field.state.meta.isTouched && !field.state.meta.isValid
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <FieldInfo field={field} />
                </div>
              )}
            />

            <editForm.Field
              name="color"
              children={(field) => (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">色を選択</label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PALETTE.map(function renderColor(color) {
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={function handleClick() {
                            field.handleChange(color);
                          }}
                          className={`h-8 w-8 rounded-full border-2 transition-all ${
                            field.state.value === color
                              ? "scale-110 border-gray-800"
                              : "border-transparent hover:scale-105"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            />

            <editForm.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="flex-1 rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {isSubmitting ? "保存中..." : "保存"}
                  </button>
                  <button
                    type="button"
                    onClick={closeEditDialog}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    キャンセル
                  </button>
                </div>
              )}
            />
          </div>
        </form>
      </dialog>

      {/* 削除確認モーダル */}
      <dialog
        ref={deleteDialogRef}
        className="top-1/2 left-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg p-0 shadow-xl backdrop:bg-black/50"
        onClick={function handleBackdropClick(e) {
          if (e.target === deleteDialogRef.current) closeDeleteDialog();
        }}
      >
        <div className="p-6">
          <h4 className="mb-2 text-lg font-semibold text-gray-800">カテゴリを削除</h4>
          <p className="mb-4 text-gray-600">
            「{deletingCategory?.name}」を削除してもよろしいですか？
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleConfirmDelete}
              className="flex-1 rounded-md bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
            >
              削除
            </button>
            <button
              onClick={closeDeleteDialog}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
            >
              キャンセル
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
