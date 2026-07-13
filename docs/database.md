# DB設計書

## 対象アプリ

Career Tracker

## DB方針

* Supabase PostgreSQLを使用する
* すべての主要テーブルに `user_id` を持たせる
* Row Level Securityを有効化し、ログインユーザー本人のデータのみ操作可能にする
* `created_at` / `updated_at` を各テーブルに持たせる
* MVPでは物理削除とする
* パスワード情報は保存しない

## テーブル一覧

| テーブル名        | 内容     |
| ------------ | ------ |
| services     | 転職サービス |
| companies    | 会社     |
| contacts     | 担当者    |
| jobs         | 求人     |
| applications | 応募・選考  |
| interviews   | 面談・面接  |
| tasks        | タスク・期限 |
| ai_generation_logs | AI生成履歴 |
| user_profiles | プロフィール・希望条件 |
| career_experiences | 職務経歴 |
| career_skills | スキル |

## リレーション概要

```text
services 1 --- * jobs
services 1 --- * contacts

companies 1 --- * jobs
companies 1 --- * contacts

jobs 1 --- 0..1 applications

applications 1 --- * interviews
applications 1 --- * tasks

jobs 1 --- * ai_generation_logs
applications 1 --- * ai_generation_logs

auth.users 1 --- 0..1 user_profiles
auth.users 1 --- * career_experiences
auth.users 1 --- * career_skills
```

## services

転職サイト・転職エージェント・スカウトサービスを管理する。

| カラム              | 型           | 必須  | 説明        |
| ---------------- | ----------- | --- | --------- |
| id               | uuid        | yes | 主キー       |
| user_id          | uuid        | yes | ユーザーID    |
| name             | text        | yes | サービス名     |
| type             | text        | yes | 種別        |
| login_url        | text        | no  | ログインURL   |
| registered_email | text        | no  | 登録メールアドレス |
| login_id         | text        | no  | ログインID    |
| status           | text        | yes | 利用状況      |
| memo             | text        | no  | メモ        |
| created_at       | timestamptz | yes | 作成日時      |
| updated_at       | timestamptz | yes | 更新日時      |

## companies

求人元企業を管理する。

| カラム             | 型           | 必須  | 説明       |
| --------------- | ----------- | --- | -------- |
| id              | uuid        | yes | 主キー      |
| user_id         | uuid        | yes | ユーザーID   |
| name            | text        | yes | 会社名      |
| industry        | text        | no  | 業種       |
| location        | text        | no  | 所在地      |
| corporate_url   | text        | no  | 企業URL    |
| recruitment_url | text        | no  | 採用ページURL |
| interest_level  | text        | yes | 志望度      |
| concerns        | text        | no  | 懸念点      |
| memo            | text        | no  | メモ       |
| created_at      | timestamptz | yes | 作成日時     |
| updated_at      | timestamptz | yes | 更新日時     |

## contacts

エージェント担当者、企業担当者などを管理する。

| カラム          | 型           | 必須  | 説明       |
| ------------ | ----------- | --- | -------- |
| id           | uuid        | yes | 主キー      |
| user_id      | uuid        | yes | ユーザーID   |
| name         | text        | yes | 氏名       |
| organization | text        | no  | 所属       |
| role         | text        | yes | 役割       |
| email        | text        | no  | メールアドレス  |
| phone        | text        | no  | 電話番号     |
| service_id   | uuid        | no  | 関連サービスID |
| company_id   | uuid        | no  | 関連会社ID   |
| memo         | text        | no  | メモ       |
| created_at   | timestamptz | yes | 作成日時     |
| updated_at   | timestamptz | yes | 更新日時     |

## jobs

求人情報を管理する。

| カラム               | 型           | 必須  | 説明     |
| ----------------- | ----------- | --- | ------ |
| id                | uuid        | yes | 主キー    |
| user_id           | uuid        | yes | ユーザーID |
| company_id        | uuid        | yes | 会社ID   |
| service_id        | uuid        | no  | サービスID |
| title             | text        | yes | 求人タイトル |
| job_url           | text        | no  | 求人URL  |
| job_type          | text        | no  | 職種     |
| employment_type   | text        | yes | 雇用形態   |
| salary_min        | integer     | no  | 年収下限   |
| salary_max        | integer     | no  | 年収上限   |
| location          | text        | no  | 勤務地    |
| remote_type       | text        | yes | リモート可否 |
| side_job_allowed  | text        | yes | 副業可否   |
| required_skills   | text        | no  | 必須スキル  |
| preferred_skills  | text        | no  | 歓迎スキル  |
| description       | text        | no  | 業務内容   |
| attractive_points | text        | no  | 魅力ポイント |
| concerns          | text        | no  | 懸念点    |
| priority          | text        | yes | 優先度    |
| memo              | text        | no  | メモ     |
| created_at        | timestamptz | yes | 作成日時   |
| updated_at        | timestamptz | yes | 更新日時   |

## applications

求人への応募状況・選考状況を管理する。

| カラム              | 型           | 必須  | 説明      |
| ---------------- | ----------- | --- | ------- |
| id               | uuid        | yes | 主キー     |
| user_id          | uuid        | yes | ユーザーID  |
| job_id           | uuid        | yes | 求人ID    |
| status           | text        | yes | 現在ステータス |
| applied_at       | date        | no  | 応募日     |
| next_action      | text        | no  | 次回アクション |
| next_deadline    | date        | no  | 次回期限    |
| interest_level   | text        | yes | 志望度     |
| selection_memo   | text        | no  | 選考メモ    |
| decline_reason   | text        | no  | 辞退理由    |
| rejection_reason | text        | no  | 不採用理由   |
| created_at       | timestamptz | yes | 作成日時    |
| updated_at       | timestamptz | yes | 更新日時    |

## interviews

面談・面接予定を管理する。

| カラム              | 型           | 必須  | 説明       |
| ---------------- | ----------- | --- | -------- |
| id               | uuid        | yes | 主キー      |
| user_id          | uuid        | yes | ユーザーID   |
| application_id   | uuid        | yes | 応募ID     |
| type             | text        | yes | 種別       |
| scheduled_at     | timestamptz | yes | 日時       |
| duration_minutes | integer     | no  | 所要時間     |
| location         | text        | no  | 場所       |
| online_url       | text        | no  | オンラインURL |
| participants     | text        | no  | 参加者      |
| preparation_memo | text        | no  | 事前準備メモ   |
| interview_memo   | text        | no  | 当日メモ     |
| result_memo      | text        | no  | 結果メモ     |
| created_at       | timestamptz | yes | 作成日時     |
| updated_at       | timestamptz | yes | 更新日時     |

## tasks

返信期限、書類提出期限、面談準備などを管理する。

| カラム            | 型           | 必須  | 説明     |
| -------------- | ----------- | --- | ------ |
| id             | uuid        | yes | 主キー    |
| user_id        | uuid        | yes | ユーザーID |
| application_id | uuid        | no  | 関連応募ID |
| title          | text        | yes | タイトル   |
| type           | text        | yes | 種別     |
| due_date       | date        | yes | 期限日    |
| is_completed   | boolean     | yes | 完了状態   |
| priority       | text        | yes | 優先度    |
| memo           | text        | no  | メモ     |
| created_at     | timestamptz | yes | 作成日時   |
| updated_at     | timestamptz | yes | 更新日時   |

## ai_generation_logs

AI求人票解析、AI応募・面接準備、AI選考状況サマリーの生成履歴を管理する。

| カラム                 | 型           | 必須  | 説明 |
| -------------------- | ----------- | --- | --- |
| id                   | uuid        | yes | 主キー |
| user_id              | uuid        | yes | ユーザーID |
| feature              | text        | yes | AI機能種別 |
| source               | text        | yes | 生成元。`openai` または `mock` |
| title                | text        | no  | 履歴タイトル |
| input_summary        | text        | no  | 入力概要 |
| output               | jsonb       | yes | AI生成結果 |
| warnings             | jsonb       | yes | 警告・補足情報 |
| related_job_id       | uuid        | no  | 関連求人ID |
| related_application_id | uuid      | no  | 関連応募ID |
| created_at           | timestamptz | yes | 作成日時 |

`ai_generation_logs.feature` には `job_import`, `application_prep`, `selection_summary`, `job_match_score`, `self_pr_draft`, `reply_draft`, `job_comparison` を保存する。

## user_profiles

プロフィール・希望条件を管理する。1ユーザーにつき1件のみ保持する。

| カラム                 | 型           | 必須  | 説明 |
| -------------------- | ----------- | --- | --- |
| id                   | uuid        | yes | 主キー |
| user_id              | uuid        | yes | ユーザーID。一意 |
| display_name         | text        | no  | 表示名 |
| current_position     | text        | no  | 現在の職種・役割 |
| desired_role         | text        | no  | 希望職種 |
| desired_industries   | text        | no  | 希望業界 |
| desired_salary_min   | integer     | no  | 希望年収下限。万円単位 |
| desired_salary_max   | integer     | no  | 希望年収上限。万円単位 |
| desired_locations    | text        | no  | 希望勤務地 |
| remote_preference    | text        | yes | リモート希望 |
| side_job_preference  | text        | yes | 副業希望 |
| work_style           | text        | no  | 希望する働き方 |
| career_axis          | text        | no  | 転職軸 |
| avoid_conditions     | text        | no  | 避けたい条件 |
| strengths            | text        | no  | 強み |
| skills               | text        | no  | スキル |
| learning_interests   | text        | no  | 今後伸ばしたい領域 |
| self_pr              | text        | no  | 自己PR素材 |
| memo                 | text        | no  | メモ |
| created_at           | timestamptz | yes | 作成日時 |
| updated_at           | timestamptz | yes | 更新日時 |

## career_experiences

職務経歴を管理する。

| カラム | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| id | uuid | yes | 主キー |
| user_id | uuid | yes | ユーザーID |
| company_name | text | yes | 会社名 |
| department | text | no | 部署 |
| position | text | no | 役職・役割 |
| employment_type | text | yes | 雇用形態 |
| start_date | date | no | 開始日 |
| end_date | date | no | 終了日 |
| is_current | boolean | yes | 現職フラグ |
| summary | text | no | 概要 |
| responsibilities | text | no | 担当業務 |
| achievements | text | no | 実績 |
| technologies | text | no | 使用技術 |
| created_at | timestamptz | yes | 作成日時 |
| updated_at | timestamptz | yes | 更新日時 |

## career_skills

技術スキル、業務スキル、マネジメント経験などを管理する。

| カラム | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| id | uuid | yes | 主キー |
| user_id | uuid | yes | ユーザーID |
| name | text | yes | スキル名 |
| category | text | yes | カテゴリ |
| skill_level | text | yes | レベル |
| years_of_experience | numeric | no | 経験年数 |
| last_used_year | integer | no | 最終利用年 |
| description | text | no | 説明 |
| created_at | timestamptz | yes | 作成日時 |
| updated_at | timestamptz | yes | 更新日時 |

## RLS方針

主要テーブルで以下を許可する。

* 自分のデータのみSELECT可能
* 自分のデータのみINSERT可能
* 自分のデータのみUPDATE可能
* 自分のデータのみDELETE可能

判定条件:

```sql
auth.uid() = user_id
```

`ai_generation_logs` は履歴用途のため、自分のデータのみSELECT / INSERT / DELETE可能とし、UPDATEは許可しない。

## インデックス方針

よく使う検索・絞り込み項目にインデックスを付与する。

対象例:

* user_id
* company_id
* service_id
* job_id
* application_id
* status
* due_date
* scheduled_at
* next_deadline
* feature
* created_at
