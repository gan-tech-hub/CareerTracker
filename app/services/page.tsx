import Link from "next/link";
import { ServicesTable } from "@/components/services/services-table";
import { PageHeader } from "@/components/ui/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ServicesPage() {
  const supabase = await createSupabaseServerClient();
  const { data: services, error } = await supabase
    .from("services")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load services: ${error.message}`);
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="転職サイト、エージェント、スカウトサービスを管理します。"
          title="転職サービス"
        />
        <Link
          className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          href="/services/new"
        >
          新規登録
        </Link>
      </div>

      <ServicesTable services={services ?? []} />
    </>
  );
}
