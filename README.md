# Career Tracker

個人用の転職活動管理アプリです。転職サービス、担当者、会社、求人、応募・選考、面談予定、タスク・期限を一元管理することを目的にしています。

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

3. `.env.local` にSupabaseの接続情報を設定します。

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

4. SupabaseのSQL Editorなどで `supabase/schema.sql` を実行します。

5. 開発サーバーを起動します。

```bash
npm run dev
```

6. ブラウザで `http://localhost:3000/login` を開きます。

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

## 今回の初期実装範囲

- Supabaseクライアント作成
- Supabase Authのログイン、ログアウト導線
- 未ログイン時の `/login` 誘導
- ログイン後のHeader、Sidebar、Main Content
- ダッシュボードの仮データ表示
- 各主要画面のプレースホルダー

## 未実装

- 各マスタ、求人、応募、面談、タスクのCRUD
- サーバーサイドでの認証ガード
- 実データを使ったダッシュボード集計
- shadcn/uiの導入
