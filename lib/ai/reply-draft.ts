export const REPLY_DRAFT_MODES = [
  "日程調整",
  "面談後のお礼",
  "追加質問への回答",
  "選考辞退",
  "内定・オファー返信",
  "カジュアル面談返信",
] as const;

export const REPLY_DRAFT_TONES = [
  "丁寧",
  "簡潔",
  "前向き",
  "慎重",
] as const;

export type ReplyDraftMode = (typeof REPLY_DRAFT_MODES)[number];
export type ReplyDraftTone = (typeof REPLY_DRAFT_TONES)[number];

export type ReplyDraftResult = {
  subject: string;
  body: string;
  key_points: string[];
  caution_points: string[];
  alternatives: string[];
  memo: string;
};

export type ReplyDraftResponse = {
  source: "openai" | "mock";
  result: ReplyDraftResult;
  warnings: string[];
};

const stringArray = {
  type: "array",
  items: { type: "string" },
};

export const replyDraftJsonSchema = {
  name: "reply_draft",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      subject: { type: "string" },
      body: { type: "string" },
      key_points: stringArray,
      caution_points: stringArray,
      alternatives: stringArray,
      memo: { type: "string" },
    },
    required: [
      "subject",
      "body",
      "key_points",
      "caution_points",
      "alternatives",
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

export function isReplyDraftMode(value: string): value is ReplyDraftMode {
  return REPLY_DRAFT_MODES.includes(value as ReplyDraftMode);
}

export function isReplyDraftTone(value: string): value is ReplyDraftTone {
  return REPLY_DRAFT_TONES.includes(value as ReplyDraftTone);
}

export function normalizeReplyDraftResult(value: unknown): ReplyDraftResult {
  const record =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {};

  return {
    subject: text(record.subject),
    body: text(record.body),
    key_points: stringList(record.key_points),
    caution_points: stringList(record.caution_points),
    alternatives: stringList(record.alternatives),
    memo: text(record.memo),
  };
}

export function createMockReplyDraft(
  mode: ReplyDraftMode,
  tone: ReplyDraftTone,
  fallbackReason = "OPENAI_API_KEY が未設定のため、モックの返信文面を表示しています。",
): ReplyDraftResponse {
  const subjectByMode: Record<ReplyDraftMode, string> = {
    "カジュアル面談返信": "カジュアル面談日程のご連絡",
    "追加質問への回答": "ご質問への回答",
    "日程調整": "面談日程のご調整について",
    "内定・オファー返信": "オファーのご連絡について",
    "選考辞退": "選考辞退のご連絡",
    "面談後のお礼": "面談のお礼",
  };

  const bodyByMode: Record<ReplyDraftMode, string> = {
    "カジュアル面談返信":
      "お世話になっております。\n\nカジュアル面談のご案内をいただき、ありがとうございます。\nぜひお話を伺えればと思います。\n\n以下の日程であれば調整可能です。\n・〇月〇日 〇:〇〇〜〇:〇〇\n・〇月〇日 〇:〇〇〜〇:〇〇\n\nご都合のよいお時間がございましたら、ご指定いただけますと幸いです。\nどうぞよろしくお願いいたします。",
    "追加質問への回答":
      "お世話になっております。\n\nご質問いただきありがとうございます。\n以下、回答いたします。\n\n〇〇については、これまでの業務で〇〇を担当し、〇〇の改善に取り組んだ経験があります。\n今回のポジションでも、これまでの経験を活かして貢献できると考えております。\n\n不足している点がございましたら、追加で補足いたします。\nどうぞよろしくお願いいたします。",
    "日程調整":
      "お世話になっております。\n\n面談日程のご連絡をいただき、ありがとうございます。\n以下の日程で調整可能です。\n\n・〇月〇日 〇:〇〇〜〇:〇〇\n・〇月〇日 〇:〇〇〜〇:〇〇\n・〇月〇日 〇:〇〇〜〇:〇〇\n\n上記で難しい場合は、別日程も調整いたします。\nどうぞよろしくお願いいたします。",
    "内定・オファー返信":
      "お世話になっております。\n\nこのたびはオファーのご連絡をいただき、誠にありがとうございます。\nこれまでの選考を通じて、貴社の事業内容やチームについて理解を深めることができ、大変ありがたく感じております。\n\n内容を確認のうえ、改めてご連絡いたします。\n引き続きどうぞよろしくお願いいたします。",
    "選考辞退":
      "お世話になっております。\n\n選考の機会をいただき、誠にありがとうございました。\n大変恐縮ではございますが、検討の結果、今回の選考を辞退させていただきたくご連絡いたしました。\n\n貴重なお時間をいただいたにもかかわらず、このようなご連絡となり申し訳ございません。\n貴社の今後のご発展を心よりお祈り申し上げます。",
    "面談後のお礼":
      "お世話になっております。\n\n本日は面談のお時間をいただき、誠にありがとうございました。\n業務内容やチームの雰囲気について詳しく伺うことができ、貴社への理解がより深まりました。\n\n引き続き選考のほど、どうぞよろしくお願いいたします。",
  };

  return {
    source: "mock",
    result: {
      subject: subjectByMode[mode],
      body: bodyByMode[mode],
      key_points: [
        `${mode}の目的に合わせて、要点を簡潔に伝えます。`,
        `${tone}なトーンで、相手に失礼のない表現にしています。`,
        "具体的な日程や条件は送信前に差し替えてください。",
      ],
      caution_points: [
        "日付、時間、会社名、担当者名に誤りがないか確認してください。",
        "辞退やオファー返信など重要な連絡は、送信前に必ず自分の言葉に調整してください。",
      ],
      alternatives: [
        "もう少し簡潔にする場合は、冒頭のお礼と結論を中心にまとめます。",
        "より前向きにする場合は、企業理解や志望度に関する一文を追加します。",
      ],
      memo: "これはデモ用の返信文面です。実APIを使う場合は OPENAI_API_KEY を設定してください。",
    },
    warnings: [
      fallbackReason,
      "AI生成結果は下書きです。相手に送信する前に、事実関係、日程、敬称、宛先を必ず確認してください。",
    ],
  };
}
