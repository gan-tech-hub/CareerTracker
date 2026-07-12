export const CAREER_EMPLOYMENT_TYPES = [
  "正社員",
  "契約社員",
  "業務委託",
  "副業",
  "インターン",
  "その他",
] as const;

export const CAREER_SKILL_CATEGORIES = [
  "Frontend",
  "Backend",
  "Database",
  "Infrastructure",
  "AI",
  "Design",
  "Management",
  "Business",
  "Other",
] as const;

export const CAREER_SKILL_LEVELS = [
  "実務経験あり",
  "得意",
  "学習中",
  "基礎理解",
  "興味あり",
] as const;

export type CareerEmploymentType =
  (typeof CAREER_EMPLOYMENT_TYPES)[number];
export type CareerSkillCategory = (typeof CAREER_SKILL_CATEGORIES)[number];
export type CareerSkillLevel = (typeof CAREER_SKILL_LEVELS)[number];

export function isCareerEmploymentType(
  value: string,
): value is CareerEmploymentType {
  return CAREER_EMPLOYMENT_TYPES.includes(value as CareerEmploymentType);
}

export function isCareerSkillCategory(
  value: string,
): value is CareerSkillCategory {
  return CAREER_SKILL_CATEGORIES.includes(value as CareerSkillCategory);
}

export function isCareerSkillLevel(value: string): value is CareerSkillLevel {
  return CAREER_SKILL_LEVELS.includes(value as CareerSkillLevel);
}
