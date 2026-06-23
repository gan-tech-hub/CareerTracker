export const INTERVIEW_TYPES = [
  "エージェント面談",
  "カジュアル面談",
  "一次面接",
  "二次面接",
  "最終面接",
  "条件面談",
  "その他",
] as const;

export const INTERVIEW_DATE_FILTERS = [
  { value: "upcoming", label: "予定あり" },
  { value: "past", label: "過去" },
  { value: "within_7_days", label: "7日以内" },
] as const;

export type InterviewType = (typeof INTERVIEW_TYPES)[number];
export type InterviewDateFilter =
  (typeof INTERVIEW_DATE_FILTERS)[number]["value"];

export function isInterviewType(value: string): value is InterviewType {
  return INTERVIEW_TYPES.includes(value as InterviewType);
}

export function isInterviewDateFilter(
  value: string,
): value is InterviewDateFilter {
  return INTERVIEW_DATE_FILTERS.some((filter) => filter.value === value);
}
