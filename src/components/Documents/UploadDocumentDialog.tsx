import { useRef, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

interface UploadDocumentDialogProps {
  onUpload: (file: File) => Promise<boolean>;
}

const MAX_SIZE_MB = 20;
const ACCEPTED_TYPES = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv';

const UploadDocumentDialog = ({ onUpload }: UploadDocumentDialogProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File too large. Max size is ${MAX_SIZE_MB}MB`);
      return;
    }
    setUploading(true);
    await onUpload(file);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [onUpload]);

  return (
    <>
      <input
        type="file"
        accept={ACCEPTED_TYPES}
        ref={fileInputRef}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="hidden"
      />
      <Button
        className="bg-gradient-blue hover:opacity-90 transition-opacity gap-2"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        <Upload className="w-4 h-4" />
        {uploading ? 'Uploading...' : 'Upload Document'}
      </Button>
    </>
  );
};

export default UploadDocumentDialog;
