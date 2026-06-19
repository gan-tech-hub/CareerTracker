import Link from "next/link";
import { createContact } from "@/app/contacts/actions";
import { ContactForm } from "@/components/contacts/contact-form";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function NewContactPage() {
  const supabase = await createSupabaseServerClient();
  const [servicesResult, companiesResult] = await Promise.all([
    supabase.from("services").select("id, name").order("name"),
    supabase.from("companies").select("id, name").order("name"),
  ]);

  if (servicesResult.error) {
    throw new Error(`Failed to load services: ${servicesResult.error.message}`);
  }

  if (companiesResult.error) {
    throw new Error(
      `Failed to load companies: ${companiesResult.error.message}`,
    );
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="エージェントや企業担当者の連絡先を登録します。"
          title="担当者を登録"
        />
        <Link
          className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
          href="/contacts"
        >
          一覧へ戻る
        </Link>
      </div>

      <Card>
        <ContactForm
          action={createContact}
          companies={companiesResult.data ?? []}
          services={servicesResult.data ?? []}
          submitLabel="登録する"
        />
      </Card>
    </>
  );
}
