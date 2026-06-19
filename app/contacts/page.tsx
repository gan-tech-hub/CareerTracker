import Link from "next/link";
import { ContactFilters } from "@/components/contacts/contact-filters";
import { ContactsTable } from "@/components/contacts/contacts-table";
import type { ContactWithRelations } from "@/components/contacts/contact-types";
import { PageHeader } from "@/components/ui/page-header";
import { isContactRole } from "@/lib/constants/contacts";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ContactsPageProps = {
  searchParams: Promise<{
    company_id?: string;
    role?: string;
    service_id?: string;
  }>;
};

export default async function ContactsPage({
  searchParams,
}: ContactsPageProps) {
  const params = await searchParams;
  const selectedRole =
    params.role && isContactRole(params.role) ? params.role : "";
  const selectedServiceId = String(params.service_id ?? "").trim();
  const selectedCompanyId = String(params.company_id ?? "").trim();

  const supabase = await createSupabaseServerClient();
  const [servicesResult, companiesResult] = await Promise.all([
    supabase.from("services").select("id, name").order("name"),
    supabase.from("companies").select("id, name").order("name"),
  ]);

  if (servicesResult.error) {
    throw new Error(`Failed to load services: ${servicesResult.error.message}`);
  }

  if (companiesResult.error) {
    throw new Error(
      `Failed to load companies: ${companiesResult.error.message}`,
    );
  }

  const serviceIds = new Set((servicesResult.data ?? []).map(({ id }) => id));
  const companyIds = new Set((companiesResult.data ?? []).map(({ id }) => id));
  const validSelectedServiceId = serviceIds.has(selectedServiceId)
    ? selectedServiceId
    : "";
  const validSelectedCompanyId = companyIds.has(selectedCompanyId)
    ? selectedCompanyId
    : "";

  let query = supabase
    .from("contacts")
    .select("*, services(id, name), companies(id, name)")
    .order("updated_at", { ascending: false });

  if (selectedRole) {
    query = query.eq("role", selectedRole);
  }

  if (validSelectedServiceId) {
    query = query.eq("service_id", validSelectedServiceId);
  }

  if (validSelectedCompanyId) {
    query = query.eq("company_id", validSelectedCompanyId);
  }

  const { data: contacts, error } = await query;

  if (error) {
    throw new Error(`Failed to load contacts: ${error.message}`);
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="エージェントや企業担当者の連絡先を管理します。"
          title="担当者"
        />
        <Link
          className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          href="/contacts/new"
        >
          新規登録
        </Link>
      </div>

      <ContactFilters
        companies={companiesResult.data ?? []}
        selectedCompanyId={validSelectedCompanyId}
        selectedRole={selectedRole}
        selectedServiceId={validSelectedServiceId}
        services={servicesResult.data ?? []}
      />
      <ContactsTable contacts={(contacts ?? []) as ContactWithRelations[]} />
    </>
  );
}
