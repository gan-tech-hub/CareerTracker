import Link from "next/link";
import { createInterview } from "@/app/interviews/actions";
import { InterviewForm } from "@/components/interviews/interview-form";
import type { InterviewApplicationOption } from "@/components/interviews/interview-types";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function NewInterviewPage() {
  const supabase = await createSupabaseServerClient();
  const { data: applications, error } = await supabase
    .from("applications")
    .select("id, status, jobs(id, title, company_id, service_id, companies(id, name), services(id, name))")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load applications: ${error.message}`);
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="応募・選考に紐づく面談や面接の予定を登録します。"
          title="面談予定を登録"
        />
        <Link
          className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
          href="/interviews"
        >
          一覧へ戻る
        </Link>
      </div>

      {applications && applications.length > 0 ? (
        <Card>
          <InterviewForm
            action={createInterview}
            applications={applications as InterviewApplicationOption[]}
            submitLabel="登録する"
          />
        </Card>
      ) : (
        <Card>
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-ink">
              先に応募・選考を登録してください
            </h3>
            <p className="text-sm text-muted">
              面談予定は応募・選考に紐づけて登録します。応募・選考情報を登録してから、面談予定を追加してください。
            </p>
            <Link
              className="inline-flex rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
              href="/applications/new"
            >
              応募・選考を登録する
            </Link>
          </div>
        </Card>
      )}
    </>
  );
}
