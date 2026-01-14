import { useRef, useState } from 'react';
import type { Category } from '../types/schedule';
import { COLOR_PALETTE } from '../constants/app-constants';

interface CategoryManagerProps {
  categories: Category[];
  onAdd: (name: string, color: string) => void;
  onUpdate: (id: string, updates: Partial<Omit<Category, 'id'>>) => void;
  onDelete: (id: string) => void;
}

export function CategoryManager({
  categories,
  onAdd,
  onUpdate,
  onDelete,
}: CategoryManagerProps): React.ReactNode {
  const addDialogRef = useRef<HTMLDialogElement>(null);
  const editDialogRef = useRef<HTMLDialogElement>(null);
  const deleteDialogRef = useRef<HTMLDialogElement>(null);

  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(COLOR_PALETTE[0]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  function openAddDialog(): void {
    setNewName('');
    setNewColor(COLOR_PALETTE[0]);
    addDialogRef.current?.showModal();
  }

  function closeAddDialog(): void {
    addDialogRef.current?.close();
  }

  function handleAdd(): void {
    if (newName.trim()) {
      onAdd(newName.trim(), newColor);
      closeAddDialog();
    }
  }

  function openEditDialog(category: Category): void {
    setEditingCategory(category);
    setEditName(category.name);
    setEditColor(category.color);
    editDialogRef.current?.showModal();
  }

  function closeEditDialog(): void {
    editDialogRef.current?.close();
    setEditingCategory(null);
  }

  function handleSaveEdit(): void {
    if (editingCategory && editName.trim()) {
      onUpdate(editingCategory.id, { name: editName.trim(), color: editColor });
      closeEditDialog();
    }
  }

  function openDeleteDialog(category: Category): void {
    setDeletingCategory(category);
    deleteDialogRef.current?.showModal();
  }

  function closeDeleteDialog(): void {
    deleteDialogRef.current?.close();
    setDeletingCategory(null);
  }

  function handleConfirmDelete(): void {
    if (deletingCategory) {
      onDelete(deletingCategory.id);
      closeDeleteDialog();
    }
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">カテゴリ管理</h3>
        <button
          onClick={openAddDialog}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
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
              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-gray-800">{category.name}</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={function handleClick() { openEditDialog(category); }}
                  className="px-2 py-1 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                >
                  編集
                </button>
                <button
                  onClick={function handleClick() { openDeleteDialog(category); }}
                  className="px-2 py-1 text-xs text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
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
        className="p-0 rounded-lg shadow-xl backdrop:bg-black/50 max-w-md w-full"
        onClick={function handleBackdropClick(e) {
          if (e.target === addDialogRef.current) closeAddDialog();
        }}
      >
        <div className="p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">カテゴリを追加</h4>
          <div className="space-y-4">
            <div>
              <label htmlFor="new-category-name" className="block text-sm font-medium text-gray-700 mb-1">
                カテゴリ名
              </label>
              <input
                id="new-category-name"
                type="text"
                value={newName}
                onChange={function handleChange(e) { setNewName(e.target.value); }}
                placeholder="例: 読書、運動"
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">色を選択</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PALETTE.map(function renderColor(color) {
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={function handleClick() { setNewColor(color); }}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        newColor === color ? 'border-gray-800 scale-110' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleAdd}
                disabled={!newName.trim()}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                追加
              </button>
              <button
                onClick={closeAddDialog}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      </dialog>

      {/* 編集モーダル */}
      <dialog
        ref={editDialogRef}
        className="p-0 rounded-lg shadow-xl backdrop:bg-black/50 max-w-md w-full"
        onClick={function handleBackdropClick(e) {
          if (e.target === editDialogRef.current) closeEditDialog();
        }}
      >
        <div className="p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">カテゴリを編集</h4>
          <div className="space-y-4">
            <div>
              <label htmlFor="edit-category-name" className="block text-sm font-medium text-gray-700 mb-1">
                カテゴリ名
              </label>
              <input
                id="edit-category-name"
                type="text"
                value={editName}
                onChange={function handleChange(e) { setEditName(e.target.value); }}
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">色を選択</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PALETTE.map(function renderColor(color) {
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={function handleClick() { setEditColor(color); }}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        editColor === color ? 'border-gray-800 scale-110' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSaveEdit}
                disabled={!editName.trim()}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                保存
              </button>
              <button
                onClick={closeEditDialog}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      </dialog>

      {/* 削除確認モーダル */}
      <dialog
        ref={deleteDialogRef}
        className="p-0 rounded-lg shadow-xl backdrop:bg-black/50 max-w-sm w-full"
        onClick={function handleBackdropClick(e) {
          if (e.target === deleteDialogRef.current) closeDeleteDialog();
        }}
      >
        <div className="p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">カテゴリを削除</h4>
          <p className="text-gray-600 mb-4">
            「{deletingCategory?.name}」を削除してもよろしいですか？
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleConfirmDelete}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              削除
            </button>
            <button
              onClick={closeDeleteDialog}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
