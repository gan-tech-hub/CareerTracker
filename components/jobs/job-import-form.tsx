"use client";

import { useMemo } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  analyzeJobPosting,
  createJobFromAnalysis,
  type AnalyzeJobPostingState,
  type ImportJobActionState,
} from "@/app/jobs/import/actions";
import type { JobPostingAnalysis } from "@/lib/ai/job-posting";
import {
  JOB_EMPLOYMENT_TYPES,
  JOB_PRIORITIES,
  JOB_REMOTE_TYPES,
  JOB_SIDE_JOB_OPTIONS,
} from "@/lib/constants/jobs";
import type { JobSelectOption } from "./job-types";

type JobImportFormProps = {
  companies: JobSelectOption[];
  services: JobSelectOption[];
};

type FieldErrorProps = {
  message?: string;
};

function FieldError({ message }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-red-700">{message}</p>;
}

function fieldClass(hasError = false) {
  return `mt-2 w-full rounded-md border px-3 py-2 text-sm outline-none transition focus:border-ink ${
    hasError ? "border-red-300 bg-red-50" : "border-border"
  }`;
}

function AnalyzeSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "解析中" : "AIで解析"}
    </button>
  );
}

function RegisterSubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={disabled || pending}
      type="submit"
    >
      {pending ? "登録中" : "求人として登録"}
    </button>
  );
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

function valueOrEmpty(value: string | number | null) {
  return value === null ? "" : String(value);
}

function SelectField({
  defaultValue,
  error,
  id,
  label,
  name,
  options,
}: {
  defaultValue: string;
  error?: string;
  id: string;
  label: string;
  name: string;
  options: readonly string[];
}) {
  return (
    <div>
      <label className="text-sm font-medium text-ink" htmlFor={id}>
        {label}
      </label>
      <select
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={Boolean(error)}
        className={`${fieldClass(Boolean(error))} bg-white`}
        defaultValue={defaultValue}
        id={id}
        name={name}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <div id={`${id}-error`}>
        <FieldError message={error} />
      </div>
    </div>
  );
}

function TextInputField({
  defaultValue,
  error,
  id,
  inputMode,
  label,
  name,
  placeholder,
}: {
  defaultValue: string;
  error?: string;
  id: string;
  inputMode?: "numeric";
  label: string;
  name: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-ink" htmlFor={id}>
        {label}
      </label>
      <input
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={Boolean(error)}
        className={fieldClass(Boolean(error))}
        defaultValue={defaultValue}
        id={id}
        inputMode={inputMode}
        name={name}
        placeholder={placeholder}
        type="text"
      />
      <div id={`${id}-error`}>
        <FieldError message={error} />
      </div>
    </div>
  );
}

function TextAreaField({
  defaultValue,
  id,
  label,
  name,
  rows = 4,
}: {
  defaultValue: string;
  id: string;
  label: string;
  name: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-ink" htmlFor={id}>
        {label}
      </label>
      <textarea
        className="mt-2 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-ink"
        defaultValue={defaultValue}
        id={id}
        name={name}
        rows={rows}
      />
    </div>
  );
}

function getInitialCompanyId(
  analysis: JobPostingAnalysis,
  companies: JobSelectOption[],
) {
  if (!analysis.company_name) {
    return "";
  }

  const normalizedCompanyName = analysis.company_name.trim().toLowerCase();
  return (
    companies.find(
      (company) => company.name.trim().toLowerCase() === normalizedCompanyName,
    )?.id ?? ""
  );
}

function ImportResultForm({
  analysis,
  companies,
  registerAction,
  registerState,
  services,
}: {
  analysis: AnalyzeJobPostingState["result"];
  companies: JobSelectOption[];
  registerAction: (formData: FormData) => void;
  registerState: ImportJobActionState;
  services: JobSelectOption[];
}) {
  const result = analysis?.result;
  const source = analysis?.source;
  const warnings = analysis?.warnings ?? [];
  const errors = registerState.fieldErrors ?? {};
  const initialCompanyId = useMemo(
    () => (result ? getInitialCompanyId(result, companies) : ""),
    [companies, result],
  );

  if (!result || !analysis) {
    return null;
  }

  const isRegistrationDisabled = companies.length === 0;

  return (
    <form action={registerAction} className="space-y-8" noValidate>
      <div className="rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded bg-white px-2 py-1 text-xs font-semibold uppercase tracking-wide text-blue-800">
            {source === "openai" ? "OpenAI" : "Mock"}
          </span>
          <span>解析結果を確認し、必要に応じて修正してください。</span>
        </div>
        {warnings.length > 0 ? (
          <ul className="mt-3 list-disc space-y-1 pl-5">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : null}
      </div>

      {registerState.formError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {registerState.formError}
        </p>
      ) : null}

      {isRegistrationDisabled ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          求人登録には会社の選択が必要です。先に会社を登録してください。
        </p>
      ) : null}

      {result.company_name ? (
        <div className="rounded-md border border-border bg-surface px-4 py-3 text-sm text-muted">
          AIが抽出した会社名:{" "}
          <span className="font-medium text-ink">{result.company_name}</span>
          。登録先の会社は下の選択欄で確認してください。
        </div>
      ) : null}

      <Section title="基本情報">
        <div className="grid gap-5 lg:grid-cols-2">
          <TextInputField
            defaultValue={valueOrEmpty(result.title)}
            error={errors.title}
            id="import-title"
            label="求人タイトル"
            name="title"
          />

          <div>
            <label
              className="text-sm font-medium text-ink"
              htmlFor="import-company-id"
            >
              会社
            </label>
            <select
              aria-describedby={
                errors.company_id ? "import-company-id-error" : undefined
              }
              aria-invalid={Boolean(errors.company_id)}
              className={`${fieldClass(Boolean(errors.company_id))} bg-white`}
              defaultValue={initialCompanyId}
              id="import-company-id"
              name="company_id"
            >
              <option value="">選択してください</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            <div id="import-company-id-error">
              <FieldError message={errors.company_id} />
            </div>
          </div>

          <div>
            <label
              className="text-sm font-medium text-ink"
              htmlFor="import-service-id"
            >
              転職サービス
            </label>
            <select
              aria-describedby={
                errors.service_id ? "import-service-id-error" : undefined
              }
              aria-invalid={Boolean(errors.service_id)}
              className={`${fieldClass(Boolean(errors.service_id))} bg-white`}
              defaultValue=""
              id="import-service-id"
              name="service_id"
            >
              <option value="">未選択</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
            <div id="import-service-id-error">
              <FieldError message={errors.service_id} />
            </div>
          </div>

          <TextInputField
            defaultValue={valueOrEmpty(result.job_url)}
            error={errors.job_url}
            id="import-job-url"
            label="求人URL"
            name="job_url"
            placeholder="https://example.com/jobs/123"
          />

          <TextInputField
            defaultValue={valueOrEmpty(result.job_type)}
            id="import-job-type"
            label="職種"
            name="job_type"
          />

          <SelectField
            defaultValue={result.employment_type ?? JOB_EMPLOYMENT_TYPES[0]}
            error={errors.employment_type}
            id="import-employment-type"
            label="雇用形態"
            name="employment_type"
            options={JOB_EMPLOYMENT_TYPES}
          />
        </div>
      </Section>

      <Section title="条件">
        <div className="grid gap-5 lg:grid-cols-3">
          <TextInputField
            defaultValue={valueOrEmpty(result.salary_min)}
            error={errors.salary_min}
            id="import-salary-min"
            inputMode="numeric"
            label="年収下限（万円）"
            name="salary_min"
          />

          <TextInputField
            defaultValue={valueOrEmpty(result.salary_max)}
            error={errors.salary_max}
            id="import-salary-max"
            inputMode="numeric"
            label="年収上限（万円）"
            name="salary_max"
          />

          <TextInputField
            defaultValue={valueOrEmpty(result.location)}
            id="import-location"
            label="勤務地"
            name="location"
          />

          <SelectField
            defaultValue={result.remote_type ?? JOB_REMOTE_TYPES[3]}
            error={errors.remote_type}
            id="import-remote-type"
            label="リモート可否"
            name="remote_type"
            options={JOB_REMOTE_TYPES}
          />

          <SelectField
            defaultValue={result.side_job_allowed ?? JOB_SIDE_JOB_OPTIONS[3]}
            error={errors.side_job_allowed}
            id="import-side-job-allowed"
            label="副業可否"
            name="side_job_allowed"
            options={JOB_SIDE_JOB_OPTIONS}
          />

          <SelectField
            defaultValue={result.priority ?? JOB_PRIORITIES[1]}
            error={errors.priority}
            id="import-priority"
            label="優先度"
            name="priority"
            options={JOB_PRIORITIES}
          />
        </div>
      </Section>

      <Section title="詳細メモ">
        <div className="grid gap-5 lg:grid-cols-2">
          <TextAreaField
            defaultValue={valueOrEmpty(result.required_skills)}
            id="import-required-skills"
            label="必須スキル"
            name="required_skills"
          />

          <TextAreaField
            defaultValue={valueOrEmpty(result.preferred_skills)}
            id="import-preferred-skills"
            label="歓迎スキル"
            name="preferred_skills"
          />

          <TextAreaField
            defaultValue={valueOrEmpty(result.description)}
            id="import-description"
            label="業務内容"
            name="description"
            rows={5}
          />

          <TextAreaField
            defaultValue={valueOrEmpty(result.attractive_points)}
            id="import-attractive-points"
            label="魅力ポイント"
            name="attractive_points"
            rows={5}
          />

          <TextAreaField
            defaultValue={valueOrEmpty(result.concerns)}
            id="import-concerns"
            label="懸念点"
            name="concerns"
          />

          <TextAreaField
            defaultValue={valueOrEmpty(result.memo)}
            id="import-memo"
            label="メモ"
            name="memo"
          />
        </div>
      </Section>

      <div className="flex items-center justify-end border-t border-border pt-5">
        <RegisterSubmitButton disabled={isRegistrationDisabled} />
      </div>
    </form>
  );
}

export function JobImportForm({ companies, services }: JobImportFormProps) {
  const [analyzeState, analyzeAction] = useActionState<
    AnalyzeJobPostingState,
    FormData
  >(analyzeJobPosting, {});
  const [registerState, registerAction] = useActionState<
    ImportJobActionState,
    FormData
  >(
    createJobFromAnalysis,
    {},
  );
  const analyzeErrors = analyzeState.fieldErrors ?? {};

  return (
    <div className="space-y-6">
      <form action={analyzeAction} className="space-y-5" noValidate>
        {analyzeState.formError ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {analyzeState.formError}
          </p>
        ) : null}

        <div>
          <label className="text-sm font-medium text-ink" htmlFor="source-url">
            求人URL
          </label>
          <input
            aria-describedby={
              analyzeErrors.source_url ? "source-url-error" : undefined
            }
            aria-invalid={Boolean(analyzeErrors.source_url)}
            className={fieldClass(Boolean(analyzeErrors.source_url))}
            defaultValue={analyzeState.values?.source_url ?? ""}
            id="source-url"
            name="source_url"
            placeholder="https://example.com/jobs/123"
            type="text"
          />
          <div id="source-url-error">
            <FieldError message={analyzeErrors.source_url} />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-ink" htmlFor="source-text">
            求人票本文
          </label>
          <textarea
            aria-describedby={
              analyzeErrors.source_text ? "source-text-error" : undefined
            }
            aria-invalid={Boolean(analyzeErrors.source_text)}
            className={`${fieldClass(Boolean(analyzeErrors.source_text))} min-h-64`}
            defaultValue={analyzeState.values?.source_text ?? ""}
            id="source-text"
            name="source_text"
            placeholder="求人票の本文を貼り付けてください。仕事内容、必須スキル、歓迎スキル、給与、勤務地などが含まれているほど解析しやすくなります。"
          />
          <div id="source-text-error">
            <FieldError message={analyzeErrors.source_text} />
          </div>
        </div>

        <div className="flex justify-end">
          <AnalyzeSubmitButton />
        </div>
      </form>

      {analyzeState.result ? (
        <div className="border-t border-border pt-6">
          <ImportResultForm
            analysis={analyzeState.result}
            companies={companies}
            registerAction={registerAction}
            registerState={registerState}
            services={services}
          />
        </div>
      ) : null}
    </div>
  );
}
