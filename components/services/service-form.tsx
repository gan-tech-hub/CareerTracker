"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  SERVICE_STATUSES,
  SERVICE_TYPES,
} from "@/lib/constants/services";
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

export function ServiceForm({
  action,
  service,
  submitLabel,
}: ServiceFormProps) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-ink" htmlFor="name">
            サービス名
          </label>
          <input
            className="mt-2 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-ink"
            defaultValue={service?.name ?? ""}
            id="name"
            name="name"
            required
            type="text"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-ink" htmlFor="type">
            種別
          </label>
          <select
            className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none transition focus:border-ink"
            defaultValue={service?.type ?? SERVICE_TYPES[0]}
            id="type"
            name="type"
            required
          >
            {SERVICE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-ink" htmlFor="status">
            利用状況
          </label>
          <select
            className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none transition focus:border-ink"
            defaultValue={service?.status ?? SERVICE_STATUSES[0]}
            id="status"
            name="status"
            required
          >
            {SERVICE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-ink" htmlFor="login_url">
            ログインURL
          </label>
          <input
            className="mt-2 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-ink"
            defaultValue={service?.login_url ?? ""}
            id="login_url"
            name="login_url"
            placeholder="https://example.com"
            type="url"
          />
        </div>

        <div>
          <label
            className="text-sm font-medium text-ink"
            htmlFor="registered_email"
          >
            登録メール
          </label>
          <input
            className="mt-2 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-ink"
            defaultValue={service?.registered_email ?? ""}
            id="registered_email"
            name="registered_email"
            type="email"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-ink" htmlFor="login_id">
            ログインID
          </label>
          <input
            className="mt-2 w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-ink"
            defaultValue={service?.login_id ?? ""}
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
          defaultValue={service?.memo ?? ""}
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
