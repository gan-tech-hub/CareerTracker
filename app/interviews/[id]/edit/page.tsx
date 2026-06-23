import Link from "next/link";
import { notFound } from "next/navigation";
import { updateInterview } from "@/app/interviews/actions";
import { InterviewForm } from "@/components/interviews/interview-form";
import type { InterviewApplicationOption } from "@/components/interviews/interview-types";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type EditInterviewPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditInterviewPage({
  params,
}: EditInterviewPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const [interviewResult, applicationsResult] = await Promise.all([
    supabase.from("interviews").select("*").eq("id", id).single(),
    supabase
      .from("applications")
      .select("id, status, jobs(id, title, company_id, service_id, companies(id, name), services(id, name))")
      .order("updated_at", { ascending: false }),
  ]);

  if (interviewResult.error || !interviewResult.data) {
    notFound();
  }

  if (applicationsResult.error) {
    throw new Error(
      `Failed to load applications: ${applicationsResult.error.message}`,
    );
  }

  const updateInterviewWithId = updateInterview.bind(
    null,
    interviewResult.data.id,
  );

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="面談予定、準備メモ、結果メモを編集します。"
          title="面談予定を編集"
        />
        <Link
          className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
          href={`/interviews/${interviewResult.data.id}`}
        >
          詳細へ戻る
        </Link>
      </div>

      <Card>
        <InterviewForm
          action={updateInterviewWithId}
          applications={
            (applicationsResult.data ?? []) as InterviewApplicationOption[]
          }
          interview={interviewResult.data}
          submitLabel="更新する"
        />
      </Card>
    </>
  );
}
