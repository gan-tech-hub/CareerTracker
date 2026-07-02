import Link from "next/link";
import type { Json } from "@/lib/types/database";

export type AiGenerationHistoryItem = {
  id: string;
  created_at: string;
  feature: string;
  input_summary: string | null;
  output: Json;
  related_application_id: string | null;
  source: string;
  title: string | null;
  warnings: Json;
  applications: {
    id: string;
    jobs: {
      title: string;
      companies: { name: string } | null;
    } | null;
  } | null;
};

type AiGenerationHistoryListProps = {
  logs: AiGenerationHistoryItem[];
};

const featureLabels: Record<string, string> = {
  application_prep: "応募・面接準備",
  job_import: "求人票解析",
  selection_summary: "選考状況サマリー",
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function previewOutput(output: Json) {
  if (typeof output === "string") {
    return output;
  }

  if (!output || typeof output !== "object" || Array.isArray(output)) {
    return "";
  }

  const record = output as Record<string, Json | undefined>;
  const candidates = [
    record.summary,
    record.overview,
    record.title,
    record.description,
    record.memo,
  ];
  const text = candidates.find(
    (candidate): candidate is string => typeof candidate === "string",
  );

  return text ?? JSON.stringify(output);
}

function sourceLabel(source: string) {
  return source === "openai" ? "OpenAI" : "Mock";
}

export function AiGenerationHistoryList({
  logs,
}: AiGenerationHistoryListProps) {
  if (logs.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border bg-white px-4 py-8 text-sm text-muted">
        AI生成履歴はまだありません。
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => {
        const relatedJob = log.applications?.jobs;
        const preview = previewOutput(log.output);

        return (
          <article
            className="rounded-md border border-border bg-white p-5 shadow-panel"
            key={log.id}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-surface px-2 py-1 text-xs font-semibold text-ink">
                    {featureLabels[log.feature] ?? log.feature}
                  </span>
                  <span className="rounded border border-border px-2 py-1 text-xs font-medium text-muted">
                    {sourceLabel(log.source)}
                  </span>
                </div>
                <h3 className="mt-3 text-base font-semibold text-ink">
                  {log.title ?? "AI生成履歴"}
                </h3>
                <p className="mt-1 text-xs text-muted">
                  {formatDateTime(log.created_at)}
                </p>
              </div>

              {log.related_application_id ? (
                <Link
                  className="text-sm font-medium text-ink underline"
                  href={`/applications/${log.related_application_id}`}
                >
                  関連応募
                </Link>
              ) : null}
            </div>

            {relatedJob ? (
              <p className="mt-3 text-sm text-muted">
                {relatedJob.companies?.name ?? "会社未設定"} / {relatedJob.title}
              </p>
            ) : null}

            {log.input_summary ? (
              <p className="mt-3 rounded-md bg-surface px-3 py-2 text-sm text-muted">
                {log.input_summary}
              </p>
            ) : null}

            <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm text-ink">
              {preview || "プレビューを表示できません。"}
            </p>
          </article>
        );
      })}
    </div>
  );
}
