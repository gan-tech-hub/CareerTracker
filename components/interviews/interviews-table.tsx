import Link from "next/link";
import type { InterviewWithRelations } from "./interview-types";

type InterviewsTableProps = {
  interviews: InterviewWithRelations[];
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

export function InterviewsTable({ interviews }: InterviewsTableProps) {
  if (interviews.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-white px-6 py-12 text-center">
        <p className="text-sm font-medium text-ink">
          面談予定はまだ登録されていません。
        </p>
        <p className="mt-2 text-sm text-muted">
          応募・選考に紐づけて、面談や面接の予定を管理しましょう。
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border bg-white shadow-panel">
      <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
        <thead className="bg-surface text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">日時</th>
            <th className="px-4 py-3 font-medium">種別</th>
            <th className="px-4 py-3 font-medium">会社</th>
            <th className="px-4 py-3 font-medium">求人</th>
            <th className="px-4 py-3 font-medium">応募ステータス</th>
            <th className="px-4 py-3 font-medium">所要時間</th>
            <th className="px-4 py-3 font-medium">場所</th>
            <th className="px-4 py-3 font-medium">URL</th>
            <th className="px-4 py-3 font-medium">更新日</th>
            <th className="px-4 py-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {interviews.map((interview) => (
            <tr className="hover:bg-surface" key={interview.id}>
              <td className="px-4 py-3 font-medium text-ink">
                <Link className="hover:underline" href={`/interviews/${interview.id}`}>
                  {formatDateTime(interview.scheduled_at)}
                </Link>
              </td>
              <td className="px-4 py-3">
                <span className="rounded-md bg-surface px-2 py-1 text-xs text-muted">
                  {interview.type}
                </span>
              </td>
              <td className="px-4 py-3 text-muted">
                {interview.applications?.jobs?.companies?.name ?? "-"}
              </td>
              <td className="px-4 py-3 text-muted">
                {interview.applications?.jobs?.title ?? "-"}
              </td>
              <td className="px-4 py-3 text-muted">
                {interview.applications?.status ?? "-"}
              </td>
              <td className="px-4 py-3 text-muted">
                {formatDuration(interview.duration_minutes)}
              </td>
              <td className="px-4 py-3 text-muted">
                {interview.location ?? "-"}
              </td>
              <td className="px-4 py-3 text-muted">
                {interview.online_url ? (
                  <a
                    className="text-ink underline"
                    href={interview.online_url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    開く
                  </a>
                ) : (
                  "-"
                )}
              </td>
              <td className="px-4 py-3 text-muted">
                {formatDateTime(interview.updated_at)}
              </td>
              <td className="px-4 py-3">
                <Link
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-surface"
                  href={`/interviews/${interview.id}`}
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
