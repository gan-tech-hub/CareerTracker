import {
  JOB_EMPLOYMENT_TYPES,
  JOB_PRIORITIES,
  JOB_REMOTE_TYPES,
  JOB_SIDE_JOB_OPTIONS,
  type JobEmploymentType,
  type JobPriority,
  type JobRemoteType,
  type JobSideJobAllowed,
} from "@/lib/constants/jobs";

export type JobPostingAnalysis = {
  company_name: string | null;
  title: string | null;
  job_url: string | null;
  job_type: string | null;
  employment_type: JobEmploymentType | null;
  salary_min: number | null;
  salary_max: number | null;
  location: string | null;
  remote_type: JobRemoteType | null;
  side_job_allowed: JobSideJobAllowed | null;
  required_skills: string | null;
  preferred_skills: string | null;
  description: string | null;
  attractive_points: string | null;
  concerns: string | null;
  priority: JobPriority | null;
  memo: string | null;
};

export type JobPostingAnalysisResult = {
  source: "openai" | "mock";
  result: JobPostingAnalysis;
  warnings: string[];
};

export const JOB_POSTING_INPUT_LIMIT = 12000;

const nullableString = {
  anyOf: [{ type: "string" }, { type: "null" }],
};

const nullableNumber = {
  anyOf: [{ type: "number" }, { type: "null" }],
};

export const jobPostingJsonSchema = {
  name: "job_posting_analysis",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      company_name: nullableString,
      title: nullableString,
      job_url: nullableString,
      job_type: nullableString,
      employment_type: {
        anyOf: [{ enum: [...JOB_EMPLOYMENT_TYPES] }, { type: "null" }],
      },
      salary_min: nullableNumber,
      salary_max: nullableNumber,
      location: nullableString,
      remote_type: {
        anyOf: [{ enum: [...JOB_REMOTE_TYPES] }, { type: "null" }],
      },
      side_job_allowed: {
        anyOf: [{ enum: [...JOB_SIDE_JOB_OPTIONS] }, { type: "null" }],
      },
      required_skills: nullableString,
      preferred_skills: nullableString,
      description: nullableString,
      attractive_points: nullableString,
      concerns: nullableString,
      priority: {
        anyOf: [{ enum: [...JOB_PRIORITIES] }, { type: "null" }],
      },
      memo: nullableString,
    },
    required: [
      "company_name",
      "title",
      "job_url",
      "job_type",
      "employment_type",
      "salary_min",
      "salary_max",
      "location",
      "remote_type",
      "side_job_allowed",
      "required_skills",
      "preferred_skills",
      "description",
      "attractive_points",
      "concerns",
      "priority",
      "memo",
    ],
  },
  strict: true,
} as const;

function textOrNull(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function numberOrNull(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return Math.max(0, Math.round(value));
}

function optionOrNull<T extends readonly string[]>(
  value: unknown,
  options: T,
): T[number] | null {
  return typeof value === "string" && options.includes(value) ? value : null;
}

export function normalizeJobPostingAnalysis(
  value: unknown,
): JobPostingAnalysis {
  const record =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {};

  return {
    company_name: textOrNull(record.company_name),
    title: textOrNull(record.title),
    job_url: textOrNull(record.job_url),
    job_type: textOrNull(record.job_type),
    employment_type: optionOrNull(
      record.employment_type,
      JOB_EMPLOYMENT_TYPES,
    ),
    salary_min: numberOrNull(record.salary_min),
    salary_max: numberOrNull(record.salary_max),
    location: textOrNull(record.location),
    remote_type: optionOrNull(record.remote_type, JOB_REMOTE_TYPES),
    side_job_allowed: optionOrNull(
      record.side_job_allowed,
      JOB_SIDE_JOB_OPTIONS,
    ),
    required_skills: textOrNull(record.required_skills),
    preferred_skills: textOrNull(record.preferred_skills),
    description: textOrNull(record.description),
    attractive_points: textOrNull(record.attractive_points),
    concerns: textOrNull(record.concerns),
    priority: optionOrNull(record.priority, JOB_PRIORITIES),
    memo: textOrNull(record.memo),
  };
}

export function createMockJobPostingAnalysis(
  sourceUrl: string | null,
): JobPostingAnalysisResult {
  return {
    source: "mock",
    result: {
      company_name: "サンプル株式会社",
      title: "バックエンドエンジニア",
      job_url: sourceUrl,
      job_type: "バックエンドエンジニア",
      employment_type: "正社員",
      salary_min: 550,
      salary_max: 850,
      location: "東京都 / 一部リモート",
      remote_type: "一部リモート",
      side_job_allowed: "条件付き",
      required_skills:
        "TypeScript、Node.js、REST API設計、RDBを用いたWebアプリケーション開発経験",
      preferred_skills:
        "Next.js、Supabase、クラウド環境での運用経験、チーム開発経験",
      description:
        "自社プロダクトのバックエンド開発、API設計、データベース設計、既存機能の改善を担当します。",
      attractive_points:
        "裁量のある開発環境、プロダクト改善に関われる点、リモートワークを組み合わせられる点が魅力です。",
      concerns:
        "担当範囲が広いため、優先順位付けや関係者との調整が必要になりそうです。",
      priority: "中",
      memo: "OpenAI APIキー未設定のため、デモ用の解析結果を表示しています。",
    },
    warnings: [
      "OPENAI_API_KEY が未設定のため、モック解析結果を表示しています。",
      "実データ登録前に、会社・年収・勤務条件を必ず確認してください。",
    ],
  };
}
