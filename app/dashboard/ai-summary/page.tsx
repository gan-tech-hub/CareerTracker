import Link from "next/link";
import { DashboardAiSummaryForm } from "@/components/dashboard/dashboard-ai-summary-form";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default function DashboardAiSummaryPage() {
  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="応募・面談・タスクの状況をもとに、転職活動全体の優先順位と注意点をAIで整理します。"
          title="AI選考状況サマリー"
        />
        <Link
          className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
          href="/dashboard"
        >
          ダッシュボードへ戻る
        </Link>
      </div>

      <Card>
        <DashboardAiSummaryForm />
      </Card>
    </>
  );
}
