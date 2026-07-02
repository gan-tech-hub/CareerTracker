import {
  AiGenerationHistoryList,
  type AiGenerationHistoryItem,
} from "@/components/ai/ai-generation-history-list";
import { PageHeader } from "@/components/ui/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AiHistoryPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("ai_generation_logs")
    .select(
      `
        id,
        created_at,
        feature,
        input_summary,
        output,
        related_application_id,
        source,
        title,
        warnings,
        applications(
          id,
          jobs(title, companies(name))
        )
      `,
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`Failed to load AI generation logs: ${error.message}`);
  }

  return (
    <>
      <PageHeader
        description="AI求人票解析、応募・面接準備、選考状況サマリーの生成履歴を確認できます。"
        title="AI生成履歴"
      />
      <AiGenerationHistoryList logs={(data ?? []) as AiGenerationHistoryItem[]} />
    </>
  );
}
