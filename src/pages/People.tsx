import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Users, Search, Filter, MapPin, Briefcase, ChevronRight,
    MessageSquare, Coffee, Sparkles, Loader2, ArrowLeft, Send
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Person {
    id: string;
    name: string;
    role: string;
    department: string;
    location: string;
    bio: string;
    skills: string[];
    initials: string;
    avatarUrl: string | null;
    email: string | null;
    color: string;
    isNewJoinee: boolean;
    unreadCount: number;
}

const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
};

const getColor = (index: number) => {
    const colors = ['bg-gradient-blue', 'bg-gradient-orange', 'bg-gradient-green', 'bg-gradient-pink'];
    return colors[index % colors.length];
};

const People = () => {
    const { isAuthenticated, loading, profile } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [directory, setDirectory] = useState<Person[]>([]);
    const [loadingDir, setLoadingDir] = useState(true);

    // Chat UI state
    const [chatUser, setChatUser] = useState<Person | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState<{ id: string, text: string, sender: 'me' | 'them', time: string }[]>([]);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/');
        }
    }, [loading, isAuthenticated, navigate]);

    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const { data, error } = await supabase.from('profiles').select('*');
                if (error) throw error;

                // Fetch unread messages for the current user
                const { data: unreadData, error: unreadError } = await supabase
                    .from('messages')
                    .select('sender_id, id')
                    .eq('receiver_id', profile?.id)
                    .eq('is_read', false);

                if (unreadError) {
                    console.error("Error fetching unread messages:", unreadError);
                }

                // Count unread messages per sender
                const unreadCounts = (unreadData || []).reduce((acc: Record<string, number>, msg) => {
                    acc[msg.sender_id] = (acc[msg.sender_id] || 0) + 1;
                    return acc;
                }, {});

                if (data && profile) {
                    const filteredData = data.filter((p: any) => p.id !== profile.id);
                    const mapped = filteredData.map((p: any, ix: number) => {
                        const rawName = p.full_name || p.username || p.email || 'Employee';
                        const isEmailSource = rawName.includes('@');

                        let finalName = rawName;
                        if (isEmailSource) {
                            const emailPrefix = rawName.split('@')[0];
                            const baseName = emailPrefix
                                .split(/[\._\-]+/) // Split "john.doe" or "john_doe"
                                .map(w => w.replace(/[^a-zA-Z]/g, '')) // Remove numbers 
                                .filter(w => w.length > 0)
                                .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                                .join(' ');
                            finalName = baseName || 'User';
                        } else {
                            finalName = rawName
                                .split(' ')
                                .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                                .join(' ')
                                .trim() || 'Employee';
                        }

                        const finalEmail = p.email || (isEmailSource ? rawName : `${finalName.toLowerCase().replace(/\s+/g, '.')}@company.com`);

                        return {
                            id: p.id,
                            name: finalName,
                            role: p.job_title || 'Employee',
                            department: p.department || 'General',
                            location: p.location || 'Remote',
                            bio: p.bio || 'Happy to connect!',
                            skills: p.skills || [],
                            avatarUrl: p.avatar_url || null,
                            email: finalEmail,
                            initials: getInitials(finalName),
                            color: getColor(ix),
                            isNewJoinee: (p.current_day || 1) <= 7,
                            unreadCount: unreadCounts[p.id] || 0,
                        };
                    });

                    // Sort: unread first, then by name
                    mapped.sort((a, b) => {
                        if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
                        if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
                        return a.name.localeCompare(b.name);
                    });

                    setDirectory(mapped);
                }
            } catch (err) {
                console.error("Error fetching directory:", err);
                toast.error("Failed to load people directory.");
            } finally {
                setLoadingDir(false);
            }
        };

        if (isAuthenticated && profile) {
            fetchProfiles();
        }
    }, [isAuthenticated, profile]);

    const filteredPeople = directory.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const newJoinees = filteredPeople.filter(p => p.isNewJoinee);
    const otherColleagues = filteredPeople.filter(p => !p.isNewJoinee);

    const handleCoffeeChat = (e: React.MouseEvent, person: Person) => {
        e.stopPropagation();

        // Fallback to a procedural email if none exists on the profile
        const recipientEmail = person.email;
        const subject = encodeURIComponent(`Coffee Chat Request from ${profile?.full_name || 'a colleague'}`);
        const body = encodeURIComponent(`Hi ${person.name},\n\nI'd love to grab a coffee/virtual chat with you sometime this week!\n\nBest,\n${profile?.full_name || 'Your Colleague'}`);

        // Trigger default mail client
        window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;

        toast.success(`Coffee chat email drafted to ${person.name}! ☕`);
    };

    const openChat = async (e: React.MouseEvent, person: Person) => {
        e.stopPropagation();
        setChatUser(person);
        setMessages([]); // Cleared before fetch starts

        // Automatically mark messages as read
        if (person.unreadCount > 0) {
            try {
                const { error } = await supabase
                    .from('messages')
                    .update({ is_read: true })
                    .eq('sender_id', person.id)
                    .eq('receiver_id', profile?.id)
                    .eq('is_read', false);

                if (error) throw error;

                // Update local directory state to clear the unread badge immediately
                setDirectory(prev => prev.map(p =>
                    p.id === person.id ? { ...p, unreadCount: 0 } : p
                ));
            } catch (err) {
                console.error("Failed to mark messages as read:", err);
            }
        }
    };

    useEffect(() => {
        if (!chatUser || !profile) return;

        let channel: any;

        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${chatUser.id}),and(sender_id.eq.${chatUser.id},receiver_id.eq.${profile.id})`)
                .order('created_at', { ascending: true });

            if (data && !error) {
                setMessages(data.map(m => ({
                    id: m.id,
                    text: m.content,
                    sender: m.sender_id === profile.id ? 'me' : 'them',
                    time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                })));
            } else if (error) {
                console.error("Error fetching messages:", error);
                toast.error(`Could not load chat history: ${error.message}`);
            }
        };

        fetchMessages();

        // Listen for incoming newly inserted messages from this user specifically
        channel = supabase
            .channel(`chat_${chatUser.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `sender_id=eq.${chatUser.id}`
            }, (payload) => {
                if (payload.new.receiver_id === profile.id) {
                    setMessages(prev => [...prev, {
                        id: payload.new.id,
                        text: payload.new.content,
                        sender: 'them',
                        time: new Date(payload.new.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }]);
                }
            })
            .subscribe();

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [chatUser, profile]);


    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || !chatUser || !profile) return;

        const content = messageInput;
        const optimisticMsg = {
            id: Date.now().toString(),
            text: content,
            sender: 'me' as const,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, optimisticMsg]);
        setMessageInput('');

        const { data, error } = await supabase.from('messages').insert({
            sender_id: profile.id,
            receiver_id: chatUser.id,
            content: content
        }).select().single();

        if (data && !error) {
            setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? { ...m, id: data.id } : m));
        } else {
            console.error("Error sending message", error);
            toast.error(`Message failed to send: ${error?.message || 'Unknown error'}`);
            // Remove the optimistic message on failure
            setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
        }
    };

    if (loading || loadingDir) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const renderPersonCard = (person: Person) => (
        <Card
            key={person.id}
            className="border-0 shadow-lg overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            onClick={() => navigate(`/profile/${person.id}`)}
        >
            <div className={`h-2 ${person.color}`} />
            <CardContent className="p-6 flex flex-col items-center text-center">
                <div className={`relative w-24 h-24 mb-4 rounded-full ${person.color} flex items-center justify-center text-primary-foreground text-3xl font-bold flex-shrink-0 shadow-lg overflow-hidden`}>
                    {person.avatarUrl ? (
                        <img src={person.avatarUrl} alt={person.name} className="w-full h-full object-cover" />
                    ) : (
                        person.initials
                    )}

                    {/* Red Notification Badge */}
                    {person.unreadCount > 0 && (
                        <div className="absolute -top-2 -right-2 bg-red-700 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg animate-bounce border-2 border-background z-10 transition-all duration-300">
                            {person.unreadCount}
                        </div>
                    )}

                    {person.isNewJoinee && !person.unreadCount && (
                        <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1.5 shadow-sm">
                            <Sparkles className="w-5 h-5 text-pink-500" />
                        </div>
                    )}
                </div>

                <h3 className="font-semibold text-xl truncate w-full px-2">{person.name}</h3>
                <p className="text-sm text-primary font-medium mt-1 uppercase tracking-wider">{person.role}</p>

                <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground mt-3 w-full">
                    <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[120px]">{person.department}</span>
                    </div>
                    <span className="hidden sm:inline">•</span>
                    <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[120px]">{person.location}</span>
                    </div>
                </div>

                <div className="mt-4 text-sm text-muted-foreground line-clamp-2 italic h-10 flex items-center justify-center w-full px-2">
                    "{person.bio}"
                </div>

                <div className="mt-4 flex flex-wrap justify-center gap-1.5 w-full">
                    {person.skills.map(skill => (
                        <span key={skill} className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                            {skill}
                        </span>
                    ))}
                </div>

                <div className="mt-6 flex flex-col w-full gap-2 mt-auto pt-4 border-t border-border/50">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors"
                        onClick={(e) => handleCoffeeChat(e, person)}
                    >
                        <Coffee className="w-4 h-4 mr-2" /> Coffee Chat
                    </Button>
                    <Button
                        variant={person.unreadCount > 0 ? "destructive" : "secondary"}
                        size="sm"
                        className={`w-full ${person.unreadCount > 0 ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse shadow-md shadow-red-900/20' : 'bg-primary text-primary-foreground hover:opacity-90'}`}
                        onClick={(e) => openChat(e, person)}
                    >
                        <MessageSquare className="w-4 h-4 mr-2" /> Message
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-gradient-pink text-primary-foreground">
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
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-card/20 backdrop-blur-sm flex items-center justify-center">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">People Directory</h1>
                                <p className="text-sm opacity-80">Connect with your colleagues</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, role, department, or skill..."
                            className="pl-10 lg:w-[400px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="gap-2">
                        <Filter className="w-4 h-4" /> Filters
                    </Button>
                </div>

                {newJoinees.length > 0 && (
                    <div className="mb-10">
                        <div className="flex items-center gap-2 mb-6">
                            <Sparkles className="w-5 h-5 text-pink-500" />
                            <h2 className="text-xl font-bold">Your Onboarding Cohort</h2>
                            <span className="text-xs font-semibold bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full dark:bg-pink-900/30 dark:text-pink-400">Fellow New Joinees</span>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {newJoinees.map(renderPersonCard)}
                        </div>
                    </div>
                )}

                {otherColleagues.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold mb-6">Directory</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {otherColleagues.map(renderPersonCard)}
                        </div>
                    </div>
                )}

                {filteredPeople.length === 0 && (
                    <div className="py-12 text-center text-muted-foreground">
                        No colleagues found matching your search.
                    </div>
                )}
            </main>

            {/* Slide-out Chat Window */}
            <Sheet open={!!chatUser} onOpenChange={(open) => !open && setChatUser(null)}>
                <SheetContent className="w-full sm:max-w-md p-0 flex flex-col border-l-0 sm:border-l">
                    {chatUser && (
                        <>
                            <SheetHeader className="p-4 border-b text-left bg-muted/30">
                                <SheetTitle className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl ${chatUser.color} flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0 shadow-sm overflow-hidden`}>
                                        {chatUser.avatarUrl ? (
                                            <img src={chatUser.avatarUrl} alt={chatUser.name} className="w-full h-full object-cover" />
                                        ) : (
                                            chatUser.initials
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-base">{chatUser.name}</p>
                                        <p className="text-xs text-muted-foreground font-normal">{chatUser.role} • {chatUser.department}</p>
                                    </div>
                                </SheetTitle>
                            </SheetHeader>
                            <ScrollArea className="flex-1 p-4">
                                <div className="space-y-4">
                                    <div className="text-center text-xs text-muted-foreground mb-4">
                                        This is the beginning of your chat history.
                                    </div>
                                    {messages.map((msg) => (
                                        <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                                            <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm shadow-sm ${msg.sender === 'me'
                                                ? 'bg-primary text-primary-foreground rounded-br-sm'
                                                : 'bg-muted rounded-bl-sm border border-border/50'
                                                }`}>
                                                {msg.text}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground mt-1 mx-1">{msg.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                            <div className="p-4 border-t bg-background">
                                <form onSubmit={sendMessage} className="flex gap-2">
                                    <Input
                                        placeholder="Type a message..."
                                        className="rounded-full bg-muted/50 border-border/50 focus-visible:ring-primary/50"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                    />
                                    <Button type="submit" size="icon" className="rounded-full shrink-0 shadow-sm transition-all hover:scale-105 active:scale-95">
                                        <Send className="w-4 h-4 ml-0.5" />
                                    </Button>
                                </form>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default People;
