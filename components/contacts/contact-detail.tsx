import Link from "next/link";
import type { ReactNode } from "react";
import type { ContactWithRelations } from "./contact-types";

type ContactDetailProps = {
  contact: ContactWithRelations;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="mt-2 text-sm text-ink">{value || "-"}</dd>
    </div>
  );
}

export function ContactDetail({ contact }: ContactDetailProps) {
  return (
    <dl className="grid gap-6 md:grid-cols-2">
      <DetailItem label="氏名" value={contact.name} />
      <DetailItem label="所属" value={contact.organization} />
      <DetailItem label="役割" value={contact.role} />
      <DetailItem
        label="メールアドレス"
        value={
          contact.email ? (
            <a className="text-ink underline" href={`mailto:${contact.email}`}>
              {contact.email}
            </a>
          ) : null
        }
      />
      <DetailItem
        label="電話番号"
        value={
          contact.phone ? (
            <a className="text-ink underline" href={`tel:${contact.phone}`}>
              {contact.phone}
            </a>
          ) : null
        }
      />
      <DetailItem
        label="関連サービス"
        value={
          contact.service_id && contact.services ? (
            <Link className="text-ink underline" href={`/services/${contact.service_id}`}>
              {contact.services.name}
            </Link>
          ) : null
        }
      />
      <DetailItem
        label="関連会社"
        value={
          contact.company_id && contact.companies ? (
            <Link className="text-ink underline" href={`/companies/${contact.company_id}`}>
              {contact.companies.name}
            </Link>
          ) : null
        }
      />
      <DetailItem label="作成日" value={formatDate(contact.created_at)} />
      <DetailItem label="更新日" value={formatDate(contact.updated_at)} />
      <div className="md:col-span-2">
        <dt className="text-xs font-medium uppercase tracking-wide text-muted">
          メモ
        </dt>
        <dd className="mt-2 whitespace-pre-wrap text-sm text-ink">
          {contact.memo || "-"}
        </dd>
      </div>
    </dl>
  );
}
