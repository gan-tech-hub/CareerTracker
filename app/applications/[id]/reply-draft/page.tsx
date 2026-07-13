import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplicationReplyDraftForm } from "@/components/applications/application-reply-draft-form";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ReplyDraftPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type ReplyDraftApplication = {
  id: string;
  status: string;
  jobs: {
    title: string;
    companies: { name: string } | null;
  } | null;
};

export default async function ReplyDraftPage({ params }: ReplyDraftPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const result = await supabase
    .from("applications")
    .select("id, status, jobs(title, companies(name))")
    .eq("id", id)
    .single();
  const { data: application, error } = result as unknown as {
    data: ReplyDraftApplication | null;
    error: { message: string } | null;
  };

  if (error || !application) {
    notFound();
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="応募・選考情報をもとに、企業やエージェントへの返信文面を生成します。"
          title="返信文面生成"
        />
        <Link
          className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
          href={`/applications/${application.id}`}
        >
          応募詳細へ戻る
        </Link>
      </div>

      <Card className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted">
              {application.jobs?.companies?.name ?? "会社未設定"}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-ink">
              {application.jobs?.title ?? "求人未設定"}
            </h3>
          </div>
          <span className="rounded border border-border px-2 py-1 text-xs font-medium text-muted">
            {application.status}
          </span>
        </div>
      </Card>

      <Card>
        <ApplicationReplyDraftForm applicationId={application.id} />
      </Card>
    </>
  );
}
