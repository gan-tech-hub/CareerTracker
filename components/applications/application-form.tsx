"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { ApplicationActionState } from "@/app/applications/actions";
import {
  APPLICATION_INTEREST_LEVELS,
  APPLICATION_STATUSES,
} from "@/lib/constants/applications";
import type { Database } from "@/lib/types/database";
import type { ApplicationJobOption } from "./application-types";

type Application = Database["public"]["Tables"]["applications"]["Row"];

type ApplicationFormProps = {
  action: (
    previousState: ApplicationActionState,
    formData: FormData,
  ) => Promise<ApplicationActionState>;
  application?: Application;
  jobs: ApplicationJobOption[];
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

function formatJobLabel(job: ApplicationJobOption) {
  const companyName = job.companies?.name ?? "会社未設定";
  const serviceName = job.services?.name ? ` / ${job.services.name}` : "";
  return `${companyName} - ${job.title}${serviceName}`;
}

export function ApplicationForm({
  action,
  application,
  jobs,
  submitLabel,
}: ApplicationFormProps) {
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
            <label className="text-sm font-medium text-ink" htmlFor="job_id">
              求人
            </label>
            <select
              aria-describedby={errors.job_id ? "job-id-error" : undefined}
              aria-invalid={Boolean(errors.job_id)}
              className={`${fieldClass(Boolean(errors.job_id))} bg-white`}
              defaultValue={values?.job_id ?? application?.job_id ?? ""}
              id="job_id"
              name="job_id"
            >
              <option value="">選択してください</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {formatJobLabel(job)}
                </option>
              ))}
            </select>
            <div id="job-id-error">
              <FieldError message={errors.job_id} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-ink" htmlFor="status">
              選考ステータス
            </label>
            <select
              aria-describedby={errors.status ? "status-error" : undefined}
              aria-invalid={Boolean(errors.status)}
              className={`${fieldClass(Boolean(errors.status))} bg-white`}
              defaultValue={
                values?.status ?? application?.status ?? APPLICATION_STATUSES[0]
              }
              id="status"
              name="status"
            >
              {APPLICATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <div id="status-error">
              <FieldError message={errors.status} />
            </div>
          </div>

          <div>
            <label
              className="text-sm font-medium text-ink"
              htmlFor="interest_level"
            >
              志望度
            </label>
            <select
              aria-describedby={
                errors.interest_level ? "interest-level-error" : undefined
              }
              aria-invalid={Boolean(errors.interest_level)}
              className={`${fieldClass(Boolean(errors.interest_level))} bg-white`}
              defaultValue={
                values?.interest_level ??
                application?.interest_level ??
                APPLICATION_INTEREST_LEVELS[1]
              }
              id="interest_level"
              name="interest_level"
            >
              {APPLICATION_INTEREST_LEVELS.map((interestLevel) => (
                <option key={interestLevel} value={interestLevel}>
                  {interestLevel}
                </option>
              ))}
            </select>
            <div id="interest-level-error">
              <FieldError message={errors.interest_level} />
            </div>
          </div>

          <div>
            <label
              className="text-sm font-medium text-ink"
              htmlFor="applied_at"
            >
              応募日
            </label>
            <input
              aria-describedby={
                errors.applied_at ? "applied-at-error" : undefined
              }
              aria-invalid={Boolean(errors.applied_at)}
              className={fieldClass(Boolean(errors.applied_at))}
              defaultValue={values?.applied_at ?? application?.applied_at ?? ""}
              id="applied_at"
              name="applied_at"
              type="date"
            />
            <div id="applied-at-error">
              <FieldError message={errors.applied_at} />
            </div>
          </div>

          <div>
            <label
              className="text-sm font-medium text-ink"
              htmlFor="next_deadline"
            >
              次回期限
            </label>
            <input
              aria-describedby={
                errors.next_deadline ? "next-deadline-error" : undefined
              }
              aria-invalid={Boolean(errors.next_deadline)}
              className={fieldClass(Boolean(errors.next_deadline))}
              defaultValue={
                values?.next_deadline ?? application?.next_deadline ?? ""
              }
              id="next_deadline"
              name="next_deadline"
              type="date"
            />
            <div id="next-deadline-error">
              <FieldError message={errors.next_deadline} />
            </div>
          </div>

          <div className="lg:col-span-2">
            <label
              className="text-sm font-medium text-ink"
              htmlFor="next_action"
            >
              次回アクション
            </label>
            <input
              className={fieldClass(false)}
              defaultValue={
                values?.next_action ?? application?.next_action ?? ""
              }
              id="next_action"
              name="next_action"
              placeholder="例: 書類提出、面接日程調整、結果待ち"
              type="text"
            />
          </div>
        </div>
      </Section>

      <Section title="メモ">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <label
              className="text-sm font-medium text-ink"
              htmlFor="selection_memo"
            >
              選考メモ
            </label>
            <textarea
              className="mt-2 min-h-32 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-ink"
              defaultValue={
                values?.selection_memo ?? application?.selection_memo ?? ""
              }
              id="selection_memo"
              name="selection_memo"
            />
          </div>

          <div>
            <label
              className="text-sm font-medium text-ink"
              htmlFor="decline_reason"
            >
              辞退理由
            </label>
            <textarea
              className="mt-2 min-h-28 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-ink"
              defaultValue={
                values?.decline_reason ?? application?.decline_reason ?? ""
              }
              id="decline_reason"
              name="decline_reason"
            />
          </div>

          <div>
            <label
              className="text-sm font-medium text-ink"
              htmlFor="rejection_reason"
            >
              不採用理由
            </label>
            <textarea
              className="mt-2 min-h-28 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-ink"
              defaultValue={
                values?.rejection_reason ?? application?.rejection_reason ?? ""
              }
              id="rejection_reason"
              name="rejection_reason"
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
