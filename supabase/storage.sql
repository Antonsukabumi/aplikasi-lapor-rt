-- 1. Create the storage bucket 'laporan-foto'
-- Note: Requires the 'storage' extension which is enabled by default in Supabase

INSERT INTO storage.buckets (id, name, public)
VALUES ('laporan-foto', 'laporan-foto', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Security Policies (RLS) for Storage
-- We need to enable RLS on the objects table to use policies
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone (anon) to upload photos to 'laporan-foto' bucket
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'laporan-foto');

-- Policy: Allow anyone to view photos in 'laporan-foto' bucket
CREATE POLICY "Allow public viewing"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'laporan-foto');

-- Policy: Allow authenticated users (if any) to upload as well
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'laporan-foto');

-- Policy: Allow authenticated viewing
CREATE POLICY "Allow authenticated viewing"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'laporan-foto');
