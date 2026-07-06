-- =========================================
-- SciCopilot v0.1
-- 003_rls_policies.sql
-- 作用：
-- 1. 开启 RLS
-- 2. 配置 profiles / agents / conversations / messages 的权限策略
-- =========================================


-- 1. 开启 RLS
alter table public.profiles enable row level security;
alter table public.agents enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;


-- 2. 删除旧策略，避免重复创建时报错
drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;

drop policy if exists agents_select_public on public.agents;

drop policy if exists conversations_select_own on public.conversations;
drop policy if exists conversations_insert_own on public.conversations;
drop policy if exists conversations_update_own on public.conversations;
drop policy if exists conversations_delete_own on public.conversations;

drop policy if exists messages_select_own on public.messages;
drop policy if exists messages_insert_own on public.messages;


-- 3. profiles：用户只能看、增、改自己的资料
create policy profiles_select_own
on public.profiles
for select
using (auth.uid() = id);

create policy profiles_insert_own
on public.profiles
for insert
with check (auth.uid() = id);

create policy profiles_update_own
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);


-- 4. agents：公开智能体允许读取
create policy agents_select_public
on public.agents
for select
using (is_public = true);


-- 5. conversations：用户只能访问自己的对话
create policy conversations_select_own
on public.conversations
for select
using (auth.uid() = user_id);

create policy conversations_insert_own
on public.conversations
for insert
with check (auth.uid() = user_id);

create policy conversations_update_own
on public.conversations
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy conversations_delete_own
on public.conversations
for delete
using (auth.uid() = user_id);


-- 6. messages：用户只能访问自己的消息
create policy messages_select_own
on public.messages
for select
using (auth.uid() = user_id);

create policy messages_insert_own
on public.messages
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.conversations c
    where c.id = conversation_id
      and c.user_id = auth.uid()
  )
);


-- 7. 检查 RLS 是否开启
select
  schemaname,
  tablename,
  rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('profiles', 'agents', 'conversations', 'messages')
order by tablename;


-- 8. 检查策略是否创建成功
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles', 'agents', 'conversations', 'messages')
order by tablename, policyname;