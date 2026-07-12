"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { CareerExperienceActionState } from "@/app/career/experiences/actions";
import { CAREER_EMPLOYMENT_TYPES } from "@/lib/constants/career";
import type { Database } from "@/lib/types/database";

type CareerExperience =
  Database["public"]["Tables"]["career_experiences"]["Row"];

type CareerExperienceFormProps = {
  action: (
    previousState: CareerExperienceActionState,
    formData: FormData,
  ) => Promise<CareerExperienceActionState>;
  experience?: CareerExperience;
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

function textAreaClass() {
  return "mt-2 min-h-28 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-ink";
}

export function CareerExperienceForm({
  action,
  experience,
  submitLabel,
}: CareerExperienceFormProps) {
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

      <section className="space-y-5">
        <h3 className="border-b border-border pb-2 text-sm font-semibold text-ink">
          基本情報
        </h3>
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label
              className="text-sm font-medium text-ink"
              htmlFor="company_name"
            >
              会社名
            </label>
            <input
              aria-describedby={
                errors.company_name ? "company-name-error" : undefined
              }
              aria-invalid={Boolean(errors.company_name)}
              className={fieldClass(Boolean(errors.company_name))}
              defaultValue={
                values?.company_name ?? experience?.company_name ?? ""
              }
              id="company_name"
              name="company_name"
              type="text"
            />
            <div id="company-name-error">
              <FieldError message={errors.company_name} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-ink" htmlFor="position">
              役職・役割
            </label>
            <input
              className={fieldClass(false)}
              defaultValue={values?.position ?? experience?.position ?? ""}
              id="position"
              name="position"
              type="text"
            />
          </div>

          <div>
            <label
              className="text-sm font-medium text-ink"
              htmlFor="department"
            >
              部署
            </label>
            <input
              className={fieldClass(false)}
              defaultValue={values?.department ?? experience?.department ?? ""}
              id="department"
              name="department"
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
              defaultValue={
                values?.employment_type ??
                experience?.employment_type ??
                CAREER_EMPLOYMENT_TYPES[0]
              }
              id="employment_type"
              name="employment_type"
            >
              {CAREER_EMPLOYMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <div id="employment-type-error">
              <FieldError message={errors.employment_type} />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <h3 className="border-b border-border pb-2 text-sm font-semibold text-ink">
          期間
        </h3>
        <div className="grid gap-5 lg:grid-cols-3">
          <div>
            <label
              className="text-sm font-medium text-ink"
              htmlFor="start_date"
            >
              開始日
            </label>
            <input
              aria-describedby={
                errors.start_date ? "start-date-error" : undefined
              }
              aria-invalid={Boolean(errors.start_date)}
              className={fieldClass(Boolean(errors.start_date))}
              defaultValue={values?.start_date ?? experience?.start_date ?? ""}
              id="start_date"
              name="start_date"
              type="date"
            />
            <div id="start-date-error">
              <FieldError message={errors.start_date} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-ink" htmlFor="end_date">
              終了日
            </label>
            <input
              aria-describedby={errors.end_date ? "end-date-error" : undefined}
              aria-invalid={Boolean(errors.end_date)}
              className={fieldClass(Boolean(errors.end_date))}
              defaultValue={values?.end_date ?? experience?.end_date ?? ""}
              id="end_date"
              name="end_date"
              type="date"
            />
            <div id="end-date-error">
              <FieldError message={errors.end_date} />
            </div>
          </div>

          <label className="flex items-center gap-2 self-end rounded-md border border-border px-3 py-2 text-sm text-ink">
            <input
              defaultChecked={
                values ? values.is_current === "on" : experience?.is_current
              }
              name="is_current"
              type="checkbox"
            />
            現職
          </label>
        </div>
      </section>

      <section className="space-y-5">
        <h3 className="border-b border-border pb-2 text-sm font-semibold text-ink">
          経験内容
        </h3>
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-ink" htmlFor="summary">
              概要
            </label>
            <textarea
              className={textAreaClass()}
              defaultValue={values?.summary ?? experience?.summary ?? ""}
              id="summary"
              name="summary"
            />
          </div>

          <div>
            <label
              className="text-sm font-medium text-ink"
              htmlFor="technologies"
            >
              使用技術
            </label>
            <textarea
              className={textAreaClass()}
              defaultValue={
                values?.technologies ?? experience?.technologies ?? ""
              }
              id="technologies"
              name="technologies"
            />
          </div>

          <div>
            <label
              className="text-sm font-medium text-ink"
              htmlFor="responsibilities"
            >
              担当業務
            </label>
            <textarea
              className={textAreaClass()}
              defaultValue={
                values?.responsibilities ?? experience?.responsibilities ?? ""
              }
              id="responsibilities"
              name="responsibilities"
            />
          </div>

          <div>
            <label
              className="text-sm font-medium text-ink"
              htmlFor="achievements"
            >
              実績
            </label>
            <textarea
              className={textAreaClass()}
              defaultValue={
                values?.achievements ?? experience?.achievements ?? ""
              }
              id="achievements"
              name="achievements"
            />
          </div>
        </div>
      </section>

      <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
