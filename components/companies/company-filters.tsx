import Link from "next/link";
import { COMPANY_INTEREST_LEVELS } from "@/lib/constants/companies";

type CompanyFiltersProps = {
  selectedInterestLevel?: string;
  selectedIndustry?: string;
};

export function CompanyFilters({
  selectedInterestLevel = "",
  selectedIndustry = "",
}: CompanyFiltersProps) {
  return (
    <form
      action="/companies"
      className="mb-5 flex flex-wrap items-end gap-3 rounded-md border border-border bg-white p-4 shadow-panel"
      method="get"
    >
      <div className="min-w-52">
        <label
          className="text-sm font-medium text-ink"
          htmlFor="interest-level-filter"
        >
          関心度
        </label>
        <select
          className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none transition focus:border-ink"
          defaultValue={selectedInterestLevel}
          id="interest-level-filter"
          name="interest_level"
        >
          <option value="">すべて</option>
          {COMPANY_INTEREST_LEVELS.map((interestLevel) => (
            <option key={interestLevel} value={interestLevel}>
              {interestLevel}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-64">
        <label
          className="text-sm font-medium text-ink"
          htmlFor="industry-filter"
        >
          業種
        </label>
        <input
          className="mt-2 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-ink"
          defaultValue={selectedIndustry}
          id="industry-filter"
          name="industry"
          placeholder="業種で絞り込み"
          type="text"
        />
      </div>

      <button
        className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        type="submit"
      >
        絞り込み
      </button>

      <Link
        className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
        href="/companies"
      >
        クリア
      </Link>
    </form>
  );
}
