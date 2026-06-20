"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { ContactActionState } from "@/app/contacts/actions";
import { CONTACT_ROLES } from "@/lib/constants/contacts";
import type { Database } from "@/lib/types/database";

type Contact = Database["public"]["Tables"]["contacts"]["Row"];

export type ContactSelectOption = {
  id: string;
  name: string;
};

type ContactFormProps = {
  action: (
    previousState: ContactActionState,
    formData: FormData,
  ) => Promise<ContactActionState>;
  companies: ContactSelectOption[];
  contact?: Contact;
  services: ContactSelectOption[];
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

export function ContactForm({
  action,
  companies,
  contact,
  services,
  submitLabel,
}: ContactFormProps) {
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
            氏名
          </label>
          <input
            aria-describedby={errors.name ? "name-error" : undefined}
            aria-invalid={Boolean(errors.name)}
            className={fieldClass(Boolean(errors.name))}
            defaultValue={values?.name ?? contact?.name ?? ""}
            id="name"
            name="name"
            type="text"
          />
          <div id="name-error">
            <FieldError message={errors.name} />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-ink" htmlFor="role">
            役割
          </label>
          <select
            aria-describedby={errors.role ? "role-error" : undefined}
            aria-invalid={Boolean(errors.role)}
            className={`${fieldClass(Boolean(errors.role))} bg-white`}
            defaultValue={values?.role ?? contact?.role ?? CONTACT_ROLES[0]}
            id="role"
            name="role"
          >
            {CONTACT_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <div id="role-error">
            <FieldError message={errors.role} />
          </div>
        </div>

        <div>
          <label
            className="text-sm font-medium text-ink"
            htmlFor="organization"
          >
            所属
          </label>
          <input
            className={fieldClass(false)}
            defaultValue={values?.organization ?? contact?.organization ?? ""}
            id="organization"
            name="organization"
            placeholder="企業名、部署名、エージェント名など"
            type="text"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-ink" htmlFor="email">
            メールアドレス
          </label>
          <input
            aria-describedby={errors.email ? "email-error" : undefined}
            aria-invalid={Boolean(errors.email)}
            className={fieldClass(Boolean(errors.email))}
            defaultValue={values?.email ?? contact?.email ?? ""}
            id="email"
            name="email"
            type="text"
          />
          <div id="email-error">
            <FieldError message={errors.email} />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-ink" htmlFor="phone">
            電話番号
          </label>
          <input
            className={fieldClass(false)}
            defaultValue={values?.phone ?? contact?.phone ?? ""}
            id="phone"
            name="phone"
            type="text"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-ink" htmlFor="service_id">
            関連サービス
          </label>
          <select
            aria-describedby={
              errors.service_id ? "service-id-error" : undefined
            }
            aria-invalid={Boolean(errors.service_id)}
            className={`${fieldClass(Boolean(errors.service_id))} bg-white`}
            defaultValue={values?.service_id ?? contact?.service_id ?? ""}
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
          <label className="text-sm font-medium text-ink" htmlFor="company_id">
            関連会社
          </label>
          <select
            aria-describedby={
              errors.company_id ? "company-id-error" : undefined
            }
            aria-invalid={Boolean(errors.company_id)}
            className={`${fieldClass(Boolean(errors.company_id))} bg-white`}
            defaultValue={values?.company_id ?? contact?.company_id ?? ""}
            id="company_id"
            name="company_id"
          >
            <option value="">未選択</option>
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
      </div>

      <div>
        <label className="text-sm font-medium text-ink" htmlFor="memo">
          メモ
        </label>
        <textarea
          className="mt-2 min-h-32 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-ink"
          defaultValue={values?.memo ?? contact?.memo ?? ""}
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
