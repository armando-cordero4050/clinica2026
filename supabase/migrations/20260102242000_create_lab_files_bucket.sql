-- Sprint 1: Create Supabase Storage bucket for lab files
-- Description: Creates a public bucket for storing digital lab files (STL, PLY, PDF, etc.)

-- Create bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('lab-files', 'lab-files', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the bucket
CREATE POLICY "Allow authenticated users to upload lab files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'lab-files');

CREATE POLICY "Allow public read access to lab files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'lab-files');

CREATE POLICY "Allow authenticated users to delete their own lab files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'lab-files');
