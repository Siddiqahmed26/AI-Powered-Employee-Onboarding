import { Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface VerifyEmailProps {
  email?: string;
}

const VerifyEmail = ({ email }: VerifyEmailProps) => {
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Verification email resent! Check your inbox.');
    }
    setResending(false);
  };

  return (
    <div className="min-h-screen bg-gradient-blue flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card shadow-xl mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-primary-foreground">Check your email</h1>
          <p className="text-primary-foreground/80">AI-Powered Employee Onboarding</p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1 pb-4 text-center">
            <CardTitle className="text-xl">Verify your email address</CardTitle>
            <CardDescription>
              We sent a verification link to{' '}
              {email ? <span className="font-medium text-foreground">{email}</span> : 'your email'}.
              Click the link to activate your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground space-y-2">
              <p>• Check your spam or junk folder if you don't see it</p>
              <p>• The link expires after 24 hours</p>
              <p>• You must verify before signing in</p>
            </div>

            {email && (
              <Button
                variant="outline"
                className="w-full h-11"
                onClick={handleResend}
                disabled={resending}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${resending ? 'animate-spin' : ''}`} />
                {resending ? 'Resending...' : 'Resend verification email'}
              </Button>
            )}

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate('/')}
            >
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmail;
