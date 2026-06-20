import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteCompany } from "@/app/companies/actions";
import { CompanyDetail } from "@/components/companies/company-detail";
import { CompanyRelated } from "@/components/companies/company-related";
import { DeleteCompanyButton } from "@/components/companies/delete-company-button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type CompanyDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CompanyDetailPage({
  params,
}: CompanyDetailPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const [companyResult, contactsResult, jobsResult] = await Promise.all([
    supabase.from("companies").select("*").eq("id", id).single(),
    supabase
      .from("contacts")
      .select("id, name, organization, role, email, services(id, name)")
      .eq("company_id", id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("jobs")
      .select("id, title, job_type, employment_type, priority, services(id, name)")
      .eq("company_id", id)
      .order("updated_at", { ascending: false }),
  ]);

  const { data: company, error } = companyResult;

  if (error || !company) {
    notFound();
  }

  if (contactsResult.error) {
    throw new Error(`Failed to load related contacts: ${contactsResult.error.message}`);
  }

  if (jobsResult.error) {
    throw new Error(`Failed to load related jobs: ${jobsResult.error.message}`);
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="会社の登録内容を確認します。"
          title={company.name}
        />
        <div className="flex items-center gap-2">
          <Link
            className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
            href="/companies"
          >
            一覧へ戻る
          </Link>
          <Link
            className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            href={`/companies/${company.id}/edit`}
          >
            編集
          </Link>
        </div>
      </div>

      <Card>
        <CompanyDetail company={company} />
      </Card>

      <CompanyRelated
        contacts={contactsResult.data ?? []}
        jobs={jobsResult.data ?? []}
      />

      <Card className="mt-6 border-red-200">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-ink">削除</h3>
            <p className="mt-1 text-sm text-muted">
              この会社を削除します。削除後は元に戻せません。
            </p>
          </div>
          <form action={deleteCompany}>
            <input name="id" type="hidden" value={company.id} />
            <DeleteCompanyButton companyName={company.name} />
          </form>
        </div>
      </Card>
    </>
  );
}
