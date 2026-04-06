-- Jalankan file ini di Supabase SQL Editor

-- 1. Tambah kolom image_url
alter table messages add column if not exists image_url text;

-- 2. Buat storage bucket untuk gambar (public)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'message-images',
  'message-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- 3. Policy: siapapun bisa upload
create policy "anyone can upload images"
  on storage.objects for insert
  with check (bucket_id = 'message-images');

-- 4. Policy: gambar bisa diakses publik
create policy "images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'message-images');
