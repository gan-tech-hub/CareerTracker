"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { CareerSkillActionState } from "@/app/career/skills/actions";
import {
  CAREER_SKILL_CATEGORIES,
  CAREER_SKILL_LEVELS,
} from "@/lib/constants/career";
import type { Database } from "@/lib/types/database";

type CareerSkill = Database["public"]["Tables"]["career_skills"]["Row"];

type CareerSkillFormProps = {
  action: (
    previousState: CareerSkillActionState,
    formData: FormData,
  ) => Promise<CareerSkillActionState>;
  skill?: CareerSkill;
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

export function CareerSkillForm({
  action,
  skill,
  submitLabel,
}: CareerSkillFormProps) {
  const [state, formAction] = useActionState(action, {});
  const errors = state.fieldErrors ?? {};
  const values = state.values;

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
            スキル名
          </label>
          <input
            aria-describedby={errors.name ? "name-error" : undefined}
            aria-invalid={Boolean(errors.name)}
            className={fieldClass(Boolean(errors.name))}
            defaultValue={values?.name ?? skill?.name ?? ""}
            id="name"
            name="name"
            type="text"
          />
          <div id="name-error">
            <FieldError message={errors.name} />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-ink" htmlFor="category">
            カテゴリ
          </label>
          <select
            aria-describedby={errors.category ? "category-error" : undefined}
            aria-invalid={Boolean(errors.category)}
            className={`${fieldClass(Boolean(errors.category))} bg-white`}
            defaultValue={
              values?.category ?? skill?.category ?? CAREER_SKILL_CATEGORIES[0]
            }
            id="category"
            name="category"
          >
            {CAREER_SKILL_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <div id="category-error">
            <FieldError message={errors.category} />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-ink" htmlFor="skill_level">
            レベル
          </label>
          <select
            aria-describedby={
              errors.skill_level ? "skill-level-error" : undefined
            }
            aria-invalid={Boolean(errors.skill_level)}
            className={`${fieldClass(Boolean(errors.skill_level))} bg-white`}
            defaultValue={
              values?.skill_level ?? skill?.skill_level ?? CAREER_SKILL_LEVELS[0]
            }
            id="skill_level"
            name="skill_level"
          >
            {CAREER_SKILL_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          <div id="skill-level-error">
            <FieldError message={errors.skill_level} />
          </div>
        </div>

        <div>
          <label
            className="text-sm font-medium text-ink"
            htmlFor="years_of_experience"
          >
            経験年数
          </label>
          <input
            aria-describedby={
              errors.years_of_experience
                ? "years-of-experience-error"
                : undefined
            }
            aria-invalid={Boolean(errors.years_of_experience)}
            className={fieldClass(Boolean(errors.years_of_experience))}
            defaultValue={
              values?.years_of_experience ?? skill?.years_of_experience ?? ""
            }
            id="years_of_experience"
            inputMode="decimal"
            name="years_of_experience"
            type="text"
          />
          <div id="years-of-experience-error">
            <FieldError message={errors.years_of_experience} />
          </div>
        </div>

        <div>
          <label
            className="text-sm font-medium text-ink"
            htmlFor="last_used_year"
          >
            最終利用年
          </label>
          <input
            aria-describedby={
              errors.last_used_year ? "last-used-year-error" : undefined
            }
            aria-invalid={Boolean(errors.last_used_year)}
            className={fieldClass(Boolean(errors.last_used_year))}
            defaultValue={values?.last_used_year ?? skill?.last_used_year ?? ""}
            id="last_used_year"
            inputMode="numeric"
            name="last_used_year"
            placeholder="2026"
            type="text"
          />
          <div id="last-used-year-error">
            <FieldError message={errors.last_used_year} />
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-ink" htmlFor="description">
          説明
        </label>
        <textarea
          className="mt-2 min-h-32 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-ink"
          defaultValue={values?.description ?? skill?.description ?? ""}
          id="description"
          name="description"
        />
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
