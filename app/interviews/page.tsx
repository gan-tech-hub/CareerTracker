import Link from "next/link";
import { InterviewFilters } from "@/components/interviews/interview-filters";
import { InterviewsTable } from "@/components/interviews/interviews-table";
import type { InterviewWithRelations } from "@/components/interviews/interview-types";
import { PageHeader } from "@/components/ui/page-header";
import {
  isInterviewDateFilter,
  isInterviewType,
} from "@/lib/constants/interviews";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type InterviewsPageProps = {
  searchParams: Promise<{
    company_id?: string;
    date_scope?: string;
    q?: string;
    service_id?: string;
    type?: string;
  }>;
};

function escapeLikePattern(value: string) {
  return value.replace(/[%_]/g, (matched) => `\\${matched}`);
}

export default async function InterviewsPage({
  searchParams,
}: InterviewsPageProps) {
  const params = await searchParams;
  const q = String(params.q ?? "").trim();
  const selectedCompanyId = String(params.company_id ?? "").trim();
  const selectedServiceId = String(params.service_id ?? "").trim();
  const selectedType =
    params.type && isInterviewType(params.type) ? params.type : "";
  const selectedDateScope =
    params.date_scope && isInterviewDateFilter(params.date_scope)
      ? params.date_scope
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

  let interviews: InterviewWithRelations[] = [];

  if (!filteredApplicationIds || filteredApplicationIds.length > 0) {
    let query = supabase
      .from("interviews")
      .select("*, applications(id, status, jobs(id, title, company_id, service_id, companies(id, name), services(id, name)))")
      .order("scheduled_at", { ascending: true });

    if (filteredApplicationIds) {
      query = query.in("application_id", filteredApplicationIds);
    }

    if (q) {
      const escapedQ = escapeLikePattern(q);
      query = query.or(
        [
          `location.ilike.%${escapedQ}%`,
          `participants.ilike.%${escapedQ}%`,
          `preparation_memo.ilike.%${escapedQ}%`,
          `interview_memo.ilike.%${escapedQ}%`,
          `result_memo.ilike.%${escapedQ}%`,
        ].join(","),
      );
    }

    if (selectedType) {
      query = query.eq("type", selectedType);
    }

    if (selectedDateScope) {
      const now = new Date();
      const sevenDaysLater = new Date(now);
      sevenDaysLater.setDate(now.getDate() + 7);

      if (selectedDateScope === "upcoming") {
        query = query.gte("scheduled_at", now.toISOString());
      }

      if (selectedDateScope === "past") {
        query = query.lt("scheduled_at", now.toISOString());
      }

      if (selectedDateScope === "within_7_days") {
        query = query
          .gte("scheduled_at", now.toISOString())
          .lte("scheduled_at", sevenDaysLater.toISOString());
      }
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to load interviews: ${error.message}`);
    }

    interviews = (data ?? []) as InterviewWithRelations[];
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="面談や面接の予定を日付順に管理します。"
          title="面談予定"
        />
        <Link
          className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          href="/interviews/new"
        >
          新規登録
        </Link>
      </div>

      <InterviewFilters
        companies={companiesResult.data ?? []}
        q={q}
        selectedCompanyId={validSelectedCompanyId}
        selectedDateScope={selectedDateScope}
        selectedServiceId={validSelectedServiceId}
        selectedType={selectedType}
        services={servicesResult.data ?? []}
      />
      <InterviewsTable interviews={interviews} />
    </>
  );
}
