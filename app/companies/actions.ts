"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  isCompanyInterestLevel,
  type CompanyInterestLevel,
} from "@/lib/constants/companies";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type CompanyFieldErrors = {
  name?: string;
  interest_level?: string;
  corporate_url?: string;
  recruitment_url?: string;
};

export type CompanyActionState = {
  formError?: string;
  fieldErrors?: CompanyFieldErrors;
};

type CompanyPayload = {
  name: string;
  industry: string | null;
  location: string | null;
  corporate_url: string | null;
  recruitment_url: string | null;
  interest_level: CompanyInterestLevel;
  concerns: string | null;
  memo: string | null;
};

function optionalText(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value === "" ? null : value;
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

function parseCompanyPayload(formData: FormData): {
  payload?: CompanyPayload;
  fieldErrors?: CompanyFieldErrors;
} {
  const name = String(formData.get("name") ?? "").trim();
  const interestLevel = String(formData.get("interest_level") ?? "").trim();
  const corporateUrl = optionalText(formData, "corporate_url");
  const recruitmentUrl = optionalText(formData, "recruitment_url");
  const fieldErrors: CompanyFieldErrors = {};

  if (!name) {
    fieldErrors.name = "会社名を入力してください。";
  }

  if (!isCompanyInterestLevel(interestLevel)) {
    fieldErrors.interest_level = "関心度を選択してください。";
  }

  if (!validateUrl(corporateUrl)) {
    fieldErrors.corporate_url =
      "企業URLは http:// または https:// で入力してください。";
  }

  if (!validateUrl(recruitmentUrl)) {
    fieldErrors.recruitment_url =
      "採用ページURLは http:// または https:// で入力してください。";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  return {
    payload: {
      name,
      industry: optionalText(formData, "industry"),
      location: optionalText(formData, "location"),
      corporate_url: corporateUrl,
      recruitment_url: recruitmentUrl,
      interest_level: interestLevel as CompanyInterestLevel,
      concerns: optionalText(formData, "concerns"),
      memo: optionalText(formData, "memo"),
    },
  };
}

export async function createCompany(
  _previousState: CompanyActionState,
  formData: FormData,
): Promise<CompanyActionState> {
  const { payload, fieldErrors } = parseCompanyPayload(formData);

  if (fieldErrors || !payload) {
    return { fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { formError: "ログイン状態を確認できませんでした。" };
  }

  const { error: insertError } = await supabase.from("companies").insert({
    ...payload,
    user_id: user.id,
  });

  if (insertError) {
    return { formError: `登録に失敗しました: ${insertError.message}` };
  }

  revalidatePath("/companies");
  redirect("/companies");
}

export async function updateCompany(
  id: string,
  _previousState: CompanyActionState,
  formData: FormData,
): Promise<CompanyActionState> {
  const { payload, fieldErrors } = parseCompanyPayload(formData);

  if (fieldErrors || !payload) {
    return { fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  const { error: updateError } = await supabase
    .from("companies")
    .update(payload)
    .eq("id", id);

  if (updateError) {
    return { formError: `更新に失敗しました: ${updateError.message}` };
  }

  revalidatePath("/companies");
  revalidatePath(`/companies/${id}`);
  redirect(`/companies/${id}`);
}

export async function deleteCompany(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/companies");
  }

  const supabase = await createSupabaseServerClient();
  await supabase.from("companies").delete().eq("id", id);

  revalidatePath("/companies");
  redirect("/companies");
}
