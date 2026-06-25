import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteApplication } from "@/app/applications/actions";
import { ApplicationDetail } from "@/components/applications/application-detail";
import { ApplicationRelated } from "@/components/applications/application-related";
import type { ApplicationWithRelations } from "@/components/applications/application-types";
import { DeleteApplicationButton } from "@/components/applications/delete-application-button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ApplicationDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const [applicationResult, interviewsResult, tasksResult] = await Promise.all([
    supabase
      .from("applications")
      .select("*, jobs(id, title, company_id, service_id, companies(id, name), services(id, name))")
      .eq("id", id)
      .single(),
    supabase
      .from("interviews")
      .select("id, type, scheduled_at, location, participants")
      .eq("application_id", id)
      .order("scheduled_at", { ascending: true }),
    supabase
      .from("tasks")
      .select("id, title, type, due_date, priority, is_completed")
      .eq("application_id", id)
      .order("is_completed", { ascending: true })
      .order("due_date", { ascending: true }),
  ]);

  if (applicationResult.error) {
    notFound();
  }

  const application = applicationResult.data;

  if (!application) {
    notFound();
  }

  if (interviewsResult.error) {
    throw new Error(
      `Failed to load related interviews: ${interviewsResult.error.message}`,
    );
  }

  if (tasksResult.error) {
    throw new Error(`Failed to load related tasks: ${tasksResult.error.message}`);
  }

  const applicationWithRelations = application as ApplicationWithRelations;
  const title = applicationWithRelations.jobs?.title ?? "応募・選考詳細";

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="応募状況と選考ステータスの詳細を確認します。"
          title={title}
        />
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link
            className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
            href={`/applications/${applicationWithRelations.id}/ai-prep`}
          >
            AIで準備メモ作成
          </Link>
          <Link
            className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
            href="/applications"
          >
            一覧へ戻る
          </Link>
          <Link
            className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
            href="/applications/kanban"
          >
            カンバンへ戻る
          </Link>
          <Link
            className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            href={`/applications/${applicationWithRelations.id}/edit`}
          >
            編集
          </Link>
        </div>
      </div>

      <Card>
        <ApplicationDetail application={applicationWithRelations} />
      </Card>

      <ApplicationRelated
        interviews={interviewsResult.data ?? []}
        tasks={tasksResult.data ?? []}
      />

      <Card className="mt-6 border-red-200">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-ink">削除</h3>
            <p className="mt-1 text-sm text-muted">
              この応募・選考情報を削除します。削除後は元に戻せません。
            </p>
          </div>
          <form action={deleteApplication}>
            <input
              name="id"
              type="hidden"
              value={applicationWithRelations.id}
            />
            <DeleteApplicationButton jobTitle={title} />
          </form>
        </div>
      </Card>
    </>
  );
}
