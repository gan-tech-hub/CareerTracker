import { PlaceholderPage } from "@/components/ui/placeholder-page";

export default function InterviewsPage() {
  return (
    <PlaceholderPage
      columns={["日時", "種別", "会社", "求人", "所要時間", "場所", "URL"]}
      description="面談や面接の予定を日付順に管理する画面です。"
      title="面談予定"
    />
  );
}
