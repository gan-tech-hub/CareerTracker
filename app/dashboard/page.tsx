import { DashboardSummary } from "@/components/dashboard/dashboard-summary";
import { APPLICATION_STATUSES } from "@/lib/constants/applications";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const inactiveApplicationStatuses = new Set(["気になる", "辞退", "不採用"]);

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const sevenDaysLater = new Date(today);
  sevenDaysLater.setDate(today.getDate() + 7);

  const todayText = toDateInputValue(today);
  const sevenDaysLaterText = toDateInputValue(sevenDaysLater);

  const [
    applicationsResult,
    upcomingInterviewsResult,
    overdueTasksResult,
    upcomingTasksResult,
    upcomingInterviewListResult,
    upcomingTaskListResult,
  ] = await Promise.all([
    supabase.from("applications").select("status"),
    supabase
      .from("interviews")
      .select("id", { count: "exact", head: true })
      .gte("scheduled_at", now.toISOString()),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("is_completed", false)
      .lt("due_date", todayText),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("is_completed", false)
      .gte("due_date", todayText)
      .lte("due_date", sevenDaysLaterText),
    supabase
      .from("interviews")
      .select("id, type, scheduled_at, applications(id, jobs(id, title, companies(id, name), services(id, name)))")
      .gte("scheduled_at", now.toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(5),
    supabase
      .from("tasks")
      .select("id, title, type, due_date, priority, applications(id, jobs(id, title, companies(id, name), services(id, name)))")
      .eq("is_completed", false)
      .gte("due_date", todayText)
      .order("due_date", { ascending: true })
      .limit(5),
  ]);

  if (applicationsResult.error) {
    throw new Error(
      `Failed to load dashboard applications: ${applicationsResult.error.message}`,
    );
  }

  if (upcomingInterviewsResult.error) {
    throw new Error(
      `Failed to load dashboard interviews: ${upcomingInterviewsResult.error.message}`,
    );
  }

  if (overdueTasksResult.error) {
    throw new Error(
      `Failed to load dashboard overdue tasks: ${overdueTasksResult.error.message}`,
    );
  }

  if (upcomingTasksResult.error) {
    throw new Error(
      `Failed to load dashboard upcoming tasks: ${upcomingTasksResult.error.message}`,
    );
  }

  if (upcomingInterviewListResult.error) {
    throw new Error(
      `Failed to load dashboard interview list: ${upcomingInterviewListResult.error.message}`,
    );
  }

  if (upcomingTaskListResult.error) {
    throw new Error(
      `Failed to load dashboard task list: ${upcomingTaskListResult.error.message}`,
    );
  }

  const applicationStatuses = applicationsResult.data ?? [];
  const activeApplicationCount = applicationStatuses.filter(
    (application) => !inactiveApplicationStatuses.has(application.status),
  ).length;
  const applicationStatusCounts = APPLICATION_STATUSES.map((status) => ({
    label: status,
    count: applicationStatuses.filter((application) => application.status === status)
      .length,
  }));

  const metrics = [
    { label: "応募中件数", value: activeApplicationCount },
    { label: "面談予定件数", value: upcomingInterviewsResult.count ?? 0 },
    { label: "期限切れタスク", value: overdueTasksResult.count ?? 0 },
    { label: "7日以内の期限タスク", value: upcomingTasksResult.count ?? 0 },
  ];

  return (
    <DashboardSummary
      applicationStatusCounts={applicationStatusCounts}
      metrics={metrics}
      upcomingInterviews={upcomingInterviewListResult.data ?? []}
      upcomingTasks={upcomingTaskListResult.data ?? []}
    />
  );
}
