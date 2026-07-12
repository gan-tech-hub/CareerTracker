"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  generateSelfPrDraft,
  type SelfPrDraftState,
} from "@/app/career/ai-draft/actions";
import { SELF_PR_DRAFT_MODES } from "@/lib/ai/self-pr-draft";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "生成中" : "AIで下書きを生成"}
    </button>
  );
}

function ResultList({ items, title }: { items: string[]; title: string }) {
  return (
    <section className="rounded-md border border-border bg-white p-4">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted">生成結果はありません。</p>
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

export function SelfPrDraftForm() {
  const [state, formAction] = useActionState<SelfPrDraftState, FormData>(
    generateSelfPrDraft,
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

        <div className="rounded-md border border-border bg-surface px-4 py-3 text-sm text-muted">
          プロフィール、職務経歴、スキルをもとに、職務経歴書や応募フォームで使える下書きを生成します。
          登録情報が多いほど、具体的で使いやすい文章になります。
        </div>

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
            defaultValue={state.selectedMode ?? SELF_PR_DRAFT_MODES[0]}
            id="mode"
            name="mode"
          >
            {SELF_PR_DRAFT_MODES.map((mode) => (
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
              <span>
                AI生成結果は下書きです。応募先や実際の経験に合わせて調整してください。
              </span>
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
                <p className="text-sm text-muted">タイトル</p>
                <h3 className="mt-1 text-xl font-semibold text-ink">
                  {result.title || "自己PR・職務要約下書き"}
                </h3>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-ink">要約</h3>
                <p className="mt-3 whitespace-pre-wrap rounded-md border border-border bg-surface px-4 py-3 text-sm leading-6 text-ink">
                  {result.summary || "生成結果はありません。"}
                </p>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-ink">下書き本文</h3>
                <p className="mt-3 whitespace-pre-wrap rounded-md border border-border bg-white px-4 py-4 text-sm leading-7 text-ink">
                  {result.draft || "生成結果はありません。"}
                </p>
              </section>

              <div className="grid gap-4 xl:grid-cols-2">
                <ResultList items={result.key_points} title="アピール要点" />
                <ResultList items={result.strengths} title="強み" />
                <ResultList
                  items={result.improvement_tips}
                  title="改善アドバイス"
                />
                <ResultList
                  items={result.usage_suggestions}
                  title="使いどころ"
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
