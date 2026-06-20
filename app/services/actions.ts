"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  isServiceStatus,
  isServiceType,
  type ServiceStatus,
  type ServiceType,
} from "@/lib/constants/services";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ServiceFieldErrors = {
  name?: string;
  type?: string;
  status?: string;
  login_url?: string;
  registered_email?: string;
};

export type ServiceFormValues = {
  name: string;
  type: string;
  login_url: string;
  registered_email: string;
  login_id: string;
  status: string;
  memo: string;
};

export type ServiceActionState = {
  formError?: string;
  fieldErrors?: ServiceFieldErrors;
  values?: ServiceFormValues;
};

type ServicePayload = {
  name: string;
  type: ServiceType;
  login_url: string | null;
  registered_email: string | null;
  login_id: string | null;
  status: ServiceStatus;
  memo: string | null;
};

function optionalText(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value === "" ? null : value;
}

function getServiceFormValues(formData: FormData): ServiceFormValues {
  return {
    name: String(formData.get("name") ?? "").trim(),
    type: String(formData.get("type") ?? "").trim(),
    login_url: String(formData.get("login_url") ?? "").trim(),
    registered_email: String(formData.get("registered_email") ?? "").trim(),
    login_id: String(formData.get("login_id") ?? "").trim(),
    status: String(formData.get("status") ?? "").trim(),
    memo: String(formData.get("memo") ?? "").trim(),
  };
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

function validateEmail(value: string | null) {
  if (!value) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function parseServicePayload(formData: FormData): {
  payload?: ServicePayload;
  fieldErrors?: ServiceFieldErrors;
  values: ServiceFormValues;
} {
  const values = getServiceFormValues(formData);
  const loginUrl = optionalText(formData, "login_url");
  const registeredEmail = optionalText(formData, "registered_email");
  const fieldErrors: ServiceFieldErrors = {};

  if (!values.name) {
    fieldErrors.name = "サービス名を入力してください。";
  }

  if (!isServiceType(values.type)) {
    fieldErrors.type = "種別を選択してください。";
  }

  if (!isServiceStatus(values.status)) {
    fieldErrors.status = "利用状況を選択してください。";
  }

  if (!validateUrl(loginUrl)) {
    fieldErrors.login_url =
      "ログインURLは http:// または https:// で入力してください。";
  }

  if (!validateEmail(registeredEmail)) {
    fieldErrors.registered_email =
      "登録メールアドレスの形式を確認してください。";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, values };
  }

  return {
    payload: {
      name: values.name,
      type: values.type as ServiceType,
      login_url: loginUrl,
      registered_email: registeredEmail,
      login_id: optionalText(formData, "login_id"),
      status: values.status as ServiceStatus,
      memo: optionalText(formData, "memo"),
    },
    values,
  };
}

export async function createService(
  _previousState: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  const { payload, fieldErrors, values } = parseServicePayload(formData);

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

  const { error: insertError } = await supabase.from("services").insert({
    ...payload,
    user_id: user.id,
  });

  if (insertError) {
    return { formError: `登録に失敗しました: ${insertError.message}`, values };
  }

  revalidatePath("/services");
  redirect("/services");
}

export async function updateService(
  id: string,
  _previousState: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  const { payload, fieldErrors, values } = parseServicePayload(formData);

  if (fieldErrors || !payload) {
    return { fieldErrors, values };
  }

  const supabase = await createSupabaseServerClient();
  const { error: updateError } = await supabase
    .from("services")
    .update(payload)
    .eq("id", id);

  if (updateError) {
    return { formError: `更新に失敗しました: ${updateError.message}`, values };
  }

  revalidatePath("/services");
  revalidatePath(`/services/${id}`);
  redirect(`/services/${id}`);
}

export async function deleteService(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/services");
  }

  const supabase = await createSupabaseServerClient();
  await supabase.from("services").delete().eq("id", id);

  revalidatePath("/services");
  redirect("/services");
}
