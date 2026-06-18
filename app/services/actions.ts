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

export type ServiceActionState = {
  error?: string;
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
  error?: string;
} {
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const loginUrl = optionalText(formData, "login_url");
  const registeredEmail = optionalText(formData, "registered_email");

  if (!name) {
    return { error: "サービス名を入力してください。" };
  }

  if (!isServiceType(type)) {
    return { error: "種別を選択してください。" };
  }

  if (!isServiceStatus(status)) {
    return { error: "利用状況を選択してください。" };
  }

  if (!validateUrl(loginUrl)) {
    return { error: "ログインURLは http:// または https:// で入力してください。" };
  }

  if (!validateEmail(registeredEmail)) {
    return { error: "登録メールアドレスの形式を確認してください。" };
  }

  return {
    payload: {
      name,
      type,
      login_url: loginUrl,
      registered_email: registeredEmail,
      login_id: optionalText(formData, "login_id"),
      status,
      memo: optionalText(formData, "memo"),
    },
  };
}

export async function createService(
  _previousState: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  const { payload, error } = parseServicePayload(formData);

  if (error || !payload) {
    return { error };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "ログイン状態を確認できませんでした。" };
  }

  const { error: insertError } = await supabase.from("services").insert({
    ...payload,
    user_id: user.id,
  });

  if (insertError) {
    return { error: `登録に失敗しました: ${insertError.message}` };
  }

  revalidatePath("/services");
  redirect("/services");
}

export async function updateService(
  id: string,
  _previousState: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  const { payload, error } = parseServicePayload(formData);

  if (error || !payload) {
    return { error };
  }

  const supabase = await createSupabaseServerClient();
  const { error: updateError } = await supabase
    .from("services")
    .update(payload)
    .eq("id", id);

  if (updateError) {
    return { error: `更新に失敗しました: ${updateError.message}` };
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
