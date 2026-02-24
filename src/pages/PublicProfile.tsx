import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Briefcase, MapPin, User, Loader2, Mail, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileData {
    id: string;
    full_name: string | null;
    username: string | null;
    department: string | null;
    role: string | null;
    location: string | null;
    bio: string | null;
    skills: string[] | null;
    avatar_url: string | null;
    email?: string | null;
}

const PublicProfile = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (!id) return;
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                if (data) setProfile(data);
            } catch (err: any) {
                console.error("Error fetching public profile:", err);
                toast.error("Could not load user profile.");
                navigate('/people');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id, navigate]);

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!profile) return null;

    const rawName = profile.full_name || profile.username || 'Employee';
    const isEmail = rawName.includes('@');

    let finalName = rawName;
    if (isEmail) {
        // Extract just the first alphabetical chunk before dots/numbers in the email
        const emailPrefix = rawName.split('@')[0];
        const match = emailPrefix.match(/^[a-zA-Z]+/);
        const base = match ? match[0] : emailPrefix.replace(/[^a-zA-Z]/g, '');
        finalName = base.charAt(0).toUpperCase() + base.slice(1).toLowerCase();
    } else {
        finalName = rawName
            .split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ')
            .trim() || 'Employee';
    }

    const displayEmail = profile.email || (isEmail ? rawName : `${finalName.toLowerCase().replace(/\s+/g, '.')}@company.com`);

    return (
        <div className="min-h-screen bg-background">
            <header className="bg-gradient-pink text-primary-foreground">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="text-primary-foreground hover:bg-card/20"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-xl font-bold">{finalName}'s Profile</h1>
                    </div>
                </div>
            </header>

            <main className="container mx-auto max-w-3xl px-4 py-12">
                <Card className="border-0 shadow-xl overflow-hidden">
                    <div className="h-32 bg-gradient-blue opacity-50 relative">
                        {/* Banner backing */}
                    </div>
                    <CardContent className="px-8 pb-8 relative">
                        <div className="flex flex-col md:flex-row gap-8 items-start -mt-16">
                            <div className="w-32 h-32 rounded-2xl bg-gradient-pink border-4 border-background flex items-center justify-center text-primary-foreground text-4xl font-bold flex-shrink-0 shadow-lg overflow-hidden relative z-10">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt={finalName} className="w-full h-full object-cover" />
                                ) : (
                                    getInitials(finalName)
                                )}
                            </div>

                            <div className="flex-1 pt-2 w-full">
                                <h1 className="text-3xl font-bold">{finalName}</h1>
                                <div className="flex flex-col gap-1 mt-1">
                                    <p className="text-lg text-primary font-medium">{profile.role || 'Employee'}</p>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="w-4 h-4" />
                                        <span>{displayEmail}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-3">
                                    {profile.department && (
                                        <div className="flex items-center gap-1.5 border border-border/50 bg-muted/20 px-3 py-1 rounded-full">
                                            <Briefcase className="w-4 h-4" />
                                            {profile.department}
                                        </div>
                                    )}
                                    {profile.location && (
                                        <div className="flex items-center gap-1.5 border border-border/50 bg-muted/20 px-3 py-1 rounded-full">
                                            <MapPin className="w-4 h-4" />
                                            {profile.location}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 space-y-8">
                            <div>
                                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary" /> About
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {profile.bio || `${finalName} hasn't added a bio yet.`}
                                </p>
                            </div>

                            {profile.skills && profile.skills.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-semibold mb-3">Skills & Expertise</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.skills.map(skill => (
                                            <span key={skill} className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default PublicProfile;
