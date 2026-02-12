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
  Sparkles,
  Loader2,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const { profile, isAuthenticated, loading, signOut, isAdmin, roleLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/');
      return;
    }
    
    if (profile?.is_first_login) {
      navigate('/profile-setup');
    }
  }, [isAuthenticated, loading, navigate, profile?.is_first_login]);

  const handleLogout = async () => {
    await signOut();
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

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  const currentDay = profile.current_day || 1;
  const role = profile.role || 'Software Engineer';
  const department = profile.department || 'Engineering';

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
                <span className="text-sm">{role}</span>
              </div>
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/admin/users')}
                    className="text-primary-foreground hover:bg-card/20"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Users
                  </Button>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/admin/task-plans')}
                    className="text-primary-foreground hover:bg-card/20"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Task Plans
                  </Button>
                </div>
              )}
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
                <p className="text-lg font-semibold">Day {currentDay} of 7</p>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <div
                    key={day}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                      day < currentDay
                        ? 'bg-success text-success-foreground'
                        : day === currentDay
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
                    <p className="font-medium">{role}</p>
                  </div>
                  <div>
                    <p className="opacity-70">Department</p>
                    <p className="font-medium">{department}</p>
                  </div>
                  <div>
                    <p className="opacity-70">Current Day</p>
                    <p className="font-medium">Day {currentDay} of 7</p>
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
