import Link from "next/link";
import { ApplicationFilters } from "@/components/applications/application-filters";
import { ApplicationsTable } from "@/components/applications/applications-table";
import type { ApplicationWithRelations } from "@/components/applications/application-types";
import { PageHeader } from "@/components/ui/page-header";
import {
  isApplicationDeadlineFilter,
  isApplicationInterestLevel,
  isApplicationStatus,
} from "@/lib/constants/applications";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ApplicationsPageProps = {
  searchParams: Promise<{
    company_id?: string;
    deadline?: string;
    interest_level?: string;
    q?: string;
    service_id?: string;
    status?: string;
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

export default async function ApplicationsPage({
  searchParams,
}: ApplicationsPageProps) {
  const params = await searchParams;
  const q = String(params.q ?? "").trim();
  const selectedCompanyId = String(params.company_id ?? "").trim();
  const selectedServiceId = String(params.service_id ?? "").trim();
  const selectedStatus =
    params.status && isApplicationStatus(params.status) ? params.status : "";
  const selectedInterestLevel =
    params.interest_level &&
    isApplicationInterestLevel(params.interest_level)
      ? params.interest_level
      : "";
  const selectedDeadline =
    params.deadline && isApplicationDeadlineFilter(params.deadline)
      ? params.deadline
      : "";

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

  let filteredJobIds: string[] | undefined;

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

    filteredJobIds = (jobs ?? []).map(({ id }) => id);
  }

  let applications: ApplicationWithRelations[] = [];

  if (!filteredJobIds || filteredJobIds.length > 0) {
    let query = supabase
      .from("applications")
      .select("*, jobs(id, title, company_id, service_id, companies(id, name), services(id, name))")
      .order("updated_at", { ascending: false });

    if (filteredJobIds) {
      query = query.in("job_id", filteredJobIds);
    }

    if (q) {
      const escapedQ = escapeLikePattern(q);
      query = query.or(
        [
          `next_action.ilike.%${escapedQ}%`,
          `selection_memo.ilike.%${escapedQ}%`,
          `decline_reason.ilike.%${escapedQ}%`,
          `rejection_reason.ilike.%${escapedQ}%`,
        ].join(","),
      );
    }

    if (selectedStatus) {
      query = query.eq("status", selectedStatus);
    }

    if (selectedInterestLevel) {
      query = query.eq("interest_level", selectedInterestLevel);
    }

    if (selectedDeadline) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayText = toDateInputValue(today);

      if (selectedDeadline === "overdue") {
        query = query.lt("next_deadline", todayText);
      }

      if (selectedDeadline === "within_7_days") {
        const sevenDaysLater = new Date(today);
        sevenDaysLater.setDate(today.getDate() + 7);
        query = query
          .gte("next_deadline", todayText)
          .lte("next_deadline", toDateInputValue(sevenDaysLater));
      }
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to load applications: ${error.message}`);
    }

    applications = (data ?? []) as ApplicationWithRelations[];
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="求人ごとの応募状況と選考ステータスを管理します。"
          title="応募・選考"
        />
        <div className="flex items-center gap-2">
          <Link
            className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
            href="/applications/kanban"
          >
            カンバン
          </Link>
          <Link
            className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            href="/applications/new"
          >
            新規登録
          </Link>
        </div>
      </div>

      <ApplicationFilters
        companies={companiesResult.data ?? []}
        q={q}
        selectedCompanyId={validSelectedCompanyId}
        selectedDeadline={selectedDeadline}
        selectedInterestLevel={selectedInterestLevel}
        selectedServiceId={validSelectedServiceId}
        selectedStatus={selectedStatus}
        services={servicesResult.data ?? []}
      />
      <ApplicationsTable applications={applications} />
    </>
  );
}
