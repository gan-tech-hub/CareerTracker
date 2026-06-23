import Link from "next/link";
import type { ReactNode } from "react";
import type { InterviewWithRelations } from "./interview-types";

type InterviewDetailProps = {
  interview: InterviewWithRelations;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDuration(value: number | null) {
  return value ? `${value}分` : "-";
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

export function InterviewDetail({ interview }: InterviewDetailProps) {
  const application = interview.applications;
  const job = application?.jobs;

  return (
    <dl className="grid gap-6 md:grid-cols-2">
      <DetailItem
        label="関連応募"
        value={
          application ? (
            <Link
              className="text-ink underline"
              href={`/applications/${application.id}`}
            >
              {job?.title ?? "求人未設定"} / {application.status}
            </Link>
          ) : null
        }
      />
      <DetailItem
        label="会社"
        value={
          job?.companies ? (
            <Link
              className="text-ink underline"
              href={`/companies/${job.companies.id}`}
            >
              {job.companies.name}
            </Link>
          ) : null
        }
      />
      <DetailItem
        label="求人"
        value={
          job ? (
            <Link className="text-ink underline" href={`/jobs/${job.id}`}>
              {job.title}
            </Link>
          ) : null
        }
      />
      <DetailItem
        label="転職サービス"
        value={
          job?.services ? (
            <Link
              className="text-ink underline"
              href={`/services/${job.services.id}`}
            >
              {job.services.name}
            </Link>
          ) : null
        }
      />
      <DetailItem label="面談種別" value={interview.type} />
      <DetailItem label="日時" value={formatDateTime(interview.scheduled_at)} />
      <DetailItem
        label="所要時間"
        value={formatDuration(interview.duration_minutes)}
      />
      <DetailItem label="場所" value={interview.location} />
      <DetailItem
        label="オンラインURL"
        value={
          interview.online_url ? (
            <a
              className="text-ink underline"
              href={interview.online_url}
              rel="noreferrer"
              target="_blank"
            >
              {interview.online_url}
            </a>
          ) : null
        }
      />
      <DetailItem label="参加者" value={interview.participants} />
      <DetailItem label="作成日" value={formatDateTime(interview.created_at)} />
      <DetailItem label="更新日" value={formatDateTime(interview.updated_at)} />
      <div className="md:col-span-2">
        <MemoItem label="事前準備メモ" value={interview.preparation_memo} />
      </div>
      <div className="md:col-span-2">
        <MemoItem label="当日メモ" value={interview.interview_memo} />
      </div>
      <div className="md:col-span-2">
        <MemoItem label="結果メモ" value={interview.result_memo} />
      </div>
    </dl>
  );
}
