"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  generateJobMatch,
  type JobMatchState,
} from "@/app/jobs/[id]/ai-match/actions";

type JobMatchAnalysisFormProps = {
  jobId: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "分析中" : "AIでマッチ度を分析"}
    </button>
  );
}

function ResultList({ items, title }: { items: string[]; title: string }) {
  return (
    <section className="rounded-md border border-border bg-white p-4">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted">分析結果はありません。</p>
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

function scoreTone(score: number) {
  if (score >= 80) {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (score >= 60) {
    return "border-blue-200 bg-blue-50 text-blue-800";
  }

  return "border-amber-200 bg-amber-50 text-amber-800";
}

export function JobMatchAnalysisForm({ jobId }: JobMatchAnalysisFormProps) {
  const action = generateJobMatch.bind(null, jobId);
  const [state, formAction] = useActionState<JobMatchState, FormData>(
    action,
    {},
  );
  const result = state.result?.result;

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        {state.formError ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.formError}
          </p>
        ) : null}

        <div className="rounded-md border border-border bg-surface px-4 py-3 text-sm text-muted">
          登録済みの求人、プロフィール、職務経歴、スキルをもとに、応募判断のためのマッチ度を分析します。
          AI結果は下書きとして確認し、実際の応募判断に合わせて調整してください。
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
                AIによる求人マッチ度は応募判断の補助情報です。
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
              <section
                className={`rounded-md border p-5 ${scoreTone(result.score)}`}
              >
                <p className="text-sm font-semibold">求人マッチ度スコア</p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-5xl font-bold leading-none">
                    {result.score}
                  </span>
                  <span className="pb-1 text-base font-semibold">/ 100</span>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6">
                  {result.summary || "分析結果はありません。"}
                </p>
              </section>

              <div className="grid gap-4 xl:grid-cols-2">
                <ResultList
                  items={result.matched_points}
                  title="マッチしているポイント"
                />
                <ResultList items={result.gaps} title="不足・ギャップ" />
                <ResultList items={result.concerns} title="懸念点" />
                <ResultList
                  items={result.interview_check_points}
                  title="面談前に確認したいこと"
                />
                <ResultList
                  items={result.recommended_actions}
                  title="次に取るべきアクション"
                />
              </div>

              <section>
                <h3 className="text-sm font-semibold text-ink">メモ</h3>
                <p className="mt-3 whitespace-pre-wrap rounded-md border border-border bg-surface px-4 py-3 text-sm text-ink">
                  {result.memo || "分析結果はありません。"}
                </p>
              </section>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
