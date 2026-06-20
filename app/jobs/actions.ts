"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  isJobEmploymentType,
  isJobPriority,
  isJobRemoteType,
  isJobSideJobAllowed,
  type JobEmploymentType,
  type JobPriority,
  type JobRemoteType,
  type JobSideJobAllowed,
} from "@/lib/constants/jobs";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type JobFieldErrors = {
  title?: string;
  company_id?: string;
  service_id?: string;
  job_url?: string;
  employment_type?: string;
  salary_min?: string;
  salary_max?: string;
  remote_type?: string;
  side_job_allowed?: string;
  priority?: string;
};

export type JobFormValues = {
  company_id: string;
  service_id: string;
  title: string;
  job_url: string;
  job_type: string;
  employment_type: string;
  salary_min: string;
  salary_max: string;
  location: string;
  remote_type: string;
  side_job_allowed: string;
  required_skills: string;
  preferred_skills: string;
  description: string;
  attractive_points: string;
  concerns: string;
  priority: string;
  memo: string;
};

export type JobActionState = {
  formError?: string;
  fieldErrors?: JobFieldErrors;
  values?: JobFormValues;
};

type JobPayload = {
  company_id: string;
  service_id: string | null;
  title: string;
  job_url: string | null;
  job_type: string | null;
  employment_type: JobEmploymentType;
  salary_min: number | null;
  salary_max: number | null;
  location: string | null;
  remote_type: JobRemoteType;
  side_job_allowed: JobSideJobAllowed;
  required_skills: string | null;
  preferred_skills: string | null;
  description: string | null;
  attractive_points: string | null;
  concerns: string | null;
  priority: JobPriority;
  memo: string | null;
};

type OptionalIntegerResult =
  | { type: "success"; value: number | null }
  | { type: "error"; error: string };

function optionalText(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value === "" ? null : value;
}

function getJobFormValues(formData: FormData): JobFormValues {
  return {
    company_id: String(formData.get("company_id") ?? "").trim(),
    service_id: String(formData.get("service_id") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    job_url: String(formData.get("job_url") ?? "").trim(),
    job_type: String(formData.get("job_type") ?? "").trim(),
    employment_type: String(formData.get("employment_type") ?? "").trim(),
    salary_min: String(formData.get("salary_min") ?? "").trim(),
    salary_max: String(formData.get("salary_max") ?? "").trim(),
    location: String(formData.get("location") ?? "").trim(),
    remote_type: String(formData.get("remote_type") ?? "").trim(),
    side_job_allowed: String(formData.get("side_job_allowed") ?? "").trim(),
    required_skills: String(formData.get("required_skills") ?? "").trim(),
    preferred_skills: String(formData.get("preferred_skills") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    attractive_points: String(formData.get("attractive_points") ?? "").trim(),
    concerns: String(formData.get("concerns") ?? "").trim(),
    priority: String(formData.get("priority") ?? "").trim(),
    memo: String(formData.get("memo") ?? "").trim(),
  };
}

function optionalInteger(
  formData: FormData,
  key: string,
): OptionalIntegerResult {
  const value = String(formData.get(key) ?? "").trim();
  if (value === "") {
    return { type: "success", value: null };
  }

  if (!/^\d+$/.test(value)) {
    return { type: "error", error: "万円単位の整数で入力してください。" };
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

function parseJobPayload(formData: FormData): {
  payload?: JobPayload;
  fieldErrors?: JobFieldErrors;
  values: JobFormValues;
} {
  const values = getJobFormValues(formData);
  const serviceId = optionalText(formData, "service_id");
  const jobUrl = optionalText(formData, "job_url");
  const salaryMin = optionalInteger(formData, "salary_min");
  const salaryMax = optionalInteger(formData, "salary_max");
  const fieldErrors: JobFieldErrors = {};

  if (!values.title) {
    fieldErrors.title = "求人タイトルを入力してください。";
  }

  if (!values.company_id) {
    fieldErrors.company_id = "会社を選択してください。";
  }

  if (!isJobEmploymentType(values.employment_type)) {
    fieldErrors.employment_type = "雇用形態を選択してください。";
  }

  if (!isJobRemoteType(values.remote_type)) {
    fieldErrors.remote_type = "リモート可否を選択してください。";
  }

  if (!isJobSideJobAllowed(values.side_job_allowed)) {
    fieldErrors.side_job_allowed = "副業可否を選択してください。";
  }

  if (!isJobPriority(values.priority)) {
    fieldErrors.priority = "優先度を選択してください。";
  }

  if (!validateUrl(jobUrl)) {
    fieldErrors.job_url =
      "求人URLは http:// または https:// で入力してください。";
  }

  if (salaryMin.type === "error") {
    fieldErrors.salary_min = salaryMin.error;
  }

  if (salaryMax.type === "error") {
    fieldErrors.salary_max = salaryMax.error;
  }

  if (
    salaryMin.type === "success" &&
    salaryMax.type === "success" &&
    salaryMin.value !== null &&
    salaryMax.value !== null &&
    salaryMin.value > salaryMax.value
  ) {
    fieldErrors.salary_min = "年収下限は年収上限以下にしてください。";
    fieldErrors.salary_max = "年収上限は年収下限以上にしてください。";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, values };
  }

  return {
    payload: {
      company_id: values.company_id,
      service_id: serviceId,
      title: values.title,
      job_url: jobUrl,
      job_type: optionalText(formData, "job_type"),
      employment_type: values.employment_type as JobEmploymentType,
      salary_min: salaryMin.type === "success" ? salaryMin.value : null,
      salary_max: salaryMax.type === "success" ? salaryMax.value : null,
      location: optionalText(formData, "location"),
      remote_type: values.remote_type as JobRemoteType,
      side_job_allowed: values.side_job_allowed as JobSideJobAllowed,
      required_skills: optionalText(formData, "required_skills"),
      preferred_skills: optionalText(formData, "preferred_skills"),
      description: optionalText(formData, "description"),
      attractive_points: optionalText(formData, "attractive_points"),
      concerns: optionalText(formData, "concerns"),
      priority: values.priority as JobPriority,
      memo: optionalText(formData, "memo"),
    },
    values,
  };
}

async function validateRelatedOwnership(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  payload: JobPayload,
) {
  const fieldErrors: JobFieldErrors = {};

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id")
    .eq("id", payload.company_id)
    .eq("user_id", userId)
    .maybeSingle();

  if (companyError || !company) {
    fieldErrors.company_id = "会社を確認できませんでした。";
  }

  if (payload.service_id) {
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("id")
      .eq("id", payload.service_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (serviceError || !service) {
      fieldErrors.service_id = "関連サービスを確認できませんでした。";
    }
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
}

export async function createJob(
  _previousState: JobActionState,
  formData: FormData,
): Promise<JobActionState> {
  const { payload, fieldErrors, values } = parseJobPayload(formData);

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

  const relatedErrors = await validateRelatedOwnership(
    supabase,
    user.id,
    payload,
  );

  if (relatedErrors) {
    return { fieldErrors: relatedErrors, values };
  }

  const { error: insertError } = await supabase.from("jobs").insert({
    ...payload,
    user_id: user.id,
  });

  if (insertError) {
    return { formError: `登録に失敗しました: ${insertError.message}`, values };
  }

  revalidatePath("/jobs");
  redirect("/jobs");
}

export async function updateJob(
  id: string,
  _previousState: JobActionState,
  formData: FormData,
): Promise<JobActionState> {
  const { payload, fieldErrors, values } = parseJobPayload(formData);

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

  const relatedErrors = await validateRelatedOwnership(
    supabase,
    user.id,
    payload,
  );

  if (relatedErrors) {
    return { fieldErrors: relatedErrors, values };
  }

  const { error: updateError } = await supabase
    .from("jobs")
    .update(payload)
    .eq("id", id);

  if (updateError) {
    return { formError: `更新に失敗しました: ${updateError.message}`, values };
  }

  revalidatePath("/jobs");
  revalidatePath(`/jobs/${id}`);
  redirect(`/jobs/${id}`);
}

export async function deleteJob(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/jobs");
  }

  const supabase = await createSupabaseServerClient();
  await supabase.from("jobs").delete().eq("id", id);

  revalidatePath("/jobs");
  redirect("/jobs");
}
