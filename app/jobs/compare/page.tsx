import Link from "next/link";
import { JobComparisonForm } from "@/components/jobs/job-comparison-form";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type JobComparisonOption = {
  id: string;
  title: string;
  job_type: string | null;
  priority: string;
  companies: { name: string } | null;
  services: { name: string } | null;
};

export default async function JobComparisonPage() {
  const supabase = await createSupabaseServerClient();
  const result = await supabase
    .from("jobs")
    .select("id, title, job_type, priority, companies(name), services(name)")
    .order("updated_at", { ascending: false })
    .limit(50);
  const { data: jobs, error } = result as unknown as {
    data: JobComparisonOption[] | null;
    error: { message: string } | null;
  };

  if (error) {
    throw new Error(`Failed to load jobs for comparison: ${error.message}`);
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="複数の求人を比較し、応募優先度や確認すべきポイントをAIで整理します。"
          title="求人比較コメント生成"
        />
        <Link
          className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
          href="/jobs"
        >
          求人一覧へ戻る
        </Link>
      </div>

      <Card>
        <JobComparisonForm jobs={jobs ?? []} />
      </Card>
    </>
  );
}
