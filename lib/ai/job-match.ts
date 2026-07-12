export type JobMatchResult = {
  score: number;
  summary: string;
  matched_points: string[];
  gaps: string[];
  concerns: string[];
  interview_check_points: string[];
  recommended_actions: string[];
  memo: string;
};

export type JobMatchResponse = {
  source: "openai" | "mock";
  result: JobMatchResult;
  warnings: string[];
};

const stringArray = {
  type: "array",
  items: { type: "string" },
};

export const jobMatchJsonSchema = {
  name: "job_match_score",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      score: { type: "number" },
      summary: { type: "string" },
      matched_points: stringArray,
      gaps: stringArray,
      concerns: stringArray,
      interview_check_points: stringArray,
      recommended_actions: stringArray,
      memo: { type: "string" },
    },
    required: [
      "score",
      "summary",
      "matched_points",
      "gaps",
      "concerns",
      "interview_check_points",
      "recommended_actions",
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

function score(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

export function normalizeJobMatchResult(value: unknown): JobMatchResult {
  const record =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {};

  return {
    score: score(record.score),
    summary: text(record.summary),
    matched_points: stringList(record.matched_points),
    gaps: stringList(record.gaps),
    concerns: stringList(record.concerns),
    interview_check_points: stringList(record.interview_check_points),
    recommended_actions: stringList(record.recommended_actions),
    memo: text(record.memo),
  };
}

export function createMockJobMatch(
  fallbackReason = "OPENAI_API_KEY が未設定のため、モックの求人マッチ度を表示しています。",
): JobMatchResponse {
  return {
    source: "mock",
    result: {
      score: 78,
      summary:
        "登録済みのプロフィール、職務経歴、スキルと求人情報を照合すると、技術スタックと志向性は比較的よく一致しています。一方で、担当範囲や年収条件などは面談前に確認した方がよい状態です。",
      matched_points: [
        "TypeScript、React、Next.js などのWebフロントエンド経験を活かしやすい求人です。",
        "SaaSや業務改善に関する経験・関心が、求人のプロダクト領域と近い可能性があります。",
        "リモート勤務や開発体制への希望が、求人条件と大きく矛盾していません。",
      ],
      gaps: [
        "求人が求める特定ドメイン経験やマネジメント範囲は、登録情報だけでは十分に確認できません。",
        "必須スキルの一部は経験年数や実務での深さを補足して説明する必要があります。",
      ],
      concerns: [
        "年収レンジ、評価制度、入社後の担当範囲は求人情報だけでは判断しきれません。",
        "魅力的に見える一方で、優先順位やチーム体制を面談で確認した方が安全です。",
      ],
      interview_check_points: [
        "入社後3か月で期待される成果と担当範囲",
        "現在の開発チーム構成、レビュー体制、技術選定の進め方",
        "リモート勤務頻度、残業時間、評価制度の具体的な運用",
      ],
      recommended_actions: [
        "求人に近い職務経歴を1〜2件選び、成果と使用技術を面接用に整理する。",
        "希望条件と求人条件が合う点、確認が必要な点を応募メモにまとめる。",
        "面談前に逆質問を3つ準備する。",
      ],
      memo: "これはデモ用のマッチ度分析です。実APIを使う場合は OPENAI_API_KEY を設定してください。",
    },
    warnings: [
      fallbackReason,
      "AIによるマッチ度は応募判断の補助情報です。合格可能性や採用結果を保証するものではありません。",
    ],
  };
}
