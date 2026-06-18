import Link from "next/link";
import type { Database } from "@/lib/types/database";

type Service = Database["public"]["Tables"]["services"]["Row"];

type ServicesTableProps = {
  services: Service[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ServicesTable({ services }: ServicesTableProps) {
  if (services.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-white px-6 py-12 text-center">
        <p className="text-sm font-medium text-ink">
          転職サービスはまだ登録されていません。
        </p>
        <p className="mt-2 text-sm text-muted">
          最初のサービスを登録して、求人や担当者との紐づけに使えるようにしましょう。
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-white shadow-panel">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-surface text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">サービス名</th>
            <th className="px-4 py-3 font-medium">種別</th>
            <th className="px-4 py-3 font-medium">利用状況</th>
            <th className="px-4 py-3 font-medium">登録メール</th>
            <th className="px-4 py-3 font-medium">ログインURL</th>
            <th className="px-4 py-3 font-medium">更新日</th>
            <th className="px-4 py-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {services.map((service) => (
            <tr className="hover:bg-surface" key={service.id}>
              <td className="px-4 py-3 font-medium text-ink">
                <Link className="hover:underline" href={`/services/${service.id}`}>
                  {service.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-muted">{service.type}</td>
              <td className="px-4 py-3">
                <span className="rounded-md bg-surface px-2 py-1 text-xs text-muted">
                  {service.status}
                </span>
              </td>
              <td className="px-4 py-3 text-muted">
                {service.registered_email ?? "-"}
              </td>
              <td className="px-4 py-3 text-muted">
                {service.login_url ? (
                  <a
                    className="hover:underline"
                    href={service.login_url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    開く
                  </a>
                ) : (
                  "-"
                )}
              </td>
              <td className="px-4 py-3 text-muted">
                {formatDate(service.updated_at)}
              </td>
              <td className="px-4 py-3">
                <Link
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-surface"
                  href={`/services/${service.id}`}
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
