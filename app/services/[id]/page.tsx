import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteService } from "@/app/services/actions";
import { DeleteServiceButton } from "@/components/services/delete-service-button";
import { ServiceDetail } from "@/components/services/service-detail";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ServiceDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ServiceDetailPage({
  params,
}: ServiceDetailPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: service, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !service) {
    notFound();
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="転職サービスの登録内容を確認します。"
          title={service.name}
        />
        <div className="flex items-center gap-2">
          <Link
            className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
            href="/services"
          >
            一覧へ戻る
          </Link>
          <Link
            className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            href={`/services/${service.id}/edit`}
          >
            編集
          </Link>
        </div>
      </div>

      <Card>
        <ServiceDetail service={service} />
      </Card>

      <Card className="mt-6 border-red-200">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-ink">削除</h3>
            <p className="mt-1 text-sm text-muted">
              この転職サービスを削除します。削除後は元に戻せません。
            </p>
          </div>
          <form action={deleteService}>
            <input name="id" type="hidden" value={service.id} />
            <DeleteServiceButton serviceName={service.name} />
          </form>
        </div>
      </Card>
    </>
  );
}
