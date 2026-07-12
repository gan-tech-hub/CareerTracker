export const SELF_PR_DRAFT_MODES = [
  "職務要約",
  "自己PR",
  "強み整理",
  "面接用ショート版",
] as const;

export type SelfPrDraftMode = (typeof SELF_PR_DRAFT_MODES)[number];

export type SelfPrDraftResult = {
  title: string;
  summary: string;
  draft: string;
  key_points: string[];
  strengths: string[];
  improvement_tips: string[];
  usage_suggestions: string[];
  memo: string;
};

export type SelfPrDraftResponse = {
  source: "openai" | "mock";
  result: SelfPrDraftResult;
  warnings: string[];
};

const stringArray = {
  type: "array",
  items: { type: "string" },
};

export const selfPrDraftJsonSchema = {
  name: "self_pr_draft",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      title: { type: "string" },
      summary: { type: "string" },
      draft: { type: "string" },
      key_points: stringArray,
      strengths: stringArray,
      improvement_tips: stringArray,
      usage_suggestions: stringArray,
      memo: { type: "string" },
    },
    required: [
      "title",
      "summary",
      "draft",
      "key_points",
      "strengths",
      "improvement_tips",
      "usage_suggestions",
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

export function isSelfPrDraftMode(
  value: string,
): value is SelfPrDraftMode {
  return SELF_PR_DRAFT_MODES.includes(value as SelfPrDraftMode);
}

export function normalizeSelfPrDraftResult(
  value: unknown,
): SelfPrDraftResult {
  const record =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {};

  return {
    title: text(record.title),
    summary: text(record.summary),
    draft: text(record.draft),
    key_points: stringList(record.key_points),
    strengths: stringList(record.strengths),
    improvement_tips: stringList(record.improvement_tips),
    usage_suggestions: stringList(record.usage_suggestions),
    memo: text(record.memo),
  };
}

export function createMockSelfPrDraft(
  mode: SelfPrDraftMode,
  fallbackReason = "OPENAI_API_KEY が未設定のため、モックの自己PR・職務要約下書きを表示しています。",
): SelfPrDraftResponse {
  const isSummaryMode = mode === "職務要約";
  const isShortMode = mode === "面接用ショート版";

  return {
    source: "mock",
    result: {
      title: `${mode}の下書き`,
      summary:
        "登録済みのプロフィール、職務経歴、スキルをもとに、転職活動で使いやすい表現へ整理したデモ下書きです。",
      draft: isShortMode
        ? "TypeScript、React、Next.jsを中心としたWebアプリケーション開発を経験してきました。業務改善やSaaS領域への関心が強く、ユーザーが継続的に使いやすい管理画面や業務支援機能の設計・実装を得意としています。"
        : isSummaryMode
          ? "TypeScript、React、Next.jsを中心に、業務アプリケーションやSaaSプロダクトのフロントエンド開発を担当してきました。要件整理からUI実装、API連携、運用改善まで幅広く関わり、ユーザーの業務効率を高める機能改善に取り組んできました。"
          : "私の強みは、ユーザーの業務課題を理解しながら、実装に落とし込めることです。TypeScript、React、Next.jsを用いたWebアプリケーション開発を軸に、UIの使いやすさ、保守性、データ連携の分かりやすさを意識して開発してきました。今後は、これまでの開発経験を活かし、事業やプロダクトの成長に近い領域で価値を出していきたいと考えています。",
      key_points: [
        "TypeScript、React、Next.jsを中心としたWeb開発経験",
        "業務改善やSaaS領域への関心",
        "ユーザー視点と実装力をつなげられる点",
      ],
      strengths: [
        "複雑な情報を整理し、使いやすい画面に落とし込める",
        "既存データや業務フローを踏まえて改善案を考えられる",
        "フロントエンドからバックエンド連携まで一貫して理解できる",
      ],
      improvement_tips: [
        "実績には数値や改善前後の変化を追加すると説得力が増します。",
        "応募先の求人に合わせて、使用技術や成果の順番を入れ替えると使いやすくなります。",
      ],
      usage_suggestions: [
        "職務経歴書の冒頭要約",
        "応募フォームの自己PR欄",
        "面接冒頭の自己紹介",
      ],
      memo: "これはデモ用の下書きです。実APIを使う場合は OPENAI_API_KEY を設定してください。",
    },
    warnings: [
      fallbackReason,
      "AI生成結果は下書きです。実際の経験、応募先、職務経歴書の文体に合わせて調整してください。",
    ],
  };
}
