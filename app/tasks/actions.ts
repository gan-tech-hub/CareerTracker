"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  isTaskPriority,
  isTaskType,
  type TaskPriority,
  type TaskType,
} from "@/lib/constants/tasks";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type TaskFieldErrors = {
  application_id?: string;
  title?: string;
  type?: string;
  due_date?: string;
  priority?: string;
};

export type TaskFormValues = {
  application_id: string;
  title: string;
  type: string;
  due_date: string;
  is_completed: string;
  priority: string;
  memo: string;
};

export type TaskActionState = {
  formError?: string;
  fieldErrors?: TaskFieldErrors;
  values?: TaskFormValues;
};

type TaskPayload = {
  application_id: string | null;
  title: string;
  type: TaskType;
  due_date: string;
  is_completed: boolean;
  priority: TaskPriority;
  memo: string | null;
};

function optionalText(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value === "" ? null : value;
}

function getTaskFormValues(formData: FormData): TaskFormValues {
  return {
    application_id: String(formData.get("application_id") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    type: String(formData.get("type") ?? "").trim(),
    due_date: String(formData.get("due_date") ?? "").trim(),
    is_completed: formData.get("is_completed") === "on" ? "on" : "",
    priority: String(formData.get("priority") ?? "").trim(),
    memo: String(formData.get("memo") ?? "").trim(),
  };
}

function isDateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime());
}

function parseTaskPayload(formData: FormData): {
  payload?: TaskPayload;
  fieldErrors?: TaskFieldErrors;
  values: TaskFormValues;
} {
  const values = getTaskFormValues(formData);
  const fieldErrors: TaskFieldErrors = {};

  if (!values.title) {
    fieldErrors.title = "タイトルを入力してください。";
  }

  if (!isTaskType(values.type)) {
    fieldErrors.type = "タスク種別を選択してください。";
  }

  if (!values.due_date || !isDateInput(values.due_date)) {
    fieldErrors.due_date = "期限日を入力してください。";
  }

  if (!isTaskPriority(values.priority)) {
    fieldErrors.priority = "優先度を選択してください。";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, values };
  }

  return {
    payload: {
      application_id: optionalText(formData, "application_id"),
      title: values.title,
      type: values.type as TaskType,
      due_date: values.due_date,
      is_completed: values.is_completed === "on",
      priority: values.priority as TaskPriority,
      memo: optionalText(formData, "memo"),
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

export async function createTask(
  _previousState: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const { payload, fieldErrors, values } = parseTaskPayload(formData);

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

  if (payload.application_id) {
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
  }

  const { error: insertError } = await supabase.from("tasks").insert({
    ...payload,
    user_id: user.id,
  });

  if (insertError) {
    return {
      formError: `登録に失敗しました: ${insertError.message}`,
      values,
    };
  }

  revalidatePath("/tasks");
  redirect("/tasks");
}

export async function updateTask(
  id: string,
  _previousState: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const { payload, fieldErrors, values } = parseTaskPayload(formData);

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

  if (payload.application_id) {
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
  }

  const { error: updateError } = await supabase
    .from("tasks")
    .update(payload)
    .eq("id", id);

  if (updateError) {
    return {
      formError: `更新に失敗しました: ${updateError.message}`,
      values,
    };
  }

  revalidatePath("/tasks");
  revalidatePath(`/tasks/${id}`);
  redirect(`/tasks/${id}`);
}

export async function deleteTask(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/tasks");
  }

  const supabase = await createSupabaseServerClient();
  await supabase.from("tasks").delete().eq("id", id);

  revalidatePath("/tasks");
  redirect("/tasks");
}
