"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  appendAiPrepToSelectionMemo,
  createTaskFromAiSuggestion,
  generateApplicationPrep,
  type AppendAiPrepMemoState,
  type ApplicationAiPrepState,
  type CreateAiPrepTaskState,
} from "@/app/applications/[id]/ai-prep/actions";
import type { ApplicationPrepResult } from "@/lib/ai/application-prep";
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

function CreateTaskSubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="shrink-0 rounded-md border border-border bg-white px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
      disabled={disabled || pending}
      type="submit"
    >
      {pending ? "作成中" : "タスク作成"}
    </button>
  );
}

function AiPrepTaskSuggestion({
  applicationId,
  title,
}: {
  applicationId: string;
  title: string;
}) {
  const action = createTaskFromAiSuggestion.bind(null, applicationId);
  const [state, formAction] = useActionState<CreateAiPrepTaskState, FormData>(
    action,
    {},
  );
  const isCreated = Boolean(state.successMessage);

  return (
    <li className="rounded-md border border-border px-3 py-2">
      <div className="flex items-start justify-between gap-3">
        <span>{title}</span>
        <form action={formAction}>
          <input name="title" type="hidden" value={title} />
          <CreateTaskSubmitButton disabled={isCreated} />
        </form>
      </div>
      {state.formError ? (
        <p className="mt-2 text-xs text-red-700">{state.formError}</p>
      ) : null}
      {state.successMessage ? (
        <p className="mt-2 text-xs text-emerald-700">{state.successMessage}</p>
      ) : null}
    </li>
  );
}

function PrepTaskSuggestionList({
  applicationId,
  items,
}: {
  applicationId: string;
  items: string[];
}) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-ink">準備タスク案</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted">生成結果はありません。</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm text-ink">
          {items.map((item) => (
            <AiPrepTaskSuggestion
              applicationId={applicationId}
              key={item}
              title={item}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function AppendMemoSubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={disabled || pending}
      type="submit"
    >
      {pending ? "追記中" : "選考メモへ追記"}
    </button>
  );
}

function HiddenListFields({ items, name }: { items: string[]; name: string }) {
  return (
    <>
      {items.map((item) => (
        <input key={`${name}-${item}`} name={name} type="hidden" value={item} />
      ))}
    </>
  );
}

function AppendAiPrepMemoForm({
  applicationId,
  mode,
  result,
}: {
  applicationId: string;
  mode: string;
  result: ApplicationPrepResult;
}) {
  const action = appendAiPrepToSelectionMemo.bind(null, applicationId);
  const [state, formAction] = useActionState<AppendAiPrepMemoState, FormData>(
    action,
    {},
  );
  const isAppended = Boolean(state.successMessage);

  return (
    <form
      action={formAction}
      className="rounded-md border border-border bg-white px-4 py-3"
    >
      <input name="mode" type="hidden" value={mode} />
      <input name="summary" type="hidden" value={result.summary} />
      <input name="memo" type="hidden" value={result.memo} />
      <HiddenListFields items={result.appeal_points} name="appeal_points" />
      <HiddenListFields items={result.expected_questions} name="expected_questions" />
      <HiddenListFields items={result.reverse_questions} name="reverse_questions" />
      <HiddenListFields items={result.concerns} name="concerns" />
      <HiddenListFields
        items={result.preparation_tasks}
        name="preparation_tasks"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-ink">選考メモへ保存</h3>
          <p className="mt-1 text-sm text-muted">
            生成結果を応募・選考の選考メモへ追記します。
          </p>
        </div>
        <AppendMemoSubmitButton disabled={isAppended} />
      </div>

      {state.formError ? (
        <p className="mt-3 text-sm text-red-700">{state.formError}</p>
      ) : null}
      {state.successMessage ? (
        <p className="mt-3 text-sm text-emerald-700">{state.successMessage}</p>
      ) : null}
    </form>
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
              <AppendAiPrepMemoForm
                applicationId={applicationId}
                mode={state.selectedMode ?? ""}
                result={result}
              />

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
                <PrepTaskSuggestionList
                  applicationId={applicationId}
                  items={result.preparation_tasks}
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
