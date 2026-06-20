export function formatSalary(
  salaryMin: number | null,
  salaryMax: number | null,
) {
  if (salaryMin !== null && salaryMax !== null) {
    return `${salaryMin}〜${salaryMax}万円`;
  }

  if (salaryMin !== null) {
    return `${salaryMin}万円〜`;
  }

  if (salaryMax !== null) {
    return `〜${salaryMax}万円`;
  }

  return "-";
}
