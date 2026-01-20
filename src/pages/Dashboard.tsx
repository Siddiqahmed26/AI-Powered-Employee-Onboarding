import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  FileText, 
  Calendar, 
  Shield, 
  Home,
  LogOut,
  User,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user, logout, isAuthenticated, setFirstLoginComplete } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    if (user?.isFirstLogin) {
      toast.success('Welcome! Your Week-1 onboarding plan has been generated.', {
        icon: <Sparkles className="w-4 h-4" />,
        duration: 5000,
      });
      setFirstLoginComplete();
    }
  }, [isAuthenticated, navigate, user?.isFirstLogin, setFirstLoginComplete]);

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.info('Logged out successfully');
  };

  const navItems = [
    {
      title: 'Context Chat',
      description: 'AI assistant aware of your role & progress',
      icon: MessageSquare,
      path: '/chat',
      gradient: 'bg-gradient-green',
    },
    {
      title: 'Documents',
      description: 'Company policies & SOPs',
      icon: FileText,
      path: '/documents',
      gradient: 'bg-gradient-blue',
    },
    {
      title: 'Day Plan',
      description: 'Your personalized daily tasks',
      icon: Calendar,
      path: '/day-plan',
      gradient: 'bg-gradient-orange',
    },
    {
      title: 'Safe Mode',
      description: 'Ask anything without judgment',
      icon: Shield,
      path: '/safe-mode',
      gradient: 'bg-gradient-pink',
    },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-blue text-primary-foreground">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-card/20 backdrop-blur-sm flex items-center justify-center">
                <Home className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-sm opacity-80">Central navigation hub connecting all onboarding features</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 bg-card/10 backdrop-blur-sm rounded-lg px-3 py-2">
                <User className="w-4 h-4" />
                <span className="text-sm">{user.role}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
                className="text-primary-foreground hover:bg-card/20"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Day Progress */}
      <div className="container mx-auto px-4 -mt-4">
        <Card className="shadow-lg border-0">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Progress</p>
                <p className="text-lg font-semibold">Day {user.currentDay} of 7</p>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <div
                    key={day}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                      day < user.currentDay
                        ? 'bg-success text-success-foreground'
                        : day === user.currentDay
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    D{day}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Grid */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {navItems.map((item) => (
            <Card 
              key={item.path}
              className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg overflow-hidden group"
              onClick={() => navigate(item.path)}
            >
              <div className={`h-2 ${item.gradient}`} />
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${item.gradient} flex items-center justify-center`}>
                    <item.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {item.title}
                    </CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </main>

      {/* User Context Card */}
      <div className="container mx-auto px-4 pb-8">
        <Card className="bg-gradient-green text-primary-foreground border-0 shadow-lg">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-card/20 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold">Your Context</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="opacity-70">Role</p>
                    <p className="font-medium">{user.role}</p>
                  </div>
                  <div>
                    <p className="opacity-70">Department</p>
                    <p className="font-medium">{user.department}</p>
                  </div>
                  <div>
                    <p className="opacity-70">Current Day</p>
                    <p className="font-medium">Day {user.currentDay} of 7</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
