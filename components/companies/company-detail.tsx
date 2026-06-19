import type { ReactNode } from "react";
import type { Database } from "@/lib/types/database";

type Company = Database["public"]["Tables"]["companies"]["Row"];

type CompanyDetailProps = {
  company: Company;
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

export function CompanyDetail({ company }: CompanyDetailProps) {
  return (
    <dl className="grid gap-6 md:grid-cols-2">
      <DetailItem label="会社名" value={company.name} />
      <DetailItem label="業種" value={company.industry} />
      <DetailItem label="所在地" value={company.location} />
      <DetailItem label="関心度" value={company.interest_level} />
      <DetailItem
        label="企業URL"
        value={
          company.corporate_url ? (
            <a
              className="text-ink underline"
              href={company.corporate_url}
              rel="noreferrer"
              target="_blank"
            >
              {company.corporate_url}
            </a>
          ) : null
        }
      />
      <DetailItem
        label="採用ページURL"
        value={
          company.recruitment_url ? (
            <a
              className="text-ink underline"
              href={company.recruitment_url}
              rel="noreferrer"
              target="_blank"
            >
              {company.recruitment_url}
            </a>
          ) : null
        }
      />
      <DetailItem label="作成日" value={formatDate(company.created_at)} />
      <DetailItem label="更新日" value={formatDate(company.updated_at)} />
      <div className="md:col-span-2">
        <dt className="text-xs font-medium uppercase tracking-wide text-muted">
          懸念点
        </dt>
        <dd className="mt-2 whitespace-pre-wrap text-sm text-ink">
          {company.concerns || "-"}
        </dd>
      </div>
      <div className="md:col-span-2">
        <dt className="text-xs font-medium uppercase tracking-wide text-muted">
          メモ
        </dt>
        <dd className="mt-2 whitespace-pre-wrap text-sm text-ink">
          {company.memo || "-"}
        </dd>
      </div>
    </dl>
  );
}
