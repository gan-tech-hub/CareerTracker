export type SelectionSummaryResult = {
  overview: string;
  priority_actions: string[];
  stalled_applications: string[];
  upcoming_events: string[];
  risks: string[];
  next_7_days: string[];
  memo: string;
};

export type SelectionSummaryResponse = {
  source: "openai" | "mock";
  result: SelectionSummaryResult;
  warnings: string[];
};

const stringArray = {
  type: "array",
  items: { type: "string" },
};

export const selectionSummaryJsonSchema = {
  name: "selection_summary",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      overview: { type: "string" },
      priority_actions: stringArray,
      stalled_applications: stringArray,
      upcoming_events: stringArray,
      risks: stringArray,
      next_7_days: stringArray,
      memo: { type: "string" },
    },
    required: [
      "overview",
      "priority_actions",
      "stalled_applications",
      "upcoming_events",
      "risks",
      "next_7_days",
      "memo",
    ],
  },
  strict: true,
} as const;

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function stringList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeSelectionSummaryResult(
  value: unknown,
): SelectionSummaryResult {
  const record =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {};

  return {
    overview: text(record.overview),
    priority_actions: stringList(record.priority_actions),
    stalled_applications: stringList(record.stalled_applications),
    upcoming_events: stringList(record.upcoming_events),
    risks: stringList(record.risks),
    next_7_days: stringList(record.next_7_days),
    memo: text(record.memo),
  };
}

export function createMockSelectionSummary(): SelectionSummaryResponse {
  return {
    source: "mock",
    result: {
      overview:
        "現在の転職活動は、応募・選考、面談予定、未完了タスクを並行して管理している状態です。期限が近いタスクと次回アクションを優先して確認すると、選考の抜け漏れを防ぎやすくなります。",
      priority_actions: [
        "期限が近い未完了タスクを確認し、今日対応するものを決める。",
        "面談予定がある応募について、求人内容と逆質問を見直す。",
        "志望度が高い求人・応募から順に、次回アクションを具体化する。",
      ],
      stalled_applications: [
        "更新が止まっている応募がある場合は、次回アクションや連絡期限を設定してください。",
        "応募済みのまま次の予定がない選考は、状況確認の対象にするとよさそうです。",
      ],
      upcoming_events: [
        "直近の面談予定と、7日以内の期限タスクを優先して確認してください。",
        "面談準備タスクが未作成の場合は、応募ごとに準備項目を追加すると管理しやすくなります。",
      ],
      risks: [
        "タスク期限が未設定の応募は、対応漏れが起きやすい状態です。",
        "複数の選考が同時進行している場合、志望度と期限の両方で優先順位を決める必要があります。",
      ],
      next_7_days: [
        "期限切れタスクを解消する。",
        "直近面談の応募詳細を確認する。",
        "志望度が高い応募の次回アクションを明確にする。",
      ],
      memo: "OpenAI APIキー未設定のため、デモ用の選考状況サマリーを表示しています。",
    },
    warnings: [
      "OPENAI_API_KEY が未設定のため、モックサマリーを表示しています。",
      "AIサマリーは登録データをもとにした下書きです。実際の状況に合わせて判断してください。",
    ],
  };
}
