"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  generateApplicationPrep,
  type ApplicationAiPrepState,
} from "@/app/applications/[id]/ai-prep/actions";
import { APPLICATION_PREP_MODES } from "@/lib/ai/application-prep";

type ApplicationAiPrepFormProps = {
  applicationId: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "生成中" : "AIで準備メモ作成"}
    </button>
  );
}

function ResultList({ items, title }: { items: string[]; title: string }) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted">生成結果はありません。</p>
      ) : (
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function ApplicationAiPrepForm({
  applicationId,
}: ApplicationAiPrepFormProps) {
  const action = generateApplicationPrep.bind(null, applicationId);
  const [state, formAction] = useActionState<ApplicationAiPrepState, FormData>(
    action,
    {},
  );
  const result = state.result?.result;

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-5" noValidate>
        {state.formError ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.formError}
          </p>
        ) : null}

        <div>
          <label className="text-sm font-medium text-ink" htmlFor="mode">
            生成モード
          </label>
          <select
            aria-describedby={state.fieldErrors?.mode ? "mode-error" : undefined}
            aria-invalid={Boolean(state.fieldErrors?.mode)}
            className={`mt-2 w-full rounded-md border bg-white px-3 py-2 text-sm outline-none transition focus:border-ink ${
              state.fieldErrors?.mode
                ? "border-red-300 bg-red-50"
                : "border-border"
            }`}
            defaultValue={state.selectedMode ?? APPLICATION_PREP_MODES[0]}
            id="mode"
            name="mode"
          >
            {APPLICATION_PREP_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
          <div id="mode-error">
            {state.fieldErrors?.mode ? (
              <p className="mt-2 text-sm text-red-700">
                {state.fieldErrors.mode}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </form>

      {state.result ? (
        <div className="space-y-6 border-t border-border pt-6">
          <div className="rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-white px-2 py-1 text-xs font-semibold uppercase tracking-wide text-blue-800">
                {state.result.source === "openai" ? "OpenAI" : "Mock"}
              </span>
              <span>生成結果は下書きです。内容を確認して活用してください。</span>
            </div>
            {state.result.warnings.length > 0 ? (
              <ul className="mt-3 list-disc space-y-1 pl-5">
                {state.result.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            ) : null}
          </div>

          {result ? (
            <div className="space-y-6">
              <section>
                <h3 className="text-sm font-semibold text-ink">要約</h3>
                <p className="mt-3 whitespace-pre-wrap rounded-md border border-border bg-surface px-4 py-3 text-sm text-ink">
                  {result.summary || "生成結果はありません。"}
                </p>
              </section>

              <div className="grid gap-6 xl:grid-cols-2">
                <ResultList
                  items={result.appeal_points}
                  title="アピールポイント"
                />
                <ResultList
                  items={result.expected_questions}
                  title="想定質問"
                />
                <ResultList
                  items={result.reverse_questions}
                  title="逆質問案"
                />
                <ResultList items={result.concerns} title="懸念点・確認事項" />
                <ResultList
                  items={result.preparation_tasks}
                  title="準備タスク案"
                />
              </div>

              <section>
                <h3 className="text-sm font-semibold text-ink">メモ</h3>
                <p className="mt-3 whitespace-pre-wrap rounded-md border border-border bg-surface px-4 py-3 text-sm text-ink">
                  {result.memo || "生成結果はありません。"}
                </p>
              </section>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
