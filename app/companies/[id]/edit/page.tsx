import Link from "next/link";
import { notFound } from "next/navigation";
import { updateCompany } from "@/app/companies/actions";
import { CompanyForm } from "@/components/companies/company-form";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type EditCompanyPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCompanyPage({ params }: EditCompanyPageProps) {
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

  const updateCompanyWithId = updateCompany.bind(null, company.id);

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="会社の登録内容を編集します。"
          title="会社を編集"
        />
        <Link
          className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
          href={`/companies/${company.id}`}
        >
          詳細へ戻る
        </Link>
      </div>

      <Card>
        <CompanyForm
          action={updateCompanyWithId}
          company={company}
          submitLabel="更新する"
        />
      </Card>
    </>
  );
}
