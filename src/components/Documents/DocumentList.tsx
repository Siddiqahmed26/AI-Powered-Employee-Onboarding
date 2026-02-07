import { useState } from 'react';
import type { Document } from '@/hooks/useDocuments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Book, ClipboardList, FileText, Eye, Trash2, Download, FileWarning } from 'lucide-react';
import { format } from 'date-fns';

interface DocumentListProps {
  title: string;
  description: string;
  documents: Document[];
  icon: 'hr' | 'sop';
  isAdmin: boolean;
  getPublicUrl: (filePath: string) => string;
  onDelete: (doc: Document) => Promise<boolean>;
}

const DocumentList = ({
  title,
  description,
  documents,
  icon,
  isAdmin,
  getPublicUrl,
  onDelete,
}: DocumentListProps) => {
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const IconComponent = icon === 'hr' ? Book : ClipboardList;
  const colorClass = icon === 'hr' ? 'bg-info' : 'bg-purple';

  const handleDelete = async (doc: Document) => {
    setDeleting(doc.id);
    await onDelete(doc);
    setDeleting(null);
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <Card className="shadow-lg border-0">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center`}>
              <IconComponent className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">{title}</CardTitle>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <span className="text-xs bg-muted px-2 py-1 rounded-full">
              {documents.length} {documents.length === 1 ? 'file' : 'files'}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <FileWarning className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-sm font-medium">No docs yet</p>
              <p className="text-xs">Documents will appear here once uploaded by admin.</p>
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-3 rounded-xl border hover:border-primary/30 hover:bg-muted/30 transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.file_name} {doc.file_size ? `• ${formatFileSize(doc.file_size)}` : ''}
                    {' • '}
                    {format(new Date(doc.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPreviewDoc(doc)}
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => window.open(getPublicUrl(doc.file_path), '_blank')}
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(doc)}
                      disabled={deleting === doc.id}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* PDF Preview Dialog */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 truncate">
              <FileText className="w-5 h-5 text-primary flex-shrink-0" />
              {previewDoc?.title}
            </DialogTitle>
          </DialogHeader>
          {previewDoc && (
            <iframe
              src={getPublicUrl(previewDoc.file_path)}
              className="flex-1 w-full rounded-lg border"
              title={previewDoc.title}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DocumentList;
