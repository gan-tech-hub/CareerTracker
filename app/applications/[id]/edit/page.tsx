import Link from "next/link";
import { notFound } from "next/navigation";
import { updateApplication } from "@/app/applications/actions";
import { ApplicationForm } from "@/components/applications/application-form";
import type { ApplicationJobOption } from "@/components/applications/application-types";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type EditApplicationPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditApplicationPage({
  params,
}: EditApplicationPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const [applicationResult, jobsResult, applicationsResult] = await Promise.all([
    supabase.from("applications").select("*").eq("id", id).single(),
    supabase
      .from("jobs")
      .select("id, title, company_id, service_id, companies(id, name), services(id, name)")
      .order("updated_at", { ascending: false }),
    supabase.from("applications").select("id, job_id"),
  ]);

  if (applicationResult.error || !applicationResult.data) {
    notFound();
  }

  if (jobsResult.error) {
    throw new Error(`Failed to load jobs: ${jobsResult.error.message}`);
  }

  if (applicationsResult.error) {
    throw new Error(
      `Failed to load applications: ${applicationsResult.error.message}`,
    );
  }

  const unavailableJobIds = new Set(
    (applicationsResult.data ?? [])
      .filter((application) => application.id !== applicationResult.data.id)
      .map(({ job_id }) => job_id),
  );
  const jobs = ((jobsResult.data ?? []) as ApplicationJobOption[]).filter(
    (job) => !unavailableJobIds.has(job.id),
  );
  const updateApplicationWithId = updateApplication.bind(
    null,
    applicationResult.data.id,
  );

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="応募状況と選考ステータスを編集します。"
          title="応募・選考を編集"
        />
        <Link
          className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
          href={`/applications/${applicationResult.data.id}`}
        >
          詳細へ戻る
        </Link>
      </div>

      <Card>
        <ApplicationForm
          action={updateApplicationWithId}
          application={applicationResult.data}
          jobs={jobs}
          submitLabel="更新する"
        />
      </Card>
    </>
  );
}
