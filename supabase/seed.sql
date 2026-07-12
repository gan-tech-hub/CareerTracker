-- =========================================================
-- Career Tracker - Demo Seed Data
-- =========================================================
--
-- Usage:
-- 1. Replace the UUID in seed_user with your Supabase Auth user id.
-- 2. Run this SQL in the Supabase SQL Editor.
--
-- This seed removes previously inserted demo data for the same user
-- where the main names start with "Demo", then inserts fresh demo data.

begin;

-- =========================================================
-- Target user
-- =========================================================

create temporary table seed_user
on commit drop
as select '6c0e41fe-4c7a-40c4-8779-bf506e67faaa'::uuid as user_id;

-- =========================================================
-- Clean existing demo data for the target user
-- =========================================================

delete from public.services
where user_id = (select user_id from seed_user)
  and name like 'Demo%';

delete from public.companies
where user_id = (select user_id from seed_user)
  and name like 'Demo%';

-- Standalone demo contacts without a demo service/company relation.
delete from public.contacts
where user_id = (select user_id from seed_user)
  and name like 'Demo%';

-- Standalone demo jobs without a demo company relation.
delete from public.jobs
where user_id = (select user_id from seed_user)
  and title like 'Demo%';

delete from public.career_experiences
where user_id = (select user_id from seed_user);

delete from public.career_skills
where user_id = (select user_id from seed_user);

-- =========================================================
-- user_profiles
-- =========================================================

insert into public.user_profiles (
  user_id,
  display_name,
  current_position,
  desired_role,
  desired_industries,
  desired_salary_min,
  desired_salary_max,
  desired_locations,
  remote_preference,
  side_job_preference,
  work_style,
  career_axis,
  avoid_conditions,
  strengths,
  skills,
  learning_interests,
  self_pr,
  memo
)
select
  seed_user.user_id,
  'Demo User',
  'フロントエンドエンジニア',
  'フルスタックエンジニア / AIプロダクトエンジニア',
  'SaaS、AI、Developer Productivity',
  600,
  900,
  '東京都、フルリモート可',
  '一部リモート希望',
  '条件次第',
  'プロダクト改善に近い立場で、フロントエンドからバックエンドまで横断して開発したい。',
  'ユーザー課題に近い開発、AI活用、裁量のある少人数チーム、継続的なUI改善。',
  '長時間労働が常態化している環境、技術負債の改善余地が全くない環境。',
  'React / Next.jsを使った業務アプリUI、要件整理、データ構造を意識した実装。',
  'TypeScript, React, Next.js, Tailwind CSS, Supabase, PostgreSQL, OpenAI API',
  'AIエージェント活用、プロダクトマネジメント、設計レビュー、テスト自動化。',
  '業務アプリの設計から実装、改善まで一貫して担当できます。AI機能を含むCareer Trackerを個人開発し、認証、CRUD、RLS、AI連携、ドキュメント整備まで実装しています。',
  'Phase8のAIマッチ度スコアや自己PR生成の確認に使うデモプロフィール。'
from seed_user
on conflict (user_id) do update
set
  display_name = excluded.display_name,
  current_position = excluded.current_position,
  desired_role = excluded.desired_role,
  desired_industries = excluded.desired_industries,
  desired_salary_min = excluded.desired_salary_min,
  desired_salary_max = excluded.desired_salary_max,
  desired_locations = excluded.desired_locations,
  remote_preference = excluded.remote_preference,
  side_job_preference = excluded.side_job_preference,
  work_style = excluded.work_style,
  career_axis = excluded.career_axis,
  avoid_conditions = excluded.avoid_conditions,
  strengths = excluded.strengths,
  skills = excluded.skills,
  learning_interests = excluded.learning_interests,
  self_pr = excluded.self_pr,
  memo = excluded.memo;

-- =========================================================
-- career_experiences
-- =========================================================

insert into public.career_experiences (
  user_id,
  company_name,
  department,
  position,
  employment_type,
  start_date,
  end_date,
  is_current,
  summary,
  responsibilities,
  achievements,
  technologies
)
select
  seed_user.user_id,
  data.company_name,
  data.department,
  data.position,
  data.employment_type,
  data.start_date::date,
  data.end_date::date,
  data.is_current,
  data.summary,
  data.responsibilities,
  data.achievements,
  data.technologies
from seed_user
cross join (
  values
    (
      'Demo Product Studio株式会社',
      'Product Engineering',
      'Frontend Engineer',
      '正社員',
      '2023-04-01',
      null,
      true,
      '業務支援SaaSの管理画面とユーザー向けWebアプリの開発を担当。',
      'Next.js / TypeScriptによる画面実装、UI改善、API連携、データ設計レビュー、AI機能の検証。',
      'ダッシュボード改善により主要導線の確認時間を短縮。AI求人票解析のプロトタイプを実装。',
      'TypeScript, React, Next.js, Tailwind CSS, Supabase, PostgreSQL, OpenAI API'
    ),
    (
      'Demo Solutions株式会社',
      'Web Application Team',
      'Web Engineer',
      '正社員',
      '2020-04-01',
      '2023-03-31',
      false,
      '社内業務アプリと顧客向けポータルの開発を担当。',
      'Reactによるフロントエンド開発、REST API連携、検索・フィルタUI、フォーム改善。',
      '入力エラー時の再入力負荷を減らすフォーム改善を実施。問い合わせ対応工数の削減に貢献。',
      'JavaScript, TypeScript, React, Node.js, PostgreSQL'
    ),
    (
      'Career Tracker',
      'Personal Project',
      'Full Stack Developer',
      '副業',
      '2026-01-01',
      null,
      true,
      '転職活動管理アプリを個人開発。認証、CRUD、RLS、AI機能、デモデータ、README整備まで実装。',
      'Next.js App Router、Supabase Auth、PostgreSQL、OpenAI APIを利用した機能開発。',
      '求人票解析、応募準備メモ、選考状況サマリー、AI生成履歴を実装し、ポートフォリオとして提示可能な状態に整備。',
      'Next.js, TypeScript, Supabase, Tailwind CSS, OpenAI API, Vercel'
    )
) as data(company_name, department, position, employment_type, start_date, end_date, is_current, summary, responsibilities, achievements, technologies);

-- =========================================================
-- career_skills
-- =========================================================

insert into public.career_skills (
  user_id,
  name,
  category,
  skill_level,
  years_of_experience,
  last_used_year,
  description
)
select
  seed_user.user_id,
  data.name,
  data.category,
  data.skill_level,
  data.years_of_experience,
  data.last_used_year,
  data.description
from seed_user
cross join (
  values
    ('TypeScript', 'Frontend', '得意', 4.0, 2026, '業務アプリの画面実装、型定義、Server Actions周りで利用。'),
    ('React', 'Frontend', '得意', 4.0, 2026, 'フォーム、一覧、詳細画面などのUI実装で利用。'),
    ('Next.js', 'Frontend', '実務経験あり', 3.0, 2026, 'App Router、Server Components、Server Actionsを利用。'),
    ('Tailwind CSS', 'Design', '実務経験あり', 2.0, 2026, '業務アプリ風UIのレイアウト、状態表現、レスポンシブ対応で利用。'),
    ('Supabase', 'Backend', '実務経験あり', 1.5, 2026, 'Auth、PostgreSQL、RLS、Server Client連携で利用。'),
    ('PostgreSQL', 'Database', '実務経験あり', 3.0, 2026, 'テーブル設計、制約、インデックス、RLSポリシー設計で利用。'),
    ('OpenAI API', 'AI', '実務経験あり', 1.0, 2026, '求人票解析、面接準備メモ、選考状況サマリー生成で利用。'),
    ('GitHub', 'Business', '実務経験あり', 4.0, 2026, 'ブランチ運用、コミット、レビュー前提の差分管理で利用。'),
    ('要件整理', 'Business', '得意', 3.0, 2026, '業務フローを画面・DB・タスクに分解する整理が得意。'),
    ('UI改善', 'Design', '実務経験あり', 3.0, 2026, '一覧性、入力保持、バリデーション、関連表示の改善経験。')
) as data(name, category, skill_level, years_of_experience, last_used_year, description);

-- =========================================================
-- services
-- =========================================================

create temporary table seed_services (
  key text primary key,
  id uuid not null
) on commit drop;

insert into seed_services (key, id)
values
  ('agent', gen_random_uuid()),
  ('scout', gen_random_uuid()),
  ('site', gen_random_uuid()),
  ('sns', gen_random_uuid());

insert into public.services (
  id,
  user_id,
  name,
  type,
  login_url,
  registered_email,
  login_id,
  status,
  memo
)
select
  seed_services.id,
  seed_user.user_id,
  data.name,
  data.type,
  data.login_url,
  data.registered_email,
  data.login_id,
  data.status,
  data.memo
from seed_user
cross join (
  values
    ('agent', 'Demo Career Agent', '転職エージェント', 'https://example.com/demo-agent', 'demo.agent@example.com', 'demo_agent', '利用中', 'ポートフォリオ用の架空エージェント。面談予定と求人紹介の中心。'),
    ('scout', 'Demo Direct Scout', 'スカウトサービス', 'https://example.com/demo-scout', 'demo.scout@example.com', 'demo_scout', '利用中', 'スカウト経由の求人を管理するためのデモサービス。'),
    ('site', 'Demo Job Board', '転職サイト', 'https://example.com/demo-jobs', 'demo.jobs@example.com', 'demo_jobs', '利用中', '求人検索用の架空転職サイト。'),
    ('sns', 'Demo Career SNS', 'SNS', 'https://example.com/demo-sns', 'demo.sns@example.com', 'demo_sns', '一時停止', 'SNS経由で気になる求人を管理するデモ。')
) as data(key, name, type, login_url, registered_email, login_id, status, memo)
join seed_services on seed_services.key = data.key;

-- =========================================================
-- companies
-- =========================================================

create temporary table seed_companies (
  key text primary key,
  id uuid not null
) on commit drop;

insert into seed_companies (key, id)
values
  ('saas', gen_random_uuid()),
  ('ai', gen_random_uuid()),
  ('fintech', gen_random_uuid()),
  ('cloud', gen_random_uuid()),
  ('health', gen_random_uuid());

insert into public.companies (
  id,
  user_id,
  name,
  industry,
  location,
  corporate_url,
  recruitment_url,
  interest_level,
  concerns,
  memo
)
select
  seed_companies.id,
  seed_user.user_id,
  data.name,
  data.industry,
  data.location,
  data.corporate_url,
  data.recruitment_url,
  data.interest_level,
  data.concerns,
  data.memo
from seed_user
cross join (
  values
    ('saas', 'Demo SaaS株式会社', 'SaaS', '東京都渋谷区', 'https://example.com/demo-saas', 'https://example.com/demo-saas/jobs', '高', '成長フェーズのため業務範囲が広そう。', 'プロダクト志向が強く、フロントエンド改善の余地が大きい。'),
    ('ai', 'Demo AI Labs株式会社', 'AI / Machine Learning', '東京都港区', 'https://example.com/demo-ai', 'https://example.com/demo-ai/careers', '高', '研究寄りの文化に適応できるか確認したい。', 'AI機能開発のポートフォリオ文脈と相性がよい企業。'),
    ('fintech', 'Demo FinTech株式会社', 'FinTech', '東京都千代田区', 'https://example.com/demo-fintech', 'https://example.com/demo-fintech/recruit', '中', '金融ドメインのキャッチアップが必要。', '堅牢な業務システム開発経験を活かせそう。'),
    ('cloud', 'Demo Cloud Works株式会社', 'Cloud Infrastructure', 'フルリモート', 'https://example.com/demo-cloud', 'https://example.com/demo-cloud/jobs', '高', '選考スピードが早いため準備を急ぎたい。', 'フルリモートで働き方の希望に合う。'),
    ('health', 'Demo HealthTech株式会社', 'HealthTech', '大阪府大阪市', 'https://example.com/demo-health', 'https://example.com/demo-health/careers', '中', '出社頻度とチーム体制を確認したい。', '社会貢献性の高いプロダクト。')
) as data(key, name, industry, location, corporate_url, recruitment_url, interest_level, concerns, memo)
join seed_companies on seed_companies.key = data.key;

-- =========================================================
-- contacts
-- =========================================================

insert into public.contacts (
  user_id,
  name,
  organization,
  role,
  email,
  phone,
  service_id,
  company_id,
  memo
)
select
  seed_user.user_id,
  data.name,
  data.organization,
  data.role,
  data.email,
  data.phone,
  seed_services.id,
  seed_companies.id,
  data.memo
from seed_user
join (
  values
    ('Demo 山田 エージェント', 'Demo Career Agent', 'エージェント', 'demo.yamada@example.com', '03-0000-0001', 'agent', null, '応募書類の添削と面接対策を相談中。'),
    ('Demo 佐藤 スカウト', 'Demo Direct Scout', 'スカウト担当', 'demo.sato@example.com', null, 'scout', null, 'AI Product Engineerのスカウト担当。'),
    ('Demo 鈴木 人事', 'Demo SaaS株式会社', '企業人事', 'demo.suzuki@example.com', '03-0000-0002', null, 'saas', '一次面接の日程調整担当。'),
    ('Demo 田中 人事', 'Demo AI Labs株式会社', '企業人事', 'demo.tanaka@example.com', null, null, 'ai', '最終面接前の確認事項あり。'),
    ('Demo 高橋 PM', 'Demo Cloud Works株式会社', '現場担当', 'demo.takahashi@example.com', null, null, 'cloud', '技術面接でアーキテクチャを深掘り予定。')
) as data(name, organization, role, email, phone, service_key, company_key, memo)
  on true
left join seed_services on seed_services.key = data.service_key
left join seed_companies on seed_companies.key = data.company_key;

-- =========================================================
-- jobs
-- =========================================================

create temporary table seed_jobs (
  key text primary key,
  id uuid not null
) on commit drop;

insert into seed_jobs (key, id)
values
  ('frontend', gen_random_uuid()),
  ('ai_product', gen_random_uuid()),
  ('backend', gen_random_uuid()),
  ('fullstack', gen_random_uuid()),
  ('platform', gen_random_uuid()),
  ('mobile', gen_random_uuid()),
  ('data', gen_random_uuid()),
  ('pm', gen_random_uuid());

insert into public.jobs (
  id,
  user_id,
  company_id,
  service_id,
  title,
  job_url,
  job_type,
  employment_type,
  salary_min,
  salary_max,
  location,
  remote_type,
  side_job_allowed,
  required_skills,
  preferred_skills,
  description,
  attractive_points,
  concerns,
  priority,
  memo
)
select
  seed_jobs.id,
  seed_user.user_id,
  seed_companies.id,
  seed_services.id,
  data.title,
  data.job_url,
  data.job_type,
  data.employment_type,
  data.salary_min,
  data.salary_max,
  data.location,
  data.remote_type,
  data.side_job_allowed,
  data.required_skills,
  data.preferred_skills,
  data.description,
  data.attractive_points,
  data.concerns,
  data.priority,
  data.memo
from seed_user
join (
  values
    ('frontend', 'saas', 'agent', 'Demo Frontend Engineer', 'https://example.com/demo-saas/frontend', 'Frontend Engineer', '正社員', 600, 850, '東京都渋谷区', '一部リモート', '条件付き', 'TypeScript, React, Next.js', 'Design System, E2E Testing', 'SaaS管理画面の改善、UI基盤整備、パフォーマンス改善を担当。', 'プロダクト改善に深く関われる。', '出社頻度を確認したい。', '高', '第一志望候補。'),
    ('ai_product', 'ai', 'scout', 'Demo AI Product Engineer', 'https://example.com/demo-ai/product-engineer', 'AI Product Engineer', '正社員', 700, 1000, '東京都港区', '一部リモート', '可', 'TypeScript, Python, LLM API', 'MLOps, Prompt Engineering', 'AI機能を持つ業務プロダクトの設計と実装を担当。', 'ポートフォリオの方向性と相性がよい。', '技術面接の難度が高そう。', '高', 'AI機能実装後に強く押したい求人。'),
    ('backend', 'fintech', 'site', 'Demo Backend Engineer', 'https://example.com/demo-fintech/backend', 'Backend Engineer', '正社員', 650, 900, '東京都千代田区', '原則出社', '不可', 'Node.js, PostgreSQL, API Design', 'FinTech domain, Security', '金融系APIと管理画面バックエンドを担当。', '堅牢性とセキュリティを学べる。', '出社中心の働き方。', '中', '条件面は要確認。'),
    ('fullstack', 'cloud', 'agent', 'Demo Full Stack Engineer', 'https://example.com/demo-cloud/fullstack', 'Full Stack Engineer', '正社員', 650, 950, 'フルリモート', 'フルリモート', '可', 'Next.js, Supabase, PostgreSQL', 'AWS, Terraform', 'クラウド管理SaaSのフロントエンドからAPIまで担当。', 'フルリモートで希望に合う。', 'インフラ領域の深い理解が必要。', '高', '働き方の希望と合う。'),
    ('platform', 'cloud', 'sns', 'Demo Platform Engineer', 'https://example.com/demo-cloud/platform', 'Platform Engineer', '正社員', 750, 1050, 'フルリモート', 'フルリモート', '条件付き', 'TypeScript, Kubernetes, Observability', 'SRE, Developer Experience', '開発者体験向上とプラットフォーム改善を担当。', '技術的な裁量が大きい。', 'オンコール有無を確認。', '中', '長期的には面白そう。'),
    ('mobile', 'health', 'site', 'Demo Mobile App Engineer', 'https://example.com/demo-health/mobile', 'Mobile Engineer', '正社員', 550, 800, '大阪府大阪市', '一部リモート', '不明', 'React Native, TypeScript', 'Healthcare domain', 'ヘルスケアアプリの機能開発を担当。', '社会貢献性が高い。', '勤務地と出社頻度が懸念。', '低', '優先度は低め。'),
    ('data', 'ai', 'scout', 'Demo Data Platform Engineer', 'https://example.com/demo-ai/data-platform', 'Data Engineer', '正社員', 700, 950, '東京都港区', '一部リモート', '可', 'Python, SQL, Data Pipeline', 'LLM, Vector Database', 'AIプロダクト向けデータ基盤を担当。', 'AI関連の専門性を伸ばせる。', 'データ基盤経験の深掘りに備える。', '中', 'AI Product Engineerと比較検討。'),
    ('pm', 'saas', 'agent', 'Demo Product-minded Engineer', 'https://example.com/demo-saas/product', 'Product Engineer', '正社員', 650, 900, '東京都渋谷区', '一部リモート', '条件付き', 'React, User Research, Product Thinking', 'Analytics, A/B Testing', 'ユーザー課題の発見から実装まで担当。', 'プロダクト志向を活かせる。', '開発以外の役割比率を確認。', '高', 'ダッシュボードで目立たせたい求人。')
) as data(key, company_key, service_key, title, job_url, job_type, employment_type, salary_min, salary_max, location, remote_type, side_job_allowed, required_skills, preferred_skills, description, attractive_points, concerns, priority, memo)
  on true
join seed_jobs on seed_jobs.key = data.key
join seed_companies on seed_companies.key = data.company_key
left join seed_services on seed_services.key = data.service_key;

-- =========================================================
-- applications
-- =========================================================

create temporary table seed_applications (
  key text primary key,
  id uuid not null
) on commit drop;

insert into seed_applications (key, id)
values
  ('frontend', gen_random_uuid()),
  ('ai_product', gen_random_uuid()),
  ('backend', gen_random_uuid()),
  ('fullstack', gen_random_uuid()),
  ('platform', gen_random_uuid()),
  ('mobile', gen_random_uuid()),
  ('data', gen_random_uuid()),
  ('pm', gen_random_uuid());

insert into public.applications (
  id,
  user_id,
  job_id,
  status,
  applied_at,
  next_action,
  next_deadline,
  interest_level,
  selection_memo,
  decline_reason,
  rejection_reason
)
select
  seed_applications.id,
  seed_user.user_id,
  seed_jobs.id,
  data.status,
  data.applied_at::date,
  data.next_action,
  data.next_deadline::date,
  data.interest_level,
  data.selection_memo,
  data.decline_reason,
  data.rejection_reason
from seed_user
join (
  values
    ('frontend', '一次面接', current_date - 12, '一次面接の準備', current_date + 2, '高', 'UI改善経験とNext.jsの実装経験を中心に話す。', null, null),
    ('ai_product', '最終面接', current_date - 18, '最終面接前の質問整理', current_date + 4, '高', 'AI機能の実装経験とプロダクト視点を整理する。', null, null),
    ('backend', '書類選考中', current_date - 5, 'エージェントへ状況確認', current_date + 6, '中', 'API設計とDB設計の経験を補足する。', null, null),
    ('fullstack', '応募済み', current_date - 2, '書類結果待ち', current_date + 7, '高', 'フルリモート希望を伝える。', null, null),
    ('platform', 'カジュアル面談', current_date - 10, 'カジュアル面談の質問準備', current_date + 1, '中', 'オンコールとチーム体制を確認。', null, null),
    ('mobile', '気になる', null, '応募するか検討', current_date + 10, '低', 'React Native経験との差分を確認。', null, null),
    ('data', '二次面接', current_date - 20, '二次面接の復習', current_date - 1, '中', 'データ基盤経験の深掘りに備える。', null, null),
    ('pm', '内定', current_date - 30, '条件面談の日程調整', current_date + 3, '高', '条件面と役割範囲を確認する。', null, null)
) as data(key, status, applied_at, next_action, next_deadline, interest_level, selection_memo, decline_reason, rejection_reason)
  on true
join seed_applications on seed_applications.key = data.key
join seed_jobs on seed_jobs.key = data.key;

-- =========================================================
-- interviews
-- =========================================================

insert into public.interviews (
  user_id,
  application_id,
  type,
  scheduled_at,
  duration_minutes,
  location,
  online_url,
  participants,
  preparation_memo,
  interview_memo,
  result_memo
)
select
  seed_user.user_id,
  seed_applications.id,
  data.type,
  data.scheduled_at,
  data.duration_minutes,
  data.location,
  data.online_url,
  data.participants,
  data.preparation_memo,
  data.interview_memo,
  data.result_memo
from seed_user
join (
  values
    ('frontend', '一次面接', now() + interval '2 days' + interval '10 hours', 60, 'オンライン', 'https://meet.example.com/demo-frontend', 'Demo 鈴木 人事, Engineering Manager', 'Career Trackerの設計判断とUI改善事例を整理する。', null, null),
    ('ai_product', '最終面接', now() + interval '4 days' + interval '14 hours', 60, 'オンライン', 'https://meet.example.com/demo-ai-final', 'CTO, Product Manager', 'AI求人票解析の構想を話せるようにする。', null, null),
    ('platform', 'カジュアル面談', now() + interval '1 day' + interval '19 hours', 45, 'オンライン', 'https://meet.example.com/demo-platform', 'Demo 高橋 PM', 'オンコール、開発体制、技術負債への向き合い方を質問。', null, null),
    ('pm', '条件面談', now() + interval '3 days' + interval '11 hours', 45, 'オンライン', 'https://meet.example.com/demo-offer', 'HR Manager', '希望年収、働き方、入社可能時期を整理。', null, null),
    ('data', '二次面接', now() - interval '2 days' + interval '15 hours', 60, 'オンライン', 'https://meet.example.com/demo-data', 'Data Lead', 'データパイプライン設計を復習。', '技術質問はSQLとデータ品質管理が中心。', '追加質問への回答待ち。')
) as data(application_key, type, scheduled_at, duration_minutes, location, online_url, participants, preparation_memo, interview_memo, result_memo)
  on true
join seed_applications on seed_applications.key = data.application_key;

-- =========================================================
-- tasks
-- =========================================================

insert into public.tasks (
  user_id,
  application_id,
  title,
  type,
  due_date,
  is_completed,
  priority,
  memo
)
select
  seed_user.user_id,
  seed_applications.id,
  data.title,
  data.type,
  data.due_date::date,
  data.is_completed,
  data.priority,
  data.memo
from seed_user
join (
  values
    ('frontend', 'Demo 職務経歴書をFrontend向けに調整', '書類提出', current_date - 2, false, '高', 'React/Next.jsの実績を先頭に出す。'),
    ('ai_product', 'Demo AI機能の説明メモを作成', '面談準備', current_date - 1, false, '高', '求人票解析の構想と実装ステップを整理する。'),
    ('platform', 'Demo カジュアル面談の質問を整理', '面談準備', current_date, false, '中', 'オンコール、開発者体験、チーム構成を確認。'),
    ('pm', 'Demo 条件面談の希望条件をまとめる', '返信', current_date + 1, false, '高', '希望年収、働き方、入社時期を整理。'),
    ('frontend', 'Demo 一次面接の想定質問を確認', '面談準備', current_date + 2, false, '高', 'UI設計、状態管理、テスト戦略を復習。'),
    ('ai_product', 'Demo 最終面接前に企業研究を更新', '面談準備', current_date + 3, false, '中', '事業内容とAI活用事例を確認。'),
    ('backend', 'Demo エージェントへ選考状況を確認', '返信', current_date + 5, false, '中', '書類選考の状況確認。'),
    ('fullstack', 'Demo ポートフォリオURLを送付', '書類提出', current_date + 6, false, '高', 'Career TrackerのREADMEを添える。'),
    ('mobile', 'Demo 応募判断のメモを作る', 'その他', current_date + 10, false, '低', '勤務地、技術領域、志望度を比較。'),
    ('data', 'Demo 二次面接のお礼メール送信', '返信', current_date - 3, true, '中', '送信済み。'),
    ('pm', 'Demo 内定条件の比較表を作る', '内定承諾', current_date + 4, false, '高', '他社条件と比較する。'),
    ('data', 'Demo 追加質問への回答を準備', '課題提出', current_date - 1, false, '中', 'SQL設計とデータ品質管理について回答。')
) as data(application_key, title, type, due_date, is_completed, priority, memo)
  on true
join seed_applications on seed_applications.key = data.application_key;

commit;
