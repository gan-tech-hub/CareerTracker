import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteTask, toggleTaskCompletion } from "@/app/tasks/actions";
import { DeleteTaskButton } from "@/components/tasks/delete-task-button";
import { TaskDetail } from "@/components/tasks/task-detail";
import type { TaskWithRelations } from "@/components/tasks/task-types";
import { ToggleTaskCompletionButton } from "@/components/tasks/toggle-task-completion-button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type TaskDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: task, error } = await supabase
    .from("tasks")
    .select("*, applications(id, status, jobs(id, title, company_id, service_id, companies(id, name), services(id, name)))")
    .eq("id", id)
    .single();

  if (error || !task) {
    notFound();
  }

  const taskWithRelations = task as TaskWithRelations;

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="タスクの期限、完了状態、関連応募を確認します。"
          title={taskWithRelations.title}
        />
        <div className="flex items-center gap-2">
          {taskWithRelations.applications ? (
            <Link
              className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
              href={`/applications/${taskWithRelations.applications.id}`}
            >
              応募詳細へ戻る
            </Link>
          ) : null}
          <Link
            className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
            href="/tasks"
          >
            一覧へ戻る
          </Link>
          <Link
            className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            href={`/tasks/${taskWithRelations.id}/edit`}
          >
            編集
          </Link>
          <form action={toggleTaskCompletion}>
            <input name="id" type="hidden" value={taskWithRelations.id} />
            <input
              name="next_completed"
              type="hidden"
              value={String(!taskWithRelations.is_completed)}
            />
            <ToggleTaskCompletionButton
              isCompleted={taskWithRelations.is_completed}
            />
          </form>
        </div>
      </div>

      <Card>
        <TaskDetail task={taskWithRelations} />
      </Card>

      <Card className="mt-6 border-red-200">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-ink">削除</h3>
            <p className="mt-1 text-sm text-muted">
              このタスクを削除します。削除後は元に戻せません。
            </p>
          </div>
          <form action={deleteTask}>
            <input name="id" type="hidden" value={taskWithRelations.id} />
            <DeleteTaskButton title={taskWithRelations.title} />
          </form>
        </div>
      </Card>
    </>
  );
}
