import Link from "next/link";
import { JobImportForm } from "@/components/jobs/job-import-form";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ImportJobPage() {
  const supabase = await createSupabaseServerClient();
  const [companiesResult, servicesResult] = await Promise.all([
    supabase.from("companies").select("id, name").order("name"),
    supabase.from("services").select("id, name").order("name"),
  ]);

  if (companiesResult.error) {
    throw new Error(
      `Failed to load companies: ${companiesResult.error.message}`,
    );
  }

  if (servicesResult.error) {
    throw new Error(`Failed to load services: ${servicesResult.error.message}`);
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="求人票本文を貼り付けて、求人登録に必要な項目をAIで下書きします。"
          title="AI求人票解析"
        />
        <Link
          className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
          href="/jobs"
        >
          一覧へ戻る
        </Link>
      </div>

      <Card>
        <JobImportForm
          companies={companiesResult.data ?? []}
          services={servicesResult.data ?? []}
        />
      </Card>
    </>
  );
}
