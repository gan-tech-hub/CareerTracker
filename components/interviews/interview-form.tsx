"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { InterviewActionState } from "@/app/interviews/actions";
import { INTERVIEW_TYPES } from "@/lib/constants/interviews";
import type { Database } from "@/lib/types/database";
import type { InterviewApplicationOption } from "./interview-types";

type Interview = Database["public"]["Tables"]["interviews"]["Row"];

type InterviewFormProps = {
  action: (
    previousState: InterviewActionState,
    formData: FormData,
  ) => Promise<InterviewActionState>;
  applications: InterviewApplicationOption[];
  interview?: Interview;
  submitLabel: string;
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

function formatApplicationLabel(application: InterviewApplicationOption) {
  const companyName = application.jobs?.companies?.name ?? "会社未設定";
  const jobTitle = application.jobs?.title ?? "求人未設定";
  return `${companyName} - ${jobTitle} / ${application.status}`;
}

function toDateTimeLocalValue(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function InterviewForm({
  action,
  applications,
  interview,
  submitLabel,
}: InterviewFormProps) {
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
              defaultValue={
                values?.application_id ?? interview?.application_id ?? ""
              }
              id="application_id"
              name="application_id"
            >
              <option value="">選択してください</option>
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

          <div>
            <label className="text-sm font-medium text-ink" htmlFor="type">
              面談種別
            </label>
            <select
              aria-describedby={errors.type ? "type-error" : undefined}
              aria-invalid={Boolean(errors.type)}
              className={`${fieldClass(Boolean(errors.type))} bg-white`}
              defaultValue={values?.type ?? interview?.type ?? INTERVIEW_TYPES[0]}
              id="type"
              name="type"
            >
              {INTERVIEW_TYPES.map((type) => (
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
            <label
              className="text-sm font-medium text-ink"
              htmlFor="scheduled_at"
            >
              日時
            </label>
            <input
              aria-describedby={
                errors.scheduled_at ? "scheduled-at-error" : undefined
              }
              aria-invalid={Boolean(errors.scheduled_at)}
              className={fieldClass(Boolean(errors.scheduled_at))}
              defaultValue={
                values?.scheduled_at ??
                toDateTimeLocalValue(interview?.scheduled_at)
              }
              id="scheduled_at"
              name="scheduled_at"
              type="datetime-local"
            />
            <div id="scheduled-at-error">
              <FieldError message={errors.scheduled_at} />
            </div>
          </div>

          <div>
            <label
              className="text-sm font-medium text-ink"
              htmlFor="duration_minutes"
            >
              所要時間（分）
            </label>
            <input
              aria-describedby={
                errors.duration_minutes ? "duration-minutes-error" : undefined
              }
              aria-invalid={Boolean(errors.duration_minutes)}
              className={fieldClass(Boolean(errors.duration_minutes))}
              defaultValue={
                values?.duration_minutes ?? interview?.duration_minutes ?? ""
              }
              id="duration_minutes"
              inputMode="numeric"
              name="duration_minutes"
              type="text"
            />
            <div id="duration-minutes-error">
              <FieldError message={errors.duration_minutes} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-ink" htmlFor="location">
              場所
            </label>
            <input
              className={fieldClass(false)}
              defaultValue={values?.location ?? interview?.location ?? ""}
              id="location"
              name="location"
              placeholder="会議室名、オフィス所在地など"
              type="text"
            />
          </div>

          <div className="lg:col-span-2">
            <label
              className="text-sm font-medium text-ink"
              htmlFor="online_url"
            >
              オンラインURL
            </label>
            <input
              aria-describedby={
                errors.online_url ? "online-url-error" : undefined
              }
              aria-invalid={Boolean(errors.online_url)}
              className={fieldClass(Boolean(errors.online_url))}
              defaultValue={values?.online_url ?? interview?.online_url ?? ""}
              id="online_url"
              name="online_url"
              placeholder="https://example.com/meeting"
              type="text"
            />
            <div id="online-url-error">
              <FieldError message={errors.online_url} />
            </div>
          </div>

          <div className="lg:col-span-2">
            <label
              className="text-sm font-medium text-ink"
              htmlFor="participants"
            >
              参加者
            </label>
            <input
              className={fieldClass(false)}
              defaultValue={
                values?.participants ?? interview?.participants ?? ""
              }
              id="participants"
              name="participants"
              placeholder="面談担当者、同席者など"
              type="text"
            />
          </div>
        </div>
      </Section>

      <Section title="メモ">
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label
              className="text-sm font-medium text-ink"
              htmlFor="preparation_memo"
            >
              事前準備メモ
            </label>
            <textarea
              className="mt-2 min-h-32 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-ink"
              defaultValue={
                values?.preparation_memo ??
                interview?.preparation_memo ??
                ""
              }
              id="preparation_memo"
              name="preparation_memo"
            />
          </div>

          <div>
            <label
              className="text-sm font-medium text-ink"
              htmlFor="interview_memo"
            >
              当日メモ
            </label>
            <textarea
              className="mt-2 min-h-32 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-ink"
              defaultValue={
                values?.interview_memo ?? interview?.interview_memo ?? ""
              }
              id="interview_memo"
              name="interview_memo"
            />
          </div>

          <div className="lg:col-span-2">
            <label
              className="text-sm font-medium text-ink"
              htmlFor="result_memo"
            >
              結果メモ
            </label>
            <textarea
              className="mt-2 min-h-32 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-ink"
              defaultValue={values?.result_memo ?? interview?.result_memo ?? ""}
              id="result_memo"
              name="result_memo"
            />
          </div>
        </div>
      </Section>

      <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
