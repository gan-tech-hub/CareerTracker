import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

const columns = [
  "気になる",
  "応募予定",
  "応募済み",
  "書類選考中",
  "カジュアル面談",
  "一次面接",
  "二次面接",
  "最終面接",
  "内定",
  "辞退",
  "不採用",
];

export default function ApplicationKanbanPage() {
  return (
    <>
      <PageHeader
        description="選考ステータス別に応募を確認するカンバン画面です。"
        title="選考カンバン"
      />
      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[1320px] grid-cols-11 gap-3">
          {columns.map((column) => (
            <Card className="min-h-64 p-3" key={column}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink">{column}</h3>
                <span className="rounded-md bg-surface px-2 py-1 text-xs text-muted">
                  0
                </span>
              </div>
              <div className="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-muted">
                カードは未登録です
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
