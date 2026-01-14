import { useCallback } from 'react';
import type { Category } from '../types/schedule';
import { useLocalStorage } from './use-local-storage';
import { generateId } from '../utils/time-utils';
import { STORAGE_KEY_CATEGORIES, DEFAULT_CATEGORIES } from '../constants/app-constants';

interface UseCategoriesReturn {
  categories: Category[];
  addCategory: (name: string, color: string) => void;
  updateCategory: (id: string, updates: Partial<Omit<Category, 'id'>>) => void;
  deleteCategory: (id: string) => void;
  getCategoryById: (id: string) => Category | undefined;
  getCategoryColor: (id: string) => string;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useLocalStorage<Category[]>(
    STORAGE_KEY_CATEGORIES,
    DEFAULT_CATEGORIES
  );

  const addCategory = useCallback(function addCategoryCallback(name: string, color: string): void {
    const newCategory: Category = {
      id: generateId(),
      name,
      color,
    };
    setCategories(function updateCategories(prev) { return [...prev, newCategory]; });
  }, [setCategories]);

  const updateCategory = useCallback(function updateCategoryCallback(
    id: string,
    updates: Partial<Omit<Category, 'id'>>
  ): void {
    setCategories(function updateCategories(prev) {
      return prev.map(function mapCategory(cat) {
        return cat.id === id ? { ...cat, ...updates } : cat;
      });
    });
  }, [setCategories]);

  const deleteCategory = useCallback(function deleteCategoryCallback(id: string): void {
    setCategories(function updateCategories(prev) {
      return prev.filter(function filterCategory(cat) { return cat.id !== id; });
    });
  }, [setCategories]);

  const getCategoryById = useCallback(function getCategoryByIdCallback(id: string): Category | undefined {
    return categories.find(function findCategory(cat) { return cat.id === id; });
  }, [categories]);

  const getCategoryColor = useCallback(function getCategoryColorCallback(id: string): string {
    const category = categories.find(function findCategory(cat) { return cat.id === id; });
    return category?.color ?? '#6b7280';
  }, [categories]);

  return {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getCategoryColor,
  };
}

export type { UseCategoriesReturn };
