import Link from "next/link";
import { notFound } from "next/navigation";
import { updateContact } from "@/app/contacts/actions";
import { ContactForm } from "@/components/contacts/contact-form";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type EditContactPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditContactPage({ params }: EditContactPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const [contactResult, servicesResult, companiesResult] = await Promise.all([
    supabase.from("contacts").select("*").eq("id", id).single(),
    supabase.from("services").select("id, name").order("name"),
    supabase.from("companies").select("id, name").order("name"),
  ]);

  if (contactResult.error || !contactResult.data) {
    notFound();
  }

  if (servicesResult.error) {
    throw new Error(`Failed to load services: ${servicesResult.error.message}`);
  }

  if (companiesResult.error) {
    throw new Error(
      `Failed to load companies: ${companiesResult.error.message}`,
    );
  }

  const updateContactWithId = updateContact.bind(null, contactResult.data.id);

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="担当者の登録内容を編集します。"
          title="担当者を編集"
        />
        <Link
          className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
          href={`/contacts/${contactResult.data.id}`}
        >
          詳細へ戻る
        </Link>
      </div>

      <Card>
        <ContactForm
          action={updateContactWithId}
          companies={companiesResult.data ?? []}
          contact={contactResult.data}
          services={servicesResult.data ?? []}
          submitLabel="更新する"
        />
      </Card>
    </>
  );
}
