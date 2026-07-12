"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  isCareerSkillCategory,
  isCareerSkillLevel,
  type CareerSkillCategory,
  type CareerSkillLevel,
} from "@/lib/constants/career";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type CareerSkillFieldErrors = {
  category?: string;
  last_used_year?: string;
  name?: string;
  skill_level?: string;
  years_of_experience?: string;
};

export type CareerSkillFormValues = {
  category: string;
  description: string;
  last_used_year: string;
  name: string;
  skill_level: string;
  years_of_experience: string;
};

export type CareerSkillActionState = {
  fieldErrors?: CareerSkillFieldErrors;
  formError?: string;
  values?: CareerSkillFormValues;
};

type CareerSkillPayload = {
  category: CareerSkillCategory;
  description: string | null;
  last_used_year: number | null;
  name: string;
  skill_level: CareerSkillLevel;
  years_of_experience: number | null;
};

function optionalText(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value === "" ? null : value;
}

function getCareerSkillFormValues(formData: FormData): CareerSkillFormValues {
  return {
    category: String(formData.get("category") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    last_used_year: String(formData.get("last_used_year") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    skill_level: String(formData.get("skill_level") ?? "").trim(),
    years_of_experience: String(
      formData.get("years_of_experience") ?? "",
    ).trim(),
  };
}

function parseOptionalDecimal(value: string) {
  if (!value) {
    return null;
  }

  if (!/^\d+(\.\d{1,2})?$/.test(value)) {
    return undefined;
  }

  return Number(value);
}

function parseOptionalInteger(value: string) {
  if (!value) {
    return null;
  }

  if (!/^\d+$/.test(value)) {
    return undefined;
  }

  return Number(value);
}

function parseCareerSkillPayload(formData: FormData): {
  fieldErrors?: CareerSkillFieldErrors;
  payload?: CareerSkillPayload;
  values: CareerSkillFormValues;
} {
  const values = getCareerSkillFormValues(formData);
  const fieldErrors: CareerSkillFieldErrors = {};
  const yearsOfExperience = parseOptionalDecimal(values.years_of_experience);
  const lastUsedYear = parseOptionalInteger(values.last_used_year);
  const currentYear = new Date().getFullYear();

  if (!values.name) {
    fieldErrors.name = "スキル名を入力してください。";
  }

  if (!isCareerSkillCategory(values.category)) {
    fieldErrors.category = "カテゴリを選択してください。";
  }

  if (!isCareerSkillLevel(values.skill_level)) {
    fieldErrors.skill_level = "レベルを選択してください。";
  }

  if (yearsOfExperience === undefined) {
    fieldErrors.years_of_experience =
      "経験年数は0以上の数値で入力してください。";
  }

  if (
    lastUsedYear === undefined ||
    (typeof lastUsedYear === "number" &&
      (lastUsedYear < 1900 || lastUsedYear > currentYear + 1))
  ) {
    fieldErrors.last_used_year = `最終利用年は1900年から${currentYear + 1}年までで入力してください。`;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, values };
  }

  const parsedYearsOfExperience =
    yearsOfExperience === undefined ? null : yearsOfExperience;
  const parsedLastUsedYear = lastUsedYear === undefined ? null : lastUsedYear;

  return {
    payload: {
      category: values.category as CareerSkillCategory,
      description: optionalText(formData, "description"),
      last_used_year: parsedLastUsedYear,
      name: values.name,
      skill_level: values.skill_level as CareerSkillLevel,
      years_of_experience: parsedYearsOfExperience,
    },
    values,
  };
}

export async function createCareerSkill(
  _previousState: CareerSkillActionState,
  formData: FormData,
): Promise<CareerSkillActionState> {
  const { fieldErrors, payload, values } = parseCareerSkillPayload(formData);

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

  const { error } = await supabase.from("career_skills").insert({
    ...payload,
    user_id: user.id,
  });

  if (error) {
    return { formError: `登録に失敗しました: ${error.message}`, values };
  }

  revalidatePath("/career");
  redirect("/career");
}

export async function updateCareerSkill(
  id: string,
  _previousState: CareerSkillActionState,
  formData: FormData,
): Promise<CareerSkillActionState> {
  const { fieldErrors, payload, values } = parseCareerSkillPayload(formData);

  if (fieldErrors || !payload) {
    return { fieldErrors, values };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("career_skills")
    .update(payload)
    .eq("id", id);

  if (error) {
    return { formError: `更新に失敗しました: ${error.message}`, values };
  }

  revalidatePath("/career");
  redirect("/career");
}

export async function deleteCareerSkill(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/career");
  }

  const supabase = await createSupabaseServerClient();
  await supabase.from("career_skills").delete().eq("id", id);

  revalidatePath("/career");
  redirect("/career");
}
