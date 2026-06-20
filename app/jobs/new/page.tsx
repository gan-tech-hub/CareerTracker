import Link from "next/link";
import { createJob } from "@/app/jobs/actions";
import { JobForm } from "@/components/jobs/job-form";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function NewJobPage() {
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
          description="求人票や紹介された求人の内容を登録します。"
          title="求人を登録"
        />
        <Link
          className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
          href="/jobs"
        >
          一覧へ戻る
        </Link>
      </div>

      {companiesResult.data && companiesResult.data.length > 0 ? (
        <Card>
          <JobForm
            action={createJob}
            companies={companiesResult.data}
            services={servicesResult.data ?? []}
            submitLabel="登録する"
          />
        </Card>
      ) : (
        <Card>
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-ink">
              先に会社を登録してください
            </h3>
            <p className="text-sm text-muted">
              求人登録には会社の選択が必要です。求人元の会社を登録してから、求人を追加してください。
            </p>
            <Link
              className="inline-flex rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
              href="/companies/new"
            >
              会社を登録する
            </Link>
          </div>
        </Card>
      )}
    </>
  );
}
