import Link from "next/link";
import { createTask } from "@/app/tasks/actions";
import { TaskForm } from "@/components/tasks/task-form";
import type { TaskApplicationOption } from "@/components/tasks/task-types";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function NewTaskPage() {
  const supabase = await createSupabaseServerClient();
  const { data: applications, error } = await supabase
    .from("applications")
    .select("id, status, jobs(id, title, company_id, service_id, companies(id, name), services(id, name))")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load applications: ${error.message}`);
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="期限付きタスクを登録します。関連応募なしでも登録できます。"
          title="タスクを登録"
        />
        <Link
          className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
          href="/tasks"
        >
          一覧へ戻る
        </Link>
      </div>

      <Card>
        <TaskForm
          action={createTask}
          applications={(applications ?? []) as TaskApplicationOption[]}
          submitLabel="登録する"
        />
      </Card>
    </>
  );
}
