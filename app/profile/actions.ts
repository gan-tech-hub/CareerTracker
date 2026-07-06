"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  isRemotePreference,
  isSideJobPreference,
  type RemotePreference,
  type SideJobPreference,
} from "@/lib/constants/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProfileFieldErrors = {
  desired_salary_min?: string;
  desired_salary_max?: string;
  remote_preference?: string;
  side_job_preference?: string;
};

export type ProfileFormValues = {
  display_name: string;
  current_position: string;
  desired_role: string;
  desired_industries: string;
  desired_salary_min: string;
  desired_salary_max: string;
  desired_locations: string;
  remote_preference: string;
  side_job_preference: string;
  work_style: string;
  career_axis: string;
  avoid_conditions: string;
  strengths: string;
  skills: string;
  learning_interests: string;
  self_pr: string;
  memo: string;
};

export type ProfileActionState = {
  formError?: string;
  fieldErrors?: ProfileFieldErrors;
  values?: ProfileFormValues;
};

type ProfilePayload = {
  display_name: string | null;
  current_position: string | null;
  desired_role: string | null;
  desired_industries: string | null;
  desired_salary_min: number | null;
  desired_salary_max: number | null;
  desired_locations: string | null;
  remote_preference: RemotePreference;
  side_job_preference: SideJobPreference;
  work_style: string | null;
  career_axis: string | null;
  avoid_conditions: string | null;
  strengths: string | null;
  skills: string | null;
  learning_interests: string | null;
  self_pr: string | null;
  memo: string | null;
};

function optionalText(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value === "" ? null : value;
}

function getProfileFormValues(formData: FormData): ProfileFormValues {
  return {
    display_name: String(formData.get("display_name") ?? "").trim(),
    current_position: String(formData.get("current_position") ?? "").trim(),
    desired_role: String(formData.get("desired_role") ?? "").trim(),
    desired_industries: String(formData.get("desired_industries") ?? "").trim(),
    desired_salary_min: String(formData.get("desired_salary_min") ?? "").trim(),
    desired_salary_max: String(formData.get("desired_salary_max") ?? "").trim(),
    desired_locations: String(formData.get("desired_locations") ?? "").trim(),
    remote_preference: String(formData.get("remote_preference") ?? "").trim(),
    side_job_preference: String(
      formData.get("side_job_preference") ?? "",
    ).trim(),
    work_style: String(formData.get("work_style") ?? "").trim(),
    career_axis: String(formData.get("career_axis") ?? "").trim(),
    avoid_conditions: String(formData.get("avoid_conditions") ?? "").trim(),
    strengths: String(formData.get("strengths") ?? "").trim(),
    skills: String(formData.get("skills") ?? "").trim(),
    learning_interests: String(
      formData.get("learning_interests") ?? "",
    ).trim(),
    self_pr: String(formData.get("self_pr") ?? "").trim(),
    memo: String(formData.get("memo") ?? "").trim(),
  };
}

function parseOptionalNumber(value: string) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
}

function parseProfilePayload(formData: FormData): {
  fieldErrors?: ProfileFieldErrors;
  payload?: ProfilePayload;
  values: ProfileFormValues;
} {
  const values = getProfileFormValues(formData);
  const fieldErrors: ProfileFieldErrors = {};
  const desiredSalaryMin = parseOptionalNumber(values.desired_salary_min);
  const desiredSalaryMax = parseOptionalNumber(values.desired_salary_max);

  if (desiredSalaryMin === undefined) {
    fieldErrors.desired_salary_min =
      "希望年収下限は0以上の整数で入力してください。";
  }

  if (desiredSalaryMax === undefined) {
    fieldErrors.desired_salary_max =
      "希望年収上限は0以上の整数で入力してください。";
  }

  if (
    typeof desiredSalaryMin === "number" &&
    typeof desiredSalaryMax === "number" &&
    desiredSalaryMin > desiredSalaryMax
  ) {
    fieldErrors.desired_salary_max =
      "希望年収上限は希望年収下限以上で入力してください。";
  }

  if (!isRemotePreference(values.remote_preference)) {
    fieldErrors.remote_preference = "リモート希望を選択してください。";
  }

  if (!isSideJobPreference(values.side_job_preference)) {
    fieldErrors.side_job_preference = "副業希望を選択してください。";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, values };
  }

  return {
    payload: {
      display_name: optionalText(formData, "display_name"),
      current_position: optionalText(formData, "current_position"),
      desired_role: optionalText(formData, "desired_role"),
      desired_industries: optionalText(formData, "desired_industries"),
      desired_salary_min: desiredSalaryMin ?? null,
      desired_salary_max: desiredSalaryMax ?? null,
      desired_locations: optionalText(formData, "desired_locations"),
      remote_preference: values.remote_preference as RemotePreference,
      side_job_preference: values.side_job_preference as SideJobPreference,
      work_style: optionalText(formData, "work_style"),
      career_axis: optionalText(formData, "career_axis"),
      avoid_conditions: optionalText(formData, "avoid_conditions"),
      strengths: optionalText(formData, "strengths"),
      skills: optionalText(formData, "skills"),
      learning_interests: optionalText(formData, "learning_interests"),
      self_pr: optionalText(formData, "self_pr"),
      memo: optionalText(formData, "memo"),
    },
    values,
  };
}

export async function upsertUserProfile(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const { payload, fieldErrors, values } = parseProfilePayload(formData);

  if (fieldErrors || !payload) {
    return { fieldErrors, values };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { formError: "ログイン状態を確認できませんでした。", values };
  }

  const { error: upsertError } = await supabase
    .from("user_profiles")
    .upsert(
      {
        ...payload,
        user_id: user.id,
      },
      { onConflict: "user_id" },
    );

  if (upsertError) {
    return { formError: `保存に失敗しました: ${upsertError.message}`, values };
  }

  revalidatePath("/profile");
  redirect("/profile");
}
