import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

const metrics = [
  { label: "応募中件数", value: "8" },
  { label: "面談予定件数", value: "3" },
  { label: "期限切れタスク", value: "1" },
  { label: "7日以内の期限タスク", value: "5" },
];

const interviews = [
  {
    date: "2026-06-20 10:00",
    type: "一次面接",
    company: "サンプル株式会社",
    job: "Frontend Engineer",
  },
  {
    date: "2026-06-24 14:30",
    type: "カジュアル面談",
    company: "Career Tech Inc.",
    job: "Full Stack Engineer",
  },
];

const tasks = [
  { due: "2026-06-18", title: "職務経歴書を更新", type: "書類提出", priority: "高" },
  { due: "2026-06-21", title: "面接質問を整理", type: "面談準備", priority: "中" },
  { due: "2026-06-23", title: "エージェントへ返信", type: "返信", priority: "中" },
];

const statuses = [
  { label: "気になる", count: 4 },
  { label: "応募予定", count: 2 },
  { label: "応募済み", count: 3 },
  { label: "書類選考中", count: 2 },
  { label: "一次面接", count: 1 },
  { label: "内定", count: 0 },
];

export function DashboardSummary() {
  return (
    <>
      <PageHeader
        description="転職活動の状況を仮データで一覧表示しています。"
        title="ダッシュボード"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <p className="text-sm text-muted">{metric.label}</p>
            <p className="mt-3 text-3xl font-semibold text-ink">{metric.value}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-base font-semibold text-ink">直近の面談予定</h3>
          <div className="space-y-3">
            {interviews.map((interview) => (
              <div
                className="rounded-md border border-border px-4 py-3"
                key={`${interview.date}-${interview.company}`}
              >
                <p className="text-sm font-medium text-ink">{interview.date}</p>
                <p className="mt-1 text-sm text-muted">
                  {interview.type} / {interview.company} / {interview.job}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-base font-semibold text-ink">期限が近いタスク</h3>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                className="flex items-center justify-between rounded-md border border-border px-4 py-3"
                key={`${task.due}-${task.title}`}
              >
                <div>
                  <p className="text-sm font-medium text-ink">{task.title}</p>
                  <p className="mt-1 text-sm text-muted">
                    {task.due} / {task.type}
                  </p>
                </div>
                <span className="rounded-md bg-surface px-2 py-1 text-xs text-muted">
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <h3 className="mb-4 text-base font-semibold text-ink">
          ステータス別応募件数
        </h3>
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {statuses.map((status) => (
            <div className="rounded-md border border-border p-4" key={status.label}>
              <p className="text-sm text-muted">{status.label}</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{status.count}</p>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
