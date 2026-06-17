import { PlaceholderPage } from "@/components/ui/placeholder-page";

export default function CompaniesPage() {
  return (
    <PlaceholderPage
      columns={["会社名", "業種", "所在地", "関心度", "企業URL", "更新日"]}
      description="求人元の会社情報を管理する画面です。"
      title="会社"
    />
  );
}
