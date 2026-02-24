import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ArrowLeft, Plus, Loader2, Trash2 } from 'lucide-react';
import { useAdminCommunications, Deadline, Announcement } from '@/hooks/useAdminCommunications';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const AdminCommunications = () => {
    const navigate = useNavigate();
    const { isAdmin, loading: authLoading, isAuthenticated, roleLoading } = useAuth();
    const {
        announcements,
        deadlines,
        loading,
        addAnnouncement,
        deleteAnnouncement,
        addDeadline,
        deleteDeadline,
    } = useAdminCommunications();

    // New Deadline State
    const [deadlineTitle, setDeadlineTitle] = useState('');
    const [deadlineDept, setDeadlineDept] = useState('Engineering');
    const [deadlineDate, setDeadlineDate] = useState<Date>();
    const [addingDeadline, setAddingDeadline] = useState(false);

    // New Announcement State
    const [annType, setAnnType] = useState('Company Wide');
    const [annTitle, setAnnTitle] = useState('');
    const [annContent, setAnnContent] = useState('');
    const [addingAnn, setAddingAnn] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) navigate('/');
    }, [authLoading, isAuthenticated, navigate]);

    useEffect(() => {
        if (!roleLoading && !isAdmin) navigate('/dashboard');
    }, [roleLoading, isAdmin, navigate]);

    if (authLoading || roleLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAdmin) return null;

    const handleAddDeadline = async () => {
        if (!deadlineTitle || !deadlineDept || !deadlineDate) {
            toast.error('All fields are required');
            return;
        }
        setAddingDeadline(true);
        try {
            await addDeadline({
                title: deadlineTitle,
                department: deadlineDept,
                due_date: format(deadlineDate, 'yyyy-MM-dd'),
            });
            setDeadlineTitle('');
            setDeadlineDate(undefined);
        } finally {
            setAddingDeadline(false);
        }
    };

    const handleAddAnnouncement = async () => {
        if (!annTitle || !annContent || !annType) {
            toast.error('All fields are required');
            return;
        }
        setAddingAnn(true);
        try {
            await addAnnouncement({
                title: annTitle,
                content: annContent,
                type: annType,
            });
            setAnnTitle('');
            setAnnContent('');
        } finally {
            setAddingAnn(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-5xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Communications Center</h1>
                        <p className="text-muted-foreground">Manage announcements and upcoming deadlines</p>
                    </div>
                </div>

                <Tabs defaultValue="deadlines" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                        <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
                        <TabsTrigger value="announcements">Announcements</TabsTrigger>
                    </TabsList>

                    {/* DEADLINES TAB */}
                    <TabsContent value="deadlines" className="space-y-6 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Add New Deadline</CardTitle>
                                <CardDescription>Visible on the dashboards of employees in the selected department</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    <div className="space-y-2 col-span-1 md:col-span-2">
                                        <label className="text-sm font-medium">Title</label>
                                        <Input
                                            placeholder="e.g. Submit I-9 Form"
                                            value={deadlineTitle}
                                            onChange={(e) => setDeadlineTitle(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Department</label>
                                        <Select value={deadlineDept} onValueChange={setDeadlineDept}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {['All', 'Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'HR', 'Finance'].map(
                                                    (d) => (
                                                        <SelectItem key={d} value={d}>
                                                            {d}
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2 flex flex-col">
                                        <label className="text-sm font-medium">Due Date</label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={'outline'}
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !deadlineDate && 'text-muted-foreground'
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {deadlineDate ? format(deadlineDate, 'PPP') : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={deadlineDate}
                                                    onSelect={setDeadlineDate}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                                <Button className="mt-4" onClick={handleAddDeadline} disabled={addingDeadline}>
                                    {addingDeadline && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    <Plus className="w-4 h-4 mr-2" /> Publish Deadline
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold">Active Deadlines</h3>
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            ) : deadlines.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>
                            ) : (
                                deadlines.map((d) => (
                                    <Card key={d.id}>
                                        <CardContent className="flex items-center justify-between p-4">
                                            <div>
                                                <p className="font-semibold">{d.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {d.department} • Due {format(new Date(d.due_date), 'MMM do, yyyy')}
                                                </p>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => deleteDeadline(d.id)}>
                                                <Trash2 className="w-4 h-4 text-destructive" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    {/* ANNOUNCEMENTS TAB */}
                    <TabsContent value="announcements" className="space-y-6 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Post Announcement</CardTitle>
                                <CardDescription>Creates a news post on employee dashboards</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium">Headline</label>
                                        <Input
                                            placeholder="e.g. Q3 Town Hall Meeting"
                                            value={annTitle}
                                            onChange={(e) => setAnnTitle(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Tag / Category</label>
                                        <Input
                                            placeholder="e.g. Company Wide"
                                            value={annType}
                                            onChange={(e) => setAnnType(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Message Body</label>
                                    <Textarea
                                        placeholder="Write your announcement here..."
                                        className="min-h-[100px]"
                                        value={annContent}
                                        onChange={(e) => setAnnContent(e.target.value)}
                                    />
                                </div>
                                <Button onClick={handleAddAnnouncement} disabled={addingAnn}>
                                    {addingAnn && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    <Plus className="w-4 h-4 mr-2" /> Post Announcement
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold">Recent Announcements</h3>
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            ) : announcements.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No announcements posted.</p>
                            ) : (
                                announcements.map((a) => (
                                    <Card key={a.id}>
                                        <CardContent className="flex items-start justify-between p-4">
                                            <div className="space-y-1 pr-6">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                                                        {a.type}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {format(new Date(a.created_at), 'PPp')}
                                                    </span>
                                                </div>
                                                <p className="font-semibold">{a.title}</p>
                                                <p className="text-sm text-muted-foreground">{a.content}</p>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => deleteAnnouncement(a.id)}>
                                                <Trash2 className="w-4 h-4 text-destructive" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default AdminCommunications;
