import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDocuments } from '@/hooks/useDocuments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import DocumentList from '@/components/Documents/DocumentList';
import UploadDocumentDialog from '@/components/Documents/UploadDocumentDialog';
import {
  ArrowLeft,
  FileText,
  Upload,
  Search,
  CheckCircle,
  Info,
} from 'lucide-react';

const Documents = () => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const {
    hrPolicies,
    toolSops,
    loading,
    uploadDocument,
    deleteDocument,
    getPublicUrl,
  } = useDocuments();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleUpload = async (file: File, title: string, category: 'hr_policy' | 'tool_sop') => {
    if (!user) return false;
    return uploadDocument(file, title, category, user.id);
  };

  const responseProtocol = [
    {
      number: 1,
      title: 'Primary Source',
      desc: 'Answers from company documents first',
      color: 'bg-success',
    },
    {
      number: 2,
      title: 'Fallback Response',
      desc: '"This isn\'t in the docs yet, but usually..."',
      color: 'bg-warning',
    },
    {
      number: 3,
      title: 'Transparency',
      desc: 'Always indicate source confidence',
      color: 'bg-info',
    },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-blue text-primary-foreground">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="text-primary-foreground hover:bg-card/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Company Document Grounding</h1>
              <p className="text-sm opacity-80">Access company policies and procedures</p>
            </div>
            <div className="bg-card/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <span className="text-xs font-medium">BRANCH 2</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Admin Upload Button */}
        {isAdmin && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-blue flex items-center justify-center">
                <Upload className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-medium text-sm">Admin Uploads</span>
            </div>
            <UploadDocumentDialog onUpload={handleUpload} />
          </div>
        )}

        {/* Document Lists */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        ) : (
          <>
            <DocumentList
              title="HR Policy PDFs"
              description="Employee handbook, benefits, company policies"
              documents={hrPolicies}
              icon="hr"
              isAdmin={isAdmin}
              getPublicUrl={getPublicUrl}
              onDelete={deleteDocument}
            />
            <DocumentList
              title="Tool SOPs"
              description="Standard operating procedures"
              documents={toolSops}
              icon="sop"
              isAdmin={isAdmin}
              getPublicUrl={getPublicUrl}
              onDelete={deleteDocument}
            />
          </>
        )}

        {/* AI Response Protocol */}
        <Card className="bg-gradient-orange text-primary-foreground border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              <CardTitle className="text-base">AI Response Protocol</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {responseProtocol.map((item) => (
              <div key={item.number} className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full ${item.color} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-xs font-bold text-primary-foreground">{item.number}</span>
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm opacity-80">{item.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Example Scenario */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Example: Policy Question
            </CardTitle>
            <p className="text-sm text-muted-foreground">Sarah needs clarification on remote work policy</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
              <p className="text-xs text-warning font-medium mb-1">User Query:</p>
              <p className="text-sm italic">"Can I work from home on Fridays?"</p>
            </div>
            <div className="bg-info/10 border border-info/20 rounded-xl p-4">
              <p className="text-xs text-info font-medium mb-1">Document Grounding:</p>
              <p className="text-sm">AI searches HR Policy PDF for remote work section</p>
            </div>
            <div className="bg-success/10 border border-success/20 rounded-xl p-4">
              <p className="text-xs text-success font-medium mb-1">AI Response:</p>
              <p className="text-sm">
                "According to our HR policy, engineers can work remotely up to 2 days per week
                after the first month. You're welcome to discuss flexible arrangements with your manager!"
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-success" />
              <span>Source: HR_Policy_2024.pdf (Page 12) • Confidence: High</span>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="border-l-4 border-l-info shadow-sm">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm mb-1">How it works</p>
                <p className="text-sm text-muted-foreground">
                  When you ask a question, the AI first searches through company documents.
                  If the answer is found, it provides a sourced response. If not, it will
                  give general guidance while clearly indicating the information is not from
                  official documents.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Documents;
