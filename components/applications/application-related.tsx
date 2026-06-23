import Link from "next/link";
import { Card } from "@/components/ui/card";

type RelatedInterview = {
  id: string;
  type: string;
  scheduled_at: string;
  location: string | null;
  participants: string | null;
};

type RelatedTask = {
  id: string;
  title: string;
  type: string;
  due_date: string;
  priority: string;
  is_completed: boolean;
};

type ApplicationRelatedProps = {
  interviews: RelatedInterview[];
  tasks: RelatedTask[];
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

function EmptyMessage({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-border bg-white px-4 py-6 text-sm text-muted">
      {children}
    </p>
  );
}

export function ApplicationRelated({
  interviews,
  tasks,
}: ApplicationRelatedProps) {
  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-2">
      <Card>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-ink">関連面談予定</h3>
          <Link
            className="rounded-md border border-border bg-white px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-surface"
            href="/interviews/new"
          >
            面談予定を追加
          </Link>
        </div>

        {interviews.length === 0 ? (
          <div className="mt-4">
            <EmptyMessage>関連する面談予定はありません。</EmptyMessage>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-md border border-border">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-surface text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">日時</th>
                  <th className="px-3 py-2 font-medium">種別</th>
                  <th className="px-3 py-2 font-medium">場所</th>
                  <th className="px-3 py-2 font-medium">参加者</th>
                  <th className="px-3 py-2 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {interviews.map((interview) => (
                  <tr className="hover:bg-surface" key={interview.id}>
                    <td className="px-3 py-2 font-medium text-ink">
                      {formatDateTime(interview.scheduled_at)}
                    </td>
                    <td className="px-3 py-2 text-muted">{interview.type}</td>
                    <td className="px-3 py-2 text-muted">
                      {interview.location ?? "-"}
                    </td>
                    <td className="px-3 py-2 text-muted">
                      {interview.participants ?? "-"}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        className="text-ink underline"
                        href={`/interviews/${interview.id}`}
                      >
                        詳細
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-ink">関連タスク</h3>
          <Link
            className="rounded-md border border-border bg-white px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-surface"
            href="/tasks/new"
          >
            タスクを追加
          </Link>
        </div>

        {tasks.length === 0 ? (
          <div className="mt-4">
            <EmptyMessage>関連するタスクはありません。</EmptyMessage>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-md border border-border">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-surface text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">期限日</th>
                  <th className="px-3 py-2 font-medium">タイトル</th>
                  <th className="px-3 py-2 font-medium">種別</th>
                  <th className="px-3 py-2 font-medium">優先度</th>
                  <th className="px-3 py-2 font-medium">状態</th>
                  <th className="px-3 py-2 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tasks.map((task) => (
                  <tr className="hover:bg-surface" key={task.id}>
                    <td className="px-3 py-2 font-medium text-ink">
                      {formatDate(task.due_date)}
                    </td>
                    <td className="px-3 py-2 text-muted">{task.title}</td>
                    <td className="px-3 py-2 text-muted">{task.type}</td>
                    <td className="px-3 py-2 text-muted">{task.priority}</td>
                    <td className="px-3 py-2 text-muted">
                      {task.is_completed ? "完了" : "未完了"}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        className="text-ink underline"
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
        )}
      </Card>
    </div>
  );
}
