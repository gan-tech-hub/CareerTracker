import Link from "next/link";
import {
  INTERVIEW_DATE_FILTERS,
  INTERVIEW_TYPES,
} from "@/lib/constants/interviews";
import type { InterviewSelectOption } from "./interview-types";

type InterviewFiltersProps = {
  companies: InterviewSelectOption[];
  q?: string;
  selectedCompanyId?: string;
  selectedDateScope?: string;
  selectedServiceId?: string;
  selectedType?: string;
  services: InterviewSelectOption[];
};

export function InterviewFilters({
  companies,
  q = "",
  selectedCompanyId = "",
  selectedDateScope = "",
  selectedServiceId = "",
  selectedType = "",
  services,
}: InterviewFiltersProps) {
  return (
    <form
      action="/interviews"
      className="mb-5 space-y-4 rounded-md border border-border bg-white p-4 shadow-panel"
      method="get"
    >
      <div>
        <label className="text-sm font-medium text-ink" htmlFor="interview-search">
          検索
        </label>
        <input
          className="mt-2 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-ink"
          defaultValue={q}
          id="interview-search"
          name="q"
          placeholder="場所、参加者、メモで検索"
          type="text"
        />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-48">
          <label className="text-sm font-medium text-ink" htmlFor="type-filter">
            面談種別
          </label>
          <select
            className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none transition focus:border-ink"
            defaultValue={selectedType}
            id="type-filter"
            name="type"
          >
            <option value="">すべて</option>
            {INTERVIEW_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-48">
          <label
            className="text-sm font-medium text-ink"
            htmlFor="date-scope-filter"
          >
            日程
          </label>
          <select
            className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none transition focus:border-ink"
            defaultValue={selectedDateScope}
            id="date-scope-filter"
            name="date_scope"
          >
            <option value="">すべて</option>
            {INTERVIEW_DATE_FILTERS.map((filter) => (
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
          href="/interviews"
        >
          クリア
        </Link>
      </div>
    </form>
  );
}
