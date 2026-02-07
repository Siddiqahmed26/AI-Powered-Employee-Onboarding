import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileUp } from 'lucide-react';

interface UploadDocumentDialogProps {
  onUpload: (file: File, title: string, category: 'hr_policy' | 'tool_sop') => Promise<boolean>;
}

const UploadDocumentDialog = ({ onUpload }: UploadDocumentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'hr_policy' | 'tool_sop'>('hr_policy');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;

    setUploading(true);
    const success = await onUpload(file, title.trim(), category);
    setUploading(false);

    if (success) {
      setTitle('');
      setFile(null);
      setCategory('hr_policy');
      setOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-blue hover:opacity-90 transition-opacity gap-2">
          <Upload className="w-4 h-4" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileUp className="w-5 h-5 text-primary" />
            Upload Document
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="doc-title">Document Title</Label>
            <Input
              id="doc-title"
              placeholder="e.g. Employee Handbook 2025"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="doc-category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as 'hr_policy' | 'tool_sop')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hr_policy">HR Policy</SelectItem>
                <SelectItem value="tool_sop">Tool SOP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="doc-file">File (PDF)</Label>
            <Input
              id="doc-file"
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
              className="cursor-pointer"
            />
            {file && (
              <p className="text-xs text-muted-foreground">
                {file.name} ({formatFileSize(file.size)})
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-blue hover:opacity-90 transition-opacity"
            disabled={uploading || !file || !title.trim()}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDocumentDialog;
