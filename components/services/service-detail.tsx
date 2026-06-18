import type { Database } from "@/lib/types/database";

type Service = Database["public"]["Tables"]["services"]["Row"];

type ServiceDetailProps = {
  service: Service;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="mt-2 text-sm text-ink">{value || "-"}</dd>
    </div>
  );
}

export function ServiceDetail({ service }: ServiceDetailProps) {
  return (
    <dl className="grid gap-6 md:grid-cols-2">
      <DetailItem label="サービス名" value={service.name} />
      <DetailItem label="種別" value={service.type} />
      <DetailItem label="利用状況" value={service.status} />
      <DetailItem label="登録メール" value={service.registered_email} />
      <DetailItem label="ログインID" value={service.login_id} />
      <DetailItem
        label="ログインURL"
        value={
          service.login_url ? (
            <a
              className="text-ink underline"
              href={service.login_url}
              rel="noreferrer"
              target="_blank"
            >
              {service.login_url}
            </a>
          ) : null
        }
      />
      <DetailItem label="作成日" value={formatDate(service.created_at)} />
      <DetailItem label="更新日" value={formatDate(service.updated_at)} />
      <div className="md:col-span-2">
        <dt className="text-xs font-medium uppercase tracking-wide text-muted">
          メモ
        </dt>
        <dd className="mt-2 whitespace-pre-wrap text-sm text-ink">
          {service.memo || "-"}
        </dd>
      </div>
    </dl>
  );
}
