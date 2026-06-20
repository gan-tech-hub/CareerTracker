"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { JobActionState } from "@/app/jobs/actions";
import {
  JOB_EMPLOYMENT_TYPES,
  JOB_PRIORITIES,
  JOB_REMOTE_TYPES,
  JOB_SIDE_JOB_OPTIONS,
} from "@/lib/constants/jobs";
import type { Database } from "@/lib/types/database";
import type { JobSelectOption } from "./job-types";

type Job = Database["public"]["Tables"]["jobs"]["Row"];

type JobFormProps = {
  action: (
    previousState: JobActionState,
    formData: FormData,
  ) => Promise<JobActionState>;
  companies: JobSelectOption[];
  job?: Job;
  services: JobSelectOption[];
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

export function JobForm({
  action,
  companies,
  job,
  services,
  submitLabel,
}: JobFormProps) {
  const [state, formAction] = useActionState(action, {});
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-8" noValidate>
      {state.formError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.formError}
        </p>
      ) : null}

      <Section title="基本情報">
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-ink" htmlFor="title">
              求人タイトル
            </label>
            <input
              aria-describedby={errors.title ? "title-error" : undefined}
              aria-invalid={Boolean(errors.title)}
              className={fieldClass(Boolean(errors.title))}
              defaultValue={job?.title ?? ""}
              id="title"
              name="title"
              type="text"
            />
            <div id="title-error">
              <FieldError message={errors.title} />
            </div>
          </div>

          <div>
            <label
              className="text-sm font-medium text-ink"
              htmlFor="company_id"
            >
              会社
            </label>
            <select
              aria-describedby={
                errors.company_id ? "company-id-error" : undefined
              }
              aria-invalid={Boolean(errors.company_id)}
              className={`${fieldClass(Boolean(errors.company_id))} bg-white`}
              defaultValue={job?.company_id ?? ""}
              id="company_id"
              name="company_id"
            >
              <option value="">選択してください</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            <div id="company-id-error">
              <FieldError message={errors.company_id} />
            </div>
          </div>

          <div>
            <label
              className="text-sm font-medium text-ink"
              htmlFor="service_id"
            >
              転職サービス
            </label>
            <select
              aria-describedby={
                errors.service_id ? "service-id-error" : undefined
              }
              aria-invalid={Boolean(errors.service_id)}
              className={`${fieldClass(Boolean(errors.service_id))} bg-white`}
              defaultValue={job?.service_id ?? ""}
              id="service_id"
              name="service_id"
            >
              <option value="">未選択</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
            <div id="service-id-error">
              <FieldError message={errors.service_id} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-ink" htmlFor="job_url">
              求人URL
            </label>
            <input
              aria-describedby={errors.job_url ? "job-url-error" : undefined}
              aria-invalid={Boolean(errors.job_url)}
              className={fieldClass(Boolean(errors.job_url))}
              defaultValue={job?.job_url ?? ""}
              id="job_url"
              name="job_url"
              placeholder="https://example.com/jobs/123"
              type="text"
            />
            <div id="job-url-error">
              <FieldError message={errors.job_url} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-ink" htmlFor="job_type">
              職種
            </label>
            <input
              className={fieldClass(false)}
              defaultValue={job?.job_type ?? ""}
              id="job_type"
              name="job_type"
              placeholder="バックエンドエンジニアなど"
              type="text"
            />
          </div>

          <div>
            <label
              className="text-sm font-medium text-ink"
              htmlFor="employment_type"
            >
              雇用形態
            </label>
            <select
              aria-describedby={
                errors.employment_type ? "employment-type-error" : undefined
              }
              aria-invalid={Boolean(errors.employment_type)}
              className={`${fieldClass(Boolean(errors.employment_type))} bg-white`}
              defaultValue={job?.employment_type ?? JOB_EMPLOYMENT_TYPES[0]}
              id="employment_type"
              name="employment_type"
            >
              {JOB_EMPLOYMENT_TYPES.map((employmentType) => (
                <option key={employmentType} value={employmentType}>
                  {employmentType}
                </option>
              ))}
            </select>
            <div id="employment-type-error">
              <FieldError message={errors.employment_type} />
            </div>
          </div>
        </div>
      </Section>

      <Section title="条件">
        <div className="grid gap-5 lg:grid-cols-3">
          <div>
            <label
              className="text-sm font-medium text-ink"
              htmlFor="salary_min"
            >
              年収下限（万円）
            </label>
            <input
              aria-describedby={
                errors.salary_min ? "salary-min-error" : undefined
              }
              aria-invalid={Boolean(errors.salary_min)}
              className={fieldClass(Boolean(errors.salary_min))}
              defaultValue={job?.salary_min ?? ""}
              id="salary_min"
              inputMode="numeric"
              name="salary_min"
              type="text"
            />
            <div id="salary-min-error">
              <FieldError message={errors.salary_min} />
            </div>
          </div>

          <div>
            <label
              className="text-sm font-medium text-ink"
              htmlFor="salary_max"
            >
              年収上限（万円）
            </label>
            <input
              aria-describedby={
                errors.salary_max ? "salary-max-error" : undefined
              }
              aria-invalid={Boolean(errors.salary_max)}
              className={fieldClass(Boolean(errors.salary_max))}
              defaultValue={job?.salary_max ?? ""}
              id="salary_max"
              inputMode="numeric"
              name="salary_max"
              type="text"
            />
            <div id="salary-max-error">
              <FieldError message={errors.salary_max} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-ink" htmlFor="location">
              勤務地
            </label>
            <input
              className={fieldClass(false)}
              defaultValue={job?.location ?? ""}
              id="location"
              name="location"
              placeholder="東京都、フルリモートなど"
              type="text"
            />
          </div>

          <div>
            <label
              className="text-sm font-medium text-ink"
              htmlFor="remote_type"
            >
              リモート可否
            </label>
            <select
              aria-describedby={
                errors.remote_type ? "remote-type-error" : undefined
              }
              aria-invalid={Boolean(errors.remote_type)}
              className={`${fieldClass(Boolean(errors.remote_type))} bg-white`}
              defaultValue={job?.remote_type ?? JOB_REMOTE_TYPES[3]}
              id="remote_type"
              name="remote_type"
            >
              {JOB_REMOTE_TYPES.map((remoteType) => (
                <option key={remoteType} value={remoteType}>
                  {remoteType}
                </option>
              ))}
            </select>
            <div id="remote-type-error">
              <FieldError message={errors.remote_type} />
            </div>
          </div>

          <div>
            <label
              className="text-sm font-medium text-ink"
              htmlFor="side_job_allowed"
            >
              副業可否
            </label>
            <select
              aria-describedby={
                errors.side_job_allowed
                  ? "side-job-allowed-error"
                  : undefined
              }
              aria-invalid={Boolean(errors.side_job_allowed)}
              className={`${fieldClass(Boolean(errors.side_job_allowed))} bg-white`}
              defaultValue={job?.side_job_allowed ?? JOB_SIDE_JOB_OPTIONS[3]}
              id="side_job_allowed"
              name="side_job_allowed"
            >
              {JOB_SIDE_JOB_OPTIONS.map((sideJobAllowed) => (
                <option key={sideJobAllowed} value={sideJobAllowed}>
                  {sideJobAllowed}
                </option>
              ))}
            </select>
            <div id="side-job-allowed-error">
              <FieldError message={errors.side_job_allowed} />
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
              defaultValue={job?.priority ?? JOB_PRIORITIES[1]}
              id="priority"
              name="priority"
            >
              {JOB_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
            <div id="priority-error">
              <FieldError message={errors.priority} />
            </div>
          </div>
        </div>
      </Section>

      <Section title="詳細メモ">
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label
              className="text-sm font-medium text-ink"
              htmlFor="required_skills"
            >
              必須スキル
            </label>
            <textarea
              className="mt-2 min-h-28 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-ink"
              defaultValue={job?.required_skills ?? ""}
              id="required_skills"
              name="required_skills"
            />
          </div>

          <div>
            <label
              className="text-sm font-medium text-ink"
              htmlFor="preferred_skills"
            >
              歓迎スキル
            </label>
            <textarea
              className="mt-2 min-h-28 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-ink"
              defaultValue={job?.preferred_skills ?? ""}
              id="preferred_skills"
              name="preferred_skills"
            />
          </div>

          <div>
            <label
              className="text-sm font-medium text-ink"
              htmlFor="description"
            >
              業務内容
            </label>
            <textarea
              className="mt-2 min-h-32 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-ink"
              defaultValue={job?.description ?? ""}
              id="description"
              name="description"
            />
          </div>

          <div>
            <label
              className="text-sm font-medium text-ink"
              htmlFor="attractive_points"
            >
              魅力ポイント
            </label>
            <textarea
              className="mt-2 min-h-32 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-ink"
              defaultValue={job?.attractive_points ?? ""}
              id="attractive_points"
              name="attractive_points"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-ink" htmlFor="concerns">
              懸念点
            </label>
            <textarea
              className="mt-2 min-h-28 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-ink"
              defaultValue={job?.concerns ?? ""}
              id="concerns"
              name="concerns"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-ink" htmlFor="memo">
              メモ
            </label>
            <textarea
              className="mt-2 min-h-28 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-ink"
              defaultValue={job?.memo ?? ""}
              id="memo"
              name="memo"
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
