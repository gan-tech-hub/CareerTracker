"use server";

import {
  createMockJobComparison,
  jobComparisonJsonSchema,
  normalizeJobComparisonResult,
  type JobComparisonResponse,
} from "@/lib/ai/job-comparison";
import { saveAiGenerationLog } from "@/lib/ai/history";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/types/database";

type FieldErrors = {
  focus?: string;
  job_ids?: string;
  memo?: string;
};

export type JobComparisonState = {
  fieldErrors?: FieldErrors;
  formError?: string;
  input?: {
    focus: string;
    jobIds: string[];
    memo: string;
  };
  result?: JobComparisonResponse;
};

type JobComparisonContext = {
  jobs: Array<{
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
    applications: Array<{
      status: string;
      next_action: string | null;
      next_deadline: string | null;
      interest_level: string;
      selection_memo: string | null;
    }>;
  }>;
  profile: {
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
    position: string | null;
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
    description: string | null;
  }>;
  user_input: {
    focus: string;
    memo: string;
  };
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

function getFormString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getSelectedJobIds(formData: FormData) {
  return Array.from(
    new Set(
      formData
        .getAll("job_ids")
        .map((value) => String(value).trim())
        .filter(Boolean),
    ),
  );
}

async function loadJobComparisonContext(
  jobIds: string[],
  focus: string,
  memo: string,
): Promise<{ context: JobComparisonContext; userId: string } | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const [jobsResult, profileResult, experiencesResult, skillsResult] =
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
            companies(name, industry, interest_level, concerns, memo),
            services(name, type, status, memo)
          `,
        )
        .eq("user_id", user.id)
        .in("id", jobIds),
      supabase
        .from("user_profiles")
        .select(
          `
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
          "company_name, position, is_current, summary, responsibilities, achievements, technologies",
        )
        .eq("user_id", user.id)
        .order("is_current", { ascending: false })
        .order("start_date", { ascending: false }),
      supabase
        .from("career_skills")
        .select("name, category, skill_level, years_of_experience, description")
        .eq("user_id", user.id)
        .order("category", { ascending: true })
        .order("name", { ascending: true }),
    ]);

  const jobsResponse = jobsResult as unknown as {
    data:
      | Array<Omit<JobComparisonContext["jobs"][number], "applications">>
      | null;
    error: { message: string } | null;
  };
  const profileResponse = profileResult as unknown as {
    data: JobComparisonContext["profile"] | null;
    error: { message: string } | null;
  };
  const experiencesResponse = experiencesResult as unknown as {
    data: JobComparisonContext["career_experiences"] | null;
    error: { message: string } | null;
  };
  const skillsResponse = skillsResult as unknown as {
    data: JobComparisonContext["career_skills"] | null;
    error: { message: string } | null;
  };

  if (
    jobsResponse.error ||
    profileResponse.error ||
    experiencesResponse.error ||
    skillsResponse.error ||
    !jobsResponse.data
  ) {
    return null;
  }

  if (jobsResponse.data.length !== jobIds.length) {
    return null;
  }

  const applicationsResult = await supabase
    .from("applications")
    .select("job_id, status, next_action, next_deadline, interest_level, selection_memo")
    .eq("user_id", user.id)
    .in("job_id", jobIds);
  const applicationsResponse = applicationsResult as unknown as {
    data:
      | Array<
          JobComparisonContext["jobs"][number]["applications"][number] & {
            job_id: string;
          }
        >
      | null;
    error: { message: string } | null;
  };

  if (applicationsResponse.error) {
    return null;
  }

  const applicationsByJobId = new Map<
    string,
    JobComparisonContext["jobs"][number]["applications"]
  >();
  for (const application of applicationsResponse.data ?? []) {
    const { job_id: jobId, ...rest } = application;
    const applications = applicationsByJobId.get(jobId) ?? [];
    applications.push(rest);
    applicationsByJobId.set(jobId, applications);
  }

  return {
    context: {
      career_experiences: experiencesResponse.data ?? [],
      career_skills: skillsResponse.data ?? [],
      jobs: jobsResponse.data.map((job) => ({
        ...job,
        applications: applicationsByJobId.get(job.id) ?? [],
      })),
      profile: profileResponse.data,
      user_input: { focus, memo },
    },
    userId: user.id,
  };
}

async function generateWithOpenAi(
  context: JobComparisonContext,
): Promise<JobComparisonResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return createMockJobComparison(context.jobs);
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
            "あなたは転職活動の意思決定を支援するキャリアアドバイザーです。複数の求人、プロフィール、希望条件、職務経歴、スキル、応募状況を比較し、日本語で実用的な求人比較コメントを作成してください。内定可能性や絶対的な優劣は断定せず、応募優先度を考えるための補助情報として表現してください。登録データにない内容は推測しすぎないでください。",
        },
        {
          role: "user",
          content: [
            "Career Trackerの比較対象データ:",
            JSON.stringify(context, null, 2),
          ].join("\n"),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          ...jobComparisonJsonSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 429 || errorText.includes("insufficient_quota")) {
      return createMockJobComparison(
        context.jobs,
        "OpenAI APIのクォータ不足またはレート制限のため、モックの求人比較コメントを表示しています。",
      );
    }

    throw new Error(
      `OpenAI API request failed: ${response.status} ${errorText}`,
    );
  }

  const data: unknown = await response.json();
  const outputText = extractResponseText(data);
  if (!outputText) {
    throw new Error("OpenAI APIから求人比較コメントを取得できませんでした。");
  }

  return {
    source: "openai",
    result: normalizeJobComparisonResult(JSON.parse(outputText) as unknown),
    warnings: [
      "AI生成結果は応募優先度を考えるための下書きです。最終判断は実際の面談内容や条件に合わせて行ってください。",
    ],
  };
}

export async function generateJobComparison(
  _previousState: JobComparisonState,
  formData: FormData,
): Promise<JobComparisonState> {
  const jobIds = getSelectedJobIds(formData);
  const focus = getFormString(formData, "focus");
  const memo = getFormString(formData, "memo");
  const fieldErrors: FieldErrors = {};

  if (jobIds.length < 2) {
    fieldErrors.job_ids = "比較する求人を2件以上選択してください。";
  }

  if (jobIds.length > 5) {
    fieldErrors.job_ids = "比較できる求人は最大5件までです。";
  }

  if (focus.length > 2000) {
    fieldErrors.focus = "重視したい観点は2,000文字以内で入力してください。";
  }

  if (memo.length > 2000) {
    fieldErrors.memo = "補足メモは2,000文字以内で入力してください。";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      fieldErrors,
      input: { focus, jobIds, memo },
    };
  }

  const loaded = await loadJobComparisonContext(jobIds, focus, memo);
  if (!loaded) {
    return {
      formError: "比較対象の求人情報を確認できませんでした。",
      input: { focus, jobIds, memo },
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
    const titles = loaded.context.jobs.map((job) => job.title).join(" / ");

    const supabase = await createSupabaseServerClient();
    await saveAiGenerationLog(supabase, {
      feature: "job_comparison",
      inputSummary: titles,
      output: response.result as unknown as Json,
      source: response.source,
      title: `求人比較コメント: ${loaded.context.jobs.length}件`,
      userId: loaded.userId,
      warnings,
    });

    return { input: { focus, jobIds, memo }, result: response };
  } catch (error) {
    return {
      formError:
        error instanceof Error
          ? `求人比較コメントの生成に失敗しました: ${error.message}`
          : "求人比較コメントの生成に失敗しました。",
      input: { focus, jobIds, memo },
    };
  }
}
