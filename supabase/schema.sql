-- =========================================================
-- Career Tracker - Supabase Schema
-- =========================================================

-- UUID generation
create extension if not exists "pgcrypto";

-- =========================================================
-- Common updated_at trigger
-- =========================================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =========================================================
-- services
-- =========================================================

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null default '転職サイト',
  login_url text,
  registered_email text,
  login_id text,
  status text not null default '利用中',
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint services_type_check check (
    type in ('転職サイト', '転職エージェント', 'スカウトサービス', 'SNS', 'その他')
  ),
  constraint services_status_check check (
    status in ('利用中', '一時停止', '退会済み')
  )
);

create trigger services_set_updated_at
before update on public.services
for each row
execute function public.set_updated_at();

-- =========================================================
-- companies
-- =========================================================

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  industry text,
  location text,
  corporate_url text,
  recruitment_url text,
  interest_level text not null default '中',
  concerns text,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint companies_interest_level_check check (
    interest_level in ('高', '中', '低')
  )
);

create trigger companies_set_updated_at
before update on public.companies
for each row
execute function public.set_updated_at();

-- =========================================================
-- contacts
-- =========================================================

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  organization text,
  role text not null default 'その他',
  email text,
  phone text,
  service_id uuid references public.services(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint contacts_role_check check (
    role in ('エージェント', '企業人事', '現場担当', 'スカウト担当', 'その他')
  )
);

create trigger contacts_set_updated_at
before update on public.contacts
for each row
execute function public.set_updated_at();

-- =========================================================
-- jobs
-- =========================================================

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  service_id uuid references public.services(id) on delete set null,
  title text not null,
  job_url text,
  job_type text,
  employment_type text not null default '正社員',
  salary_min integer,
  salary_max integer,
  location text,
  remote_type text not null default '不明',
  side_job_allowed text not null default '不明',
  required_skills text,
  preferred_skills text,
  description text,
  attractive_points text,
  concerns text,
  priority text not null default '中',
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint jobs_employment_type_check check (
    employment_type in ('正社員', '契約社員', '業務委託', '副業', 'その他')
  ),
  constraint jobs_remote_type_check check (
    remote_type in ('フルリモート', '一部リモート', '原則出社', '不明')
  ),
  constraint jobs_side_job_allowed_check check (
    side_job_allowed in ('可', '不可', '条件付き', '不明')
  ),
  constraint jobs_priority_check check (
    priority in ('高', '中', '低')
  ),
  constraint jobs_salary_check check (
    salary_min is null
    or salary_max is null
    or salary_min <= salary_max
  )
);

create trigger jobs_set_updated_at
before update on public.jobs
for each row
execute function public.set_updated_at();

-- =========================================================
-- applications
-- =========================================================

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  status text not null default '気になる',
  applied_at date,
  next_action text,
  next_deadline date,
  interest_level text not null default '中',
  selection_memo text,
  decline_reason text,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint applications_job_unique unique (job_id),

  constraint applications_status_check check (
    status in (
      '気になる',
      '応募予定',
      '応募済み',
      '書類選考中',
      'カジュアル面談',
      '一次面接',
      '二次面接',
      '最終面接',
      '内定',
      '辞退',
      '不採用'
    )
  ),
  constraint applications_interest_level_check check (
    interest_level in ('高', '中', '低')
  )
);

create trigger applications_set_updated_at
before update on public.applications
for each row
execute function public.set_updated_at();

-- =========================================================
-- interviews
-- =========================================================

create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  type text not null default 'その他',
  scheduled_at timestamptz not null,
  duration_minutes integer,
  location text,
  online_url text,
  participants text,
  preparation_memo text,
  interview_memo text,
  result_memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint interviews_type_check check (
    type in (
      'エージェント面談',
      'カジュアル面談',
      '一次面接',
      '二次面接',
      '最終面接',
      '条件面談',
      'その他'
    )
  ),
  constraint interviews_duration_check check (
    duration_minutes is null or duration_minutes > 0
  )
);

create trigger interviews_set_updated_at
before update on public.interviews
for each row
execute function public.set_updated_at();

-- =========================================================
-- tasks
-- =========================================================

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid references public.applications(id) on delete cascade,
  title text not null,
  type text not null default 'その他',
  due_date date not null,
  is_completed boolean not null default false,
  priority text not null default '中',
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint tasks_type_check check (
    type in ('返信', '書類提出', '課題提出', '面談準備', '内定承諾', 'その他')
  ),
  constraint tasks_priority_check check (
    priority in ('高', '中', '低')
  )
);

create trigger tasks_set_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();

-- =========================================================
-- Indexes
-- =========================================================

create index if not exists services_user_id_idx
on public.services(user_id);

create index if not exists companies_user_id_idx
on public.companies(user_id);

create index if not exists contacts_user_id_idx
on public.contacts(user_id);

create index if not exists contacts_service_id_idx
on public.contacts(service_id);

create index if not exists contacts_company_id_idx
on public.contacts(company_id);

create index if not exists jobs_user_id_idx
on public.jobs(user_id);

create index if not exists jobs_company_id_idx
on public.jobs(company_id);

create index if not exists jobs_service_id_idx
on public.jobs(service_id);

create index if not exists jobs_priority_idx
on public.jobs(priority);

create index if not exists applications_user_id_idx
on public.applications(user_id);

create index if not exists applications_job_id_idx
on public.applications(job_id);

create index if not exists applications_status_idx
on public.applications(status);

create index if not exists applications_next_deadline_idx
on public.applications(next_deadline);

create index if not exists interviews_user_id_idx
on public.interviews(user_id);

create index if not exists interviews_application_id_idx
on public.interviews(application_id);

create index if not exists interviews_scheduled_at_idx
on public.interviews(scheduled_at);

create index if not exists tasks_user_id_idx
on public.tasks(user_id);

create index if not exists tasks_application_id_idx
on public.tasks(application_id);

create index if not exists tasks_due_date_idx
on public.tasks(due_date);

create index if not exists tasks_is_completed_idx
on public.tasks(is_completed);

-- =========================================================
-- Row Level Security
-- =========================================================

alter table public.services enable row level security;
alter table public.companies enable row level security;
alter table public.contacts enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.interviews enable row level security;
alter table public.tasks enable row level security;

-- =========================================================
-- RLS Policies - services
-- =========================================================

create policy "Users can select own services"
on public.services
for select
using (auth.uid() = user_id);

create policy "Users can insert own services"
on public.services
for insert
with check (auth.uid() = user_id);

create policy "Users can update own services"
on public.services
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own services"
on public.services
for delete
using (auth.uid() = user_id);

-- =========================================================
-- RLS Policies - companies
-- =========================================================

create policy "Users can select own companies"
on public.companies
for select
using (auth.uid() = user_id);

create policy "Users can insert own companies"
on public.companies
for insert
with check (auth.uid() = user_id);

create policy "Users can update own companies"
on public.companies
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own companies"
on public.companies
for delete
using (auth.uid() = user_id);

-- =========================================================
-- RLS Policies - contacts
-- =========================================================

create policy "Users can select own contacts"
on public.contacts
for select
using (auth.uid() = user_id);

create policy "Users can insert own contacts"
on public.contacts
for insert
with check (auth.uid() = user_id);

create policy "Users can update own contacts"
on public.contacts
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own contacts"
on public.contacts
for delete
using (auth.uid() = user_id);

-- =========================================================
-- RLS Policies - jobs
-- =========================================================

create policy "Users can select own jobs"
on public.jobs
for select
using (auth.uid() = user_id);

create policy "Users can insert own jobs"
on public.jobs
for insert
with check (auth.uid() = user_id);

create policy "Users can update own jobs"
on public.jobs
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own jobs"
on public.jobs
for delete
using (auth.uid() = user_id);

-- =========================================================
-- RLS Policies - applications
-- =========================================================

create policy "Users can select own applications"
on public.applications
for select
using (auth.uid() = user_id);

create policy "Users can insert own applications"
on public.applications
for insert
with check (auth.uid() = user_id);

create policy "Users can update own applications"
on public.applications
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own applications"
on public.applications
for delete
using (auth.uid() = user_id);

-- =========================================================
-- RLS Policies - interviews
-- =========================================================

create policy "Users can select own interviews"
on public.interviews
for select
using (auth.uid() = user_id);

create policy "Users can insert own interviews"
on public.interviews
for insert
with check (auth.uid() = user_id);

create policy "Users can update own interviews"
on public.interviews
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own interviews"
on public.interviews
for delete
using (auth.uid() = user_id);

-- =========================================================
-- RLS Policies - tasks
-- =========================================================

create policy "Users can select own tasks"
on public.tasks
for select
using (auth.uid() = user_id);

create policy "Users can insert own tasks"
on public.tasks
for insert
with check (auth.uid() = user_id);

create policy "Users can update own tasks"
on public.tasks
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own tasks"
on public.tasks
for delete
using (auth.uid() = user_id);
