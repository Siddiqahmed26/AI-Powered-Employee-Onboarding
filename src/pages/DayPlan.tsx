import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Calendar, CheckCircle2, Clock, Zap, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

const dayPlans: Record<number, Task[]> = {
  1: [
    { id: '1-1', title: 'Complete HR paperwork', duration: '1 hour', completed: false, priority: 'high' },
    { id: '1-2', title: 'Set up development environment', duration: '2 hours', completed: false, priority: 'high' },
    { id: '1-3', title: 'Meet your team lead', duration: '30 min', completed: false, priority: 'medium' },
    { id: '1-4', title: 'Review employee handbook', duration: '1 hour', completed: false, priority: 'medium' },
  ],
  2: [
    { id: '2-1', title: 'Complete security training', duration: '1 hour', completed: false, priority: 'high' },
    { id: '2-2', title: 'Get access to code repository', duration: '30 min', completed: false, priority: 'high' },
    { id: '2-3', title: 'Review team documentation', duration: '2 hours', completed: false, priority: 'medium' },
  ],
  3: [
    { id: '3-1', title: 'Shadow a team member', duration: '3 hours', completed: false, priority: 'high' },
    { id: '3-2', title: 'Attend team standup', duration: '30 min', completed: false, priority: 'medium' },
    { id: '3-3', title: 'Review current sprint tasks', duration: '1 hour', completed: false, priority: 'medium' },
  ],
  4: [
    { id: '4-1', title: 'Pick your first bug to fix', duration: '30 min', completed: false, priority: 'high' },
    { id: '4-2', title: 'Set up local testing environment', duration: '1 hour', completed: false, priority: 'high' },
    { id: '4-3', title: 'Review code review guidelines', duration: '45 min', completed: false, priority: 'medium' },
  ],
  5: [
    { id: '5-1', title: 'Review codebase architecture', duration: '2 hours', completed: false, priority: 'high' },
    { id: '5-2', title: 'Complete first small bug fix', duration: '2 hours', completed: false, priority: 'high' },
    { id: '5-3', title: 'Submit your first PR', duration: '30 min', completed: false, priority: 'medium' },
  ],
  6: [
    { id: '6-1', title: 'Pair programming session', duration: '2 hours', completed: false, priority: 'high' },
    { id: '6-2', title: 'Attend 1:1 with manager', duration: '30 min', completed: false, priority: 'high' },
    { id: '6-3', title: 'Document learnings so far', duration: '1 hour', completed: false, priority: 'medium' },
  ],
  7: [
    { id: '7-1', title: 'Present Week 1 summary', duration: '30 min', completed: false, priority: 'high' },
    { id: '7-2', title: 'Set goals for Week 2', duration: '1 hour', completed: false, priority: 'high' },
    { id: '7-3', title: 'Feedback session with team', duration: '30 min', completed: false, priority: 'medium' },
  ],
};

const DayPlan = () => {
  const { profile, isAuthenticated, loading, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDay, setSelectedDay] = useState(1);

  const currentDay = profile?.current_day || 1;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/');
      return;
    }
    if (profile) {
      setSelectedDay(currentDay);
    }
  }, [isAuthenticated, loading, navigate, profile, currentDay]);

  useEffect(() => {
    // Load tasks for selected day
    const storedTasks = localStorage.getItem(`tasks_day_${selectedDay}`);
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    } else {
      setTasks(dayPlans[selectedDay] || []);
    }
  }, [selectedDay]);

  const toggleTask = (taskId: string) => {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    setTasks(updated);
    localStorage.setItem(`tasks_day_${selectedDay}`, JSON.stringify(updated));
    
    const task = tasks.find(t => t.id === taskId);
    if (task && !task.completed) {
      toast.success('Task completed! Great progress! 🎉');
    }
  };

  const handleDayChange = (day: number) => {
    setSelectedDay(day);
    if (profile && day !== currentDay) {
      updateProfile({ current_day: day });
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  if (loading || !profile) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-orange text-primary-foreground">
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
              <h1 className="text-xl font-bold">Auto-Generated Day-Wise Plan</h1>
              <p className="text-sm opacity-80">Plan created automatically on first login</p>
            </div>
            <div className="bg-card/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <span className="text-xs font-medium">AUTO-GENERATED</span>
            </div>
          </div>
        </div>
      </header>

      {/* Day Selector */}
      <div className="container mx-auto px-4 py-4">
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-info" />
              <CardTitle className="text-base">Initial Setup</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <button
                  key={day}
                  onClick={() => handleDayChange(day)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                    day === selectedDay
                      ? 'bg-info text-info-foreground shadow-md'
                      : day <= currentDay
                      ? 'bg-success/20 text-success border border-success/30'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  D{day}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <div className="container mx-auto px-4 pb-4">
        <Card className="bg-gradient-blue text-primary-foreground border-0 shadow-lg">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                <span className="font-medium">Day {selectedDay} Progress</span>
              </div>
              <span className="text-sm">{completedCount}/{tasks.length} tasks</span>
            </div>
            <div className="h-3 bg-card/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-card transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks */}
      <main className="container mx-auto px-4 pb-8">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <CardTitle className="text-base">Today's Tasks</CardTitle>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <RefreshCw className="w-3 h-3" />
                <span>Real-Time Adaptation</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                  task.completed
                    ? 'bg-success/5 border-success/20'
                    : 'bg-card border-border hover:border-primary/30'
                }`}
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {task.duration}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      task.priority === 'high' 
                        ? 'bg-coral/10 text-coral' 
                        : task.priority === 'medium'
                        ? 'bg-warning/10 text-warning'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Dynamic Updates Card */}
        <Card className="mt-4 border-l-4 border-l-info shadow-sm">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-4 h-4 text-info" />
              <span className="font-medium text-sm">Dynamic Updates</span>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                <span><strong className="text-foreground">Progress-Based:</strong> Plan adjusts based on user interaction</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-info" />
                <span><strong className="text-foreground">Real-Time Adaptation:</strong> AI learns from user behavior</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DayPlan;
