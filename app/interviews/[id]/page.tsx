import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteInterview } from "@/app/interviews/actions";
import { DeleteInterviewButton } from "@/components/interviews/delete-interview-button";
import { InterviewDetail } from "@/components/interviews/interview-detail";
import type { InterviewWithRelations } from "@/components/interviews/interview-types";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type InterviewDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatTitle(interview: InterviewWithRelations) {
  const companyName = interview.applications?.jobs?.companies?.name;
  return companyName ? `${companyName} - ${interview.type}` : interview.type;
}

export default async function InterviewDetailPage({
  params,
}: InterviewDetailPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: interview, error } = await supabase
    .from("interviews")
    .select("*, applications(id, status, jobs(id, title, company_id, service_id, companies(id, name), services(id, name)))")
    .eq("id", id)
    .single();

  if (error || !interview) {
    notFound();
  }

  const interviewWithRelations = interview as InterviewWithRelations;
  const title = formatTitle(interviewWithRelations);

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="面談予定の詳細、準備メモ、結果メモを確認します。"
          title={title}
        />
        <div className="flex items-center gap-2">
          <Link
            className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
            href="/interviews"
          >
            一覧へ戻る
          </Link>
          <Link
            className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            href={`/interviews/${interviewWithRelations.id}/edit`}
          >
            編集
          </Link>
        </div>
      </div>

      <Card>
        <InterviewDetail interview={interviewWithRelations} />
      </Card>

      <Card className="mt-6 border-red-200">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-ink">削除</h3>
            <p className="mt-1 text-sm text-muted">
              この面談予定を削除します。削除後は元に戻せません。
            </p>
          </div>
          <form action={deleteInterview}>
            <input name="id" type="hidden" value={interviewWithRelations.id} />
            <DeleteInterviewButton label={title} />
          </form>
        </div>
      </Card>
    </>
  );
}
