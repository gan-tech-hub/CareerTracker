import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteContact } from "@/app/contacts/actions";
import { ContactDetail } from "@/components/contacts/contact-detail";
import type { ContactWithRelations } from "@/components/contacts/contact-types";
import { DeleteContactButton } from "@/components/contacts/delete-contact-button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ContactDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ContactDetailPage({
  params,
}: ContactDetailPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: contact, error } = await supabase
    .from("contacts")
    .select("*, services(id, name), companies(id, name)")
    .eq("id", id)
    .single();

  if (error || !contact) {
    notFound();
  }

  const contactWithRelations = contact as ContactWithRelations;

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          description="担当者の登録内容を確認します。"
          title={contactWithRelations.name}
        />
        <div className="flex items-center gap-2">
          <Link
            className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
            href="/contacts"
          >
            一覧へ戻る
          </Link>
          <Link
            className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            href={`/contacts/${contactWithRelations.id}/edit`}
          >
            編集
          </Link>
        </div>
      </div>

      <Card>
        <ContactDetail contact={contactWithRelations} />
      </Card>

      <Card className="mt-6 border-red-200">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-ink">削除</h3>
            <p className="mt-1 text-sm text-muted">
              この担当者を削除します。削除後は元に戻せません。
            </p>
          </div>
          <form action={deleteContact}>
            <input name="id" type="hidden" value={contactWithRelations.id} />
            <DeleteContactButton contactName={contactWithRelations.name} />
          </form>
        </div>
      </Card>
    </>
  );
}
