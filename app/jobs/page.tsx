import Link from "next/link";
import { JobFilters } from "@/components/jobs/job-filters";
import { JobsTable } from "@/components/jobs/jobs-table";
import type { JobWithRelations } from "@/components/jobs/job-types";
import { PageHeader } from "@/components/ui/page-header";
import {
  isJobEmploymentType,
  isJobPriority,
  isJobRemoteType,
  isJobSideJobAllowed,
} from "@/lib/constants/jobs";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type JobsPageProps = {
  searchParams: Promise<{
    company_id?: string;
    employment_type?: string;
    priority?: string;
    q?: string;
    remote_type?: string;
    service_id?: string;
    side_job_allowed?: string;
  }>;
};

function escapeLikePattern(value: string) {
  return value.replace(/[%_]/g, (matched) => `\\${matched}`);
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;
  const q = String(params.q ?? "").trim();
  const selectedCompanyId = String(params.company_id ?? "").trim();
  const selectedServiceId = String(params.service_id ?? "").trim();
  const selectedEmploymentType =
    params.employment_type && isJobEmploymentType(params.employment_type)
      ? params.employment_type
      : "";
  const selectedRemoteType =
    params.remote_type && isJobRemoteType(params.remote_type)
      ? params.remote_type
      : "";
  const selectedSideJobAllowed =
    params.side_job_allowed && isJobSideJobAllowed(params.side_job_allowed)
      ? params.side_job_allowed
      : "";
  const selectedPriority =
    params.priority && isJobPriority(params.priority) ? params.priority : "";

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

  let query = supabase
    .from("jobs")
    .select("*, companies(id, name), services(id, name)")
    .order("updated_at", { ascending: false });

  if (q) {
    const escapedQ = escapeLikePattern(q);
    query = query.or(
      [
        `title.ilike.%${escapedQ}%`,
        `job_type.ilike.%${escapedQ}%`,
        `required_skills.ilike.%${escapedQ}%`,
        `preferred_skills.ilike.%${escapedQ}%`,
        `memo.ilike.%${escapedQ}%`,
      ].join(","),
    );
  }

  if (validSelectedCompanyId) {
    query = query.eq("company_id", validSelectedCompanyId);
  }

  if (validSelectedServiceId) {
    query = query.eq("service_id", validSelectedServiceId);
  }

  if (selectedEmploymentType) {
    query = query.eq("employment_type", selectedEmploymentType);
  }

  if (selectedRemoteType) {
    query = query.eq("remote_type", selectedRemoteType);
  }

  if (selectedSideJobAllowed) {
    query = query.eq("side_job_allowed", selectedSideJobAllowed);
  }

  if (selectedPriority) {
    query = query.eq("priority", selectedPriority);
  }

  const { data: jobs, error } = await query;

  if (error) {
    throw new Error(`Failed to load jobs: ${error.message}`);
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="登録済みの求人を一覧で確認し、比較・絞り込みできます。"
          title="求人"
        />
        <div className="flex flex-wrap justify-end gap-2">
          <Link
            className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
            href="/jobs/import"
          >
            AIで求人票解析
          </Link>
          <Link
            className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            href="/jobs/new"
          >
            新規登録
          </Link>
        </div>
      </div>

      <JobFilters
        companies={companiesResult.data ?? []}
        q={q}
        selectedCompanyId={validSelectedCompanyId}
        selectedEmploymentType={selectedEmploymentType}
        selectedPriority={selectedPriority}
        selectedRemoteType={selectedRemoteType}
        selectedServiceId={validSelectedServiceId}
        selectedSideJobAllowed={selectedSideJobAllowed}
        services={servicesResult.data ?? []}
      />
      <JobsTable jobs={(jobs ?? []) as JobWithRelations[]} />
    </>
  );
}
