import Link from "next/link";
import { deleteCareerSkill } from "@/app/career/skills/actions";
import type { Database } from "@/lib/types/database";
import { DeleteCareerSkillButton } from "./delete-career-skill-button";

type CareerSkill = Database["public"]["Tables"]["career_skills"]["Row"];

type CareerSkillListProps = {
  skills: CareerSkill[];
};

function formatYears(value: number | null) {
  if (value === null) {
    return "-";
  }

  return `${value}年`;
}

export function CareerSkillList({ skills }: CareerSkillListProps) {
  if (skills.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-white p-8 text-center">
        <h3 className="text-base font-semibold text-ink">
          スキルが未登録です
        </h3>
        <p className="mt-2 text-sm text-muted">
          技術・業務スキルを登録すると、求人との相性評価に使いやすくなります。
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-white shadow-panel">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-surface">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-ink">
              スキル
            </th>
            <th className="px-4 py-3 text-left font-semibold text-ink">
              カテゴリ
            </th>
            <th className="px-4 py-3 text-left font-semibold text-ink">
              レベル
            </th>
            <th className="px-4 py-3 text-left font-semibold text-ink">
              経験年数
            </th>
            <th className="px-4 py-3 text-left font-semibold text-ink">
              最終利用年
            </th>
            <th className="px-4 py-3 text-right font-semibold text-ink">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {skills.map((skill) => (
            <tr key={skill.id}>
              <td className="px-4 py-3">
                <div className="font-medium text-ink">{skill.name}</div>
                {skill.description ? (
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">
                    {skill.description}
                  </p>
                ) : null}
              </td>
              <td className="px-4 py-3 text-muted">{skill.category}</td>
              <td className="px-4 py-3 text-muted">{skill.skill_level}</td>
              <td className="px-4 py-3 text-muted">
                {formatYears(skill.years_of_experience)}
              </td>
              <td className="px-4 py-3 text-muted">
                {skill.last_used_year ?? "-"}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Link
                    className="rounded-md border border-border bg-white px-3 py-2 text-sm font-medium text-ink transition hover:bg-surface"
                    href={`/career/skills/${skill.id}/edit`}
                  >
                    編集
                  </Link>
                  <form action={deleteCareerSkill}>
                    <input name="id" type="hidden" value={skill.id} />
                    <DeleteCareerSkillButton skillName={skill.name} />
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
