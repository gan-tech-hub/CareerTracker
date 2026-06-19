import Link from "next/link";
import { CONTACT_ROLES } from "@/lib/constants/contacts";
import type { ContactSelectOption } from "./contact-form";

type ContactFiltersProps = {
  companies: ContactSelectOption[];
  selectedCompanyId?: string;
  selectedRole?: string;
  selectedServiceId?: string;
  services: ContactSelectOption[];
};

export function ContactFilters({
  companies,
  selectedCompanyId = "",
  selectedRole = "",
  selectedServiceId = "",
  services,
}: ContactFiltersProps) {
  return (
    <form
      action="/contacts"
      className="mb-5 flex flex-wrap items-end gap-3 rounded-md border border-border bg-white p-4 shadow-panel"
      method="get"
    >
      <div className="min-w-52">
        <label className="text-sm font-medium text-ink" htmlFor="role-filter">
          役割
        </label>
        <select
          className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none transition focus:border-ink"
          defaultValue={selectedRole}
          id="role-filter"
          name="role"
        >
          <option value="">すべて</option>
          {CONTACT_ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-56">
        <label
          className="text-sm font-medium text-ink"
          htmlFor="service-filter"
        >
          関連サービス
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

      <div className="min-w-56">
        <label
          className="text-sm font-medium text-ink"
          htmlFor="company-filter"
        >
          関連会社
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

      <button
        className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        type="submit"
      >
        絞り込み
      </button>

      <Link
        className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
        href="/contacts"
      >
        クリア
      </Link>
    </form>
  );
}
