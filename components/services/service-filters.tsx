import Link from "next/link";
import { SERVICE_STATUSES, SERVICE_TYPES } from "@/lib/constants/services";

type ServiceFiltersProps = {
  selectedType?: string;
  selectedStatus?: string;
};

export function ServiceFilters({
  selectedType = "",
  selectedStatus = "",
}: ServiceFiltersProps) {
  return (
    <form
      action="/services"
      className="mb-5 flex flex-wrap items-end gap-3 rounded-md border border-border bg-white p-4 shadow-panel"
      method="get"
    >
      <div className="min-w-52">
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
          {SERVICE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-52">
        <label className="text-sm font-medium text-ink" htmlFor="status-filter">
          利用状況
        </label>
        <select
          className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none transition focus:border-ink"
          defaultValue={selectedStatus}
          id="status-filter"
          name="status"
        >
          <option value="">すべて</option>
          {SERVICE_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
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
        href="/services"
      >
        クリア
      </Link>
    </form>
  );
}
