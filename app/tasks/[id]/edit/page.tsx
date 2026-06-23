import Link from "next/link";
import { notFound } from "next/navigation";
import { updateTask } from "@/app/tasks/actions";
import { TaskForm } from "@/components/tasks/task-form";
import type { TaskApplicationOption } from "@/components/tasks/task-types";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type EditTaskPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const [taskResult, applicationsResult] = await Promise.all([
    supabase.from("tasks").select("*").eq("id", id).single(),
    supabase
      .from("applications")
      .select("id, status, jobs(id, title, company_id, service_id, companies(id, name), services(id, name))")
      .order("updated_at", { ascending: false }),
  ]);

  if (taskResult.error || !taskResult.data) {
    notFound();
  }

  if (applicationsResult.error) {
    throw new Error(
      `Failed to load applications: ${applicationsResult.error.message}`,
    );
  }

  const updateTaskWithId = updateTask.bind(null, taskResult.data.id);

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="タスクの期限、完了状態、メモを編集します。"
          title="タスクを編集"
        />
        <Link
          className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
          href={`/tasks/${taskResult.data.id}`}
        >
          詳細へ戻る
        </Link>
      </div>

      <Card>
        <TaskForm
          action={updateTaskWithId}
          applications={
            (applicationsResult.data ?? []) as TaskApplicationOption[]
          }
          submitLabel="更新する"
          task={taskResult.data}
        />
      </Card>
    </>
  );
}
