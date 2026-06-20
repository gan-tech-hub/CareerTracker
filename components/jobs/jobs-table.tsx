import Link from "next/link";
import { formatSalary } from "./job-format";
import type { JobWithRelations } from "./job-types";

type JobsTableProps = {
  jobs: JobWithRelations[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function JobsTable({ jobs }: JobsTableProps) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-white px-6 py-12 text-center">
        <p className="text-sm font-medium text-ink">
          求人はまだ登録されていません。
        </p>
        <p className="mt-2 text-sm text-muted">
          気になる求人を登録して、応募や選考管理につなげましょう。
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border bg-white shadow-panel">
      <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
        <thead className="bg-surface text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">求人タイトル</th>
            <th className="px-4 py-3 font-medium">会社</th>
            <th className="px-4 py-3 font-medium">サービス</th>
            <th className="px-4 py-3 font-medium">職種</th>
            <th className="px-4 py-3 font-medium">雇用形態</th>
            <th className="px-4 py-3 font-medium">年収</th>
            <th className="px-4 py-3 font-medium">勤務地</th>
            <th className="px-4 py-3 font-medium">リモート</th>
            <th className="px-4 py-3 font-medium">副業</th>
            <th className="px-4 py-3 font-medium">優先度</th>
            <th className="px-4 py-3 font-medium">更新日</th>
            <th className="px-4 py-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {jobs.map((job) => (
            <tr className="hover:bg-surface" key={job.id}>
              <td className="px-4 py-3 font-medium text-ink">
                <Link className="hover:underline" href={`/jobs/${job.id}`}>
                  {job.title}
                </Link>
              </td>
              <td className="px-4 py-3 text-muted">
                {job.companies?.name ?? "-"}
              </td>
              <td className="px-4 py-3 text-muted">
                {job.services?.name ?? "-"}
              </td>
              <td className="px-4 py-3 text-muted">{job.job_type ?? "-"}</td>
              <td className="px-4 py-3 text-muted">{job.employment_type}</td>
              <td className="px-4 py-3 text-muted">
                {formatSalary(job.salary_min, job.salary_max)}
              </td>
              <td className="px-4 py-3 text-muted">{job.location ?? "-"}</td>
              <td className="px-4 py-3 text-muted">{job.remote_type}</td>
              <td className="px-4 py-3 text-muted">
                {job.side_job_allowed}
              </td>
              <td className="px-4 py-3">
                <span className="rounded-md bg-surface px-2 py-1 text-xs text-muted">
                  {job.priority}
                </span>
              </td>
              <td className="px-4 py-3 text-muted">
                {formatDate(job.updated_at)}
              </td>
              <td className="px-4 py-3">
                <Link
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-surface"
                  href={`/jobs/${job.id}`}
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
