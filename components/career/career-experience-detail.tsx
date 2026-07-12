import type { ReactNode } from "react";
import type { Database } from "@/lib/types/database";

type CareerExperience =
  Database["public"]["Tables"]["career_experiences"]["Row"];

type CareerExperienceDetailProps = {
  experience: CareerExperience;
};

function formatPeriod(experience: CareerExperience) {
  const start = experience.start_date ?? "開始日未設定";
  const end = experience.is_current
    ? "現在"
    : experience.end_date ?? "終了日未設定";

  return `${start} - ${end}`;
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="mt-2 whitespace-pre-wrap text-sm text-ink">
        {value || "-"}
      </dd>
    </div>
  );
}

export function CareerExperienceDetail({
  experience,
}: CareerExperienceDetailProps) {
  return (
    <dl className="grid gap-6 md:grid-cols-2">
      <DetailItem label="会社名" value={experience.company_name} />
      <DetailItem label="雇用形態" value={experience.employment_type} />
      <DetailItem label="部署" value={experience.department} />
      <DetailItem label="役職・役割" value={experience.position} />
      <DetailItem label="期間" value={formatPeriod(experience)} />
      <DetailItem label="現職" value={experience.is_current ? "はい" : "いいえ"} />
      <div className="md:col-span-2">
        <DetailItem label="概要" value={experience.summary} />
      </div>
      <div className="md:col-span-2">
        <DetailItem label="担当業務" value={experience.responsibilities} />
      </div>
      <div className="md:col-span-2">
        <DetailItem label="実績" value={experience.achievements} />
      </div>
      <div className="md:col-span-2">
        <DetailItem label="使用技術" value={experience.technologies} />
      </div>
    </dl>
  );
}
