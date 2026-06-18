import Link from "next/link";
import { notFound } from "next/navigation";
import { updateService } from "@/app/services/actions";
import { ServiceForm } from "@/components/services/service-form";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type EditServicePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditServicePage({ params }: EditServicePageProps) {
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

  const updateServiceWithId = updateService.bind(null, service.id);

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="転職サービスの登録内容を編集します。"
          title="転職サービスを編集"
        />
        <Link
          className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
          href={`/services/${service.id}`}
        >
          詳細へ戻る
        </Link>
      </div>

      <Card>
        <ServiceForm
          action={updateServiceWithId}
          service={service}
          submitLabel="更新する"
        />
      </Card>
    </>
  );
}
