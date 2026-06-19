export const CONTACT_ROLES = [
  "エージェント",
  "企業人事",
  "現場担当",
  "スカウト担当",
  "その他",
] as const;

export type ContactRole = (typeof CONTACT_ROLES)[number];

export function isContactRole(value: string): value is ContactRole {
  return CONTACT_ROLES.includes(value as ContactRole);
}
