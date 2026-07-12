"use server";

import {
  createMockSelfPrDraft,
  isSelfPrDraftMode,
  normalizeSelfPrDraftResult,
  selfPrDraftJsonSchema,
  type SelfPrDraftMode,
  type SelfPrDraftResponse,
} from "@/lib/ai/self-pr-draft";
import { saveAiGenerationLog } from "@/lib/ai/history";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/types/database";

type FieldErrors = {
  mode?: string;
};

export type SelfPrDraftState = {
  fieldErrors?: FieldErrors;
  formError?: string;
  result?: SelfPrDraftResponse;
  selectedMode?: SelfPrDraftMode;
};

type SelfPrDraftContext = {
  profile: {
    display_name: string | null;
    current_position: string | null;
    desired_role: string | null;
    desired_industries: string | null;
    desired_salary_min: number | null;
    desired_salary_max: number | null;
    desired_locations: string | null;
    remote_preference: string;
    side_job_preference: string;
    work_style: string | null;
    career_axis: string | null;
    avoid_conditions: string | null;
    strengths: string | null;
    skills: string | null;
    learning_interests: string | null;
    self_pr: string | null;
    memo: string | null;
  } | null;
  career_experiences: Array<{
    company_name: string;
    department: string | null;
    position: string | null;
    employment_type: string;
    start_date: string | null;
    end_date: string | null;
    is_current: boolean;
    summary: string | null;
    responsibilities: string | null;
    achievements: string | null;
    technologies: string | null;
  }>;
  career_skills: Array<{
    name: string;
    category: string;
    skill_level: string;
    years_of_experience: number | null;
    last_used_year: number | null;
    description: string | null;
  }>;
};

function extractResponseText(value: unknown): string | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const response = value as Record<string, unknown>;
  if (typeof response.output_text === "string") {
    return response.output_text;
  }

  if (!Array.isArray(response.output)) {
    return null;
  }

  for (const outputItem of response.output) {
    if (typeof outputItem !== "object" || outputItem === null) {
      continue;
    }

    const item = outputItem as Record<string, unknown>;
    if (!Array.isArray(item.content)) {
      continue;
    }

    for (const contentItem of item.content) {
      if (typeof contentItem !== "object" || contentItem === null) {
        continue;
      }

      const content = contentItem as Record<string, unknown>;
      if (typeof content.text === "string") {
        return content.text;
      }
    }
  }

  return null;
}

async function loadSelfPrDraftContext(): Promise<{
  context: SelfPrDraftContext;
  userId: string;
} | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const [profileResult, experiencesResult, skillsResult] = await Promise.all([
    supabase
      .from("user_profiles")
      .select(
        `
          display_name,
          current_position,
          desired_role,
          desired_industries,
          desired_salary_min,
          desired_salary_max,
          desired_locations,
          remote_preference,
          side_job_preference,
          work_style,
          career_axis,
          avoid_conditions,
          strengths,
          skills,
          learning_interests,
          self_pr,
          memo
        `,
      )
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("career_experiences")
      .select(
        "company_name, department, position, employment_type, start_date, end_date, is_current, summary, responsibilities, achievements, technologies",
      )
      .eq("user_id", user.id)
      .order("is_current", { ascending: false })
      .order("start_date", { ascending: false }),
    supabase
      .from("career_skills")
      .select(
        "name, category, skill_level, years_of_experience, last_used_year, description",
      )
      .eq("user_id", user.id)
      .order("category", { ascending: true })
      .order("name", { ascending: true }),
  ]);

  const profileResponse = profileResult as unknown as {
    data: SelfPrDraftContext["profile"] | null;
    error: { message: string } | null;
  };
  const experiencesResponse = experiencesResult as unknown as {
    data: SelfPrDraftContext["career_experiences"] | null;
    error: { message: string } | null;
  };
  const skillsResponse = skillsResult as unknown as {
    data: SelfPrDraftContext["career_skills"] | null;
    error: { message: string } | null;
  };

  if (
    profileResponse.error ||
    experiencesResponse.error ||
    skillsResponse.error
  ) {
    return null;
  }

  return {
    context: {
      profile: profileResponse.data,
      career_experiences: experiencesResponse.data ?? [],
      career_skills: skillsResponse.data ?? [],
    },
    userId: user.id,
  };
}

async function generateWithOpenAi(
  mode: SelfPrDraftMode,
  context: SelfPrDraftContext,
): Promise<SelfPrDraftResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return createMockSelfPrDraft(mode);
  }

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content:
            "あなたは日本語の職務経歴書と面接準備を支援するキャリアライティングアシスタントです。登録済みのプロフィール、希望条件、職務経歴、スキルをもとに、転職活動で使える自然な日本語の下書きを作成してください。事実として登録されていない内容は断定せず、盛りすぎない表現にしてください。",
        },
        {
          role: "user",
          content: [
            `生成モード: ${mode}`,
            "Career Trackerの登録データ:",
            JSON.stringify(context, null, 2),
          ].join("\n"),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          ...selfPrDraftJsonSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 429 || errorText.includes("insufficient_quota")) {
      return createMockSelfPrDraft(
        mode,
        "OpenAI APIのクォータ不足またはレート制限のため、モックの自己PR・職務要約下書きを表示しています。",
      );
    }

    throw new Error(
      `OpenAI API request failed: ${response.status} ${errorText}`,
    );
  }

  const data: unknown = await response.json();
  const outputText = extractResponseText(data);
  if (!outputText) {
    throw new Error("OpenAI APIから自己PR・職務要約下書きを取得できませんでした。");
  }

  return {
    source: "openai",
    result: normalizeSelfPrDraftResult(JSON.parse(outputText) as unknown),
    warnings: [
      "AI生成結果は下書きです。実際の経験、応募先、職務経歴書の文体に合わせて調整してください。",
    ],
  };
}

export async function generateSelfPrDraft(
  _previousState: SelfPrDraftState,
  formData: FormData,
): Promise<SelfPrDraftState> {
  const modeValue = String(formData.get("mode") ?? "").trim();

  if (!isSelfPrDraftMode(modeValue)) {
    return {
      fieldErrors: { mode: "生成モードを選択してください。" },
    };
  }

  const loaded = await loadSelfPrDraftContext();
  if (!loaded) {
    return {
      formError:
        "プロフィール、職務経歴、スキル情報を確認できませんでした。",
      selectedMode: modeValue,
    };
  }

  try {
    const result = await generateWithOpenAi(modeValue, loaded.context);
    const contextWarnings = [
      loaded.context.profile ? null : "プロフィールが未登録です。",
      loaded.context.career_experiences.length > 0
        ? null
        : "職務経歴が未登録です。",
      loaded.context.career_skills.length > 0 ? null : "スキルが未登録です。",
    ].filter((warning): warning is string => Boolean(warning));
    const warnings = [...contextWarnings, ...result.warnings];
    const response = { ...result, warnings };

    const supabase = await createSupabaseServerClient();
    await saveAiGenerationLog(supabase, {
      feature: "self_pr_draft",
      inputSummary: `${modeValue} / 職務経歴${loaded.context.career_experiences.length}件 / スキル${loaded.context.career_skills.length}件`,
      output: response.result as unknown as Json,
      source: response.source,
      title: `自己PR・職務要約下書き: ${modeValue}`,
      userId: loaded.userId,
      warnings,
    });

    return { result: response, selectedMode: modeValue };
  } catch (error) {
    return {
      formError:
        error instanceof Error
          ? `自己PR・職務要約下書きの生成に失敗しました: ${error.message}`
          : "自己PR・職務要約下書きの生成に失敗しました。",
      selectedMode: modeValue,
    };
  }
}
