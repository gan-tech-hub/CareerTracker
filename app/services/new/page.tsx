import Link from "next/link";
import { createService } from "@/app/services/actions";
import { ServiceForm } from "@/components/services/service-form";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default function NewServicePage() {
  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="利用中の転職サイトやエージェントを登録します。"
          title="転職サービスを登録"
        />
        <Link
          className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
          href="/services"
        >
          一覧へ戻る
        </Link>
      </div>

      <Card>
        <ServiceForm action={createService} submitLabel="登録する" />
      </Card>
    </>
  );
}
