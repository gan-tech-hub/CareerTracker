import { PlaceholderPage } from "@/components/ui/placeholder-page";

export default function ContactsPage() {
  return (
    <PlaceholderPage
      columns={["氏名", "所属", "役割", "メール", "関連サービス", "関連会社", "更新日"]}
      description="エージェントや企業担当者の連絡先を管理する画面です。"
      title="担当者"
    />
  );
}
