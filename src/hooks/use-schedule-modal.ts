import { useRef, useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import * as v from "valibot";
import type { ScheduleItem, ScheduleType, Category, TimeString } from "~/types/schedule";
import { COLOR_PALETTE, HOUR_HEIGHT_CALENDAR, MINUTES_IN_HOUR } from "~/constants";
import { timeToMinutes } from "~/utils/time-utils";

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
  containerRef?: React.RefObject<HTMLDivElement | null>;
  currentView?: "clock" | "calendar";
  onClose: () => void;
  onSave: (itemData: Omit<ScheduleItem, "id">) => void;
}

export function useScheduleModal({
  item,
  categories,
  isOpen,
  position,
  containerRef,
  currentView,
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
    if (!isOpen || !position || !containerRef?.current) {
      return;
    }

    function calculatePosition() {
      if (!popoverRef.current || !position || !containerRef?.current) {
        return;
      }

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();

      // Convert screen coordinates to container-relative coordinates
      const relativeX = position.x - containerRect.left;
      const relativeY = position.y - containerRect.top;

      const popoverWidthLarge = 384; // max-w-sm (384px)
      const popoverWidthSmall = 256; // w-64 (256px) for compact card
      const estimatedPopoverHeight = 500;
      const padding = 16;

      // Get actual popover height if available, otherwise use estimate
      const popoverHeight = popoverRef.current.offsetHeight || estimatedPopoverHeight;

      // Get container dimensions
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;

      // Use window width for breakpoint check
      const windowWidth = window.innerWidth;
      const isSmallScreen = windowWidth < 1024; // lg breakpoint
      const popoverWidth = isSmallScreen ? popoverWidthSmall : popoverWidthLarge;

      let left = relativeX - popoverWidth / 2;
      let top = relativeY + 20;

      if (currentView === "clock") {
        // Clock view: position below the clicked item
        top = relativeY + 20;
        left = relativeX - popoverWidth / 2;

        // Adjust horizontal position to fit within container
        if (left + popoverWidth > containerWidth - padding) {
          left = containerWidth - popoverWidth - padding;
        }

        if (left < padding) {
          left = padding;
        }

        // Adjust vertical position if it goes below container
        if (top + popoverHeight > containerHeight - padding) {
          // Try to show above the click position
          const topAbove = relativeY - popoverHeight - 20;

          if (topAbove >= padding) {
            top = topAbove;
          } else {
            // Position at top of container
            top = padding;
          }
        }
      } else {
        // Calendar view: position on the right side, fixed at start time position
        // Calculate top based on item's startTime (not click position)
        const headerOffset = 60; // Approximate header height including title and padding
        const timeLabelsWidth = 64; // w-16 = 64px

        if (item) {
          // Calculate position from start time
          const startMinutes = timeToMinutes(item.startTime);
          top = headerOffset + (startMinutes / MINUTES_IN_HOUR) * HOUR_HEIGHT_CALENDAR;
        } else {
          top = relativeY;
        }

        // Position to the right of the calendar area
        left = containerWidth - popoverWidth - padding;

        // Ensure minimum left position
        if (left < timeLabelsWidth + padding) {
          left = timeLabelsWidth + padding;
        }
      }

      // Final vertical bounds check
      if (top < padding) {
        top = padding;
      }

      if (top + popoverHeight > containerHeight - padding) {
        top = containerHeight - popoverHeight - padding;

        if (top < padding) {
          top = padding;
        }
      }

      setPopoverPosition({ top, left });
    }

    // Initial calculation with estimated height
    calculatePosition();

    // Recalculate after layout to get accurate height
    const timeoutId = setTimeout(() => {
      calculatePosition();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [isOpen, position, containerRef, currentView, item]);

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
