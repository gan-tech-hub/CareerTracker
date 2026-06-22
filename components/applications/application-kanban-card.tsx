import Link from "next/link";
import type { ApplicationWithRelations } from "./application-types";

type ApplicationKanbanCardProps = {
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

function MetaItem({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-[11px] font-medium text-muted">{label}</dt>
      <dd className="mt-0.5 truncate text-xs text-ink">{value || "-"}</dd>
    </div>
  );
}

export function ApplicationKanbanCard({
  application,
}: ApplicationKanbanCardProps) {
  const job = application.jobs;

  return (
    <article className="rounded-md border border-border bg-white p-3 shadow-sm transition hover:border-slate-300">
      <div className="space-y-1">
        <Link
          className="line-clamp-2 text-sm font-semibold text-ink hover:underline"
          href={`/applications/${application.id}`}
        >
          {job?.title ?? "求人未設定"}
        </Link>
        <p className="truncate text-xs text-muted">
          {job?.companies?.name ?? "会社未設定"}
        </p>
        <p className="truncate text-xs text-muted">
          {job?.services?.name ?? "サービス未設定"}
        </p>
      </div>

      <dl className="mt-3 grid gap-2">
        <MetaItem label="志望度" value={application.interest_level} />
        <MetaItem label="応募日" value={formatDate(application.applied_at)} />
        <MetaItem
          label="次回期限"
          value={formatDate(application.next_deadline)}
        />
        <MetaItem label="次回アクション" value={application.next_action} />
      </dl>

      <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
        <Link
          className="rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-ink transition hover:bg-surface"
          href={`/applications/${application.id}`}
        >
          詳細
        </Link>
        <Link
          className="rounded-md bg-ink px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700"
          href={`/applications/${application.id}/edit`}
        >
          編集
        </Link>
      </div>
    </article>
  );
}
