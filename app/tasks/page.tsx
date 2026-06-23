import Link from "next/link";
import { TaskFilters } from "@/components/tasks/task-filters";
import type { TaskWithRelations } from "@/components/tasks/task-types";
import { TasksTable } from "@/components/tasks/tasks-table";
import { PageHeader } from "@/components/ui/page-header";
import {
  isTaskCompletionFilter,
  isTaskDueDateFilter,
  isTaskPriority,
  isTaskType,
} from "@/lib/constants/tasks";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type TasksPageProps = {
  searchParams: Promise<{
    company_id?: string;
    completion?: string;
    due_date?: string;
    priority?: string;
    q?: string;
    service_id?: string;
    type?: string;
  }>;
};

function escapeLikePattern(value: string) {
  return value.replace(/[%_]/g, (matched) => `\\${matched}`);
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const params = await searchParams;
  const q = String(params.q ?? "").trim();
  const selectedCompanyId = String(params.company_id ?? "").trim();
  const selectedServiceId = String(params.service_id ?? "").trim();
  const selectedCompletion =
    params.completion && isTaskCompletionFilter(params.completion)
      ? params.completion
      : "";
  const selectedDueDate =
    params.due_date && isTaskDueDateFilter(params.due_date)
      ? params.due_date
      : "";
  const selectedPriority =
    params.priority && isTaskPriority(params.priority) ? params.priority : "";
  const selectedType =
    params.type && isTaskType(params.type) ? params.type : "";

  const supabase = await createSupabaseServerClient();
  const [companiesResult, servicesResult] = await Promise.all([
    supabase.from("companies").select("id, name").order("name"),
    supabase.from("services").select("id, name").order("name"),
  ]);

  if (companiesResult.error) {
    throw new Error(
      `Failed to load companies: ${companiesResult.error.message}`,
    );
  }

  if (servicesResult.error) {
    throw new Error(`Failed to load services: ${servicesResult.error.message}`);
  }

  const companyIds = new Set((companiesResult.data ?? []).map(({ id }) => id));
  const serviceIds = new Set((servicesResult.data ?? []).map(({ id }) => id));
  const validSelectedCompanyId = companyIds.has(selectedCompanyId)
    ? selectedCompanyId
    : "";
  const validSelectedServiceId = serviceIds.has(selectedServiceId)
    ? selectedServiceId
    : "";

  let filteredApplicationIds: string[] | undefined;

  if (validSelectedCompanyId || validSelectedServiceId) {
    let jobsQuery = supabase.from("jobs").select("id");

    if (validSelectedCompanyId) {
      jobsQuery = jobsQuery.eq("company_id", validSelectedCompanyId);
    }

    if (validSelectedServiceId) {
      jobsQuery = jobsQuery.eq("service_id", validSelectedServiceId);
    }

    const { data: jobs, error: jobsError } = await jobsQuery;

    if (jobsError) {
      throw new Error(`Failed to load filtered jobs: ${jobsError.message}`);
    }

    const jobIds = (jobs ?? []).map(({ id }) => id);

    if (jobIds.length > 0) {
      const { data: applications, error: applicationsError } = await supabase
        .from("applications")
        .select("id")
        .in("job_id", jobIds);

      if (applicationsError) {
        throw new Error(
          `Failed to load filtered applications: ${applicationsError.message}`,
        );
      }

      filteredApplicationIds = (applications ?? []).map(({ id }) => id);
    } else {
      filteredApplicationIds = [];
    }
  }

  let tasks: TaskWithRelations[] = [];

  if (!filteredApplicationIds || filteredApplicationIds.length > 0) {
    let query = supabase
      .from("tasks")
      .select("*, applications(id, status, jobs(id, title, company_id, service_id, companies(id, name), services(id, name)))")
      .order("is_completed", { ascending: true })
      .order("due_date", { ascending: true })
      .order("updated_at", { ascending: false });

    if (filteredApplicationIds) {
      query = query.in("application_id", filteredApplicationIds);
    }

    if (q) {
      const escapedQ = escapeLikePattern(q);
      query = query.or(
        [`title.ilike.%${escapedQ}%`, `memo.ilike.%${escapedQ}%`].join(","),
      );
    }

    if (selectedCompletion === "incomplete") {
      query = query.eq("is_completed", false);
    }

    if (selectedCompletion === "completed") {
      query = query.eq("is_completed", true);
    }

    if (selectedType) {
      query = query.eq("type", selectedType);
    }

    if (selectedPriority) {
      query = query.eq("priority", selectedPriority);
    }

    if (selectedDueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayText = toDateInputValue(today);

      if (selectedDueDate === "overdue") {
        query = query.eq("is_completed", false).lt("due_date", todayText);
      }

      if (selectedDueDate === "today") {
        query = query.eq("due_date", todayText);
      }

      if (selectedDueDate === "within_7_days") {
        const sevenDaysLater = new Date(today);
        sevenDaysLater.setDate(today.getDate() + 7);
        query = query
          .eq("is_completed", false)
          .gte("due_date", todayText)
          .lte("due_date", toDateInputValue(sevenDaysLater));
      }
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to load tasks: ${error.message}`);
    }

    tasks = (data ?? []) as TaskWithRelations[];
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="返信、書類提出、面談準備などの期限付きタスクを管理します。"
          title="タスク・期限"
        />
        <Link
          className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          href="/tasks/new"
        >
          新規登録
        </Link>
      </div>

      <TaskFilters
        companies={companiesResult.data ?? []}
        q={q}
        selectedCompanyId={validSelectedCompanyId}
        selectedCompletion={selectedCompletion}
        selectedDueDate={selectedDueDate}
        selectedPriority={selectedPriority}
        selectedServiceId={validSelectedServiceId}
        selectedType={selectedType}
        services={servicesResult.data ?? []}
      />
      <TasksTable tasks={tasks} />
    </>
  );
}
