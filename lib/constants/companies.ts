export const COMPANY_INTEREST_LEVELS = ["高", "中", "低"] as const;

export type CompanyInterestLevel = (typeof COMPANY_INTEREST_LEVELS)[number];

export function isCompanyInterestLevel(
  value: string,
): value is CompanyInterestLevel {
  return COMPANY_INTEREST_LEVELS.includes(value as CompanyInterestLevel);
}
