export const SERVICE_TYPES = [
  "転職サイト",
  "転職エージェント",
  "スカウトサービス",
  "SNS",
  "その他",
] as const;

export const SERVICE_STATUSES = ["利用中", "一時停止", "退会済み"] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];
export type ServiceStatus = (typeof SERVICE_STATUSES)[number];

export function isServiceType(value: string): value is ServiceType {
  return SERVICE_TYPES.includes(value as ServiceType);
}

export function isServiceStatus(value: string): value is ServiceStatus {
  return SERVICE_STATUSES.includes(value as ServiceStatus);
}
