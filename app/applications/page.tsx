import { PlaceholderPage } from "@/components/ui/placeholder-page";

export default function ApplicationsPage() {
  return (
    <PlaceholderPage
      columns={["会社", "求人", "サービス", "ステータス", "応募日", "次回期限", "関心度"]}
      description="求人ごとの応募状況と選考ステータスを管理する画面です。"
      title="応募・選考"
    />
  );
}
