-- =========================================
-- SciCopilot v0.1
-- 002_updated_at_trigger.sql
-- 作用：
-- 当 conversations 表中的某一行被 update 时，
-- 自动把 updated_at 设置为当前时间。
-- =========================================


-- 1. 创建更新时间函数
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;


-- 2. 如果旧触发器已经存在，先删除
drop trigger if exists set_conversations_updated_at
on public.conversations;


-- 3. 创建 conversations 表的更新时间触发器
create trigger set_conversations_updated_at
before update on public.conversations
for each row
execute function public.set_updated_at();


-- 4. 检查触发器是否创建成功
select
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
from information_schema.triggers
where event_object_schema = 'public'
  and event_object_table = 'conversations';