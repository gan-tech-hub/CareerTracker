import Link from "next/link";
import { Card } from "@/components/ui/card";

type RelatedApplication = {
  id: string;
  status: string;
  applied_at: string | null;
  next_action: string | null;
  next_deadline: string | null;
  interest_level: string;
};

type JobApplicationRelatedProps = {
  application: RelatedApplication | null;
};

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
  }).format(new Date(`${value}T00:00:00`));
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="mt-2 text-sm text-ink">{value || "-"}</dd>
    </div>
  );
}

export function JobApplicationRelated({
  application,
}: JobApplicationRelatedProps) {
  return (
    <Card className="mt-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-ink">応募・選考情報</h3>
        {application ? (
          <Link
            className="rounded-md border border-border bg-white px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-surface"
            href={`/applications/${application.id}`}
          >
            応募詳細へ
          </Link>
        ) : (
          <Link
            className="rounded-md border border-border bg-white px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-surface"
            href="/applications/new"
          >
            応募・選考を登録
          </Link>
        )}
      </div>

      {application ? (
        <dl className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <DetailItem label="ステータス" value={application.status} />
          <DetailItem label="応募日" value={formatDate(application.applied_at)} />
          <DetailItem label="次回アクション" value={application.next_action} />
          <DetailItem
            label="次回期限"
            value={formatDate(application.next_deadline)}
          />
          <DetailItem label="志望度" value={application.interest_level} />
        </dl>
      ) : (
        <p className="mt-4 rounded-md border border-dashed border-border bg-white px-4 py-6 text-sm text-muted">
          この求人の応募・選考情報は未登録です。
        </p>
      )}
    </Card>
  );
}
