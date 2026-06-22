import Link from "next/link";
import {
  APPLICATION_DEADLINE_FILTERS,
  APPLICATION_INTEREST_LEVELS,
  APPLICATION_STATUSES,
} from "@/lib/constants/applications";
import type { ApplicationSelectOption } from "./application-types";

type ApplicationFiltersProps = {
  actionPath?: string;
  clearHref?: string;
  companies: ApplicationSelectOption[];
  q?: string;
  selectedCompanyId?: string;
  selectedDeadline?: string;
  selectedInterestLevel?: string;
  selectedServiceId?: string;
  selectedStatus?: string;
  services: ApplicationSelectOption[];
};

export function ApplicationFilters({
  actionPath = "/applications",
  clearHref = actionPath,
  companies,
  q = "",
  selectedCompanyId = "",
  selectedDeadline = "",
  selectedInterestLevel = "",
  selectedServiceId = "",
  selectedStatus = "",
  services,
}: ApplicationFiltersProps) {
  return (
    <form
      action={actionPath}
      className="mb-5 space-y-4 rounded-md border border-border bg-white p-4 shadow-panel"
      method="get"
    >
      <div>
        <label
          className="text-sm font-medium text-ink"
          htmlFor="application-search"
        >
          検索
        </label>
        <input
          className="mt-2 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-ink"
          defaultValue={q}
          id="application-search"
          name="q"
          placeholder="次回アクション、選考メモ、辞退理由、不採用理由で検索"
          type="text"
        />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-48">
          <label
            className="text-sm font-medium text-ink"
            htmlFor="status-filter"
          >
            ステータス
          </label>
          <select
            className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none transition focus:border-ink"
            defaultValue={selectedStatus}
            id="status-filter"
            name="status"
          >
            <option value="">すべて</option>
            {APPLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-40">
          <label
            className="text-sm font-medium text-ink"
            htmlFor="interest-level-filter"
          >
            志望度
          </label>
          <select
            className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none transition focus:border-ink"
            defaultValue={selectedInterestLevel}
            id="interest-level-filter"
            name="interest_level"
          >
            <option value="">すべて</option>
            {APPLICATION_INTEREST_LEVELS.map((interestLevel) => (
              <option key={interestLevel} value={interestLevel}>
                {interestLevel}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-48">
          <label
            className="text-sm font-medium text-ink"
            htmlFor="deadline-filter"
          >
            次回期限
          </label>
          <select
            className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none transition focus:border-ink"
            defaultValue={selectedDeadline}
            id="deadline-filter"
            name="deadline"
          >
            <option value="">すべて</option>
            {APPLICATION_DEADLINE_FILTERS.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>

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

        <button
          className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          type="submit"
        >
          絞り込み
        </button>

        <Link
          className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
          href={clearHref}
        >
          クリア
        </Link>
      </div>
    </form>
  );
}
