"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { CompanyActionState } from "@/app/companies/actions";
import { COMPANY_INTEREST_LEVELS } from "@/lib/constants/companies";
import type { Database } from "@/lib/types/database";

type Company = Database["public"]["Tables"]["companies"]["Row"];

type CompanyFormProps = {
  action: (
    previousState: CompanyActionState,
    formData: FormData,
  ) => Promise<CompanyActionState>;
  company?: Company;
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

export function CompanyForm({
  action,
  company,
  submitLabel,
}: CompanyFormProps) {
  const [state, formAction] = useActionState(action, {});
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {state.formError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.formError}
        </p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-ink" htmlFor="name">
            会社名
          </label>
          <input
            aria-describedby={errors.name ? "name-error" : undefined}
            aria-invalid={Boolean(errors.name)}
            className={fieldClass(Boolean(errors.name))}
            defaultValue={company?.name ?? ""}
            id="name"
            name="name"
            type="text"
          />
          <div id="name-error">
            <FieldError message={errors.name} />
          </div>
        </div>

        <div>
          <label
            className="text-sm font-medium text-ink"
            htmlFor="interest_level"
          >
            関心度
          </label>
          <select
            aria-describedby={
              errors.interest_level ? "interest-level-error" : undefined
            }
            aria-invalid={Boolean(errors.interest_level)}
            className={`${fieldClass(Boolean(errors.interest_level))} bg-white`}
            defaultValue={company?.interest_level ?? COMPANY_INTEREST_LEVELS[1]}
            id="interest_level"
            name="interest_level"
          >
            {COMPANY_INTEREST_LEVELS.map((interestLevel) => (
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
          <label className="text-sm font-medium text-ink" htmlFor="industry">
            業種
          </label>
          <input
            className={fieldClass(false)}
            defaultValue={company?.industry ?? ""}
            id="industry"
            name="industry"
            placeholder="SaaS、SIer、製造業など"
            type="text"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-ink" htmlFor="location">
            所在地
          </label>
          <input
            className={fieldClass(false)}
            defaultValue={company?.location ?? ""}
            id="location"
            name="location"
            placeholder="東京都、フルリモートなど"
            type="text"
          />
        </div>

        <div>
          <label
            className="text-sm font-medium text-ink"
            htmlFor="corporate_url"
          >
            企業URL
          </label>
          <input
            aria-describedby={
              errors.corporate_url ? "corporate-url-error" : undefined
            }
            aria-invalid={Boolean(errors.corporate_url)}
            className={fieldClass(Boolean(errors.corporate_url))}
            defaultValue={company?.corporate_url ?? ""}
            id="corporate_url"
            name="corporate_url"
            placeholder="https://example.com"
            type="text"
          />
          <div id="corporate-url-error">
            <FieldError message={errors.corporate_url} />
          </div>
        </div>

        <div>
          <label
            className="text-sm font-medium text-ink"
            htmlFor="recruitment_url"
          >
            採用ページURL
          </label>
          <input
            aria-describedby={
              errors.recruitment_url ? "recruitment-url-error" : undefined
            }
            aria-invalid={Boolean(errors.recruitment_url)}
            className={fieldClass(Boolean(errors.recruitment_url))}
            defaultValue={company?.recruitment_url ?? ""}
            id="recruitment_url"
            name="recruitment_url"
            placeholder="https://example.com/recruit"
            type="text"
          />
          <div id="recruitment-url-error">
            <FieldError message={errors.recruitment_url} />
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-ink" htmlFor="concerns">
          懸念点
        </label>
        <textarea
          className="mt-2 min-h-28 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-ink"
          defaultValue={company?.concerns ?? ""}
          id="concerns"
          name="concerns"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-ink" htmlFor="memo">
          メモ
        </label>
        <textarea
          className="mt-2 min-h-32 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-ink"
          defaultValue={company?.memo ?? ""}
          id="memo"
          name="memo"
        />
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
