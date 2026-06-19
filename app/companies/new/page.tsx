import Link from "next/link";
import { createCompany } from "@/app/companies/actions";
import { CompanyForm } from "@/components/companies/company-form";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default function NewCompanyPage() {
  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="求人元や気になる会社の基本情報を登録します。"
          title="会社を登録"
        />
        <Link
          className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
          href="/companies"
        >
          一覧へ戻る
        </Link>
      </div>

      <Card>
        <CompanyForm action={createCompany} submitLabel="登録する" />
      </Card>
    </>
  );
}
