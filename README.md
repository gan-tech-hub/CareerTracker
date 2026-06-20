# Career Tracker

個人用の転職活動管理アプリです。転職サービス、会社、担当者、求人、応募・選考、面談予定、タスク・期限を一元管理することを目的にしています。

## 技術スタック

- Next.js
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase PostgreSQL

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

## 利用可能な画面

- `/login`
- `/dashboard`
- `/services`
- `/companies`
- `/contacts`
- `/jobs`
- `/applications`
- `/applications/kanban`
- `/interviews`
- `/tasks`

## 実装済み機能

- Supabase クライアント設定
- Supabase Auth によるログイン / ログアウト
- 未ログイン時の `/login` 誘導
- ログイン後の Header / Sidebar / Main Content レイアウト
- ダッシュボード仮表示
- 転職サービス CRUD
- 会社 CRUD
- 担当者 CRUD
- 求人 CRUD
- 一覧フィルタ / 検索
- 削除確認
- 独自バリデーション表示
- バリデーションエラー時の入力値保持
- サービス詳細・会社詳細での関連担当者 / 関連求人表示

## 未実装機能

- 応募・選考 CRUD
- 面談予定 CRUD
- タスク・期限 CRUD
- 選考カンバンの実データ表示
- ダッシュボードの実データ集計
- AI求人票解析
- CSV出力
- 通知機能

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
- Phase2 では `services` / `companies` / `contacts` / `jobs` の基本 CRUD を対象にしています。
