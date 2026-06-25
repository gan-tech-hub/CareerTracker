import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplicationAiPrepForm } from "@/components/applications/application-ai-prep-form";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ApplicationAiPrepPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ApplicationAiPrepPage({
  params,
}: ApplicationAiPrepPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: application, error } = await supabase
    .from("applications")
    .select("id, status, interest_level, jobs(id, title, companies(id, name))")
    .eq("id", id)
    .single();

  if (error || !application) {
    notFound();
  }

  const applicationRecord = application as unknown as {
    id: string;
    status: string;
    interest_level: string;
    jobs: {
      id: string;
      title: string;
      companies: { id: string; name: string } | null;
    } | null;
  };
  const title = applicationRecord.jobs?.title ?? "応募・選考";
  const companyName = applicationRecord.jobs?.companies?.name ?? "-";

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="登録済みの応募・求人・会社情報をもとに、面接や応募理由の準備メモをAIで作成します。"
          title="AI応募・面接準備"
        />
        <Link
          className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
          href={`/applications/${applicationRecord.id}`}
        >
          詳細へ戻る
        </Link>
      </div>

      <Card className="mb-6">
        <dl className="grid gap-4 text-sm md:grid-cols-3">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              求人
            </dt>
            <dd className="mt-2 font-medium text-ink">{title}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              会社
            </dt>
            <dd className="mt-2 text-ink">{companyName}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              状態
            </dt>
            <dd className="mt-2 text-ink">
              {applicationRecord.status} / 志望度 {applicationRecord.interest_level}
            </dd>
          </div>
        </dl>
      </Card>

      <Card>
        <ApplicationAiPrepForm applicationId={applicationRecord.id} />
      </Card>
    </>
  );
}
