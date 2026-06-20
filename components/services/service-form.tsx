"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { SERVICE_STATUSES, SERVICE_TYPES } from "@/lib/constants/services";
import type { ServiceActionState } from "@/app/services/actions";
import type { Database } from "@/lib/types/database";

type Service = Database["public"]["Tables"]["services"]["Row"];

type ServiceFormProps = {
  action: (
    previousState: ServiceActionState,
    formData: FormData,
  ) => Promise<ServiceActionState>;
  service?: Service;
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

export function ServiceForm({
  action,
  service,
  submitLabel,
}: ServiceFormProps) {
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
            サービス名
          </label>
          <input
            aria-describedby={errors.name ? "name-error" : undefined}
            aria-invalid={Boolean(errors.name)}
            className={fieldClass(Boolean(errors.name))}
            defaultValue={values?.name ?? service?.name ?? ""}
            id="name"
            name="name"
            type="text"
          />
          <div id="name-error">
            <FieldError message={errors.name} />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-ink" htmlFor="type">
            種別
          </label>
          <select
            aria-describedby={errors.type ? "type-error" : undefined}
            aria-invalid={Boolean(errors.type)}
            className={`${fieldClass(Boolean(errors.type))} bg-white`}
            defaultValue={values?.type ?? service?.type ?? SERVICE_TYPES[0]}
            id="type"
            name="type"
          >
            {SERVICE_TYPES.map((type) => (
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
          <label className="text-sm font-medium text-ink" htmlFor="status">
            利用状況
          </label>
          <select
            aria-describedby={errors.status ? "status-error" : undefined}
            aria-invalid={Boolean(errors.status)}
            className={`${fieldClass(Boolean(errors.status))} bg-white`}
            defaultValue={
              values?.status ?? service?.status ?? SERVICE_STATUSES[0]
            }
            id="status"
            name="status"
          >
            {SERVICE_STATUSES.map((status) => (
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
          <label className="text-sm font-medium text-ink" htmlFor="login_url">
            ログインURL
          </label>
          <input
            aria-describedby={errors.login_url ? "login-url-error" : undefined}
            aria-invalid={Boolean(errors.login_url)}
            className={fieldClass(Boolean(errors.login_url))}
            defaultValue={values?.login_url ?? service?.login_url ?? ""}
            id="login_url"
            name="login_url"
            placeholder="https://example.com"
            type="text"
          />
          <div id="login-url-error">
            <FieldError message={errors.login_url} />
          </div>
        </div>

        <div>
          <label
            className="text-sm font-medium text-ink"
            htmlFor="registered_email"
          >
            登録メール
          </label>
          <input
            aria-describedby={
              errors.registered_email ? "registered-email-error" : undefined
            }
            aria-invalid={Boolean(errors.registered_email)}
            className={fieldClass(Boolean(errors.registered_email))}
            defaultValue={
              values?.registered_email ?? service?.registered_email ?? ""
            }
            id="registered_email"
            name="registered_email"
            type="text"
          />
          <div id="registered-email-error">
            <FieldError message={errors.registered_email} />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-ink" htmlFor="login_id">
            ログインID
          </label>
          <input
            className={fieldClass(false)}
            defaultValue={values?.login_id ?? service?.login_id ?? ""}
            id="login_id"
            name="login_id"
            type="text"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-ink" htmlFor="memo">
          メモ
        </label>
        <textarea
          className="mt-2 min-h-32 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-ink"
          defaultValue={values?.memo ?? service?.memo ?? ""}
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
