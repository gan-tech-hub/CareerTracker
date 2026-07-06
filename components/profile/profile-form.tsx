"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { ProfileActionState } from "@/app/profile/actions";
import {
  REMOTE_PREFERENCES,
  SIDE_JOB_PREFERENCES,
} from "@/lib/constants/profile";
import type { Database } from "@/lib/types/database";

type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];

type ProfileFormProps = {
  action: (
    previousState: ProfileActionState,
    formData: FormData,
  ) => Promise<ProfileActionState>;
  profile?: UserProfile | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "保存中" : "保存する"}
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

function TextField({
  error,
  label,
  name,
  profileValue,
  stateValue,
  type = "text",
}: {
  error?: string;
  label: string;
  name: string;
  profileValue?: number | string | null;
  stateValue?: string;
  type?: "number" | "text";
}) {
  return (
    <div>
      <label className="text-sm font-medium text-ink" htmlFor={name}>
        {label}
      </label>
      <input
        aria-describedby={error ? `${name}-error` : undefined}
        aria-invalid={Boolean(error)}
        className={fieldClass(Boolean(error))}
        defaultValue={stateValue ?? profileValue ?? ""}
        id={name}
        min={type === "number" ? 0 : undefined}
        name={name}
        type={type}
      />
      <div id={`${name}-error`}>
        <FieldError message={error} />
      </div>
    </div>
  );
}

function TextAreaField({
  label,
  name,
  profileValue,
  stateValue,
}: {
  label: string;
  name: string;
  profileValue?: string | null;
  stateValue?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-ink" htmlFor={name}>
        {label}
      </label>
      <textarea
        className="mt-2 min-h-28 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-ink"
        defaultValue={stateValue ?? profileValue ?? ""}
        id={name}
        name={name}
      />
    </div>
  );
}

export function ProfileForm({ action, profile }: ProfileFormProps) {
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

      <section>
        <h3 className="text-base font-semibold text-ink">基本情報</h3>
        <div className="mt-4 grid gap-5 lg:grid-cols-2">
          <TextField
            label="表示名"
            name="display_name"
            profileValue={profile?.display_name}
            stateValue={values?.display_name}
          />
          <TextField
            label="現在の職種・役割"
            name="current_position"
            profileValue={profile?.current_position}
            stateValue={values?.current_position}
          />
          <TextField
            label="希望職種"
            name="desired_role"
            profileValue={profile?.desired_role}
            stateValue={values?.desired_role}
          />
          <TextField
            label="希望業界"
            name="desired_industries"
            profileValue={profile?.desired_industries}
            stateValue={values?.desired_industries}
          />
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold text-ink">希望条件</h3>
        <div className="mt-4 grid gap-5 lg:grid-cols-2">
          <TextField
            error={errors.desired_salary_min}
            label="希望年収下限（万円）"
            name="desired_salary_min"
            profileValue={profile?.desired_salary_min}
            stateValue={values?.desired_salary_min}
            type="number"
          />
          <TextField
            error={errors.desired_salary_max}
            label="希望年収上限（万円）"
            name="desired_salary_max"
            profileValue={profile?.desired_salary_max}
            stateValue={values?.desired_salary_max}
            type="number"
          />
          <TextField
            label="希望勤務地"
            name="desired_locations"
            profileValue={profile?.desired_locations}
            stateValue={values?.desired_locations}
          />

          <div>
            <label
              className="text-sm font-medium text-ink"
              htmlFor="remote_preference"
            >
              リモート希望
            </label>
            <select
              aria-describedby={
                errors.remote_preference ? "remote_preference-error" : undefined
              }
              aria-invalid={Boolean(errors.remote_preference)}
              className={`${fieldClass(Boolean(errors.remote_preference))} bg-white`}
              defaultValue={
                values?.remote_preference ??
                profile?.remote_preference ??
                REMOTE_PREFERENCES[3]
              }
              id="remote_preference"
              name="remote_preference"
            >
              {REMOTE_PREFERENCES.map((preference) => (
                <option key={preference} value={preference}>
                  {preference}
                </option>
              ))}
            </select>
            <div id="remote_preference-error">
              <FieldError message={errors.remote_preference} />
            </div>
          </div>

          <div>
            <label
              className="text-sm font-medium text-ink"
              htmlFor="side_job_preference"
            >
              副業希望
            </label>
            <select
              aria-describedby={
                errors.side_job_preference
                  ? "side_job_preference-error"
                  : undefined
              }
              aria-invalid={Boolean(errors.side_job_preference)}
              className={`${fieldClass(Boolean(errors.side_job_preference))} bg-white`}
              defaultValue={
                values?.side_job_preference ??
                profile?.side_job_preference ??
                SIDE_JOB_PREFERENCES[3]
              }
              id="side_job_preference"
              name="side_job_preference"
            >
              {SIDE_JOB_PREFERENCES.map((preference) => (
                <option key={preference} value={preference}>
                  {preference}
                </option>
              ))}
            </select>
            <div id="side_job_preference-error">
              <FieldError message={errors.side_job_preference} />
            </div>
          </div>
        </div>
        <div className="mt-5">
          <TextAreaField
            label="働き方"
            name="work_style"
            profileValue={profile?.work_style}
            stateValue={values?.work_style}
          />
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold text-ink">転職軸・NG条件</h3>
        <div className="mt-4 grid gap-5 lg:grid-cols-2">
          <TextAreaField
            label="転職軸"
            name="career_axis"
            profileValue={profile?.career_axis}
            stateValue={values?.career_axis}
          />
          <TextAreaField
            label="避けたい条件"
            name="avoid_conditions"
            profileValue={profile?.avoid_conditions}
            stateValue={values?.avoid_conditions}
          />
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold text-ink">
          スキル・自己PR素材
        </h3>
        <div className="mt-4 grid gap-5 lg:grid-cols-2">
          <TextAreaField
            label="強み"
            name="strengths"
            profileValue={profile?.strengths}
            stateValue={values?.strengths}
          />
          <TextAreaField
            label="スキル"
            name="skills"
            profileValue={profile?.skills}
            stateValue={values?.skills}
          />
          <TextAreaField
            label="今後伸ばしたい領域"
            name="learning_interests"
            profileValue={profile?.learning_interests}
            stateValue={values?.learning_interests}
          />
          <TextAreaField
            label="自己PR素材"
            name="self_pr"
            profileValue={profile?.self_pr}
            stateValue={values?.self_pr}
          />
        </div>
      </section>

      <TextAreaField
        label="メモ"
        name="memo"
        profileValue={profile?.memo}
        stateValue={values?.memo}
      />

      <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
        <SubmitButton />
      </div>
    </form>
  );
}
