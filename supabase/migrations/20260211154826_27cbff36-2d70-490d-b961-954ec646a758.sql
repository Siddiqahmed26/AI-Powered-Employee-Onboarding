-- Make hr-docs bucket private so files can't be accessed via public URLs
UPDATE storage.buckets SET public = false WHERE id = 'hr-docs';