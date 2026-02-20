import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles, CheckCircle2, Circle, ChevronRight, Users,
  Calendar, MessageSquare, FileText, Shield, Play,
  Star, Trophy, Zap, Clock, ArrowRight, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---- Timeline milestones ----
const milestones = [
  { day: 'Day 1', label: 'Orientation & Access', description: 'Get set up, meet your team, and complete compliance docs', icon: Star, gradient: 'bg-gradient-blue', done: true },
  { day: 'Day 2–3', label: 'Role Deep Dive', description: 'Explore your tools, workflows, and first real tasks', icon: Zap, gradient: 'bg-gradient-orange', done: false },
  { day: 'Week 1', label: 'First Deliverable', description: 'Submit a small project to get feedback from your manager', icon: Trophy, gradient: 'bg-gradient-green', done: false },
  { day: 'Week 2–3', label: 'Cross-team Collab', description: 'Shadow other teams and schedule coffee chats', icon: Users, gradient: 'bg-gradient-pink', done: false },
  { day: 'Month 1', label: 'Full Ramp-Up', description: 'Operate independently and complete your onboarding certificate', icon: CheckCircle2, gradient: 'bg-gradient-blue', done: false },
];

// ---- Mock team members ----
const teamMembers = [
  { name: 'Sarah K.', role: 'Engineering Lead', initials: 'SK', color: 'bg-gradient-blue' },
  { name: 'Marcus T.', role: 'Product Manager', initials: 'MT', color: 'bg-gradient-orange' },
  { name: 'Priya R.', role: 'Design Lead', initials: 'PR', color: 'bg-gradient-green' },
  { name: 'James L.', role: 'HR Partner', initials: 'JL', color: 'bg-gradient-pink' },
];

// ---- XP Badge Component ----
const XPBadge = ({ label, icon: Icon, earned }: { label: string; icon: React.ElementType; earned: boolean }) => (
  <div className={cn(
    'flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all',
    earned ? 'border-success/30 bg-success/10' : 'border-border bg-muted/30 opacity-50'
  )}>
    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', earned ? 'bg-gradient-green' : 'bg-muted')}>
      <Icon className={cn('w-5 h-5', earned ? 'text-success-foreground' : 'text-muted-foreground')} />
    </div>
    <span className="text-xs font-medium text-center leading-tight">{label}</span>
    {earned && <span className="text-xs text-success font-semibold">Earned!</span>}
  </div>
);

const Welcome = () => {
  const { profile, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [progressAnim, setProgressAnim] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const currentDay = profile?.current_day || 1;
  const progressPct = Math.round(((currentDay - 1) / 7) * 100);
  const estimatedMins = Math.max(0, (7 - currentDay + 1) * 45);
  const role = profile?.role || 'your role';
  const name = profile?.full_name || profile?.username || 'there';
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
            <div className="inline-flex items-center gap-2 bg-card/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Your personalized onboarding experience</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Welcome, {name}! 👋
            </h1>
            <p className="text-xl opacity-85">
              You're joining as <strong>{role}</strong>. Here's everything you need to hit the ground running.
            </p>

            {/* Animated progress ring area */}
            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="text-center">
                <div className="text-4xl font-bold">{currentDay}</div>
                <div className="text-sm opacity-70">Current Day</div>
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
                  day < currentDay ? 'bg-success' :
                  day === currentDay ? 'bg-primary animate-pulse' :
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
                          <p className="text-xs text-muted-foreground mt-1 animate-fade-in">{m.description}</p>
                        )}
                      </div>
                      {activeStep === i && <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Company Intro Video Placeholder */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="h-1 bg-gradient-green" />
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Play className="w-5 h-5 text-primary" />
                  Company Introduction
                </h2>
                <div className="relative bg-gradient-blue rounded-2xl overflow-hidden aspect-video flex items-center justify-center group cursor-pointer">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_white_0%,_transparent_70%)]" />
                  <div className="text-center text-primary-foreground space-y-3">
                    <div className="w-20 h-20 rounded-full bg-card/20 backdrop-blur-sm flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-xl">
                      <Play className="w-8 h-8 fill-current ml-1" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Welcome to the Company</p>
                      <p className="text-sm opacity-80">4 min intro · Meet the leadership team</p>
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-card/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-primary-foreground font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 4:02
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {['Culture & Values', 'Meet the CEO', 'How We Work'].map((title, i) => (
                    <div key={i} className="bg-muted/50 rounded-xl p-3 cursor-pointer hover:bg-muted transition-colors text-center">
                      <div className="w-8 h-8 rounded-lg bg-gradient-orange mx-auto mb-2 flex items-center justify-center">
                        <Play className="w-3.5 h-3.5 text-primary-foreground ml-0.5" />
                      </div>
                      <p className="text-xs font-medium">{title}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">

            {/* Team Preview */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="h-1 bg-gradient-pink" />
              <CardContent className="p-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Your Team
                </h2>
                <div className="space-y-3">
                  {teamMembers.map((m, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group">
                      <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0', m.color)}>
                        {m.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{m.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{m.role}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4 text-sm" size="sm">
                  View Full Directory
                </Button>
              </CardContent>
            </Card>

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
                    <div className="text-2xl font-bold text-success">{currentDay - 1}</div>
                    <div className="text-xs text-muted-foreground">Days Done</div>
                  </div>
                  <div className="bg-warning/10 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-warning">{7 - currentDay + 1}</div>
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

            {/* Badges / Gamification */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <CardContent className="p-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-warning" />
                  Achievements
                </h2>
                <div className="grid grid-cols-3 gap-2">
                  <XPBadge label="Early Bird" icon={Star} earned={currentDay >= 1} />
                  <XPBadge label="Day 3 Hero" icon={Zap} earned={currentDay >= 3} />
                  <XPBadge label="Week 1 ✓" icon={Trophy} earned={currentDay >= 7} />
                  <XPBadge label="Chat Pro" icon={MessageSquare} earned={false} />
                  <XPBadge label="Doc Reader" icon={FileText} earned={false} />
                  <XPBadge label="Safe Space" icon={Shield} earned={false} />
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
                  <div className="flex justify-between"><span>Tasks left</span><span className="font-medium">{(7 - currentDay + 1) * 3}</span></div>
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
