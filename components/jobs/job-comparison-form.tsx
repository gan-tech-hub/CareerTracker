"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  generateJobComparison,
  type JobComparisonState,
} from "@/app/jobs/compare/actions";

type JobComparisonOption = {
  id: string;
  title: string;
  job_type: string | null;
  priority: string;
  companies: { name: string } | null;
  services: { name: string } | null;
};

type JobComparisonFormProps = {
  jobs: JobComparisonOption[];
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "生成中" : "AIで比較コメント生成"}
    </button>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-red-700">{message}</p>;
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

export function JobComparisonForm({ jobs }: JobComparisonFormProps) {
  const [state, formAction] = useActionState<JobComparisonState, FormData>(
    generateJobComparison,
    {},
  );
  const selectedJobIds = new Set(state.input?.jobIds ?? []);
  const result = state.result?.result;

  if (jobs.length < 2) {
    return (
      <div className="rounded-md border border-dashed border-border bg-white px-6 py-12 text-center">
        <p className="text-sm font-medium text-ink">
          比較するには求人が2件以上必要です。
        </p>
        <p className="mt-2 text-sm text-muted">
          気になる求人を登録してから、求人比較コメントを生成しましょう。
        </p>
        <Link
          className="mt-5 inline-flex rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          href="/jobs/new"
        >
          求人を登録
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-6" noValidate>
        {state.formError ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.formError}
          </p>
        ) : null}

        <div className="rounded-md border border-border bg-surface px-4 py-3 text-sm text-muted">
          比較したい求人を2〜5件選択してください。プロフィール、職務経歴、スキル、応募状況も参考にして、応募優先度を整理します。
        </div>

        <section>
          <h3 className="text-sm font-semibold text-ink">比較する求人</h3>
          <FieldError message={state.fieldErrors?.job_ids} />
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {jobs.map((job) => (
              <label
                className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-white p-4 transition hover:bg-surface"
                key={job.id}
              >
                <input
                  className="mt-1 h-4 w-4 rounded border-border"
                  defaultChecked={selectedJobIds.has(job.id)}
                  name="job_ids"
                  type="checkbox"
                  value={job.id}
                />
                <span>
                  <span className="block text-sm font-semibold text-ink">
                    {job.title}
                  </span>
                  <span className="mt-1 block text-xs text-muted">
                    {job.companies?.name ?? "会社未設定"} /{" "}
                    {job.job_type ?? "職種未設定"} / 優先度: {job.priority}
                  </span>
                  {job.services ? (
                    <span className="mt-1 block text-xs text-muted">
                      サービス: {job.services.name}
                    </span>
                  ) : null}
                </span>
              </label>
            ))}
          </div>
        </section>

        <div>
          <label className="text-sm font-medium text-ink" htmlFor="focus">
            重視したい観点
          </label>
          <textarea
            aria-describedby={state.fieldErrors?.focus ? "focus-error" : undefined}
            aria-invalid={Boolean(state.fieldErrors?.focus)}
            className={`mt-2 min-h-28 w-full rounded-md border bg-white px-3 py-2 text-sm outline-none transition focus:border-ink ${
              state.fieldErrors?.focus
                ? "border-red-300 bg-red-50"
                : "border-border"
            }`}
            defaultValue={state.input?.focus ?? ""}
            id="focus"
            name="focus"
            placeholder="例: 年収よりも、リモート可否、技術成長、SaaS領域での経験を重視したい。"
          />
          <FieldError message={state.fieldErrors?.focus} />
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
            placeholder="迷っているポイントや、判断に入れたい事情があれば入力してください。"
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
                AI生成結果は応募優先度を考えるための下書きです。
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
                <h3 className="text-sm font-semibold text-ink">総評</h3>
                <p className="mt-3 whitespace-pre-wrap rounded-md border border-border bg-surface px-4 py-3 text-sm leading-6 text-ink">
                  {result.summary || "生成結果はありません。"}
                </p>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-ink">おすすめ順</h3>
                {result.recommended_order.length === 0 ? (
                  <p className="mt-3 text-sm text-muted">
                    生成結果はありません。
                  </p>
                ) : (
                  <ol className="mt-3 space-y-3">
                    {result.recommended_order
                      .slice()
                      .sort((a, b) => a.rank - b.rank)
                      .map((item) => (
                        <li
                          className="rounded-md border border-border bg-white p-4"
                          key={`${item.rank}-${item.job_id}`}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded bg-ink px-2 py-1 text-xs font-semibold text-white">
                              {item.rank}位
                            </span>
                            <Link
                              className="text-sm font-semibold text-ink underline"
                              href={`/jobs/${item.job_id}`}
                            >
                              {item.title}
                            </Link>
                          </div>
                          <p className="mt-2 whitespace-pre-wrap text-sm text-muted">
                            {item.reason}
                          </p>
                        </li>
                      ))}
                  </ol>
                )}
              </section>

              <div className="grid gap-4 xl:grid-cols-2">
                <ResultList
                  items={result.comparison_points}
                  title="比較ポイント"
                />
                <ResultList items={result.risks} title="リスク・懸念" />
                <ResultList
                  items={result.decision_advice}
                  title="判断アドバイス"
                />
                <ResultList
                  items={result.follow_up_questions}
                  title="確認したい質問"
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
