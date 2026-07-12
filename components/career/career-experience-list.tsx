import Link from "next/link";
import type { Database } from "@/lib/types/database";

type CareerExperience =
  Database["public"]["Tables"]["career_experiences"]["Row"];

type CareerExperienceListProps = {
  experiences: CareerExperience[];
};

function formatPeriod(experience: CareerExperience) {
  const start = experience.start_date ?? "開始日未設定";
  const end = experience.is_current
    ? "現在"
    : experience.end_date ?? "終了日未設定";

  return `${start} - ${end}`;
}

export function CareerExperienceList({
  experiences,
}: CareerExperienceListProps) {
  if (experiences.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-white p-8 text-center">
        <h3 className="text-base font-semibold text-ink">
          職務経歴が未登録です
        </h3>
        <p className="mt-2 text-sm text-muted">
          これまでの経験を登録すると、求人マッチ度や自己PR生成に活用できます。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {experiences.map((experience) => (
        <article
          className="rounded-md border border-border bg-white p-5 shadow-panel"
          key={experience.id}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-ink">
                  {experience.company_name}
                </h3>
                {experience.is_current ? (
                  <span className="rounded-full bg-ink px-2 py-0.5 text-xs font-medium text-white">
                    現職
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-muted">
                {[experience.department, experience.position]
                  .filter(Boolean)
                  .join(" / ") || "役割未設定"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                className="rounded-md border border-border bg-white px-3 py-2 text-sm font-medium text-ink transition hover:bg-surface"
                href={`/career/experiences/${experience.id}`}
              >
                詳細
              </Link>
              <Link
                className="rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                href={`/career/experiences/${experience.id}/edit`}
              >
                編集
              </Link>
            </div>
          </div>

          <dl className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                期間
              </dt>
              <dd className="mt-1 text-sm text-ink">
                {formatPeriod(experience)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                雇用形態
              </dt>
              <dd className="mt-1 text-sm text-ink">
                {experience.employment_type}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                使用技術
              </dt>
              <dd className="mt-1 line-clamp-2 text-sm text-ink">
                {experience.technologies || "-"}
              </dd>
            </div>
          </dl>

          {experience.summary ? (
            <p className="mt-4 line-clamp-3 text-sm leading-6 text-ink">
              {experience.summary}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
