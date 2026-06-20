"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  isApplicationInterestLevel,
  isApplicationStatus,
  type ApplicationInterestLevel,
  type ApplicationStatus,
} from "@/lib/constants/applications";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ApplicationFieldErrors = {
  job_id?: string;
  status?: string;
  applied_at?: string;
  next_deadline?: string;
  interest_level?: string;
};

export type ApplicationFormValues = {
  job_id: string;
  status: string;
  applied_at: string;
  next_action: string;
  next_deadline: string;
  interest_level: string;
  selection_memo: string;
  decline_reason: string;
  rejection_reason: string;
};

export type ApplicationActionState = {
  formError?: string;
  fieldErrors?: ApplicationFieldErrors;
  values?: ApplicationFormValues;
};

type ApplicationPayload = {
  job_id: string;
  status: ApplicationStatus;
  applied_at: string | null;
  next_action: string | null;
  next_deadline: string | null;
  interest_level: ApplicationInterestLevel;
  selection_memo: string | null;
  decline_reason: string | null;
  rejection_reason: string | null;
};

function optionalText(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value === "" ? null : value;
}

function getApplicationFormValues(formData: FormData): ApplicationFormValues {
  return {
    job_id: String(formData.get("job_id") ?? "").trim(),
    status: String(formData.get("status") ?? "").trim(),
    applied_at: String(formData.get("applied_at") ?? "").trim(),
    next_action: String(formData.get("next_action") ?? "").trim(),
    next_deadline: String(formData.get("next_deadline") ?? "").trim(),
    interest_level: String(formData.get("interest_level") ?? "").trim(),
    selection_memo: String(formData.get("selection_memo") ?? "").trim(),
    decline_reason: String(formData.get("decline_reason") ?? "").trim(),
    rejection_reason: String(formData.get("rejection_reason") ?? "").trim(),
  };
}

function isDateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime());
}

function parseApplicationPayload(formData: FormData): {
  payload?: ApplicationPayload;
  fieldErrors?: ApplicationFieldErrors;
  values: ApplicationFormValues;
} {
  const values = getApplicationFormValues(formData);
  const appliedAt = optionalText(formData, "applied_at");
  const nextDeadline = optionalText(formData, "next_deadline");
  const fieldErrors: ApplicationFieldErrors = {};

  if (!values.job_id) {
    fieldErrors.job_id = "求人を選択してください。";
  }

  if (!isApplicationStatus(values.status)) {
    fieldErrors.status = "選考ステータスを選択してください。";
  }

  if (!isApplicationInterestLevel(values.interest_level)) {
    fieldErrors.interest_level = "志望度を選択してください。";
  }

  if (appliedAt && !isDateInput(appliedAt)) {
    fieldErrors.applied_at = "応募日は日付形式で入力してください。";
  }

  if (nextDeadline && !isDateInput(nextDeadline)) {
    fieldErrors.next_deadline = "次回期限は日付形式で入力してください。";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, values };
  }

  return {
    payload: {
      job_id: values.job_id,
      status: values.status as ApplicationStatus,
      applied_at: appliedAt,
      next_action: optionalText(formData, "next_action"),
      next_deadline: nextDeadline,
      interest_level: values.interest_level as ApplicationInterestLevel,
      selection_memo: optionalText(formData, "selection_memo"),
      decline_reason: optionalText(formData, "decline_reason"),
      rejection_reason: optionalText(formData, "rejection_reason"),
    },
    values,
  };
}

async function validateJobOwnership(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  jobId: string,
) {
  const { data: job, error } = await supabase
    .from("jobs")
    .select("id")
    .eq("id", jobId)
    .eq("user_id", userId)
    .maybeSingle();

  return !error && Boolean(job);
}

async function validateJobNotAlreadyApplied(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  jobId: string,
  currentApplicationId?: string,
) {
  let query = supabase
    .from("applications")
    .select("id")
    .eq("job_id", jobId)
    .limit(1);

  if (currentApplicationId) {
    query = query.neq("id", currentApplicationId);
  }

  const { data, error } = await query;

  return !error && (data ?? []).length === 0;
}

export async function createApplication(
  _previousState: ApplicationActionState,
  formData: FormData,
): Promise<ApplicationActionState> {
  const { payload, fieldErrors, values } = parseApplicationPayload(formData);

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

  const ownsJob = await validateJobOwnership(supabase, user.id, payload.job_id);

  if (!ownsJob) {
    return {
      fieldErrors: { job_id: "求人を確認できませんでした。" },
      values,
    };
  }

  const isAvailable = await validateJobNotAlreadyApplied(
    supabase,
    payload.job_id,
  );

  if (!isAvailable) {
    return {
      fieldErrors: {
        job_id: "この求人はすでに応募・選考に登録されています。",
      },
      values,
    };
  }

  const { error: insertError } = await supabase.from("applications").insert({
    ...payload,
    user_id: user.id,
  });

  if (insertError) {
    const message =
      insertError.code === "23505"
        ? "この求人はすでに応募・選考に登録されています。"
        : `登録に失敗しました: ${insertError.message}`;

    return { formError: message, values };
  }

  revalidatePath("/applications");
  redirect("/applications");
}

export async function updateApplication(
  id: string,
  _previousState: ApplicationActionState,
  formData: FormData,
): Promise<ApplicationActionState> {
  const { payload, fieldErrors, values } = parseApplicationPayload(formData);

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

  const ownsJob = await validateJobOwnership(supabase, user.id, payload.job_id);

  if (!ownsJob) {
    return {
      fieldErrors: { job_id: "求人を確認できませんでした。" },
      values,
    };
  }

  const isAvailable = await validateJobNotAlreadyApplied(
    supabase,
    payload.job_id,
    id,
  );

  if (!isAvailable) {
    return {
      fieldErrors: {
        job_id: "この求人はすでに応募・選考に登録されています。",
      },
      values,
    };
  }

  const { error: updateError } = await supabase
    .from("applications")
    .update(payload)
    .eq("id", id);

  if (updateError) {
    return {
      formError: `更新に失敗しました: ${updateError.message}`,
      values,
    };
  }

  revalidatePath("/applications");
  revalidatePath(`/applications/${id}`);
  redirect(`/applications/${id}`);
}

export async function deleteApplication(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/applications");
  }

  const supabase = await createSupabaseServerClient();
  await supabase.from("applications").delete().eq("id", id);

  revalidatePath("/applications");
  redirect("/applications");
}
