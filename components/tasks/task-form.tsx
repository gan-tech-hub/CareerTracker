"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { TaskActionState } from "@/app/tasks/actions";
import { TASK_PRIORITIES, TASK_TYPES } from "@/lib/constants/tasks";
import type { Database } from "@/lib/types/database";
import type { TaskApplicationOption } from "./task-types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

type TaskFormProps = {
  action: (
    previousState: TaskActionState,
    formData: FormData,
  ) => Promise<TaskActionState>;
  applications: TaskApplicationOption[];
  submitLabel: string;
  task?: Task;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "保存中" : label}
    </button>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-red-700">{message}</p>;
}

function fieldClass(hasError: boolean) {
  return `mt-2 w-full rounded-md border px-3 py-2 text-sm outline-none transition focus:border-ink ${
    hasError ? "border-red-300 bg-red-50" : "border-border"
  }`;
}

function Section({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="space-y-5">
      <h3 className="border-b border-border pb-2 text-sm font-semibold text-ink">
        {title}
      </h3>
      {children}
    </section>
  );
}

function formatApplicationLabel(application: TaskApplicationOption) {
  const companyName = application.jobs?.companies?.name ?? "会社未設定";
  const jobTitle = application.jobs?.title ?? "求人未設定";
  return `${companyName} - ${jobTitle} / ${application.status}`;
}

export function TaskForm({
  action,
  applications,
  submitLabel,
  task,
}: TaskFormProps) {
  const [state, formAction] = useActionState(action, {});
  const errors = state.fieldErrors ?? {};
  const values = state.values;

  return (
    <form action={formAction} className="space-y-8" noValidate>
      {state.formError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.formError}
        </p>
      ) : null}

      <Section title="基本情報">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <label className="text-sm font-medium text-ink" htmlFor="title">
              タイトル
            </label>
            <input
              aria-describedby={errors.title ? "title-error" : undefined}
              aria-invalid={Boolean(errors.title)}
              className={fieldClass(Boolean(errors.title))}
              defaultValue={values?.title ?? task?.title ?? ""}
              id="title"
              name="title"
              type="text"
            />
            <div id="title-error">
              <FieldError message={errors.title} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-ink" htmlFor="type">
              タスク種別
            </label>
            <select
              aria-describedby={errors.type ? "type-error" : undefined}
              aria-invalid={Boolean(errors.type)}
              className={`${fieldClass(Boolean(errors.type))} bg-white`}
              defaultValue={values?.type ?? task?.type ?? TASK_TYPES[0]}
              id="type"
              name="type"
            >
              {TASK_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <div id="type-error">
              <FieldError message={errors.type} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-ink" htmlFor="due_date">
              期限日
            </label>
            <input
              aria-describedby={errors.due_date ? "due-date-error" : undefined}
              aria-invalid={Boolean(errors.due_date)}
              className={fieldClass(Boolean(errors.due_date))}
              defaultValue={values?.due_date ?? task?.due_date ?? ""}
              id="due_date"
              name="due_date"
              type="date"
            />
            <div id="due-date-error">
              <FieldError message={errors.due_date} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-ink" htmlFor="priority">
              優先度
            </label>
            <select
              aria-describedby={errors.priority ? "priority-error" : undefined}
              aria-invalid={Boolean(errors.priority)}
              className={`${fieldClass(Boolean(errors.priority))} bg-white`}
              defaultValue={values?.priority ?? task?.priority ?? TASK_PRIORITIES[1]}
              id="priority"
              name="priority"
            >
              {TASK_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
            <div id="priority-error">
              <FieldError message={errors.priority} />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-8">
            <input
              className="h-4 w-4 rounded border-border text-ink"
              defaultChecked={
                values ? values.is_completed === "on" : task?.is_completed
              }
              id="is_completed"
              name="is_completed"
              type="checkbox"
            />
            <label className="text-sm font-medium text-ink" htmlFor="is_completed">
              完了済み
            </label>
          </div>

          <div className="lg:col-span-2">
            <label
              className="text-sm font-medium text-ink"
              htmlFor="application_id"
            >
              関連応募
            </label>
            <select
              aria-describedby={
                errors.application_id ? "application-id-error" : undefined
              }
              aria-invalid={Boolean(errors.application_id)}
              className={`${fieldClass(Boolean(errors.application_id))} bg-white`}
              defaultValue={values?.application_id ?? task?.application_id ?? ""}
              id="application_id"
              name="application_id"
            >
              <option value="">未選択</option>
              {applications.map((application) => (
                <option key={application.id} value={application.id}>
                  {formatApplicationLabel(application)}
                </option>
              ))}
            </select>
            <div id="application-id-error">
              <FieldError message={errors.application_id} />
            </div>
          </div>
        </div>
      </Section>

      <Section title="メモ">
        <div>
          <label className="text-sm font-medium text-ink" htmlFor="memo">
            メモ
          </label>
          <textarea
            className="mt-2 min-h-36 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-ink"
            defaultValue={values?.memo ?? task?.memo ?? ""}
            id="memo"
            name="memo"
          />
        </div>
      </Section>

      <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
