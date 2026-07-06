-- =========================================
-- SciCopilot v0.1
-- 001_init_schema.sql
-- 作用：
-- 1. 创建第一版基础数据库表
-- 2. 插入 / 更新第一版 3 个智能体
-- =========================================

create extension if not exists pgcrypto;


-- 1. profiles：用户资料表
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone not null default now()
);


-- 2. agents：智能体表
create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  system_prompt text not null,
  category text,
  is_public boolean not null default true,
  created_at timestamp with time zone not null default now()
);


-- 如果早期表结构没有 unique，这里补一个 name 唯一索引
create unique index if not exists idx_agents_name_unique
on public.agents(name);


-- 3. conversations：对话表
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete restrict,
  title text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);


-- 4. messages：消息表
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamp with time zone not null default now()
);


-- 5. 常用索引
create index if not exists idx_conversations_user_id
on public.conversations(user_id);

create index if not exists idx_conversations_agent_id
on public.conversations(agent_id);

create index if not exists idx_messages_conversation_id
on public.messages(conversation_id);

create index if not exists idx_messages_user_id
on public.messages(user_id);


-- 6. 如果旧版本存在“软件工程学习助手”，先更新为“论文精读助手”
update public.agents
set
  name = '论文精读助手',
  description = '帮助用户精读软件工程、人工智能、智能软件开发等方向的论文，支持结构拆解、创新点分析、实验理解和汇报整理。',
  system_prompt = '你是一名论文精读助手，擅长帮助学生阅读和理解软件工程、人工智能、智能软件开发方向的学术论文。你的任务不是简单总结论文，而是帮助用户从研究背景、研究问题、核心方法、实验设计、创新点、不足之处、可复现思路和与项目选题的关联等角度进行系统分析。回答时要结构清晰、重点突出，避免空泛表达。面对基础较弱的用户时，要优先使用分点解释、通俗说明和步骤化拆解。必要时可以把论文内容整理成组会汇报结构、阅读笔记结构或项目调研报告结构。',
  category = 'paper-reading',
  is_public = true
where name = '软件工程学习助手'
  and not exists (
    select 1 from public.agents where name = '论文精读助手'
  );


-- 7. 插入 / 更新：论文精读助手
insert into public.agents (
  name,
  description,
  system_prompt,
  category,
  is_public
)
values (
  '论文精读助手',
  '帮助用户精读软件工程、人工智能、智能软件开发等方向的论文，支持结构拆解、创新点分析、实验理解和汇报整理。',
  '你是一名论文精读助手，擅长帮助学生阅读和理解软件工程、人工智能、智能软件开发方向的学术论文。你的任务不是简单总结论文，而是帮助用户从研究背景、研究问题、核心方法、实验设计、创新点、不足之处、可复现思路和与项目选题的关联等角度进行系统分析。回答时要结构清晰、重点突出，避免空泛表达。面对基础较弱的用户时，要优先使用分点解释、通俗说明和步骤化拆解。必要时可以把论文内容整理成组会汇报结构、阅读笔记结构或项目调研报告结构。',
  'paper-reading',
  true
)
on conflict (name) do update
set
  description = excluded.description,
  system_prompt = excluded.system_prompt,
  category = excluded.category,
  is_public = excluded.is_public;


-- 8. 插入 / 更新：代码解释助手
insert into public.agents (
  name,
  description,
  system_prompt,
  category,
  is_public
)
values (
  '代码解释助手',
  '帮助用户解释代码逻辑、分析报错原因，并给出修改建议。',
  '你是一名代码解释助手。你的任务是帮助学生理解代码逻辑、定位报错原因、给出修改建议。回答时要先说明代码整体在做什么，再指出关键逻辑和可能的问题，最后给出修改方案。面对基础较弱的用户时，要避免只给结论，要把每一步解释清楚。必要时可以给出可运行示例、常见错误原因和调试步骤。',
  'coding',
  true
)
on conflict (name) do update
set
  description = excluded.description,
  system_prompt = excluded.system_prompt,
  category = excluded.category,
  is_public = excluded.is_public;


-- 9. 插入 / 更新：项目规划助手
insert into public.agents (
  name,
  description,
  system_prompt,
  category,
  is_public
)
values (
  '项目规划助手',
  '帮助用户拆解项目功能、规划技术路线、设计数据库和接口。',
  '你是一名软件项目规划助手。你的任务是帮助学生把一个软件项目拆解成功能模块、技术架构、数据库设计、接口设计和开发计划。回答要具体、可执行，不要只讲概念。你需要优先帮助用户明确项目目标、核心用户、MVP 功能、技术选型、数据库表、接口设计、开发顺序和验收标准。面对基础较弱的用户时，要用清晰的步骤说明该去哪里做、做什么、怎么检查是否完成。',
  'project-planning',
  true
)
on conflict (name) do update
set
  description = excluded.description,
  system_prompt = excluded.system_prompt,
  category = excluded.category,
  is_public = excluded.is_public;