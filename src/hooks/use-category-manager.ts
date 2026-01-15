import { useRef, useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import * as v from "valibot";
import type { Category } from "~/types/schedule";
import { COLOR_PALETTE } from "~/constants";

const categoryFormSchema = v.object({
  name: v.pipe(v.string(), v.trim(), v.minLength(1, "カテゴリ名を入力してください")),
  color: v.pipe(
    v.string(),
    v.regex(/^#([0-9a-fA-F]{6})$/, "有効な16進数カラーコードを入力してください"),
  ),
});

interface UseCategoryManagerProps {
  onAdd: (name: Category["name"], color: Category["color"]) => void;
  onUpdate: (id: Category["id"], updates: Partial<Omit<Category, "id">>) => void;
  onDelete: (id: Category["id"]) => void;
}

export function useCategoryManager({ onAdd, onUpdate, onDelete }: UseCategoryManagerProps) {
  const addDialogRef = useRef<HTMLDialogElement>(null);
  const editDialogRef = useRef<HTMLDialogElement>(null);
  const deleteDialogRef = useRef<HTMLDialogElement>(null);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  // 関数を先に定義（フォームのonSubmitで使用するため）
  function closeAddDialog() {
    addDialogRef.current?.close();
  }

  function closeEditDialog() {
    editDialogRef.current?.close();
    setEditingCategory(null);
  }

  const addForm = useForm({
    defaultValues: {
      name: "",
      color: COLOR_PALETTE[0] as string,
    },
    validators: {
      onChange: categoryFormSchema,
    },
    onSubmit: async ({ value }) => {
      onAdd(value.name.trim(), value.color);
      closeAddDialog();
      addForm.reset();
    },
  });

  const editForm = useForm({
    defaultValues: {
      name: "",
      color: COLOR_PALETTE[0] as string,
    },
    validators: {
      onChange: categoryFormSchema,
    },
    onSubmit: async ({ value }) => {
      if (editingCategory) {
        onUpdate(editingCategory.id, { name: value.name.trim(), color: value.color });
        closeEditDialog();
      }
    },
  });

  // Sync edit form when editingCategory changes
  useEffect(() => {
    if (editingCategory) {
      editForm.setFieldValue("name", editingCategory.name);
      editForm.setFieldValue("color", editingCategory.color);
    }
  }, [editingCategory, editForm]);

  function openAddDialog() {
    addForm.reset();
    addDialogRef.current?.showModal();
  }

  function openEditDialog(category: Category) {
    setEditingCategory(category);
    editDialogRef.current?.showModal();
  }

  function openDeleteDialog(category: Category) {
    setDeletingCategory(category);
    deleteDialogRef.current?.showModal();
  }

  function closeDeleteDialog() {
    deleteDialogRef.current?.close();
    setDeletingCategory(null);
  }

  function handleConfirmDelete() {
    if (deletingCategory) {
      onDelete(deletingCategory.id);
      closeDeleteDialog();
    }
  }

  return {
    // Refs
    addDialogRef,
    editDialogRef,
    deleteDialogRef,
    // Forms
    addForm,
    editForm,
    // State
    editingCategory,
    deletingCategory,
    // Functions
    openAddDialog,
    closeAddDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
    handleConfirmDelete,
  } as const;
}
