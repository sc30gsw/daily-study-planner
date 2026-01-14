import { useState } from 'react';
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
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(COLOR_PALETTE[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  function handleAdd(): void {
    if (newName.trim()) {
      onAdd(newName.trim(), newColor);
      setNewName('');
      setNewColor(COLOR_PALETTE[0]);
      setIsAdding(false);
    }
  }

  function handleStartEdit(category: Category): void {
    setEditingId(category.id);
    setEditName(category.name);
    setEditColor(category.color);
  }

  function handleSaveEdit(): void {
    if (editingId && editName.trim()) {
      onUpdate(editingId, { name: editName.trim(), color: editColor });
      setEditingId(null);
    }
  }

  function handleCancelEdit(): void {
    setEditingId(null);
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">カテゴリ管理</h3>
        {!isAdding && (
          <button
            onClick={function handleClick() { setIsAdding(true); }}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            + 追加
          </button>
        )}
      </div>

      {/* 新規追加フォーム */}
      {isAdding && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <div className="space-y-3">
            <input
              type="text"
              value={newName}
              onChange={function handleChange(e) { setNewName(e.target.value); }}
              placeholder="カテゴリ名"
              className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div>
              <label className="block text-sm text-gray-600 mb-2">色を選択</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PALETTE.map(function renderColor(color) {
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={function handleClick() { setNewColor(color); }}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        newColor === color ? 'border-gray-800 scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                追加
              </button>
              <button
                onClick={function handleClick() { setIsAdding(false); setNewName(''); }}
                className="px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* カテゴリ一覧 */}
      <ul className="space-y-2">
        {categories.map(function renderCategory(category) {
          const isEditing = editingId === category.id;

          if (isEditing) {
            return (
              <li key={category.id} className="p-3 bg-gray-50 rounded-md">
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editName}
                    onChange={function handleChange(e) { setEditName(e.target.value); }}
                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PALETTE.map(function renderColor(color) {
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={function handleClick() { setEditColor(color); }}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${
                            editColor === color ? 'border-gray-800 scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      保存
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1 text-sm bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              </li>
            );
          }

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
                  onClick={function handleClick() { handleStartEdit(category); }}
                  className="px-2 py-1 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                >
                  編集
                </button>
                <button
                  onClick={function handleClick() { onDelete(category.id); }}
                  className="px-2 py-1 text-xs text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  削除
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
