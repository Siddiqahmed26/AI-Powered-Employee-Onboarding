import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, User, Save, Loader2, Image as ImageIcon, Briefcase, MapPin, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Profile = () => {
    const { profile, loading, updateProfile } = useAuth();
    const navigate = useNavigate();

    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        username: '',
        bio: '',
        job_title: '',
        location: '',
        department: '',
        avatar_url: '',
        skills: ''
    });

    useEffect(() => {
        if (!loading && !profile) {
            navigate('/');
        } else if (profile && !formData.full_name) {
            // Initialize form on mount
            setFormData({
                full_name: profile.full_name || '',
                username: profile.username || '',
                bio: profile.bio || '',
                job_title: profile.job_title || '',
                location: profile.location || '',
                department: profile.department || '',
                avatar_url: profile.avatar_url || '',
                skills: profile.skills ? profile.skills.join(', ') : ''
            });
        }
    }, [loading, profile, navigate, formData.full_name]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) return;
            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${profile?.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            setIsUploading(true);

            // Upload the file to supabase storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
            toast.success("Image uploaded successfully! Click save to keep your changes.");
        } catch (error: any) {
            console.error("Error uploading image:", error);
            toast.error(error.message || "Error uploading image.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            const updatedData = {
                ...formData,
                skills: formData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0)
            };

            await updateProfile(updatedData);
            toast.success("Profile updated successfully!");
        } catch (error: any) {
            console.error("Error updating profile:", error);
            toast.error(error.message || "Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
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
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">Edit Profile</h1>
                                <p className="text-sm opacity-80">Manage your publicly visible information</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto max-w-3xl px-4 py-8">
                <Card className="shadow-lg border-0 shadow-primary/5">
                    <CardHeader className="pb-4 border-b border-border/50">
                        <CardTitle className="text-2xl">Personal Information</CardTitle>
                        <CardDescription>
                            This is how you will appear to your colleagues in the People directory.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="full_name">Full Name</Label>
                                <Input
                                    id="full_name"
                                    name="full_name"
                                    placeholder="Jane Doe"
                                    value={formData.full_name}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="username">Username (Optional)</Label>
                                <Input
                                    id="username"
                                    name="username"
                                    placeholder="janedoe99"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="job_title">Job Title</Label>
                                <Input
                                    id="job_title"
                                    name="job_title"
                                    placeholder="e.g. Software Engineer, Marketing Manager"
                                    value={formData.job_title}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="department" className="flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                                    Department
                                </Label>
                                <Input
                                    id="department"
                                    name="department"
                                    placeholder="e.g. Engineering, Sales, HR"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location" className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    Location
                                </Label>
                                <Input
                                    id="location"
                                    name="location"
                                    placeholder="e.g. New York, Remote"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                name="bio"
                                placeholder="Tell your colleagues a little bit about yourself..."
                                className="resize-none min-h-[100px]"
                                value={formData.bio}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="skills">Skills (Comma separated)</Label>
                            <Input
                                id="skills"
                                name="skills"
                                placeholder="React, Python, Project Management, Public Speaking"
                                value={formData.skills}
                                onChange={handleInputChange}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                These help people find you when they use the search bar in the People directory.
                            </p>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-border/50">
                            <Label className="flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                Profile Picture
                            </Label>

                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="w-24 h-24 rounded-full bg-muted border-4 border-background shadow-md overflow-hidden flex items-center justify-center shrink-0">
                                    {formData.avatar_url ? (
                                        <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-8 h-8 text-muted-foreground/50" />
                                    )}
                                </div>
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="file"
                                            id="avatar_upload"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            disabled={isUploading}
                                            className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                        />
                                        {isUploading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Recommended size: 256x256px. Max 2MB.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="border-t border-border/50 pt-6 flex justify-between">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/dashboard')}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            className="min-w-[120px]"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Profile
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </div>
    );
};

export default Profile;
