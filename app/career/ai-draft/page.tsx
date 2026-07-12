import Link from "next/link";
import { SelfPrDraftForm } from "@/components/career/self-pr-draft-form";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default function CareerAiDraftPage() {
  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="プロフィール、職務経歴、スキルをもとに、職務要約や自己PRの下書きを生成します。"
          title="自己PR・職務要約下書き"
        />
        <Link
          className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
          href="/career"
        >
          職務経歴へ戻る
        </Link>
      </div>

      <Card>
        <SelfPrDraftForm />
      </Card>
    </>
  );
}
