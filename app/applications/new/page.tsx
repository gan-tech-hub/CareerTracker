import Link from "next/link";
import { createApplication } from "@/app/applications/actions";
import { ApplicationForm } from "@/components/applications/application-form";
import type { ApplicationJobOption } from "@/components/applications/application-types";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function NewApplicationPage() {
  const supabase = await createSupabaseServerClient();
  const [jobsResult, applicationsResult] = await Promise.all([
    supabase
      .from("jobs")
      .select("id, title, company_id, service_id, companies(id, name), services(id, name)")
      .order("updated_at", { ascending: false }),
    supabase.from("applications").select("job_id"),
  ]);

  if (jobsResult.error) {
    throw new Error(`Failed to load jobs: ${jobsResult.error.message}`);
  }

  if (applicationsResult.error) {
    throw new Error(
      `Failed to load applications: ${applicationsResult.error.message}`,
    );
  }

  const appliedJobIds = new Set(
    (applicationsResult.data ?? []).map(({ job_id }) => job_id),
  );
  const jobs = ((jobsResult.data ?? []) as ApplicationJobOption[]).filter(
    (job) => !appliedJobIds.has(job.id),
  );
  const hasJobs = (jobsResult.data ?? []).length > 0;

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="求人に対する応募状況と選考ステータスを登録します。"
          title="応募・選考を登録"
        />
        <Link
          className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
          href="/applications"
        >
          一覧へ戻る
        </Link>
      </div>

      {jobs.length > 0 ? (
        <Card>
          <ApplicationForm
            action={createApplication}
            jobs={jobs}
            submitLabel="登録する"
          />
        </Card>
      ) : (
        <Card>
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-ink">
              {hasJobs
                ? "応募・選考に登録できる求人がありません"
                : "先に求人を登録してください"}
            </h3>
            <p className="text-sm text-muted">
              {hasJobs
                ? "登録済みの求人はすべて応募・選考に紐づいています。新しい求人を追加するか、既存の応募・選考情報を確認してください。"
                : "応募・選考登録には求人の選択が必要です。求人を登録してから、応募・選考情報を追加してください。"}
            </p>
            <Link
              className="inline-flex rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
              href={hasJobs ? "/applications" : "/jobs/new"}
            >
              {hasJobs ? "応募・選考一覧を見る" : "求人を登録する"}
            </Link>
          </div>
        </Card>
      )}
    </>
  );
}
