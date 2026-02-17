import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const passwordSchema = z.string().min(6, { message: "Password must be at least 6 characters" });

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event from the email link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidSession(true);
      }
    });

    // Also check if we already have a recovery session (page reload case)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsValidSession(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        setIsLoading(false);
        return;
      }
    }

    if (password !== confirmPassword) {
      toast.error("Passwords don't match.");
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error(error.message);
    } else {
      setIsDone(true);
      await supabase.auth.signOut();
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-blue flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card shadow-xl mb-4">
            {isDone ? (
              <CheckCircle className="w-8 h-8 text-success" />
            ) : (
              <KeyRound className="w-8 h-8 text-primary" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-primary-foreground">
            {isDone ? 'Password updated!' : 'Reset your password'}
          </h1>
          <p className="text-primary-foreground/80">AI-Powered Employee Onboarding</p>
        </div>

        <Card className="shadow-2xl border-0">
          {isDone ? (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-xl">All done!</CardTitle>
                <CardDescription>
                  Your password has been updated. You can now sign in with your new password.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full h-11 bg-gradient-blue hover:opacity-90 transition-opacity"
                  onClick={() => navigate('/')}
                >
                  Back to Sign In
                </Button>
              </CardContent>
            </>
          ) : !isValidSession ? (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Invalid or expired link</CardTitle>
                <CardDescription>
                  This password reset link is invalid or has expired. Please request a new one.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => navigate('/')}
                >
                  Back to Sign In
                </Button>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl">Choose a new password</CardTitle>
                <CardDescription>
                  Must be at least 6 characters long.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New password</Label>
                    <PasswordInput
                      id="new-password"
                      placeholder="••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm new password</Label>
                    <PasswordInput
                      id="confirm-password"
                      placeholder="••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-blue hover:opacity-90 transition-opacity"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Updating...' : 'Update password'}
                  </Button>
                </form>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
