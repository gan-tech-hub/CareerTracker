import Link from "next/link";
import type { ReactNode } from "react";
import type { TaskWithRelations } from "./task-types";

type TaskDetailProps = {
  task: TaskWithRelations;
};

function formatDate(value: string) {
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

export function TaskDetail({ task }: TaskDetailProps) {
  const application = task.applications;
  const job = application?.jobs;

  return (
    <dl className="grid gap-6 md:grid-cols-2">
      <DetailItem label="タイトル" value={task.title} />
      <DetailItem label="種別" value={task.type} />
      <DetailItem label="期限日" value={formatDate(task.due_date)} />
      <DetailItem label="優先度" value={task.priority} />
      <DetailItem label="完了状態" value={task.is_completed ? "完了" : "未完了"} />
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
      <DetailItem label="作成日" value={formatDateTime(task.created_at)} />
      <DetailItem label="更新日" value={formatDateTime(task.updated_at)} />
      <div className="md:col-span-2">
        <MemoItem label="メモ" value={task.memo} />
      </div>
    </dl>
  );
}
