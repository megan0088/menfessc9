-- Tabel pesan menfess
create table if not exists messages (
  id         uuid primary key default gen_random_uuid(),
  dari       text not null,
  untuk      text not null,
  pesan      text not null,
  created_at timestamptz default now()
);

-- Index untuk query feed (sort by date)
create index if not exists messages_created_at_idx on messages (created_at desc);

-- Enable Row Level Security
alter table messages enable row level security;

-- Policy: siapapun bisa baca pesan yang belum expired (< 7 hari)
create policy "read active messages" on messages
  for select using (created_at > now() - interval '7 days');

-- Policy: siapapun bisa insert pesan baru
create policy "insert messages" on messages
  for insert with check (true);

-- Opsional: pg_cron untuk hapus pesan expired (jalankan sekali setup)
-- Aktifkan extension pg_cron dulu di Supabase Dashboard > Database > Extensions
-- select cron.schedule('cleanup-expired-messages', '0 0 * * *', $$
--   delete from messages where created_at < now() - interval '7 days';
-- $$);
