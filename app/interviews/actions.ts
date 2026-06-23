"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  isInterviewType,
  type InterviewType,
} from "@/lib/constants/interviews";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type InterviewFieldErrors = {
  application_id?: string;
  type?: string;
  scheduled_at?: string;
  duration_minutes?: string;
  online_url?: string;
};

export type InterviewFormValues = {
  application_id: string;
  type: string;
  scheduled_at: string;
  duration_minutes: string;
  location: string;
  online_url: string;
  participants: string;
  preparation_memo: string;
  interview_memo: string;
  result_memo: string;
};

export type InterviewActionState = {
  formError?: string;
  fieldErrors?: InterviewFieldErrors;
  values?: InterviewFormValues;
};

type InterviewPayload = {
  application_id: string;
  type: InterviewType;
  scheduled_at: string;
  duration_minutes: number | null;
  location: string | null;
  online_url: string | null;
  participants: string | null;
  preparation_memo: string | null;
  interview_memo: string | null;
  result_memo: string | null;
};

type OptionalPositiveIntegerResult =
  | { type: "success"; value: number | null }
  | { type: "error"; error: string };

function optionalText(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value === "" ? null : value;
}

function getInterviewFormValues(formData: FormData): InterviewFormValues {
  return {
    application_id: String(formData.get("application_id") ?? "").trim(),
    type: String(formData.get("type") ?? "").trim(),
    scheduled_at: String(formData.get("scheduled_at") ?? "").trim(),
    duration_minutes: String(formData.get("duration_minutes") ?? "").trim(),
    location: String(formData.get("location") ?? "").trim(),
    online_url: String(formData.get("online_url") ?? "").trim(),
    participants: String(formData.get("participants") ?? "").trim(),
    preparation_memo: String(formData.get("preparation_memo") ?? "").trim(),
    interview_memo: String(formData.get("interview_memo") ?? "").trim(),
    result_memo: String(formData.get("result_memo") ?? "").trim(),
  };
}

function optionalPositiveInteger(
  formData: FormData,
  key: string,
): OptionalPositiveIntegerResult {
  const value = String(formData.get(key) ?? "").trim();

  if (value === "") {
    return { type: "success", value: null };
  }

  if (!/^\d+$/.test(value) || Number(value) <= 0) {
    return {
      type: "error",
      error: "1以上の整数で入力してください。",
    };
  }

  return { type: "success", value: Number(value) };
}

function validateUrl(value: string | null) {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function parseDateTimeLocal(value: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function parseInterviewPayload(formData: FormData): {
  payload?: InterviewPayload;
  fieldErrors?: InterviewFieldErrors;
  values: InterviewFormValues;
} {
  const values = getInterviewFormValues(formData);
  const durationMinutes = optionalPositiveInteger(
    formData,
    "duration_minutes",
  );
  const onlineUrl = optionalText(formData, "online_url");
  const scheduledAt = parseDateTimeLocal(values.scheduled_at);
  const fieldErrors: InterviewFieldErrors = {};

  if (!values.application_id) {
    fieldErrors.application_id = "関連応募を選択してください。";
  }

  if (!isInterviewType(values.type)) {
    fieldErrors.type = "面談種別を選択してください。";
  }

  if (!scheduledAt) {
    fieldErrors.scheduled_at = "日時を入力してください。";
  }

  if (durationMinutes.type === "error") {
    fieldErrors.duration_minutes = durationMinutes.error;
  }

  if (!validateUrl(onlineUrl)) {
    fieldErrors.online_url =
      "オンラインURLは http:// または https:// で入力してください。";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, values };
  }

  return {
    payload: {
      application_id: values.application_id,
      type: values.type as InterviewType,
      scheduled_at: scheduledAt as string,
      duration_minutes:
        durationMinutes.type === "success" ? durationMinutes.value : null,
      location: optionalText(formData, "location"),
      online_url: onlineUrl,
      participants: optionalText(formData, "participants"),
      preparation_memo: optionalText(formData, "preparation_memo"),
      interview_memo: optionalText(formData, "interview_memo"),
      result_memo: optionalText(formData, "result_memo"),
    },
    values,
  };
}

async function validateApplicationOwnership(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  applicationId: string,
) {
  const { data: application, error } = await supabase
    .from("applications")
    .select("id")
    .eq("id", applicationId)
    .eq("user_id", userId)
    .maybeSingle();

  return !error && Boolean(application);
}

export async function createInterview(
  _previousState: InterviewActionState,
  formData: FormData,
): Promise<InterviewActionState> {
  const { payload, fieldErrors, values } = parseInterviewPayload(formData);

  if (fieldErrors || !payload) {
    return { fieldErrors, values };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      formError: "ログイン状態を確認できませんでした。",
      values,
    };
  }

  const ownsApplication = await validateApplicationOwnership(
    supabase,
    user.id,
    payload.application_id,
  );

  if (!ownsApplication) {
    return {
      fieldErrors: { application_id: "関連応募を確認できませんでした。" },
      values,
    };
  }

  const { error: insertError } = await supabase.from("interviews").insert({
    ...payload,
    user_id: user.id,
  });

  if (insertError) {
    return {
      formError: `登録に失敗しました: ${insertError.message}`,
      values,
    };
  }

  revalidatePath("/interviews");
  redirect("/interviews");
}

export async function updateInterview(
  id: string,
  _previousState: InterviewActionState,
  formData: FormData,
): Promise<InterviewActionState> {
  const { payload, fieldErrors, values } = parseInterviewPayload(formData);

  if (fieldErrors || !payload) {
    return { fieldErrors, values };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      formError: "ログイン状態を確認できませんでした。",
      values,
    };
  }

  const ownsApplication = await validateApplicationOwnership(
    supabase,
    user.id,
    payload.application_id,
  );

  if (!ownsApplication) {
    return {
      fieldErrors: { application_id: "関連応募を確認できませんでした。" },
      values,
    };
  }

  const { error: updateError } = await supabase
    .from("interviews")
    .update(payload)
    .eq("id", id);

  if (updateError) {
    return {
      formError: `更新に失敗しました: ${updateError.message}`,
      values,
    };
  }

  revalidatePath("/interviews");
  revalidatePath(`/interviews/${id}`);
  redirect(`/interviews/${id}`);
}

export async function deleteInterview(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/interviews");
  }

  const supabase = await createSupabaseServerClient();
  await supabase.from("interviews").delete().eq("id", id);

  revalidatePath("/interviews");
  redirect("/interviews");
}
