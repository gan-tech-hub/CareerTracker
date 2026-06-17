import { PlaceholderPage } from "@/components/ui/placeholder-page";

export default function JobsPage() {
  return (
    <PlaceholderPage
      columns={["求人タイトル", "会社", "サービス", "職種", "雇用形態", "優先度", "更新日"]}
      description="検討中または応募対象の求人情報を管理する画面です。"
      title="求人"
    />
  );
}
