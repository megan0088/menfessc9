-- Jalankan file ini di Supabase SQL Editor

-- 1. Tambah kolom likes
alter table messages add column if not exists likes integer default 0;

-- 2. Fungsi increment likes (atomic, bypass RLS)
create or replace function increment_likes(message_id uuid)
returns void
language sql
security definer
as $$
  update messages
  set likes = likes + 1
  where id = message_id
    and created_at > now() - interval '7 days';
$$;

-- 3. Izinkan anon memanggil fungsi ini
grant execute on function increment_likes to anon;
