import Link from "next/link";
import type { TaskWithRelations } from "./task-types";

type TasksTableProps = {
  tasks: TaskWithRelations[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
  }).format(new Date(`${value}T00:00:00`));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function completionLabel(isCompleted: boolean) {
  return isCompleted ? "完了" : "未完了";
}

export function TasksTable({ tasks }: TasksTableProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-white px-6 py-12 text-center">
        <p className="text-sm font-medium text-ink">
          タスクはまだ登録されていません。
        </p>
        <p className="mt-2 text-sm text-muted">
          返信、書類提出、面談準備などの期限付きタスクを登録しましょう。
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border bg-white shadow-panel">
      <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
        <thead className="bg-surface text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">期限日</th>
            <th className="px-4 py-3 font-medium">タイトル</th>
            <th className="px-4 py-3 font-medium">種別</th>
            <th className="px-4 py-3 font-medium">会社</th>
            <th className="px-4 py-3 font-medium">求人</th>
            <th className="px-4 py-3 font-medium">優先度</th>
            <th className="px-4 py-3 font-medium">完了状態</th>
            <th className="px-4 py-3 font-medium">更新日</th>
            <th className="px-4 py-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {tasks.map((task) => (
            <tr className="hover:bg-surface" key={task.id}>
              <td className="px-4 py-3 font-medium text-ink">
                {formatDate(task.due_date)}
              </td>
              <td className="px-4 py-3 font-medium text-ink">
                <Link className="hover:underline" href={`/tasks/${task.id}`}>
                  {task.title}
                </Link>
              </td>
              <td className="px-4 py-3 text-muted">{task.type}</td>
              <td className="px-4 py-3 text-muted">
                {task.applications?.jobs?.companies?.name ?? "-"}
              </td>
              <td className="px-4 py-3 text-muted">
                {task.applications?.jobs?.title ?? "-"}
              </td>
              <td className="px-4 py-3">
                <span className="rounded-md bg-surface px-2 py-1 text-xs text-muted">
                  {task.priority}
                </span>
              </td>
              <td className="px-4 py-3 text-muted">
                {completionLabel(task.is_completed)}
              </td>
              <td className="px-4 py-3 text-muted">
                {formatDateTime(task.updated_at)}
              </td>
              <td className="px-4 py-3">
                <Link
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-surface"
                  href={`/tasks/${task.id}`}
                >
                  詳細
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
