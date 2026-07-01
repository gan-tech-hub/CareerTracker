export const APPLICATION_PREP_MODES = [
  "面接準備",
  "応募理由整理",
  "逆質問作成",
  "懸念点整理",
] as const;

export type ApplicationPrepMode = (typeof APPLICATION_PREP_MODES)[number];

export type ApplicationPrepResult = {
  summary: string;
  appeal_points: string[];
  expected_questions: string[];
  reverse_questions: string[];
  concerns: string[];
  preparation_tasks: string[];
  memo: string;
};

export type ApplicationPrepResponse = {
  source: "openai" | "mock";
  result: ApplicationPrepResult;
  warnings: string[];
};

export function isApplicationPrepMode(
  value: string,
): value is ApplicationPrepMode {
  return APPLICATION_PREP_MODES.includes(value as ApplicationPrepMode);
}

const stringArray = {
  type: "array",
  items: { type: "string" },
};

export const applicationPrepJsonSchema = {
  name: "application_prep",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      summary: { type: "string" },
      appeal_points: stringArray,
      expected_questions: stringArray,
      reverse_questions: stringArray,
      concerns: stringArray,
      preparation_tasks: stringArray,
      memo: { type: "string" },
    },
    required: [
      "summary",
      "appeal_points",
      "expected_questions",
      "reverse_questions",
      "concerns",
      "preparation_tasks",
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

export function normalizeApplicationPrepResult(
  value: unknown,
): ApplicationPrepResult {
  const record =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {};

  return {
    summary: text(record.summary),
    appeal_points: stringList(record.appeal_points),
    expected_questions: stringList(record.expected_questions),
    reverse_questions: stringList(record.reverse_questions),
    concerns: stringList(record.concerns),
    preparation_tasks: stringList(record.preparation_tasks),
    memo: text(record.memo),
  };
}

export function createMockApplicationPrep(
  mode: ApplicationPrepMode,
  fallbackReason = "OPENAI_API_KEY が未設定のため、モック準備メモを表示しています。",
): ApplicationPrepResponse {
  return {
    source: "mock",
    result: {
      summary:
        "登録済みの求人・会社・選考情報をもとに、面接前に確認すべき論点を整理します。現在はOpenAI APIを利用できないため、デモ用の準備メモを表示しています。",
      appeal_points: [
        "求人で求められている技術や業務内容と、自分の経験が重なる部分を具体例で話せるようにする。",
        "応募先企業の事業内容に対して、なぜ関心を持ったのかを一言で説明できるようにする。",
        "これまでの成果を、課題、行動、結果の順に整理しておく。",
      ],
      expected_questions: [
        "これまでの経験の中で、今回の求人に最も活かせるものは何ですか？",
        "チーム開発で工夫したことや、難しかった調整はありますか？",
        "入社後、どのような領域から貢献したいですか？",
      ],
      reverse_questions: [
        "入社後最初の3か月で期待される役割を教えてください。",
        "現在のチームで特に改善したい開発課題は何ですか？",
        "選考中に確認しておくべき技術スタックや開発体制はありますか？",
      ],
      concerns: [
        "求人票だけでは担当範囲や優先順位が不明確な可能性があります。",
        "働き方やリモート頻度は、面接で具体的に確認した方が良さそうです。",
      ],
      preparation_tasks: [
        "応募理由を3行で整理する。",
        "職務経歴から求人に近い実績を2つ選ぶ。",
        "逆質問を3つ用意する。",
      ],
      memo: `${mode}モードのデモ結果です。実APIを使う場合はOPENAI_API_KEYを設定してください。`,
    },
    warnings: [
      fallbackReason,
      "生成内容は下書きです。実際の経験や志望理由に合わせて修正してください。",
    ],
  };
}
