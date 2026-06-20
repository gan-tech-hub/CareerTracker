import Link from "next/link";
import type { ReactNode } from "react";
import type { ApplicationWithRelations } from "./application-types";

type ApplicationDetailProps = {
  application: ApplicationWithRelations;
};

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
  }).format(new Date(`${value}T00:00:00`));
}

function formatDateTime(value: string) {
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

export function ApplicationDetail({ application }: ApplicationDetailProps) {
  const job = application.jobs;

  return (
    <dl className="grid gap-6 md:grid-cols-2">
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
      <DetailItem label="選考ステータス" value={application.status} />
      <DetailItem label="応募日" value={formatDate(application.applied_at)} />
      <DetailItem label="次回アクション" value={application.next_action} />
      <DetailItem label="次回期限" value={formatDate(application.next_deadline)} />
      <DetailItem label="志望度" value={application.interest_level} />
      <DetailItem label="作成日" value={formatDateTime(application.created_at)} />
      <DetailItem label="更新日" value={formatDateTime(application.updated_at)} />
      <div className="md:col-span-2">
        <MemoItem label="選考メモ" value={application.selection_memo} />
      </div>
      <div className="md:col-span-2">
        <MemoItem label="辞退理由" value={application.decline_reason} />
      </div>
      <div className="md:col-span-2">
        <MemoItem label="不採用理由" value={application.rejection_reason} />
      </div>
    </dl>
  );
}
