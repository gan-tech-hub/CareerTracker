import Link from "next/link";
import type { ReactNode } from "react";
import { formatSalary } from "./job-format";
import type { JobWithRelations } from "./job-types";

type JobDetailProps = {
  job: JobWithRelations;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="mt-2 text-sm text-ink">{value || "-"}</dd>
    </div>
  );
}

function MemoItem({ label, value }: { label: string; value: string | null }) {
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

export function JobDetail({ job }: JobDetailProps) {
  return (
    <dl className="grid gap-6 md:grid-cols-2">
      <DetailItem label="求人タイトル" value={job.title} />
      <DetailItem
        label="会社"
        value={
          job.companies ? (
            <Link className="text-ink underline" href={`/companies/${job.company_id}`}>
              {job.companies.name}
            </Link>
          ) : null
        }
      />
      <DetailItem
        label="転職サービス"
        value={
          job.service_id && job.services ? (
            <Link className="text-ink underline" href={`/services/${job.service_id}`}>
              {job.services.name}
            </Link>
          ) : null
        }
      />
      <DetailItem
        label="求人URL"
        value={
          job.job_url ? (
            <a
              className="text-ink underline"
              href={job.job_url}
              rel="noreferrer"
              target="_blank"
            >
              {job.job_url}
            </a>
          ) : null
        }
      />
      <DetailItem label="職種" value={job.job_type} />
      <DetailItem label="雇用形態" value={job.employment_type} />
      <DetailItem label="年収" value={formatSalary(job.salary_min, job.salary_max)} />
      <DetailItem label="勤務地" value={job.location} />
      <DetailItem label="リモート可否" value={job.remote_type} />
      <DetailItem label="副業可否" value={job.side_job_allowed} />
      <DetailItem label="優先度" value={job.priority} />
      <DetailItem label="作成日" value={formatDate(job.created_at)} />
      <DetailItem label="更新日" value={formatDate(job.updated_at)} />
      <div className="md:col-span-2">
        <MemoItem label="必須スキル" value={job.required_skills} />
      </div>
      <div className="md:col-span-2">
        <MemoItem label="歓迎スキル" value={job.preferred_skills} />
      </div>
      <div className="md:col-span-2">
        <MemoItem label="業務内容" value={job.description} />
      </div>
      <div className="md:col-span-2">
        <MemoItem label="魅力ポイント" value={job.attractive_points} />
      </div>
      <div className="md:col-span-2">
        <MemoItem label="懸念点" value={job.concerns} />
      </div>
      <div className="md:col-span-2">
        <MemoItem label="メモ" value={job.memo} />
      </div>
    </dl>
  );
}
