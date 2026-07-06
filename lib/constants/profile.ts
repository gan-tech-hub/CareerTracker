export const REMOTE_PREFERENCES = [
  "フルリモート希望",
  "一部リモート希望",
  "出社可",
  "こだわらない",
] as const;

export const SIDE_JOB_PREFERENCES = [
  "希望する",
  "条件次第",
  "希望しない",
  "こだわらない",
] as const;

export type RemotePreference = (typeof REMOTE_PREFERENCES)[number];
export type SideJobPreference = (typeof SIDE_JOB_PREFERENCES)[number];

export function isRemotePreference(value: string): value is RemotePreference {
  return REMOTE_PREFERENCES.includes(value as RemotePreference);
}

export function isSideJobPreference(
  value: string,
): value is SideJobPreference {
  return SIDE_JOB_PREFERENCES.includes(value as SideJobPreference);
}
