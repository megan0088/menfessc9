-- Jalankan di Supabase SQL Editor

alter table messages
  add column if not exists parent_id uuid references messages(id) on delete cascade;

create index if not exists messages_parent_id_idx on messages (parent_id);
