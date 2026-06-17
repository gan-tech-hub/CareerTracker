import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

type PlaceholderPageProps = {
  title: string;
  description: string;
  columns: string[];
};

export function PlaceholderPage({
  title,
  description,
  columns,
}: PlaceholderPageProps) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-ink">一覧</h3>
          <span className="rounded-md border border-border px-3 py-1 text-xs text-muted">
            CRUDは次フェーズで実装
          </span>
        </div>
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full table-fixed border-collapse text-left text-sm">
            <thead className="bg-surface text-muted">
              <tr>
                {columns.map((column) => (
                  <th className="px-4 py-3 font-medium" key={column}>
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  className="px-4 py-8 text-center text-muted"
                  colSpan={columns.length}
                >
                  まだデータ表示はありません
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
