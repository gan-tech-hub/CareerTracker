import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/types/database";

export type AiGenerationFeature =
  | "job_import"
  | "application_prep"
  | "selection_summary";

export type AiGenerationSource = "openai" | "mock";

type SaveAiGenerationLogParams = {
  feature: AiGenerationFeature;
  inputSummary?: string | null;
  output: Json;
  relatedApplicationId?: string | null;
  relatedJobId?: string | null;
  source: AiGenerationSource;
  title?: string | null;
  userId: string;
  warnings?: Json;
};

export async function saveAiGenerationLog(
  supabase: SupabaseClient<Database>,
  params: SaveAiGenerationLogParams,
) {
  const { error } = await supabase.from("ai_generation_logs").insert({
    feature: params.feature,
    input_summary: params.inputSummary ?? null,
    output: params.output,
    related_application_id: params.relatedApplicationId ?? null,
    related_job_id: params.relatedJobId ?? null,
    source: params.source,
    title: params.title ?? null,
    user_id: params.userId,
    warnings: params.warnings ?? [],
  });

  if (error) {
    console.error("Failed to save AI generation log", error);
  }
}
