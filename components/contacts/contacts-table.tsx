import Link from "next/link";
import type { ContactWithRelations } from "./contact-types";

type ContactsTableProps = {
  contacts: ContactWithRelations[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ContactsTable({ contacts }: ContactsTableProps) {
  if (contacts.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-white px-6 py-12 text-center">
        <p className="text-sm font-medium text-ink">
          担当者はまだ登録されていません。
        </p>
        <p className="mt-2 text-sm text-muted">
          エージェントや企業担当者を登録して、連絡先を一元管理しましょう。
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-white shadow-panel">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-surface text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">氏名</th>
            <th className="px-4 py-3 font-medium">所属</th>
            <th className="px-4 py-3 font-medium">役割</th>
            <th className="px-4 py-3 font-medium">メール</th>
            <th className="px-4 py-3 font-medium">関連サービス</th>
            <th className="px-4 py-3 font-medium">関連会社</th>
            <th className="px-4 py-3 font-medium">更新日</th>
            <th className="px-4 py-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {contacts.map((contact) => (
            <tr className="hover:bg-surface" key={contact.id}>
              <td className="px-4 py-3 font-medium text-ink">
                <Link
                  className="hover:underline"
                  href={`/contacts/${contact.id}`}
                >
                  {contact.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-muted">
                {contact.organization ?? "-"}
              </td>
              <td className="px-4 py-3">
                <span className="rounded-md bg-surface px-2 py-1 text-xs text-muted">
                  {contact.role}
                </span>
              </td>
              <td className="px-4 py-3 text-muted">
                {contact.email ? (
                  <a className="hover:underline" href={`mailto:${contact.email}`}>
                    {contact.email}
                  </a>
                ) : (
                  "-"
                )}
              </td>
              <td className="px-4 py-3 text-muted">
                {contact.services?.name ?? "-"}
              </td>
              <td className="px-4 py-3 text-muted">
                {contact.companies?.name ?? "-"}
              </td>
              <td className="px-4 py-3 text-muted">
                {formatDate(contact.updated_at)}
              </td>
              <td className="px-4 py-3">
                <Link
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-surface"
                  href={`/contacts/${contact.id}`}
                >
                  詳細
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
