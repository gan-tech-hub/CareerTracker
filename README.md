# Career Tracker

個人用の転職活動管理アプリです。転職サービス、会社、担当者、求人、応募・選考、面談予定、タスク・期限を一元管理することを目的にしています。

## 技術スタック

- Next.js
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase PostgreSQL
- Vercel

## 初期セットアップ

1. 依存関係をインストールします。

```bash
npm install
```

2. 環境変数ファイルを作成します。

```bash
cp .env.example .env.local
```

3. `.env.local` に Supabase の接続情報を設定します。

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

4. Supabase の SQL Editor で [supabase/schema.sql](./supabase/schema.sql) の内容を実行します。

SQL Editor へ貼り付ける際は、Markdown のコードフェンス（```sql など）は含めず、SQL本文のみを実行してください。

5. Supabase Authentication でログイン用ユーザーを作成します。

6. 開発サーバーを起動します。

```bash
npm run dev
```

7. ブラウザで `http://localhost:3000/login` を開きます。

## デプロイ準備

Vercelへのデプロイ手順と公開前チェックは [docs/deployment.md](./docs/deployment.md) を参照してください。

## 利用可能な画面

- `/login`
- `/dashboard`
- `/services`
- `/services/new`
- `/services/[id]`
- `/services/[id]/edit`
- `/companies`
- `/companies/new`
- `/companies/[id]`
- `/companies/[id]/edit`
- `/contacts`
- `/contacts/new`
- `/contacts/[id]`
- `/contacts/[id]/edit`
- `/jobs`
- `/jobs/new`
- `/jobs/[id]`
- `/jobs/[id]/edit`
- `/applications`
- `/applications/new`
- `/applications/[id]`
- `/applications/[id]/edit`
- `/applications/kanban`
- `/interviews`
- `/interviews/new`
- `/interviews/[id]`
- `/interviews/[id]/edit`
- `/tasks`
- `/tasks/new`
- `/tasks/[id]`
- `/tasks/[id]/edit`

## 実装済み機能

- Supabase クライアント設定
- Supabase Auth によるログイン / ログアウト
- 未ログイン時の `/login` 誘導
- ログイン後の Header / Sidebar / Main Content レイアウト
- 転職サービス CRUD
- 会社 CRUD
- 担当者 CRUD
- 求人 CRUD
- 応募・選考 CRUD
- 面談予定 CRUD
- タスク・期限 CRUD
- 一覧フィルタ / 検索
- 削除確認
- 独自バリデーション表示
- バリデーションエラー時の入力値保持
- サービス詳細・会社詳細での関連担当者 / 関連求人表示
- 求人詳細での関連応募表示
- 応募・選考詳細での関連面談予定 / 関連タスク表示
- 応募・選考の一覧 / カンバン表示切り替え
- 選考カンバンの実データ表示
- ダッシュボードの実データ集計
- ダッシュボードでの直近面談予定 / 期限が近いタスク表示
- ダッシュボードでの期限切れタスク / 優先度高の求人表示
- ステータス別応募件数表示

## 未実装機能

- AI求人票解析
- CSV出力
- 通知機能
- Googleカレンダー連携
- PDF出力
- ユーザー設定画面
- 管理者画面
- ドラッグ&ドロップ式カンバン更新

## 開発状況

現在は Phase5-4 まで進行しています。

| Phase | 内容 | 状態 |
| --- | --- | --- |
| Phase1 | 認証、Supabase接続、共通レイアウト | 完了 |
| Phase2 | 転職サービス、会社、担当者、求人の基本CRUD | 完了 |
| Phase3 | 応募・選考、面談予定、タスク・期限、カンバン | 完了 |
| Phase4 | ダッシュボード、期限注意、ステータス別件数、関連表示 | 完了 |
| Phase5 | ドキュメント整理、UX改善、ダッシュボード改善、リリース準備 | 進行中 |

詳細な進捗は [docs/development_log.md](./docs/development_log.md) を参照してください。

## 動作確認コマンド

```bash
npm run typecheck
npm run lint
npm run build
```

## 開発メモ

- `.env.local` は Git 管理しません。
- パスワードそのものは保存しません。
- 主要テーブルは `user_id` を持ち、Supabase RLS によりログインユーザー本人のデータのみ操作できる設計です。
- Supabase の SQL は、Markdown のコードフェンスを含めず SQL 本文のみを SQL Editor で実行してください。
