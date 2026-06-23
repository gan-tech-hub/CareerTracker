export const TASK_TYPES = [
  "返信",
  "書類提出",
  "課題提出",
  "面談準備",
  "内定承諾",
  "その他",
] as const;

export const TASK_PRIORITIES = ["高", "中", "低"] as const;

export const TASK_COMPLETION_FILTERS = [
  { value: "incomplete", label: "未完了" },
  { value: "completed", label: "完了" },
] as const;

export const TASK_DUE_DATE_FILTERS = [
  { value: "overdue", label: "期限切れ" },
  { value: "today", label: "今日" },
  { value: "within_7_days", label: "7日以内" },
] as const;

export type TaskType = (typeof TASK_TYPES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type TaskCompletionFilter =
  (typeof TASK_COMPLETION_FILTERS)[number]["value"];
export type TaskDueDateFilter =
  (typeof TASK_DUE_DATE_FILTERS)[number]["value"];

export function isTaskType(value: string): value is TaskType {
  return TASK_TYPES.includes(value as TaskType);
}

export function isTaskPriority(value: string): value is TaskPriority {
  return TASK_PRIORITIES.includes(value as TaskPriority);
}

export function isTaskCompletionFilter(
  value: string,
): value is TaskCompletionFilter {
  return TASK_COMPLETION_FILTERS.some((filter) => filter.value === value);
}

export function isTaskDueDateFilter(
  value: string,
): value is TaskDueDateFilter {
  return TASK_DUE_DATE_FILTERS.some((filter) => filter.value === value);
}
