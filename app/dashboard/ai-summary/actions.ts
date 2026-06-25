"use server";

import {
  createMockSelectionSummary,
  normalizeSelectionSummaryResult,
  selectionSummaryJsonSchema,
  type SelectionSummaryResponse,
} from "@/lib/ai/selection-summary";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DashboardAiSummaryState = {
  formError?: string;
  result?: SelectionSummaryResponse;
};

type DashboardAiContext = {
  generated_at: string;
  applications: Array<{
    id: string;
    status: string;
    applied_at: string | null;
    next_action: string | null;
    next_deadline: string | null;
    interest_level: string;
    selection_memo: string | null;
    updated_at: string;
    jobs:
      | {
          title: string;
          priority: string;
          job_type: string | null;
          employment_type: string;
          companies: { name: string } | null;
          services: { name: string } | null;
        }
      | null;
  }>;
  upcoming_interviews: Array<{
    id: string;
    type: string;
    scheduled_at: string;
    location: string | null;
    participants: string | null;
    applications:
      | {
          status: string;
          jobs:
            | {
                title: string;
                companies: { name: string } | null;
              }
            | null;
        }
      | null;
  }>;
  incomplete_tasks: Array<{
    id: string;
    title: string;
    type: string;
    due_date: string;
    priority: string;
    memo: string | null;
    applications:
      | {
          status: string;
          jobs:
            | {
                title: string;
                companies: { name: string } | null;
              }
            | null;
        }
      | null;
  }>;
  high_priority_jobs: Array<{
    id: string;
    title: string;
    job_type: string | null;
    employment_type: string;
    priority: string;
    companies: { name: string } | null;
    services: { name: string } | null;
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

async function loadDashboardContext(): Promise<DashboardAiContext | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const now = new Date();
  const [
    applicationsResult,
    interviewsResult,
    tasksResult,
    highPriorityJobsResult,
  ] = await Promise.all([
    supabase
      .from("applications")
      .select(
        `
          id,
          status,
          applied_at,
          next_action,
          next_deadline,
          interest_level,
          selection_memo,
          updated_at,
          jobs(
            title,
            priority,
            job_type,
            employment_type,
            companies(name),
            services(name)
          )
        `,
      )
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(20),
    supabase
      .from("interviews")
      .select(
        `
          id,
          type,
          scheduled_at,
          location,
          participants,
          applications(
            status,
            jobs(title, companies(name))
          )
        `,
      )
      .eq("user_id", user.id)
      .gte("scheduled_at", now.toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(10),
    supabase
      .from("tasks")
      .select(
        `
          id,
          title,
          type,
          due_date,
          priority,
          memo,
          applications(
            status,
            jobs(title, companies(name))
          )
        `,
      )
      .eq("user_id", user.id)
      .eq("is_completed", false)
      .order("due_date", { ascending: true })
      .limit(20),
    supabase
      .from("jobs")
      .select(
        "id, title, job_type, employment_type, priority, companies(name), services(name)",
      )
      .eq("user_id", user.id)
      .eq("priority", "高")
      .order("updated_at", { ascending: false })
      .limit(10),
  ]);

  const applicationsResponse = applicationsResult as unknown as {
    data: DashboardAiContext["applications"] | null;
    error: { message: string } | null;
  };
  const interviewsResponse = interviewsResult as unknown as {
    data: DashboardAiContext["upcoming_interviews"] | null;
    error: { message: string } | null;
  };
  const tasksResponse = tasksResult as unknown as {
    data: DashboardAiContext["incomplete_tasks"] | null;
    error: { message: string } | null;
  };
  const highPriorityJobsResponse = highPriorityJobsResult as unknown as {
    data: DashboardAiContext["high_priority_jobs"] | null;
    error: { message: string } | null;
  };

  if (
    applicationsResponse.error ||
    interviewsResponse.error ||
    tasksResponse.error ||
    highPriorityJobsResponse.error
  ) {
    return null;
  }

  return {
    generated_at: now.toISOString(),
    applications: applicationsResponse.data ?? [],
    upcoming_interviews: interviewsResponse.data ?? [],
    incomplete_tasks: tasksResponse.data ?? [],
    high_priority_jobs: highPriorityJobsResponse.data ?? [],
  };
}

async function generateWithOpenAi(
  context: DashboardAiContext,
): Promise<SelectionSummaryResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return createMockSelectionSummary();
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
            "あなたは転職活動の状況を俯瞰し、優先順位とリスクを整理するアシスタントです。登録データから見える傾向だけを扱い、合否可能性などを断定しないでください。日本語で簡潔かつ実用的にまとめてください。",
        },
        {
          role: "user",
          content: [
            "Career Trackerのダッシュボード用データ:",
            JSON.stringify(context, null, 2),
          ].join("\n"),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          ...selectionSummaryJsonSchema,
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
    throw new Error("OpenAI APIから選考状況サマリーを取得できませんでした。");
  }

  return {
    source: "openai",
    result: normalizeSelectionSummaryResult(JSON.parse(outputText) as unknown),
    warnings: [
      "AIサマリーは登録データをもとにした下書きです。実際の状況に合わせて判断してください。",
    ],
  };
}

export async function generateDashboardAiSummary(
  _previousState: DashboardAiSummaryState,
): Promise<DashboardAiSummaryState> {
  void _previousState;

  const context = await loadDashboardContext();

  if (!context) {
    return {
      formError: "ダッシュボード情報を確認できませんでした。",
    };
  }

  try {
    const result = await generateWithOpenAi(context);
    return { result };
  } catch (error) {
    return {
      formError:
        error instanceof Error
          ? `AI選考状況サマリーの生成に失敗しました: ${error.message}`
          : "AI選考状況サマリーの生成に失敗しました。",
    };
  }
}
