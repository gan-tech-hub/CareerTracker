import { PlaceholderPage } from "@/components/ui/placeholder-page";

export default function TasksPage() {
  return (
    <PlaceholderPage
      columns={["期限日", "タイトル", "種別", "関連応募", "優先度", "完了状態", "更新日"]}
      description="返信、書類提出、面談準備などの期限付きタスクを管理する画面です。"
      title="タスク・期限"
    />
  );
}
