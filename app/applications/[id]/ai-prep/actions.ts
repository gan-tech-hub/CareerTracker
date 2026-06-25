"use server";

import { revalidatePath } from "next/cache";
import {
  applicationPrepJsonSchema,
  createMockApplicationPrep,
  isApplicationPrepMode,
  normalizeApplicationPrepResult,
  type ApplicationPrepMode,
  type ApplicationPrepResponse,
} from "@/lib/ai/application-prep";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type FieldErrors = {
  mode?: string;
};

export type ApplicationAiPrepState = {
  fieldErrors?: FieldErrors;
  formError?: string;
  result?: ApplicationPrepResponse;
  selectedMode?: ApplicationPrepMode;
};

export type CreateAiPrepTaskState = {
  formError?: string;
  successMessage?: string;
};

type ApplicationAiContext = {
  application: {
    status: string;
    applied_at: string | null;
    next_action: string | null;
    next_deadline: string | null;
    interest_level: string;
    selection_memo: string | null;
    decline_reason: string | null;
    rejection_reason: string | null;
  };
  job: {
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
  } | null;
  company: {
    name: string;
    industry: string | null;
    location: string | null;
    interest_level: string;
    concerns: string | null;
    memo: string | null;
  } | null;
  service: {
    name: string;
    type: string;
    status: string;
    memo: string | null;
  } | null;
  interviews: Array<{
    type: string;
    scheduled_at: string;
    location: string | null;
    participants: string | null;
    preparation_memo: string | null;
    interview_memo: string | null;
    result_memo: string | null;
  }>;
  tasks: Array<{
    title: string;
    type: string;
    due_date: string;
    priority: string;
    is_completed: boolean;
    memo: string | null;
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

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function loadApplicationContext(
  applicationId: string,
): Promise<ApplicationAiContext | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const [applicationResult, interviewsResult, tasksResult] = await Promise.all([
    supabase
      .from("applications")
      .select(
        `
          status,
          applied_at,
          next_action,
          next_deadline,
          interest_level,
          selection_memo,
          decline_reason,
          rejection_reason,
          jobs(
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
          )
        `,
      )
      .eq("id", applicationId)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("interviews")
      .select(
        "type, scheduled_at, location, participants, preparation_memo, interview_memo, result_memo",
      )
      .eq("application_id", applicationId)
      .eq("user_id", user.id)
      .order("scheduled_at", { ascending: true }),
    supabase
      .from("tasks")
      .select("title, type, due_date, priority, is_completed, memo")
      .eq("application_id", applicationId)
      .eq("user_id", user.id)
      .order("is_completed", { ascending: true })
      .order("due_date", { ascending: true }),
  ]);

  const applicationResponse = applicationResult as unknown as {
    data: unknown;
    error: { message: string } | null;
  };
  const interviewsResponse = interviewsResult as unknown as {
    data: ApplicationAiContext["interviews"] | null;
    error: { message: string } | null;
  };
  const tasksResponse = tasksResult as unknown as {
    data: ApplicationAiContext["tasks"] | null;
    error: { message: string } | null;
  };

  if (applicationResponse.error || !applicationResponse.data) {
    return null;
  }

  if (interviewsResponse.error || tasksResponse.error) {
    return null;
  }

  const applicationRecord = applicationResponse.data as {
    status: string;
    applied_at: string | null;
    next_action: string | null;
    next_deadline: string | null;
    interest_level: string;
    selection_memo: string | null;
    decline_reason: string | null;
    rejection_reason: string | null;
    jobs: (ApplicationAiContext["job"] & {
      companies: ApplicationAiContext["company"];
      services: ApplicationAiContext["service"];
    }) | null;
  };

  const job = applicationRecord.jobs
    ? {
        title: applicationRecord.jobs.title,
        job_type: applicationRecord.jobs.job_type,
        employment_type: applicationRecord.jobs.employment_type,
        salary_min: applicationRecord.jobs.salary_min,
        salary_max: applicationRecord.jobs.salary_max,
        location: applicationRecord.jobs.location,
        remote_type: applicationRecord.jobs.remote_type,
        side_job_allowed: applicationRecord.jobs.side_job_allowed,
        required_skills: applicationRecord.jobs.required_skills,
        preferred_skills: applicationRecord.jobs.preferred_skills,
        description: applicationRecord.jobs.description,
        attractive_points: applicationRecord.jobs.attractive_points,
        concerns: applicationRecord.jobs.concerns,
        priority: applicationRecord.jobs.priority,
        memo: applicationRecord.jobs.memo,
      }
    : null;

  return {
    application: {
      status: applicationRecord.status,
      applied_at: applicationRecord.applied_at,
      next_action: applicationRecord.next_action,
      next_deadline: applicationRecord.next_deadline,
      interest_level: applicationRecord.interest_level,
      selection_memo: applicationRecord.selection_memo,
      decline_reason: applicationRecord.decline_reason,
      rejection_reason: applicationRecord.rejection_reason,
    },
    job,
    company: applicationRecord.jobs?.companies ?? null,
    service: applicationRecord.jobs?.services ?? null,
    interviews: interviewsResponse.data ?? [],
    tasks: tasksResponse.data ?? [],
  };
}

async function generateWithOpenAi(
  mode: ApplicationPrepMode,
  context: ApplicationAiContext,
): Promise<ApplicationPrepResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return createMockApplicationPrep(mode);
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
            "あなたは転職活動の応募・面接準備を支援するアシスタントです。登録済みの求人、会社、応募状況、面談予定、タスクをもとに、日本語で具体的な準備メモを作成してください。事実として登録されていないことは断定しないでください。",
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
          ...applicationPrepJsonSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenAI API request failed: ${response.status} ${errorText}`,
    );
  }

  const data: unknown = await response.json();
  const outputText = extractResponseText(data);
  if (!outputText) {
    throw new Error("OpenAI APIから準備メモを取得できませんでした。");
  }

  return {
    source: "openai",
    result: normalizeApplicationPrepResult(JSON.parse(outputText) as unknown),
    warnings: [
      "AI生成結果は下書きです。実際の経験・志望理由に合わせて調整してください。",
    ],
  };
}

export async function generateApplicationPrep(
  applicationId: string,
  _previousState: ApplicationAiPrepState,
  formData: FormData,
): Promise<ApplicationAiPrepState> {
  const modeValue = String(formData.get("mode") ?? "").trim();

  if (!isApplicationPrepMode(modeValue)) {
    return {
      fieldErrors: { mode: "生成モードを選択してください。" },
    };
  }

  const context = await loadApplicationContext(applicationId);
  if (!context) {
    return {
      formError: "応募・選考情報を確認できませんでした。",
      selectedMode: modeValue,
    };
  }

  try {
    const result = await generateWithOpenAi(modeValue, context);
    return { result, selectedMode: modeValue };
  } catch (error) {
    return {
      formError:
        error instanceof Error
          ? `AI準備メモの生成に失敗しました: ${error.message}`
          : "AI準備メモの生成に失敗しました。",
      selectedMode: modeValue,
    };
  }
}

export async function createTaskFromAiSuggestion(
  applicationId: string,
  _previousState: CreateAiPrepTaskState,
  formData: FormData,
): Promise<CreateAiPrepTaskState> {
  const title = String(formData.get("title") ?? "").trim();

  if (!title) {
    return { formError: "タスク名を確認できませんでした。" };
  }

  if (title.length > 200) {
    return { formError: "タスク名は200文字以内にしてください。" };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { formError: "ログイン状態を確認できませんでした。" };
  }

  const { data: application, error: applicationError } = await supabase
    .from("applications")
    .select("id")
    .eq("id", applicationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (applicationError || !application) {
    return { formError: "応募・選考情報を確認できませんでした。" };
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 1);

  const { error: insertError } = await supabase.from("tasks").insert({
    application_id: applicationId,
    due_date: toDateInputValue(dueDate),
    is_completed: false,
    memo: "AI応募・面接準備アシスタントから作成",
    priority: "中",
    title,
    type: "面談準備",
    user_id: user.id,
  });

  if (insertError) {
    return { formError: `タスク作成に失敗しました: ${insertError.message}` };
  }

  revalidatePath("/dashboard");
  revalidatePath("/tasks");
  revalidatePath(`/applications/${applicationId}`);
  revalidatePath(`/applications/${applicationId}/ai-prep`);

  return { successMessage: "タスクを作成しました。" };
}
