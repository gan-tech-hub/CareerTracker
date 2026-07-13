"use server";

import {
  createMockReplyDraft,
  isReplyDraftMode,
  isReplyDraftTone,
  normalizeReplyDraftResult,
  REPLY_DRAFT_MODES,
  REPLY_DRAFT_TONES,
  replyDraftJsonSchema,
  type ReplyDraftMode,
  type ReplyDraftResponse,
  type ReplyDraftTone,
} from "@/lib/ai/reply-draft";
import { saveAiGenerationLog } from "@/lib/ai/history";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/types/database";

type FieldErrors = {
  incoming_message?: string;
  memo?: string;
  mode?: string;
  reply_points?: string;
  tone?: string;
};

export type ReplyDraftState = {
  fieldErrors?: FieldErrors;
  formError?: string;
  input?: {
    incomingMessage: string;
    mode: ReplyDraftMode;
    replyPoints: string;
    tone: ReplyDraftTone;
    memo: string;
  };
  result?: ReplyDraftResponse;
};

type ReplyDraftContext = {
  application: {
    id: string;
    status: string;
    applied_at: string | null;
    next_action: string | null;
    next_deadline: string | null;
    interest_level: string;
    selection_memo: string | null;
  };
  job: {
    title: string;
    job_type: string | null;
    employment_type: string;
    location: string | null;
    remote_type: string;
    memo: string | null;
  } | null;
  company: {
    name: string;
    industry: string | null;
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
  contacts: Array<{
    name: string;
    organization: string | null;
    role: string;
    email: string | null;
    memo: string | null;
  }>;
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

type ReplyDraftInput = {
  incoming_message: string;
  memo: string;
  mode: ReplyDraftMode;
  reply_points: string;
  tone: ReplyDraftTone;
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

function toStateInput(input: ReplyDraftInput) {
  return {
    incomingMessage: input.incoming_message,
    memo: input.memo,
    mode: input.mode,
    replyPoints: input.reply_points,
    tone: input.tone,
  };
}

async function loadReplyDraftContext(
  applicationId: string,
): Promise<{ context: ReplyDraftContext; userId: string } | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const applicationResult = await supabase
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
        jobs(
          title,
          job_type,
          employment_type,
          location,
          remote_type,
          memo,
          company_id,
          service_id,
          companies(name, industry, interest_level, concerns, memo),
          services(name, type, status, memo)
        )
      `,
    )
    .eq("id", applicationId)
    .eq("user_id", user.id)
    .single();

  const applicationResponse = applicationResult as unknown as {
    data:
      | (ReplyDraftContext["application"] & {
          jobs:
            | (ReplyDraftContext["job"] & {
                company_id: string | null;
                service_id: string | null;
                companies: ReplyDraftContext["company"];
                services: ReplyDraftContext["service"];
              })
            | null;
        })
      | null;
    error: { message: string } | null;
  };

  if (applicationResponse.error || !applicationResponse.data) {
    return null;
  }

  const jobRecord = applicationResponse.data.jobs;
  const contactFilters = [
    jobRecord?.company_id ? `company_id.eq.${jobRecord.company_id}` : "",
    jobRecord?.service_id ? `service_id.eq.${jobRecord.service_id}` : "",
  ].filter(Boolean);
  const [contactsResult, interviewsResult, tasksResult] = await Promise.all([
    contactFilters.length > 0
      ? supabase
          .from("contacts")
          .select("name, organization, role, email, memo")
          .eq("user_id", user.id)
          .or(contactFilters.join(","))
          .order("updated_at", { ascending: false })
          .limit(10)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("interviews")
      .select(
        "type, scheduled_at, location, participants, preparation_memo, interview_memo, result_memo",
      )
      .eq("application_id", applicationId)
      .eq("user_id", user.id)
      .order("scheduled_at", { ascending: true })
      .limit(10),
    supabase
      .from("tasks")
      .select("title, type, due_date, priority, is_completed, memo")
      .eq("application_id", applicationId)
      .eq("user_id", user.id)
      .order("is_completed", { ascending: true })
      .order("due_date", { ascending: true })
      .limit(10),
  ]);

  const contactsResponse = contactsResult as unknown as {
    data: ReplyDraftContext["contacts"] | null;
    error: { message: string } | null;
  };
  const interviewsResponse = interviewsResult as unknown as {
    data: ReplyDraftContext["interviews"] | null;
    error: { message: string } | null;
  };
  const tasksResponse = tasksResult as unknown as {
    data: ReplyDraftContext["tasks"] | null;
    error: { message: string } | null;
  };

  if (
    contactsResponse.error ||
    interviewsResponse.error ||
    tasksResponse.error
  ) {
    return null;
  }

  const job = jobRecord
    ? {
        employment_type: jobRecord.employment_type,
        job_type: jobRecord.job_type,
        location: jobRecord.location,
        memo: jobRecord.memo,
        remote_type: jobRecord.remote_type,
        title: jobRecord.title,
      }
    : null;

  return {
    context: {
      application: {
        applied_at: applicationResponse.data.applied_at,
        id: applicationResponse.data.id,
        interest_level: applicationResponse.data.interest_level,
        next_action: applicationResponse.data.next_action,
        next_deadline: applicationResponse.data.next_deadline,
        selection_memo: applicationResponse.data.selection_memo,
        status: applicationResponse.data.status,
      },
      company: jobRecord?.companies ?? null,
      contacts: contactsResponse.data ?? [],
      interviews: interviewsResponse.data ?? [],
      job,
      service: jobRecord?.services ?? null,
      tasks: tasksResponse.data ?? [],
    },
    userId: user.id,
  };
}

async function generateWithOpenAi(
  context: ReplyDraftContext,
  input: ReplyDraftInput,
): Promise<ReplyDraftResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return createMockReplyDraft(input.mode, input.tone);
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
            "あなたは日本語の転職活動におけるメール・チャット返信を支援するアシスタントです。応募・選考情報、求人、会社、担当者、面談、タスク、ユーザー入力をもとに、丁寧で自然な返信文面を作成してください。日程、会社名、担当者名など未確定の情報は断定せず、プレースホルダーや確認を促す表現にしてください。送信前に人間が確認する前提の下書きとして作成してください。",
        },
        {
          role: "user",
          content: [
            "返信文面生成の入力:",
            JSON.stringify(input, null, 2),
            "Career Trackerの登録データ:",
            JSON.stringify(context, null, 2),
          ].join("\n"),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          ...replyDraftJsonSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 429 || errorText.includes("insufficient_quota")) {
      return createMockReplyDraft(
        input.mode,
        input.tone,
        "OpenAI APIのクォータ不足またはレート制限のため、モックの返信文面を表示しています。",
      );
    }

    throw new Error(
      `OpenAI API request failed: ${response.status} ${errorText}`,
    );
  }

  const data: unknown = await response.json();
  const outputText = extractResponseText(data);
  if (!outputText) {
    throw new Error("OpenAI APIから返信文面を取得できませんでした。");
  }

  return {
    source: "openai",
    result: normalizeReplyDraftResult(JSON.parse(outputText) as unknown),
    warnings: [
      "AI生成結果は下書きです。相手に送信する前に、事実関係、日程、敬称、宛先を必ず確認してください。",
    ],
  };
}

export async function generateReplyDraft(
  applicationId: string,
  _previousState: ReplyDraftState,
  formData: FormData,
): Promise<ReplyDraftState> {
  const modeValue = getFormString(formData, "mode");
  const toneValue = getFormString(formData, "tone");
  const input = {
    incoming_message: getFormString(formData, "incoming_message"),
    memo: getFormString(formData, "memo"),
    mode: modeValue,
    reply_points: getFormString(formData, "reply_points"),
    tone: toneValue,
  };
  const fieldErrors: FieldErrors = {};

  if (!isReplyDraftMode(modeValue)) {
    fieldErrors.mode = "生成モードを選択してください。";
  }

  if (!isReplyDraftTone(toneValue)) {
    fieldErrors.tone = "希望トーンを選択してください。";
  }

  if (!input.incoming_message && !input.reply_points) {
    fieldErrors.incoming_message =
      "相手からの連絡内容、または返信で伝えたいことを入力してください。";
    fieldErrors.reply_points =
      "相手からの連絡内容、または返信で伝えたいことを入力してください。";
  }

  if (input.incoming_message.length > 6000) {
    fieldErrors.incoming_message =
      "相手からの連絡内容は6,000文字以内で入力してください。";
  }

  if (input.reply_points.length > 3000) {
    fieldErrors.reply_points =
      "返信で伝えたいことは3,000文字以内で入力してください。";
  }

  if (input.memo.length > 2000) {
    fieldErrors.memo = "補足メモは2,000文字以内で入力してください。";
  }

  if (
    Object.keys(fieldErrors).length > 0 ||
    !isReplyDraftMode(modeValue) ||
    !isReplyDraftTone(toneValue)
  ) {
    return {
      fieldErrors,
      input: {
        incomingMessage: input.incoming_message,
        memo: input.memo,
        mode: isReplyDraftMode(modeValue) ? modeValue : REPLY_DRAFT_MODES[0],
        replyPoints: input.reply_points,
        tone: isReplyDraftTone(toneValue) ? toneValue : REPLY_DRAFT_TONES[0],
      },
    };
  }

  const typedInput: ReplyDraftInput = {
    incoming_message: input.incoming_message,
    memo: input.memo,
    mode: modeValue,
    reply_points: input.reply_points,
    tone: toneValue,
  };
  const loaded = await loadReplyDraftContext(applicationId);

  if (!loaded) {
    return {
      formError: "応募・選考情報を確認できませんでした。",
      input: toStateInput(typedInput),
    };
  }

  try {
    const result = await generateWithOpenAi(loaded.context, typedInput);
    const warnings = [
      ...result.warnings,
      loaded.context.contacts.length > 0
        ? null
        : "関連する担当者情報が見つかりませんでした。宛先や敬称は送信前に確認してください。",
    ].filter((warning): warning is string => Boolean(warning));
    const response = { ...result, warnings };

    const supabase = await createSupabaseServerClient();
    await saveAiGenerationLog(supabase, {
      feature: "reply_draft",
      inputSummary: `${typedInput.mode} / ${loaded.context.job?.title ?? "求人未設定"}`,
      output: response.result as unknown as Json,
      relatedApplicationId: applicationId,
      source: response.source,
      title: `返信文面生成: ${typedInput.mode}`,
      userId: loaded.userId,
      warnings,
    });

    return { input: toStateInput(typedInput), result: response };
  } catch (error) {
    return {
      formError:
        error instanceof Error
          ? `返信文面の生成に失敗しました: ${error.message}`
          : "返信文面の生成に失敗しました。",
      input: toStateInput(typedInput),
    };
  }
}
