export const JOB_EMPLOYMENT_TYPES = [
  "正社員",
  "契約社員",
  "業務委託",
  "副業",
  "その他",
] as const;

export const JOB_REMOTE_TYPES = [
  "フルリモート",
  "一部リモート",
  "原則出社",
  "不明",
] as const;

export const JOB_SIDE_JOB_OPTIONS = ["可", "不可", "条件付き", "不明"] as const;

export const JOB_PRIORITIES = ["高", "中", "低"] as const;

export type JobEmploymentType = (typeof JOB_EMPLOYMENT_TYPES)[number];
export type JobRemoteType = (typeof JOB_REMOTE_TYPES)[number];
export type JobSideJobAllowed = (typeof JOB_SIDE_JOB_OPTIONS)[number];
export type JobPriority = (typeof JOB_PRIORITIES)[number];

export function isJobEmploymentType(
  value: string,
): value is JobEmploymentType {
  return JOB_EMPLOYMENT_TYPES.includes(value as JobEmploymentType);
}

export function isJobRemoteType(value: string): value is JobRemoteType {
  return JOB_REMOTE_TYPES.includes(value as JobRemoteType);
}

export function isJobSideJobAllowed(
  value: string,
): value is JobSideJobAllowed {
  return JOB_SIDE_JOB_OPTIONS.includes(value as JobSideJobAllowed);
}

export function isJobPriority(value: string): value is JobPriority {
  return JOB_PRIORITIES.includes(value as JobPriority);
}
