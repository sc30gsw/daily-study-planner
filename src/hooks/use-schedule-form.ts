import { useForm } from "@tanstack/react-form";
import * as v from "valibot";
import type { ScheduleType, Category, TimeString } from "~/types/schedule";

const scheduleFormSchema = v.object({
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

interface UseScheduleFormProps {
  categories: readonly Category[];
  onSubmit: (item: {
    title: string;
    startTime: TimeString;
    endTime: TimeString;
    type: ScheduleType;
    categoryId: string;
  }) => void;
}

export function useScheduleForm({ categories, onSubmit }: UseScheduleFormProps) {
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
      onChange: scheduleFormSchema,
    },
    onSubmit: async ({ value }) => {
      onSubmit({
        title: value.title,
        startTime: value.startTime as TimeString,
        endTime: value.endTime as TimeString,
        type: value.type as ScheduleType,
        categoryId: value.categoryId,
      });
      form.reset();
    },
  });

  return {
    form,
  } as const;
}
