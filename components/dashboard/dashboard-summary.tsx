import Link from "next/link";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

type DashboardMetric = {
  label: string;
  value: number;
};

type ApplicationStatusCount = {
  label: string;
  count: number;
};

type DashboardInterview = {
  id: string;
  type: string;
  scheduled_at: string;
  applications: {
    jobs:
      | {
          title: string;
          companies: { name: string } | null;
        }
      | null;
  } | null;
};

type DashboardTask = {
  id: string;
  title: string;
  type: string;
  due_date: string;
  priority: string;
  applications: {
    jobs:
      | {
          title: string;
          companies: { name: string } | null;
        }
      | null;
  } | null;
};

type DashboardSummaryProps = {
  applicationStatusCounts: ApplicationStatusCount[];
  metrics: DashboardMetric[];
  upcomingInterviews: DashboardInterview[];
  upcomingTasks: DashboardTask[];
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

function relationLabel(
  relation: {
    jobs:
      | {
          title: string;
          companies: { name: string } | null;
        }
      | null;
  } | null,
) {
  const companyName = relation?.jobs?.companies?.name ?? "会社未設定";
  const jobTitle = relation?.jobs?.title ?? "求人未設定";
  return `${companyName} / ${jobTitle}`;
}

function EmptyMessage({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-border bg-white px-4 py-6 text-sm text-muted">
      {children}
    </p>
  );
}

export function DashboardSummary({
  applicationStatusCounts,
  metrics,
  upcomingInterviews,
  upcomingTasks,
}: DashboardSummaryProps) {
  return (
    <>
      <PageHeader
        description="転職活動の状況を一覧で確認できます。"
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
          {upcomingInterviews.length === 0 ? (
            <EmptyMessage>直近の面談予定はありません。</EmptyMessage>
          ) : (
            <div className="space-y-3">
              {upcomingInterviews.map((interview) => (
                <div
                  className="rounded-md border border-border px-4 py-3"
                  key={interview.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {formatDateTime(interview.scheduled_at)}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        {interview.type} / {relationLabel(interview.applications)}
                      </p>
                    </div>
                    <Link
                      className="shrink-0 text-xs font-medium text-ink underline"
                      href={`/interviews/${interview.id}`}
                    >
                      詳細
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="mb-4 text-base font-semibold text-ink">期限が近いタスク</h3>
          {upcomingTasks.length === 0 ? (
            <EmptyMessage>期限が近いタスクはありません。</EmptyMessage>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div
                  className="rounded-md border border-border px-4 py-3"
                  key={task.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-ink">{task.title}</p>
                      <p className="mt-1 text-sm text-muted">
                        {formatDate(task.due_date)} / {task.type} /{" "}
                        {task.priority}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {relationLabel(task.applications)}
                      </p>
                    </div>
                    <Link
                      className="shrink-0 text-xs font-medium text-ink underline"
                      href={`/tasks/${task.id}`}
                    >
                      詳細
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <h3 className="mb-4 text-base font-semibold text-ink">
          ステータス別応募件数
        </h3>
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {applicationStatusCounts.map((status) => (
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
