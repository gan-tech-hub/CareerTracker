import Link from "next/link";
import {
  JOB_EMPLOYMENT_TYPES,
  JOB_PRIORITIES,
  JOB_REMOTE_TYPES,
  JOB_SIDE_JOB_OPTIONS,
} from "@/lib/constants/jobs";
import type { JobSelectOption } from "./job-types";

type JobFiltersProps = {
  companies: JobSelectOption[];
  q?: string;
  selectedCompanyId?: string;
  selectedEmploymentType?: string;
  selectedPriority?: string;
  selectedRemoteType?: string;
  selectedServiceId?: string;
  selectedSideJobAllowed?: string;
  services: JobSelectOption[];
};

export function JobFilters({
  companies,
  q = "",
  selectedCompanyId = "",
  selectedEmploymentType = "",
  selectedPriority = "",
  selectedRemoteType = "",
  selectedServiceId = "",
  selectedSideJobAllowed = "",
  services,
}: JobFiltersProps) {
  return (
    <form
      action="/jobs"
      className="mb-5 space-y-4 rounded-md border border-border bg-white p-4 shadow-panel"
      method="get"
    >
      <div>
        <label className="text-sm font-medium text-ink" htmlFor="job-search">
          検索
        </label>
        <input
          className="mt-2 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-ink"
          defaultValue={q}
          id="job-search"
          name="q"
          placeholder="求人タイトル、職種、スキル、メモで検索"
          type="text"
        />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-56">
          <label
            className="text-sm font-medium text-ink"
            htmlFor="company-filter"
          >
            会社
          </label>
          <select
            className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none transition focus:border-ink"
            defaultValue={selectedCompanyId}
            id="company-filter"
            name="company_id"
          >
            <option value="">すべて</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-56">
          <label
            className="text-sm font-medium text-ink"
            htmlFor="service-filter"
          >
            転職サービス
          </label>
          <select
            className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none transition focus:border-ink"
            defaultValue={selectedServiceId}
            id="service-filter"
            name="service_id"
          >
            <option value="">すべて</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-48">
          <label
            className="text-sm font-medium text-ink"
            htmlFor="employment-type-filter"
          >
            雇用形態
          </label>
          <select
            className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none transition focus:border-ink"
            defaultValue={selectedEmploymentType}
            id="employment-type-filter"
            name="employment_type"
          >
            <option value="">すべて</option>
            {JOB_EMPLOYMENT_TYPES.map((employmentType) => (
              <option key={employmentType} value={employmentType}>
                {employmentType}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-48">
          <label
            className="text-sm font-medium text-ink"
            htmlFor="remote-type-filter"
          >
            リモート可否
          </label>
          <select
            className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none transition focus:border-ink"
            defaultValue={selectedRemoteType}
            id="remote-type-filter"
            name="remote_type"
          >
            <option value="">すべて</option>
            {JOB_REMOTE_TYPES.map((remoteType) => (
              <option key={remoteType} value={remoteType}>
                {remoteType}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-48">
          <label
            className="text-sm font-medium text-ink"
            htmlFor="side-job-filter"
          >
            副業可否
          </label>
          <select
            className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none transition focus:border-ink"
            defaultValue={selectedSideJobAllowed}
            id="side-job-filter"
            name="side_job_allowed"
          >
            <option value="">すべて</option>
            {JOB_SIDE_JOB_OPTIONS.map((sideJobAllowed) => (
              <option key={sideJobAllowed} value={sideJobAllowed}>
                {sideJobAllowed}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-40">
          <label
            className="text-sm font-medium text-ink"
            htmlFor="priority-filter"
          >
            優先度
          </label>
          <select
            className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none transition focus:border-ink"
            defaultValue={selectedPriority}
            id="priority-filter"
            name="priority"
          >
            <option value="">すべて</option>
            {JOB_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>

        <button
          className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          type="submit"
        >
          絞り込み
        </button>

        <Link
          className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
          href="/jobs"
        >
          クリア
        </Link>
      </div>
    </form>
  );
}
