import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Sparkles, Shield, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(username, password);
    
    if (success) {
      toast.success('Welcome! Let\'s start your onboarding journey.');
      navigate('/dashboard');
    } else {
      toast.error('Invalid credentials. Try company@123 / 1234');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-blue flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card shadow-xl mb-4">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-primary-foreground">User Login</h1>
          <p className="text-primary-foreground/80">AI-Powered Employee Onboarding</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="company@123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-blue hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-primary-foreground/90 bg-card/10 backdrop-blur-sm rounded-xl p-3">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-sm">User credentials validation</span>
          </div>
          <div className="flex items-center gap-3 text-primary-foreground/90 bg-card/10 backdrop-blur-sm rounded-xl p-3">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <span className="text-sm">First-time login detection</span>
          </div>
          <div className="flex items-center gap-3 text-primary-foreground/90 bg-card/10 backdrop-blur-sm rounded-xl p-3">
            <div className="w-2 h-2 rounded-full bg-info" />
            <span className="text-sm">Session initialization</span>
          </div>
        </div>

        {/* Trigger Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 bg-gradient-orange text-primary-foreground px-4 py-2 rounded-full shadow-lg">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Triggers AI Onboarding</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
