import Link from "next/link";
import { ServiceFilters } from "@/components/services/service-filters";
import { ServicesTable } from "@/components/services/services-table";
import { PageHeader } from "@/components/ui/page-header";
import {
  isServiceStatus,
  isServiceType,
} from "@/lib/constants/services";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ServicesPageProps = {
  searchParams: Promise<{
    type?: string;
    status?: string;
  }>;
};

export default async function ServicesPage({
  searchParams,
}: ServicesPageProps) {
  const params = await searchParams;
  const selectedType = params.type && isServiceType(params.type) ? params.type : "";
  const selectedStatus =
    params.status && isServiceStatus(params.status) ? params.status : "";

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("services")
    .select("*")
    .order("updated_at", { ascending: false });

  if (selectedType) {
    query = query.eq("type", selectedType);
  }

  if (selectedStatus) {
    query = query.eq("status", selectedStatus);
  }

  const { data: services, error } = await query;

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

      <ServiceFilters
        selectedStatus={selectedStatus}
        selectedType={selectedType}
      />
      <ServicesTable services={services ?? []} />
    </>
  );
}
