import Link from "next/link";
import type { ApplicationWithRelations } from "./application-types";

type ApplicationsTableProps = {
  applications: ApplicationWithRelations[];
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

export function ApplicationsTable({ applications }: ApplicationsTableProps) {
  if (applications.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-white px-6 py-12 text-center">
        <p className="text-sm font-medium text-ink">
          応募・選考情報はまだ登録されていません。
        </p>
        <p className="mt-2 text-sm text-muted">
          求人に対する応募状況を登録して、選考の進み具合を追えるようにしましょう。
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border bg-white shadow-panel">
      <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
        <thead className="bg-surface text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">会社</th>
            <th className="px-4 py-3 font-medium">求人</th>
            <th className="px-4 py-3 font-medium">サービス</th>
            <th className="px-4 py-3 font-medium">ステータス</th>
            <th className="px-4 py-3 font-medium">応募日</th>
            <th className="px-4 py-3 font-medium">次回アクション</th>
            <th className="px-4 py-3 font-medium">次回期限</th>
            <th className="px-4 py-3 font-medium">志望度</th>
            <th className="px-4 py-3 font-medium">更新日</th>
            <th className="px-4 py-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {applications.map((application) => (
            <tr className="hover:bg-surface" key={application.id}>
              <td className="px-4 py-3 text-muted">
                {application.jobs?.companies?.name ?? "-"}
              </td>
              <td className="px-4 py-3 font-medium text-ink">
                <Link
                  className="hover:underline"
                  href={`/applications/${application.id}`}
                >
                  {application.jobs?.title ?? "求人未設定"}
                </Link>
              </td>
              <td className="px-4 py-3 text-muted">
                {application.jobs?.services?.name ?? "-"}
              </td>
              <td className="px-4 py-3">
                <span className="rounded-md bg-surface px-2 py-1 text-xs text-muted">
                  {application.status}
                </span>
              </td>
              <td className="px-4 py-3 text-muted">
                {formatDate(application.applied_at)}
              </td>
              <td className="px-4 py-3 text-muted">
                {application.next_action ?? "-"}
              </td>
              <td className="px-4 py-3 text-muted">
                {formatDate(application.next_deadline)}
              </td>
              <td className="px-4 py-3 text-muted">
                {application.interest_level}
              </td>
              <td className="px-4 py-3 text-muted">
                {formatDateTime(application.updated_at)}
              </td>
              <td className="px-4 py-3">
                <Link
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-surface"
                  href={`/applications/${application.id}`}
                >
                  詳細
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
