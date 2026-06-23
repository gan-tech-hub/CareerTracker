import Link from "next/link";
import {
  TASK_COMPLETION_FILTERS,
  TASK_DUE_DATE_FILTERS,
  TASK_PRIORITIES,
  TASK_TYPES,
} from "@/lib/constants/tasks";
import type { TaskSelectOption } from "./task-types";

type TaskFiltersProps = {
  companies: TaskSelectOption[];
  q?: string;
  selectedCompanyId?: string;
  selectedCompletion?: string;
  selectedDueDate?: string;
  selectedPriority?: string;
  selectedServiceId?: string;
  selectedType?: string;
  services: TaskSelectOption[];
};

export function TaskFilters({
  companies,
  q = "",
  selectedCompanyId = "",
  selectedCompletion = "",
  selectedDueDate = "",
  selectedPriority = "",
  selectedServiceId = "",
  selectedType = "",
  services,
}: TaskFiltersProps) {
  return (
    <form
      action="/tasks"
      className="mb-5 space-y-4 rounded-md border border-border bg-white p-4 shadow-panel"
      method="get"
    >
      <div>
        <label className="text-sm font-medium text-ink" htmlFor="task-search">
          検索
        </label>
        <input
          className="mt-2 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-ink"
          defaultValue={q}
          id="task-search"
          name="q"
          placeholder="タイトル、メモで検索"
          type="text"
        />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-40">
          <label
            className="text-sm font-medium text-ink"
            htmlFor="completion-filter"
          >
            完了状態
          </label>
          <select
            className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none transition focus:border-ink"
            defaultValue={selectedCompletion}
            id="completion-filter"
            name="completion"
          >
            <option value="">すべて</option>
            {TASK_COMPLETION_FILTERS.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-40">
          <label className="text-sm font-medium text-ink" htmlFor="type-filter">
            種別
          </label>
          <select
            className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none transition focus:border-ink"
            defaultValue={selectedType}
            id="type-filter"
            name="type"
          >
            <option value="">すべて</option>
            {TASK_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
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
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-40">
          <label
            className="text-sm font-medium text-ink"
            htmlFor="due-date-filter"
          >
            期限
          </label>
          <select
            className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none transition focus:border-ink"
            defaultValue={selectedDueDate}
            id="due-date-filter"
            name="due_date"
          >
            <option value="">すべて</option>
            {TASK_DUE_DATE_FILTERS.map((filter) => (
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
          href="/tasks"
        >
          クリア
        </Link>
      </div>
    </form>
  );
}
