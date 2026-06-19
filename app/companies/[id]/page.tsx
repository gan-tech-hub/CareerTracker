import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteCompany } from "@/app/companies/actions";
import { CompanyDetail } from "@/components/companies/company-detail";
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
  const { data: company, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !company) {
    notFound();
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
