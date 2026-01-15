import { useRef, useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import * as v from "valibot";
import type { ScheduleItem, ScheduleType, Category, TimeString } from "~/types/schedule";
import { COLOR_PALETTE } from "~/constants";

const scheduleModalSchema = v.object({
  title: v.pipe(v.string(), v.trim(), v.minLength(1, "タイトルを入力してください")),
  startTime: v.pipe(
    v.string(),
    v.regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "正しい時間形式で入力してください"),
  ),
  endTime: v.pipe(
    v.string(),
    v.regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "正しい時間形式で入力してください"),
  ),
  type: v.picklist(["doing", "available"]),
  categoryId: v.string(),
});

interface UseScheduleModalProps {
  item: ScheduleItem | null;
  categories: readonly Category[];
  isOpen: boolean;
  position?: { x: number; y: number };
  onClose: () => void;
  onSave: (itemData: Omit<ScheduleItem, "id">) => void;
}

export function useScheduleModal({
  item,
  categories,
  isOpen,
  position,
  onClose,
  onSave,
}: UseScheduleModalProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const defaultCategoryId = categories[0]?.id ?? "";

  const form = useForm({
    defaultValues: {
      title: "",
      startTime: "09:00",
      endTime: "10:00",
      type: "doing" as ScheduleType,
      categoryId: defaultCategoryId,
    },
    validators: {
      onChange: scheduleModalSchema,
    },
    onSubmit: async ({ value }) => {
      onSave({
        title: value.title.trim(),
        startTime: value.startTime as TimeString,
        endTime: value.endTime as TimeString,
        type: value.type as ScheduleType,
        categoryId: value.categoryId,
      });
    },
  });

  // Sync form values when item changes
  useEffect(() => {
    if (item) {
      form.setFieldValue("title", item.title);
      form.setFieldValue("startTime", item.startTime);
      form.setFieldValue("endTime", item.endTime);
      form.setFieldValue("type", item.type);
      form.setFieldValue("categoryId", item.categoryId);
    }
  }, [item, form]);

  useEffect(() => {
    if (!isOpen || !position) {
      return;
    }

    const popoverWidth = 400;
    const popoverHeight = 500;
    const padding = 16;

    let left = position.x - popoverWidth / 2;
    let top = position.y + 20;

    if (left + popoverWidth > window.innerWidth - padding) {
      left = window.innerWidth - popoverWidth - padding;
    }

    if (left < padding) {
      left = padding;
    }

    if (top + popoverHeight > window.innerHeight - padding) {
      top = position.y - popoverHeight - 20;
    }

    if (top < padding) {
      top = padding;
    }

    setPopoverPosition({ top, left });
  }, [isOpen, position]);

  useEffect(() => {
    if (!isOpen || !position || !popoverRef.current) {
      return;
    }

    const popover = popoverRef.current;
    const popoverWidth = 400;
    const popoverHeight = popover.offsetHeight;
    const padding = 16;

    let left = position.x - popoverWidth / 2;
    let top = position.y + 20;

    if (left + popoverWidth > window.innerWidth - padding) {
      left = window.innerWidth - popoverWidth - padding;
    }

    if (left < padding) {
      left = padding;
    }

    if (top + popoverHeight > window.innerHeight - padding) {
      top = position.y - popoverHeight - 20;
    }

    if (top < padding) {
      top = padding;
    }

    setPopoverPosition({ top, left });
  }, [isOpen, position]);

  useEffect(() => {
    function handleClickOutsideEvent(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      setTimeout(() => {
        document.addEventListener("click", handleClickOutsideEvent);
      }, 0);
    }

    return () => {
      document.removeEventListener("click", handleClickOutsideEvent);
    };
  }, [isOpen, onClose]);

  function getCategoryColor(catId: Category["id"]) {
    const category = categories.find((c) => c.id === catId);
    return category?.color ?? COLOR_PALETTE[0];
  }

  return {
    popoverRef,
    popoverPosition,
    form,
    getCategoryColor,
  } as const;
}
