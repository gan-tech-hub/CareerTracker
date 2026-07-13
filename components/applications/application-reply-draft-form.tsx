"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  generateReplyDraft,
  type ReplyDraftState,
} from "@/app/applications/[id]/reply-draft/actions";
import { REPLY_DRAFT_MODES, REPLY_DRAFT_TONES } from "@/lib/ai/reply-draft";

type ApplicationReplyDraftFormProps = {
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
      {pending ? "生成中" : "AIで返信文面を生成"}
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

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-red-700">{message}</p>;
}

export function ApplicationReplyDraftForm({
  applicationId,
}: ApplicationReplyDraftFormProps) {
  const action = generateReplyDraft.bind(null, applicationId);
  const [state, formAction] = useActionState<ReplyDraftState, FormData>(
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

        <div className="rounded-md border border-border bg-surface px-4 py-3 text-sm text-muted">
          応募・選考情報、求人、会社、面談予定をもとに返信文面を生成します。
          送信前に宛先、敬称、日程、会社名を必ず確認してください。
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-ink" htmlFor="mode">
              生成モード
            </label>
            <select
              aria-describedby={
                state.fieldErrors?.mode ? "mode-error" : undefined
              }
              aria-invalid={Boolean(state.fieldErrors?.mode)}
              className={`mt-2 w-full rounded-md border bg-white px-3 py-2 text-sm outline-none transition focus:border-ink ${
                state.fieldErrors?.mode
                  ? "border-red-300 bg-red-50"
                  : "border-border"
              }`}
              defaultValue={state.input?.mode ?? REPLY_DRAFT_MODES[0]}
              id="mode"
              name="mode"
            >
              {REPLY_DRAFT_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
            <FieldError message={state.fieldErrors?.mode} />
          </div>

          <div>
            <label className="text-sm font-medium text-ink" htmlFor="tone">
              希望トーン
            </label>
            <select
              aria-describedby={
                state.fieldErrors?.tone ? "tone-error" : undefined
              }
              aria-invalid={Boolean(state.fieldErrors?.tone)}
              className={`mt-2 w-full rounded-md border bg-white px-3 py-2 text-sm outline-none transition focus:border-ink ${
                state.fieldErrors?.tone
                  ? "border-red-300 bg-red-50"
                  : "border-border"
              }`}
              defaultValue={state.input?.tone ?? REPLY_DRAFT_TONES[0]}
              id="tone"
              name="tone"
            >
              {REPLY_DRAFT_TONES.map((tone) => (
                <option key={tone} value={tone}>
                  {tone}
                </option>
              ))}
            </select>
            <FieldError message={state.fieldErrors?.tone} />
          </div>
        </div>

        <div>
          <label
            className="text-sm font-medium text-ink"
            htmlFor="incoming_message"
          >
            相手からの連絡内容
          </label>
          <textarea
            aria-describedby={
              state.fieldErrors?.incoming_message
                ? "incoming-message-error"
                : undefined
            }
            aria-invalid={Boolean(state.fieldErrors?.incoming_message)}
            className={`mt-2 min-h-36 w-full rounded-md border bg-white px-3 py-2 text-sm outline-none transition focus:border-ink ${
              state.fieldErrors?.incoming_message
                ? "border-red-300 bg-red-50"
                : "border-border"
            }`}
            defaultValue={state.input?.incomingMessage ?? ""}
            id="incoming_message"
            name="incoming_message"
            placeholder="相手から届いたメールやチャットの本文を貼り付けてください。"
          />
          <FieldError message={state.fieldErrors?.incoming_message} />
        </div>

        <div>
          <label
            className="text-sm font-medium text-ink"
            htmlFor="reply_points"
          >
            返信で伝えたいこと
          </label>
          <textarea
            aria-describedby={
              state.fieldErrors?.reply_points
                ? "reply-points-error"
                : undefined
            }
            aria-invalid={Boolean(state.fieldErrors?.reply_points)}
            className={`mt-2 min-h-28 w-full rounded-md border bg-white px-3 py-2 text-sm outline-none transition focus:border-ink ${
              state.fieldErrors?.reply_points
                ? "border-red-300 bg-red-50"
                : "border-border"
            }`}
            defaultValue={state.input?.replyPoints ?? ""}
            id="reply_points"
            name="reply_points"
            placeholder="候補日、回答内容、辞退理由、確認したい条件などを入力してください。"
          />
          <FieldError message={state.fieldErrors?.reply_points} />
        </div>

        <div>
          <label className="text-sm font-medium text-ink" htmlFor="memo">
            補足メモ
          </label>
          <textarea
            aria-describedby={state.fieldErrors?.memo ? "memo-error" : undefined}
            aria-invalid={Boolean(state.fieldErrors?.memo)}
            className={`mt-2 min-h-24 w-full rounded-md border bg-white px-3 py-2 text-sm outline-none transition focus:border-ink ${
              state.fieldErrors?.memo
                ? "border-red-300 bg-red-50"
                : "border-border"
            }`}
            defaultValue={state.input?.memo ?? ""}
            id="memo"
            name="memo"
            placeholder="避けたい表現、強調したいニュアンス、相手との関係性などがあれば入力してください。"
          />
          <FieldError message={state.fieldErrors?.memo} />
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
                AI生成結果は返信文面の下書きです。送信前に必ず内容を確認してください。
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
                <h3 className="text-sm font-semibold text-ink">件名</h3>
                <p className="mt-3 rounded-md border border-border bg-surface px-4 py-3 text-sm text-ink">
                  {result.subject || "生成結果はありません。"}
                </p>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-ink">本文</h3>
                <p className="mt-3 whitespace-pre-wrap rounded-md border border-border bg-white px-4 py-4 text-sm leading-7 text-ink">
                  {result.body || "生成結果はありません。"}
                </p>
              </section>

              <div className="grid gap-4 xl:grid-cols-2">
                <ResultList items={result.key_points} title="含めた要点" />
                <ResultList items={result.caution_points} title="注意点" />
                <ResultList items={result.alternatives} title="別案フレーズ" />
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
