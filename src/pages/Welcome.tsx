import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles, CheckCircle2, Circle, ChevronRight, Users,
  Calendar, MessageSquare, FileText, Shield, Play,
  Star, Trophy, Zap, Clock, ArrowRight, Loader2, PartyPopper
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---- Timeline milestones ----
const milestones = [
  { day: 'Day 1', label: 'Orientation & Access', description: 'Get set up, meet your team, and complete compliance docs', icon: Star, gradient: 'bg-gradient-blue', path: '/documents', buttonText: 'Review Documents' },
  { day: 'Day 2–3', label: 'Role Deep Dive & Planning', description: 'Explore your tools, workflows, and plan your first tasks', icon: Zap, gradient: 'bg-gradient-orange', path: '/day-plan', buttonText: 'View Day Plan' },
  { day: 'Day 4', label: 'AI Context Chat', description: 'Engage with your personalized AI assistant to learn about organizational context', icon: MessageSquare, gradient: 'bg-gradient-green', path: '/chat', buttonText: 'Chat with AI' },
  { day: 'Day 5', label: 'Safe Mode Queries', description: 'Ask any questions securely and without judgment using safe mode', icon: Shield, gradient: 'bg-gradient-pink', path: '/safe-mode', buttonText: 'Enter Safe Mode' },
  { day: 'Day 6–7', label: 'First Week Review', description: 'Review your overall progress, dashboard, and initial milestones', icon: CheckCircle2, gradient: 'bg-gradient-blue', path: '/dashboard', buttonText: 'View Dashboard' },
];



const Welcome = () => {
  const { user, profile, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [progressAnim, setProgressAnim] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const currentDay = profile?.current_day || 1;
  const effectiveDay = Math.min(7, currentDay);
  const isFullyComplete = currentDay > 7;
  const daysDone = isFullyComplete ? 7 : Math.max(0, currentDay - 1);
  const daysLeft = isFullyComplete ? 0 : Math.max(0, 7 - currentDay + 1);
  const progressPct = isFullyComplete ? 100 : Math.round((daysDone / 7) * 100);
  const estimatedMins = daysLeft * 45;
  const role = profile?.role || 'your role';

  const getDisplayName = () => {
    if (profile?.full_name) return profile.full_name;
    const metaName = user?.user_metadata?.full_name || user?.user_metadata?.name;
    if (metaName) return metaName;

    const emailStr = profile?.username?.includes('@') ? profile.username : user?.email;
    if (emailStr && emailStr.includes('@')) {
      const parts = emailStr.split('@')[0].split(/[._-]/);
      return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
    }
    return profile?.username || 'there';
  };
  const name = getDisplayName();

  const managerName = (profile as any)?.manager_name || 'Your Manager';
  const managerMessage = (profile as any)?.manager_message ||
    `Welcome to the team! We're thrilled to have you join us as ${role}. Your first week is designed to help you settle in, meet the team, and start contributing. Don't hesitate to ask questions — we're all here to help you succeed!`;

  // Auth guard
  useEffect(() => {
    if (!loading && !isAuthenticated) navigate('/');
  }, [loading, isAuthenticated, navigate]);

  // Animate progress bar on mount
  useEffect(() => {
    const t = setTimeout(() => setProgressAnim(progressPct), 200);
    return () => clearTimeout(t);
  }, [progressPct]);

  // Auto-advance timeline highlight
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(s => (s + 1) % milestones.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="bg-gradient-blue text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-primary-foreground"
              style={{
                width: `${(i + 1) * 120}px`,
                height: `${(i + 1) * 120}px`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                animation: `pulse ${2 + i * 0.5}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>
        <div className="container mx-auto px-4 py-12 relative">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className={`inline-flex items-center gap-2 bg-card/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-2`}>
              {isFullyComplete ? <PartyPopper className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              <span>{isFullyComplete ? 'Graduation Complete' : 'Your personalized onboarding experience'}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              {isFullyComplete ? 'Congratulations' : 'Welcome'}, {name}! {isFullyComplete ? '🎉' : '👋'}
            </h1>
            <p className="text-xl opacity-85">
              {isFullyComplete
                ? <>You've successfully completed your onboarding as <strong>{role}</strong>. Amazing job!</>
                : <>You're joining as <strong>{role}</strong>. Here's everything you need to hit the ground running.</>}
            </p>

            {/* Animated progress ring area */}
            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="text-center">
                <div className="text-4xl font-bold">{isFullyComplete ? 'Done' : effectiveDay}</div>
                <div className="text-sm opacity-70">{isFullyComplete ? 'Status' : 'Current Day'}</div>
              </div>
              <div className="w-px h-12 bg-primary-foreground/20" />
              <div className="text-center">
                <div className="text-4xl font-bold">{progressPct}%</div>
                <div className="text-sm opacity-70">Complete</div>
              </div>
              <div className="w-px h-12 bg-primary-foreground/20" />
              <div className="text-center">
                <div className="text-4xl font-bold flex items-center gap-1">
                  <Clock className="w-7 h-7" />{Math.round(estimatedMins / 60)}h
                </div>
                <div className="text-sm opacity-70">Remaining</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isFullyComplete && (
        <div className="bg-success text-success-foreground py-3 text-center text-sm font-medium shadow-sm animate-fade-in">
          <span className="flex items-center justify-center gap-2">
            <Trophy className="w-4 h-4" /> You've earned your Onboarding Certificate! Check your Dashboard to view it.
          </span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Overall Progress</span>
            <div className="flex-1">
              <Progress value={progressAnim} className="h-3 transition-all duration-1000" />
            </div>
            <span className="text-sm font-semibold text-primary whitespace-nowrap">{progressPct}%</span>
          </div>
          <div className="flex gap-2 mt-3">
            {[1, 2, 3, 4, 5, 6, 7].map(day => (
              <div
                key={day}
                className={cn(
                  'flex-1 h-2 rounded-full transition-all duration-500',
                  day <= daysDone ? 'bg-success' :
                    (day === currentDay && !isFullyComplete) ? 'bg-primary animate-pulse' :
                      'bg-muted'
                )}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Day 1</span>
            <span>Day 7</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">

            {/* Manager Welcome Card */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="h-1 bg-gradient-blue" />
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-blue flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-primary-foreground font-bold text-lg">
                      {managerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{managerName}</h3>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Your Manager</span>
                    </div>
                    <div className="relative bg-muted/40 rounded-xl p-4 mt-2">
                      <div className="absolute -top-2 left-4 w-4 h-4 bg-muted/40 rotate-45 rounded-sm" />
                      <p className="text-sm text-muted-foreground leading-relaxed italic">
                        "{managerMessage}"
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Onboarding Timeline */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="h-1 bg-gradient-orange" />
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg mb-5 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Your Onboarding Timeline
                </h2>
                <div className="space-y-3">
                  {milestones.map((m, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex items-start gap-4 p-4 rounded-xl border transition-all duration-500 cursor-pointer',
                        activeStep === i ? 'border-primary/30 bg-primary/5 shadow-sm' : 'border-border hover:border-primary/20 hover:bg-muted/20',
                        i < currentDay - 1 ? 'opacity-75' : ''
                      )}
                      onClick={() => setActiveStep(i)}
                    >
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', m.gradient)}>
                        {i < currentDay - 1 ? (
                          <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
                        ) : (
                          <m.icon className="w-5 h-5 text-primary-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{m.day}</span>
                          {i < currentDay - 1 && <span className="text-xs text-success font-medium">✓ Done</span>}
                          {i === currentDay - 1 && <span className="text-xs text-primary font-medium">← You are here</span>}
                        </div>
                        <p className="font-medium text-sm mt-0.5">{m.label}</p>
                        {activeStep === i && (
                          <div className="animate-fade-in mt-2 space-y-3">
                            <p className="text-xs text-muted-foreground">{m.description}</p>
                            <Button
                              size="sm"
                              className={cn("w-full gap-2 text-xs", m.gradient)}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(m.path);
                              }}
                            >
                              {m.buttonText} <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>


          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">



            {/* Quick Stats */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <CardContent className="p-6 space-y-3">
                <h2 className="font-semibold mb-1 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-warning" />
                  Your Stats
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-primary/5 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-primary">{(profile as any)?.xp_points || 0}</div>
                    <div className="text-xs text-muted-foreground">XP Points</div>
                  </div>
                  <div className="bg-success/10 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-success">{daysDone}</div>
                    <div className="text-xs text-muted-foreground">Days Done</div>
                  </div>
                  <div className="bg-warning/10 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-warning">{daysLeft}</div>
                    <div className="text-xs text-muted-foreground">Days Left</div>
                  </div>
                  <div className="bg-purple/10 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold" style={{ color: 'hsl(var(--purple))' }}>
                      {((profile as any)?.badges || []).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Badges</div>
                  </div>
                </div>
              </CardContent>
            </Card>



            {/* Estimated Completion */}
            <Card className="border-0 shadow-lg overflow-hidden bg-gradient-green text-primary-foreground">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-6 h-6" />
                  <h2 className="font-semibold">Estimated Completion</h2>
                </div>
                <p className="text-3xl font-bold">{estimatedMins < 60 ? `${estimatedMins}m` : `${Math.round(estimatedMins / 60)}h ${estimatedMins % 60}m`}</p>
                <p className="text-sm opacity-80 mt-1">remaining in your onboarding</p>
                <div className="mt-4 pt-4 border-t border-primary-foreground/20 text-sm opacity-90 space-y-1">
                  <div className="flex justify-between"><span>Tasks left</span><span className="font-medium">{daysLeft * 3}</span></div>
                  <div className="flex justify-between"><span>Est. per task</span><span className="font-medium">~15 min</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pb-4">
          <Button
            size="lg"
            className="bg-gradient-blue hover:opacity-90 transition-opacity gap-2 shadow-lg"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard <ArrowRight className="w-5 h-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="gap-2"
            onClick={() => navigate('/day-plan')}
          >
            <Calendar className="w-5 h-5" />
            View Today's Plan
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
