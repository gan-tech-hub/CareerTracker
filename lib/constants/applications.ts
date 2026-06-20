export const APPLICATION_STATUSES = [
  "気になる",
  "応募予定",
  "応募済み",
  "書類選考中",
  "カジュアル面談",
  "一次面接",
  "二次面接",
  "最終面接",
  "内定",
  "辞退",
  "不採用",
] as const;

export const APPLICATION_INTEREST_LEVELS = ["高", "中", "低"] as const;

export const APPLICATION_DEADLINE_FILTERS = [
  { value: "overdue", label: "期限切れ" },
  { value: "within_7_days", label: "7日以内" },
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
export type ApplicationInterestLevel =
  (typeof APPLICATION_INTEREST_LEVELS)[number];
export type ApplicationDeadlineFilter =
  (typeof APPLICATION_DEADLINE_FILTERS)[number]["value"];

export function isApplicationStatus(
  value: string,
): value is ApplicationStatus {
  return APPLICATION_STATUSES.includes(value as ApplicationStatus);
}

export function isApplicationInterestLevel(
  value: string,
): value is ApplicationInterestLevel {
  return APPLICATION_INTEREST_LEVELS.includes(
    value as ApplicationInterestLevel,
  );
}

export function isApplicationDeadlineFilter(
  value: string,
): value is ApplicationDeadlineFilter {
  return APPLICATION_DEADLINE_FILTERS.some((filter) => filter.value === value);
}
