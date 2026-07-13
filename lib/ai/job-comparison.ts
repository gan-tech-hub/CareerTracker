export type JobComparisonRank = {
  job_id: string;
  title: string;
  rank: number;
  reason: string;
};

export type JobComparisonResult = {
  summary: string;
  recommended_order: JobComparisonRank[];
  comparison_points: string[];
  risks: string[];
  decision_advice: string[];
  follow_up_questions: string[];
  memo: string;
};

export type JobComparisonResponse = {
  source: "openai" | "mock";
  result: JobComparisonResult;
  warnings: string[];
};

const stringArray = {
  type: "array",
  items: { type: "string" },
};

export const jobComparisonJsonSchema = {
  name: "job_comparison",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      summary: { type: "string" },
      recommended_order: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            job_id: { type: "string" },
            title: { type: "string" },
            rank: { type: "number" },
            reason: { type: "string" },
          },
          required: ["job_id", "title", "rank", "reason"],
        },
      },
      comparison_points: stringArray,
      risks: stringArray,
      decision_advice: stringArray,
      follow_up_questions: stringArray,
      memo: { type: "string" },
    },
    required: [
      "summary",
      "recommended_order",
      "comparison_points",
      "risks",
      "decision_advice",
      "follow_up_questions",
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

function rankList(value: unknown): JobComparisonRank[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const record =
        typeof item === "object" && item !== null
          ? (item as Record<string, unknown>)
          : {};
      const rank =
        typeof record.rank === "number" && Number.isFinite(record.rank)
          ? Math.max(1, Math.round(record.rank))
          : 0;

      return {
        job_id: text(record.job_id),
        rank,
        reason: text(record.reason),
        title: text(record.title),
      };
    })
    .filter((item) => item.job_id && item.title && item.rank > 0);
}

export function normalizeJobComparisonResult(
  value: unknown,
): JobComparisonResult {
  const record =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {};

  return {
    summary: text(record.summary),
    recommended_order: rankList(record.recommended_order),
    comparison_points: stringList(record.comparison_points),
    risks: stringList(record.risks),
    decision_advice: stringList(record.decision_advice),
    follow_up_questions: stringList(record.follow_up_questions),
    memo: text(record.memo),
  };
}

export function createMockJobComparison(
  jobs: Array<{ id: string; title: string }>,
  fallbackReason = "OPENAI_API_KEY が未設定のため、モックの求人比較コメントを表示しています。",
): JobComparisonResponse {
  const rankedJobs = jobs.map((job, index) => ({
    job_id: job.id,
    rank: index + 1,
    reason:
      index === 0
        ? "希望条件や技術スタックとの一致度が高く、最初に深掘りする候補として扱いやすい求人です。"
        : "魅力はありますが、条件や担当範囲を確認してから優先度を判断したい求人です。",
    title: job.title,
  }));

  return {
    source: "mock",
    result: {
      summary:
        "選択した求人を比較すると、技術スタック、働き方、志望度、確認すべき懸念点に差があります。まずは最も希望条件に近い求人を優先しつつ、他の求人は面談で条件を確認して判断するのがよさそうです。",
      recommended_order: rankedJobs,
      comparison_points: [
        "希望職種や使用技術と求人内容がどの程度重なっているか",
        "リモート可否、勤務地、年収など働き方の条件が希望と合っているか",
        "会社や求人に対して登録済みの懸念点が残っているか",
      ],
      risks: [
        "求人情報だけでは担当範囲やチーム体制が十分に判断できない可能性があります。",
        "未入力項目が多い求人は比較精度が粗くなるため、面談前に情報を補完してください。",
      ],
      decision_advice: [
        "第一候補は面談で具体的な担当範囲と期待役割を確認する。",
        "迷う求人は、希望条件に対して譲れない点と妥協できる点を分けて整理する。",
        "応募・選考が進んでいる求人は、次回アクションや期限も含めて優先度を決める。",
      ],
      follow_up_questions: [
        "入社後3か月で期待される成果は何ですか？",
        "現在のチーム構成と開発プロセスを教えてください。",
        "リモート勤務や評価制度の具体的な運用を教えてください。",
      ],
      memo: "これはデモ用の求人比較コメントです。実APIを使う場合は OPENAI_API_KEY を設定してください。",
    },
    warnings: [
      fallbackReason,
      "AI生成結果は応募優先度を考えるための下書きです。最終判断は実際の面談内容や条件に合わせて行ってください。",
    ],
  };
}
