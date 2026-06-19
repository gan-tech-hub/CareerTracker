import Link from "next/link";
import type { Database } from "@/lib/types/database";

type Company = Database["public"]["Tables"]["companies"]["Row"];

type CompaniesTableProps = {
  companies: Company[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function CompaniesTable({ companies }: CompaniesTableProps) {
  if (companies.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-white px-6 py-12 text-center">
        <p className="text-sm font-medium text-ink">
          会社はまだ登録されていません。
        </p>
        <p className="mt-2 text-sm text-muted">
          最初の会社を登録して、求人や担当者と紐づけられるようにしましょう。
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-white shadow-panel">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-surface text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">会社名</th>
            <th className="px-4 py-3 font-medium">業種</th>
            <th className="px-4 py-3 font-medium">所在地</th>
            <th className="px-4 py-3 font-medium">関心度</th>
            <th className="px-4 py-3 font-medium">企業URL</th>
            <th className="px-4 py-3 font-medium">更新日</th>
            <th className="px-4 py-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {companies.map((company) => (
            <tr className="hover:bg-surface" key={company.id}>
              <td className="px-4 py-3 font-medium text-ink">
                <Link
                  className="hover:underline"
                  href={`/companies/${company.id}`}
                >
                  {company.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-muted">
                {company.industry ?? "-"}
              </td>
              <td className="px-4 py-3 text-muted">
                {company.location ?? "-"}
              </td>
              <td className="px-4 py-3">
                <span className="rounded-md bg-surface px-2 py-1 text-xs text-muted">
                  {company.interest_level}
                </span>
              </td>
              <td className="px-4 py-3 text-muted">
                {company.corporate_url ? (
                  <a
                    className="hover:underline"
                    href={company.corporate_url}
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
                {formatDate(company.updated_at)}
              </td>
              <td className="px-4 py-3">
                <Link
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-surface"
                  href={`/companies/${company.id}`}
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
