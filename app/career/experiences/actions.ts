"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  isCareerEmploymentType,
  type CareerEmploymentType,
} from "@/lib/constants/career";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type CareerExperienceFieldErrors = {
  company_name?: string;
  employment_type?: string;
  start_date?: string;
  end_date?: string;
};

export type CareerExperienceFormValues = {
  achievements: string;
  company_name: string;
  department: string;
  employment_type: string;
  end_date: string;
  is_current: string;
  position: string;
  responsibilities: string;
  start_date: string;
  summary: string;
  technologies: string;
};

export type CareerExperienceActionState = {
  fieldErrors?: CareerExperienceFieldErrors;
  formError?: string;
  values?: CareerExperienceFormValues;
};

type CareerExperiencePayload = {
  achievements: string | null;
  company_name: string;
  department: string | null;
  employment_type: CareerEmploymentType;
  end_date: string | null;
  is_current: boolean;
  position: string | null;
  responsibilities: string | null;
  start_date: string | null;
  summary: string | null;
  technologies: string | null;
};

function optionalText(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value === "" ? null : value;
}

function getCareerExperienceFormValues(
  formData: FormData,
): CareerExperienceFormValues {
  return {
    achievements: String(formData.get("achievements") ?? "").trim(),
    company_name: String(formData.get("company_name") ?? "").trim(),
    department: String(formData.get("department") ?? "").trim(),
    employment_type: String(formData.get("employment_type") ?? "").trim(),
    end_date: String(formData.get("end_date") ?? "").trim(),
    is_current: String(formData.get("is_current") ?? "").trim(),
    position: String(formData.get("position") ?? "").trim(),
    responsibilities: String(formData.get("responsibilities") ?? "").trim(),
    start_date: String(formData.get("start_date") ?? "").trim(),
    summary: String(formData.get("summary") ?? "").trim(),
    technologies: String(formData.get("technologies") ?? "").trim(),
  };
}

function isValidDateValue(value: string) {
  if (!value) {
    return true;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

function parseCareerExperiencePayload(formData: FormData): {
  fieldErrors?: CareerExperienceFieldErrors;
  payload?: CareerExperiencePayload;
  values: CareerExperienceFormValues;
} {
  const values = getCareerExperienceFormValues(formData);
  const fieldErrors: CareerExperienceFieldErrors = {};
  const startDate = optionalText(formData, "start_date");
  const endDate = optionalText(formData, "end_date");
  const isCurrent = formData.get("is_current") === "on";

  if (!values.company_name) {
    fieldErrors.company_name = "会社名を入力してください。";
  }

  if (!isCareerEmploymentType(values.employment_type)) {
    fieldErrors.employment_type = "雇用形態を選択してください。";
  }

  if (!isValidDateValue(values.start_date)) {
    fieldErrors.start_date = "開始日はYYYY-MM-DD形式で入力してください。";
  }

  if (!isValidDateValue(values.end_date)) {
    fieldErrors.end_date = "終了日はYYYY-MM-DD形式で入力してください。";
  }

  if (startDate && endDate && startDate > endDate) {
    fieldErrors.start_date = "開始日は終了日以前にしてください。";
    fieldErrors.end_date = "終了日は開始日以降にしてください。";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, values };
  }

  return {
    payload: {
      achievements: optionalText(formData, "achievements"),
      company_name: values.company_name,
      department: optionalText(formData, "department"),
      employment_type: values.employment_type as CareerEmploymentType,
      end_date: isCurrent ? null : endDate,
      is_current: isCurrent,
      position: optionalText(formData, "position"),
      responsibilities: optionalText(formData, "responsibilities"),
      start_date: startDate,
      summary: optionalText(formData, "summary"),
      technologies: optionalText(formData, "technologies"),
    },
    values,
  };
}

export async function createCareerExperience(
  _previousState: CareerExperienceActionState,
  formData: FormData,
): Promise<CareerExperienceActionState> {
  const { fieldErrors, payload, values } =
    parseCareerExperiencePayload(formData);

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

  const { error } = await supabase.from("career_experiences").insert({
    ...payload,
    user_id: user.id,
  });

  if (error) {
    return { formError: `登録に失敗しました: ${error.message}`, values };
  }

  revalidatePath("/career");
  redirect("/career");
}

export async function updateCareerExperience(
  id: string,
  _previousState: CareerExperienceActionState,
  formData: FormData,
): Promise<CareerExperienceActionState> {
  const { fieldErrors, payload, values } =
    parseCareerExperiencePayload(formData);

  if (fieldErrors || !payload) {
    return { fieldErrors, values };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("career_experiences")
    .update(payload)
    .eq("id", id);

  if (error) {
    return { formError: `更新に失敗しました: ${error.message}`, values };
  }

  revalidatePath("/career");
  revalidatePath(`/career/experiences/${id}`);
  redirect(`/career/experiences/${id}`);
}

export async function deleteCareerExperience(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/career");
  }

  const supabase = await createSupabaseServerClient();
  await supabase.from("career_experiences").delete().eq("id", id);

  revalidatePath("/career");
  redirect("/career");
}
