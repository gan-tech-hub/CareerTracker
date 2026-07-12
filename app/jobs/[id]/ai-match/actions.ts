"use server";

import {
  createMockJobMatch,
  jobMatchJsonSchema,
  normalizeJobMatchResult,
  type JobMatchResponse,
} from "@/lib/ai/job-match";
import { saveAiGenerationLog } from "@/lib/ai/history";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/types/database";

export type JobMatchState = {
  formError?: string;
  result?: JobMatchResponse;
};

type JobMatchContext = {
  job: {
    id: string;
    title: string;
    job_type: string | null;
    employment_type: string;
    salary_min: number | null;
    salary_max: number | null;
    location: string | null;
    remote_type: string;
    side_job_allowed: string;
    required_skills: string | null;
    preferred_skills: string | null;
    description: string | null;
    attractive_points: string | null;
    concerns: string | null;
    priority: string;
    memo: string | null;
    companies: {
      name: string;
      industry: string | null;
      location: string | null;
      interest_level: string;
      concerns: string | null;
      memo: string | null;
    } | null;
    services: {
      name: string;
      type: string;
      status: string;
      memo: string | null;
    } | null;
  };
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

async function loadJobMatchContext(
  jobId: string,
): Promise<{ context: JobMatchContext; userId: string } | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const [jobResult, profileResult, experiencesResult, skillsResult] =
    await Promise.all([
      supabase
        .from("jobs")
        .select(
          `
            id,
            title,
            job_type,
            employment_type,
            salary_min,
            salary_max,
            location,
            remote_type,
            side_job_allowed,
            required_skills,
            preferred_skills,
            description,
            attractive_points,
            concerns,
            priority,
            memo,
            companies(name, industry, location, interest_level, concerns, memo),
            services(name, type, status, memo)
          `,
        )
        .eq("id", jobId)
        .eq("user_id", user.id)
        .single(),
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

  const jobResponse = jobResult as unknown as {
    data: JobMatchContext["job"] | null;
    error: { message: string } | null;
  };
  const profileResponse = profileResult as unknown as {
    data: JobMatchContext["profile"] | null;
    error: { message: string; code?: string } | null;
  };
  const experiencesResponse = experiencesResult as unknown as {
    data: JobMatchContext["career_experiences"] | null;
    error: { message: string } | null;
  };
  const skillsResponse = skillsResult as unknown as {
    data: JobMatchContext["career_skills"] | null;
    error: { message: string } | null;
  };

  if (
    jobResponse.error ||
    !jobResponse.data ||
    profileResponse.error ||
    experiencesResponse.error ||
    skillsResponse.error
  ) {
    return null;
  }

  return {
    context: {
      job: jobResponse.data,
      profile: profileResponse.data,
      career_experiences: experiencesResponse.data ?? [],
      career_skills: skillsResponse.data ?? [],
    },
    userId: user.id,
  };
}

async function generateWithOpenAi(
  context: JobMatchContext,
): Promise<JobMatchResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return createMockJobMatch();
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
            "あなたは転職活動の意思決定を支援するキャリアアドバイザーです。登録済みの求人、プロフィール、希望条件、職務経歴、スキルを照合し、日本語で実用的な求人マッチ度分析を作成してください。合格可能性や採用結果は断定せず、応募判断の補助情報として表現してください。登録データにない内容は推測しすぎないでください。",
        },
        {
          role: "user",
          content: [
            "Career Trackerの登録データ:",
            JSON.stringify(context, null, 2),
          ].join("\n"),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          ...jobMatchJsonSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 429 || errorText.includes("insufficient_quota")) {
      return createMockJobMatch(
        "OpenAI APIのクォータ不足またはレート制限のため、モックの求人マッチ度を表示しています。",
      );
    }

    throw new Error(
      `OpenAI API request failed: ${response.status} ${errorText}`,
    );
  }

  const data: unknown = await response.json();
  const outputText = extractResponseText(data);
  if (!outputText) {
    throw new Error("OpenAI APIから求人マッチ度分析を取得できませんでした。");
  }

  return {
    source: "openai",
    result: normalizeJobMatchResult(JSON.parse(outputText) as unknown),
    warnings: [
      "AIによる求人マッチ度は応募判断の補助情報です。合格可能性や採用結果を保証するものではありません。",
    ],
  };
}

export async function generateJobMatch(
  jobId: string,
  _previousState: JobMatchState,
): Promise<JobMatchState> {
  void _previousState;

  const loaded = await loadJobMatchContext(jobId);
  if (!loaded) {
    return {
      formError:
        "求人、プロフィール、職務経歴、スキル情報を確認できませんでした。",
    };
  }

  try {
    const result = await generateWithOpenAi(loaded.context);
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
      feature: "job_match_score",
      inputSummary: `${loaded.context.job.companies?.name ?? "会社未設定"} / ${loaded.context.job.title}`,
      output: response.result as unknown as Json,
      relatedJobId: jobId,
      source: response.source,
      title: `求人マッチ度スコア: ${loaded.context.job.title}`,
      userId: loaded.userId,
      warnings,
    });

    return { result: response };
  } catch (error) {
    return {
      formError:
        error instanceof Error
          ? `求人マッチ度分析に失敗しました: ${error.message}`
          : "求人マッチ度分析に失敗しました。",
    };
  }
}
