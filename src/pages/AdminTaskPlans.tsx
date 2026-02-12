import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminTaskTemplates, DbTaskTemplate } from '@/hooks/useTaskTemplates';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Trash2, Edit2, Download, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const DEPARTMENTS = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales'];
const DAYS = [1, 2, 3, 4, 5, 6, 7];

const AdminTaskPlans = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading, isAuthenticated, roleLoading } = useAuth();
  const { templates, loading, addTemplate, updateTemplate, deleteTemplate, seedDefaults } = useAdminTaskTemplates();

  const [selectedDept, setSelectedDept] = useState('Engineering');
  const [selectedDay, setSelectedDay] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<DbTaskTemplate | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/');
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!roleLoading && !isAdmin) navigate('/dashboard');
  }, [roleLoading, isAdmin, navigate]);

  const filteredTasks = templates.filter(
    (t) => t.department === selectedDept && t.day_number === selectedDay
  );

  const openAddDialog = () => {
    setEditingTask(null);
    setTitle('');
    setDuration('1 hour');
    setPriority('medium');
    setDialogOpen(true);
  };

  const openEditDialog = (task: DbTaskTemplate) => {
    setEditingTask(task);
    setTitle(task.title);
    setDuration(task.duration);
    setPriority(task.priority);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !duration.trim()) {
      toast.error('Title and duration are required');
      return;
    }
    if (editingTask) {
      await updateTemplate(editingTask.id, { title, duration, priority });
    } else {
      await addTemplate({
        department: selectedDept,
        day_number: selectedDay,
        title,
        duration,
        priority,
        sort_order: filteredTasks.length,
      });
    }
    setDialogOpen(false);
  };

  const handleSeedDefaults = async () => {
    const existing = templates.filter((t) => t.department === selectedDept);
    if (existing.length > 0) {
      toast.error(`${selectedDept} already has custom tasks. Delete them first to re-seed.`);
      return;
    }
    await seedDefaults(selectedDept);
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Task Plan Settings</h1>
            <p className="text-muted-foreground">Customize onboarding task plans per department & day</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={selectedDept} onValueChange={setSelectedDept}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Day</Label>
                <div className="flex gap-1">
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                        day === selectedDay
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'bg-muted text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      D{day}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={handleSeedDefaults}>
                  <Download className="w-4 h-4 mr-1" />
                  Seed Defaults
                </Button>
                <Button size="sm" onClick={openAddDialog}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Task
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {selectedDept} — Day {selectedDay} Tasks
            </CardTitle>
            <CardDescription>
              {filteredTasks.length === 0
                ? 'No custom tasks. Employees will see default tasks. Click "Seed Defaults" to populate or "Add Task" to create custom ones.'
                : `${filteredTasks.length} custom task(s) configured`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-4 rounded-xl border bg-card"
                >
                  <div className="flex-1">
                    <p className="font-medium">{task.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {task.duration}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          task.priority === 'high'
                            ? 'bg-destructive/10 text-destructive'
                            : task.priority === 'medium'
                            ? 'bg-warning/10 text-warning'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(task)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteTemplate(task.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Add Task'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" />
            </div>
            <div className="space-y-2">
              <Label>Duration</Label>
              <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 1 hour" />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleSave}>
              {editingTask ? 'Update Task' : 'Add Task'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTaskPlans;
