import Link from "next/link";
import { notFound } from "next/navigation";
import { JobMatchAnalysisForm } from "@/components/jobs/job-match-analysis-form";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type JobMatchPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type JobMatchPageJob = {
  id: string;
  title: string;
  job_type: string | null;
  employment_type: string;
  companies: { name: string } | null;
};

export default async function JobMatchPage({ params }: JobMatchPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const jobResult = await supabase
    .from("jobs")
    .select("id, title, job_type, employment_type, companies(name)")
    .eq("id", id)
    .single();
  const { data: job, error } = jobResult as unknown as {
    data: JobMatchPageJob | null;
    error: { message: string } | null;
  };

  if (error || !job) {
    notFound();
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="プロフィール、職務経歴、スキルと求人情報を照合し、応募判断の材料を整理します。"
          title="求人マッチ度スコア"
        />
        <Link
          className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
          href={`/jobs/${job.id}`}
        >
          求人詳細へ戻る
        </Link>
      </div>

      <Card className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted">
              {job.companies?.name ?? "会社未設定"}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-ink">{job.title}</h3>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-medium text-muted">
            <span className="rounded border border-border px-2 py-1">
              {job.job_type ?? "職種未設定"}
            </span>
            <span className="rounded border border-border px-2 py-1">
              {job.employment_type}
            </span>
          </div>
        </div>
      </Card>

      <Card>
        <JobMatchAnalysisForm jobId={job.id} />
      </Card>
    </>
  );
}
