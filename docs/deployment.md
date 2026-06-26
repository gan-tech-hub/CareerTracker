# Deployment Guide

Career Tracker をVercelにデプロイする前後の確認手順です。

## 前提

- Supabaseプロジェクトが作成済みであること
- Supabase Authenticationにログイン用ユーザーを作成できること
- Supabase SQL Editorで `supabase/schema.sql` を実行できること
- GitHubリポジトリをVercelへ連携できること

## 1. ローカル確認

デプロイ前に以下を実行します。

```bash
npm run typecheck
npm run lint
npm run build
```

開発サーバーで確認する場合:

```bash
npm run dev
```

確認する主な画面:

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

## 2. Supabase設定

SupabaseのSQL Editorで `supabase/schema.sql` のSQL本文を実行します。

注意:

- Markdownのコードフェンスは貼り付けないでください。
- `supabase/schema.sql` のSQL本文のみを実行してください。
- 既にテーブル作成済みの場合、`create table if not exists` により既存テーブルは再作成されません。
- 既存データがある環境へ適用する場合は、事前にバックアップしてください。

確認項目:

- `services`
- `companies`
- `contacts`
- `jobs`
- `applications`
- `interviews`
- `tasks`

各テーブルで確認すること:

- `user_id` カラムが存在する
- Row Level Securityが有効化されている
- SELECT / INSERT / UPDATE / DELETE のポリシーがある
- `auth.uid() = user_id` の条件で本人データのみ操作できる

## 3. 環境変数

VercelのProject Settingsで以下を設定します。

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=
```

設定値はSupabase Project SettingsのAPI設定から取得します。

注意:

- `.env.local` はGit管理しません。
- SupabaseのService Role Keyはフロントエンド向け環境変数に設定しません。
- `NEXT_PUBLIC_` が付いた値はブラウザにも公開されます。
- `OPENAI_API_KEY` はサーバー側でのみ使用します。`NEXT_PUBLIC_` は付けないでください。
- `OPENAI_API_KEY` が未設定の場合、AI機能はモック結果で動作します。

## 4. Vercelデプロイ

基本手順:

1. VercelでGitHubリポジトリをImportします。
2. Framework PresetはNext.jsを選択します。
3. Environment VariablesにSupabase接続情報を設定します。
4. Deployを実行します。

ビルドコマンド:

```bash
npm run build
```

通常、VercelのNext.js標準設定で動作します。

## 5. デプロイ後確認

デプロイ後に以下を確認します。

- `/login` が表示できる
- Supabase Authのユーザーでログインできる
- ログイン後に `/dashboard` へ遷移できる
- 未ログイン状態で保護ページへアクセスすると `/login` に誘導される
- 各CRUD画面で登録 / 編集 / 削除ができる
- 自分のデータだけが表示される
- ダッシュボードの集計が表示される
- 応募・選考カンバンが表示される
- AI求人票解析、AI応募・面接準備、AI選考状況サマリーが表示できる

## 6. 公開時の注意

ポートフォリオとして公開する場合:

- 実在する個人情報、会社情報、応募情報を入れないでください。
- デモ用データを使う場合は、架空の会社名・担当者名にしてください。
- SupabaseプロジェクトのRLSを必ず有効にしてください。
- Service Role Keyを公開しないでください。

## 7. 現時点の未実装機能

- AI求人票解析の精度改善
- AI生成結果の応募メモへの反映
- AIサマリーからのタスク作成
- CSV出力
- 通知機能
- Googleカレンダー連携
- PDF出力
- ユーザー設定画面
- 管理者画面
- ドラッグ&ドロップ式カンバン更新

これらは公開後の追加改善またはポートフォリオ強化フェーズで扱います。
