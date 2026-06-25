"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  generateDashboardAiSummary,
  type DashboardAiSummaryState,
} from "@/app/dashboard/ai-summary/actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "生成中" : "AIで選考状況を要約"}
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

export function DashboardAiSummaryForm() {
  const [state, formAction] = useActionState<DashboardAiSummaryState, FormData>(
    generateDashboardAiSummary,
    {},
  );
  const result = state.result?.result;

  return (
    <div className="space-y-6">
      <form action={formAction} className="flex justify-end">
        <SubmitButton />
      </form>

      {state.formError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.formError}
        </p>
      ) : null}

      {state.result ? (
        <div className="space-y-6 border-t border-border pt-6">
          <div className="rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-white px-2 py-1 text-xs font-semibold uppercase tracking-wide text-blue-800">
                {state.result.source === "openai" ? "OpenAI" : "Mock"}
              </span>
              <span>サマリーは参考情報です。実際の状況に合わせて確認してください。</span>
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
                <h3 className="text-sm font-semibold text-ink">全体サマリー</h3>
                <p className="mt-3 whitespace-pre-wrap rounded-md border border-border bg-surface px-4 py-3 text-sm text-ink">
                  {result.overview || "生成結果はありません。"}
                </p>
              </section>

              <div className="grid gap-6 xl:grid-cols-2">
                <ResultList
                  items={result.priority_actions}
                  title="優先アクション"
                />
                <ResultList
                  items={result.upcoming_events}
                  title="直近の予定・期限"
                />
                <ResultList
                  items={result.stalled_applications}
                  title="停滞している可能性がある応募"
                />
                <ResultList items={result.risks} title="リスク・注意点" />
                <ResultList
                  items={result.next_7_days}
                  title="次の7日間でやること"
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
