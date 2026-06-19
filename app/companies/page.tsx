import Link from "next/link";
import { CompanyFilters } from "@/components/companies/company-filters";
import { CompaniesTable } from "@/components/companies/companies-table";
import { PageHeader } from "@/components/ui/page-header";
import { isCompanyInterestLevel } from "@/lib/constants/companies";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type CompaniesPageProps = {
  searchParams: Promise<{
    interest_level?: string;
    industry?: string;
  }>;
};

export default async function CompaniesPage({
  searchParams,
}: CompaniesPageProps) {
  const params = await searchParams;
  const selectedInterestLevel =
    params.interest_level && isCompanyInterestLevel(params.interest_level)
      ? params.interest_level
      : "";
  const selectedIndustry = String(params.industry ?? "").trim();

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("companies")
    .select("*")
    .order("updated_at", { ascending: false });

  if (selectedInterestLevel) {
    query = query.eq("interest_level", selectedInterestLevel);
  }

  if (selectedIndustry) {
    query = query.ilike("industry", `%${selectedIndustry}%`);
  }

  const { data: companies, error } = await query;

  if (error) {
    throw new Error(`Failed to load companies: ${error.message}`);
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="求人元の会社情報を管理します。"
          title="会社"
        />
        <Link
          className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          href="/companies/new"
        >
          新規登録
        </Link>
      </div>

      <CompanyFilters
        selectedIndustry={selectedIndustry}
        selectedInterestLevel={selectedInterestLevel}
      />
      <CompaniesTable companies={companies ?? []} />
    </>
  );
}
