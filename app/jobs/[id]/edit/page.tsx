import Link from "next/link";
import { notFound } from "next/navigation";
import { updateJob } from "@/app/jobs/actions";
import { JobForm } from "@/components/jobs/job-form";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type EditJobPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditJobPage({ params }: EditJobPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const [jobResult, companiesResult, servicesResult] = await Promise.all([
    supabase.from("jobs").select("*").eq("id", id).single(),
    supabase.from("companies").select("id, name").order("name"),
    supabase.from("services").select("id, name").order("name"),
  ]);

  if (jobResult.error || !jobResult.data) {
    notFound();
  }

  if (companiesResult.error) {
    throw new Error(
      `Failed to load companies: ${companiesResult.error.message}`,
    );
  }

  if (servicesResult.error) {
    throw new Error(`Failed to load services: ${servicesResult.error.message}`);
  }

  const updateJobWithId = updateJob.bind(null, jobResult.data.id);

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="求人の登録内容を編集します。"
          title="求人を編集"
        />
        <Link
          className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
          href={`/jobs/${jobResult.data.id}`}
        >
          詳細へ戻る
        </Link>
      </div>

      <Card>
        <JobForm
          action={updateJobWithId}
          companies={companiesResult.data ?? []}
          job={jobResult.data}
          services={servicesResult.data ?? []}
          submitLabel="更新する"
        />
      </Card>
    </>
  );
}
