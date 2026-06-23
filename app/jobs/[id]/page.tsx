import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteJob } from "@/app/jobs/actions";
import { DeleteJobButton } from "@/components/jobs/delete-job-button";
import { JobApplicationRelated } from "@/components/jobs/job-application-related";
import { JobDetail } from "@/components/jobs/job-detail";
import type { JobWithRelations } from "@/components/jobs/job-types";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type JobDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const [jobResult, applicationResult] = await Promise.all([
    supabase
      .from("jobs")
      .select("*, companies(id, name), services(id, name)")
      .eq("id", id)
      .single(),
    supabase
      .from("applications")
      .select("id, status, applied_at, next_action, next_deadline, interest_level")
      .eq("job_id", id)
      .maybeSingle(),
  ]);

  if (jobResult.error) {
    notFound();
  }

  const job = jobResult.data;

  if (!job) {
    notFound();
  }

  if (applicationResult.error) {
    throw new Error(
      `Failed to load related application: ${applicationResult.error.message}`,
    );
  }

  const jobWithRelations = job as JobWithRelations;

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="求人の登録内容を確認します。"
          title={jobWithRelations.title}
        />
        <div className="flex items-center gap-2">
          <Link
            className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
            href="/jobs"
          >
            一覧へ戻る
          </Link>
          <Link
            className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            href={`/jobs/${jobWithRelations.id}/edit`}
          >
            編集
          </Link>
        </div>
      </div>

      <Card>
        <JobDetail job={jobWithRelations} />
      </Card>

      <JobApplicationRelated application={applicationResult.data} />

      <Card className="mt-6 border-red-200">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-ink">削除</h3>
            <p className="mt-1 text-sm text-muted">
              この求人を削除します。削除後は元に戻せません。
            </p>
          </div>
          <form action={deleteJob}>
            <input name="id" type="hidden" value={jobWithRelations.id} />
            <DeleteJobButton jobTitle={jobWithRelations.title} />
          </form>
        </div>
      </Card>
    </>
  );
}
