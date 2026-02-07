import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Document {
  id: string;
  title: string;
  category: 'hr_policy' | 'tool_sop';
  file_name: string;
  file_path: string;
  file_size: number | null;
  uploaded_by: string | null;
  created_at: string;
}

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } else {
      setDocuments((data as Document[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadDocument = async (
    file: File,
    title: string,
    category: 'hr_policy' | 'tool_sop',
    userId: string
  ) => {
    const fileExt = file.name.split('.').pop();
    const filePath = `${category}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('hr-docs')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      toast.error('Failed to upload file');
      return false;
    }

    const { error: dbError } = await supabase.from('documents').insert({
      title,
      category,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      uploaded_by: userId,
    });

    if (dbError) {
      console.error('DB error:', dbError);
      toast.error('Failed to save document record');
      // Clean up uploaded file
      await supabase.storage.from('hr-docs').remove([filePath]);
      return false;
    }

    toast.success('Document uploaded successfully');
    await fetchDocuments();
    return true;
  };

  const deleteDocument = async (doc: Document) => {
    const { error: storageError } = await supabase.storage
      .from('hr-docs')
      .remove([doc.file_path]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
      toast.error('Failed to delete file from storage');
      return false;
    }

    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', doc.id);

    if (dbError) {
      console.error('DB delete error:', dbError);
      toast.error('Failed to delete document record');
      return false;
    }

    toast.success('Document deleted');
    await fetchDocuments();
    return true;
  };

  const getPublicUrl = (filePath: string) => {
    const { data } = supabase.storage.from('hr-docs').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const hrPolicies = documents.filter((d) => d.category === 'hr_policy');
  const toolSops = documents.filter((d) => d.category === 'tool_sop');

  return {
    documents,
    hrPolicies,
    toolSops,
    loading,
    uploadDocument,
    deleteDocument,
    getPublicUrl,
    refetch: fetchDocuments,
  };
};
