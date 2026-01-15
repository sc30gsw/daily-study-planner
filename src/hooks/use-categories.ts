import { useCallback } from "react";
import type { Category } from "~/types/schedule";
import { useLocalStorage } from "~/hooks/use-local-storage";
import { generateId } from "~/utils/time-utils";
import { STORAGE_KEY_CATEGORIES, DEFAULT_CATEGORIES } from "~/constants";

export function useCategories() {
  const [categories, setCategories] = useLocalStorage<readonly Category[]>(
    STORAGE_KEY_CATEGORIES,
    DEFAULT_CATEGORIES,
  );

  const addCategory = useCallback(
    function addCategoryCallback(name: Category["name"], color: Category["color"]) {
      const newCategory = {
        id: generateId(),
        name,
        color,
      } as const satisfies Category;

      setCategories(function updateCategories(prev) {
        return [...prev, newCategory];
      });
    },
    [setCategories],
  );

  const updateCategory = useCallback(
    function updateCategoryCallback(id: Category["id"], updates: Partial<Omit<Category, "id">>) {
      setCategories(function updateCategories(prev) {
        return prev.map(function mapCategory(cat) {
          return cat.id === id ? { ...cat, ...updates } : cat;
        });
      });
    },
    [setCategories],
  );

  const deleteCategory = useCallback(
    function deleteCategoryCallback(id: Category["id"]) {
      setCategories(function updateCategories(prev) {
        return prev.filter(function filterCategory(cat) {
          return cat.id !== id;
        });
      });
    },
    [setCategories],
  );

  const getCategoryById = useCallback(
    function getCategoryByIdCallback(id: Category["id"]) {
      return categories.find(function findCategory(cat) {
        return cat.id === id;
      });
    },
    [categories],
  );

  const getCategoryColor = useCallback(
    function getCategoryColorCallback(id: Category["id"]) {
      const category = categories.find(function findCategory(cat) {
        return cat.id === id;
      });
      return category?.color ?? "#6b7280";
    },
    [categories],
  );

  return {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getCategoryColor,
  } as const;
}
