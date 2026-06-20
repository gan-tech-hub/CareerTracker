"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isContactRole, type ContactRole } from "@/lib/constants/contacts";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ContactFieldErrors = {
  name?: string;
  role?: string;
  email?: string;
  service_id?: string;
  company_id?: string;
};

export type ContactFormValues = {
  name: string;
  organization: string;
  role: string;
  email: string;
  phone: string;
  service_id: string;
  company_id: string;
  memo: string;
};

export type ContactActionState = {
  formError?: string;
  fieldErrors?: ContactFieldErrors;
  values?: ContactFormValues;
};

type ContactPayload = {
  name: string;
  organization: string | null;
  role: ContactRole;
  email: string | null;
  phone: string | null;
  service_id: string | null;
  company_id: string | null;
  memo: string | null;
};

function optionalText(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value === "" ? null : value;
}

function getContactFormValues(formData: FormData): ContactFormValues {
  return {
    name: String(formData.get("name") ?? "").trim(),
    organization: String(formData.get("organization") ?? "").trim(),
    role: String(formData.get("role") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    service_id: String(formData.get("service_id") ?? "").trim(),
    company_id: String(formData.get("company_id") ?? "").trim(),
    memo: String(formData.get("memo") ?? "").trim(),
  };
}

function validateEmail(value: string | null) {
  if (!value) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function parseContactPayload(formData: FormData): {
  payload?: ContactPayload;
  fieldErrors?: ContactFieldErrors;
  values: ContactFormValues;
} {
  const values = getContactFormValues(formData);
  const email = optionalText(formData, "email");
  const fieldErrors: ContactFieldErrors = {};

  if (!values.name) {
    fieldErrors.name = "氏名を入力してください。";
  }

  if (!isContactRole(values.role)) {
    fieldErrors.role = "役割を選択してください。";
  }

  if (!validateEmail(email)) {
    fieldErrors.email = "メールアドレスの形式を確認してください。";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, values };
  }

  return {
    payload: {
      name: values.name,
      organization: optionalText(formData, "organization"),
      role: values.role as ContactRole,
      email,
      phone: optionalText(formData, "phone"),
      service_id: optionalText(formData, "service_id"),
      company_id: optionalText(formData, "company_id"),
      memo: optionalText(formData, "memo"),
    },
    values,
  };
}

async function validateRelatedOwnership(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  payload: ContactPayload,
) {
  const fieldErrors: ContactFieldErrors = {};

  if (payload.service_id) {
    const { data: service, error } = await supabase
      .from("services")
      .select("id")
      .eq("id", payload.service_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !service) {
      fieldErrors.service_id = "関連サービスを確認できませんでした。";
    }
  }

  if (payload.company_id) {
    const { data: company, error } = await supabase
      .from("companies")
      .select("id")
      .eq("id", payload.company_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !company) {
      fieldErrors.company_id = "関連会社を確認できませんでした。";
    }
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
}

export async function createContact(
  _previousState: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const { payload, fieldErrors, values } = parseContactPayload(formData);

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

  const { error: insertError } = await supabase.from("contacts").insert({
    ...payload,
    user_id: user.id,
  });

  if (insertError) {
    return { formError: `登録に失敗しました: ${insertError.message}`, values };
  }

  revalidatePath("/contacts");
  redirect("/contacts");
}

export async function updateContact(
  id: string,
  _previousState: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const { payload, fieldErrors, values } = parseContactPayload(formData);

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
    .from("contacts")
    .update(payload)
    .eq("id", id);

  if (updateError) {
    return { formError: `更新に失敗しました: ${updateError.message}`, values };
  }

  revalidatePath("/contacts");
  revalidatePath(`/contacts/${id}`);
  redirect(`/contacts/${id}`);
}

export async function deleteContact(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/contacts");
  }

  const supabase = await createSupabaseServerClient();
  await supabase.from("contacts").delete().eq("id", id);

  revalidatePath("/contacts");
  redirect("/contacts");
}
