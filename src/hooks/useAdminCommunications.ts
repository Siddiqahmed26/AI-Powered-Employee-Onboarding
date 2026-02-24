import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Announcement {
    id: string;
    title: string;
    content: string;
    type: string;
    created_at: string;
}

export interface Deadline {
    id: string;
    title: string;
    department: string;
    due_date: string;
    created_at: string;
}

export const useAdminCommunications = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [deadlines, setDeadlines] = useState<Deadline[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);

        // Fetch Announcements
        const { data: aData, error: aError } = await supabase
            .from('announcements')
            .select('id, title, content, type, created_at')
            .order('created_at', { ascending: false });

        if (aError) {
            console.error('Error fetching announcements:', aError);
        } else if (aData) {
            setAnnouncements(aData as Announcement[]);
        }

        // Fetch Deadlines
        const { data: dData, error: dError } = await supabase
            .from('company_deadlines')
            .select('*')
            .order('due_date', { ascending: true });

        if (dError) {
            console.error('Error fetching deadlines:', dError);
        } else if (dData) {
            setDeadlines(dData as Deadline[]);
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const addAnnouncement = async (announcement: Partial<Announcement>) => {
        const payload = {
            title: announcement.title || '',
            content: announcement.content || '',
            type: announcement.type || 'General',
        };
        const { error } = await supabase.from('announcements').insert(payload);
        if (error) {
            toast.error('Failed to add announcement');
            throw error;
        }
        toast.success('Announcement added!');
        fetchData();
    };

    const updateAnnouncement = async (id: string, updates: Partial<Announcement>) => {
        const { error } = await supabase.from('announcements').update(updates).eq('id', id);
        if (error) {
            toast.error('Failed to update announcement');
            throw error;
        }
        toast.success('Announcement updated!');
        fetchData();
    };

    const deleteAnnouncement = async (id: string) => {
        const { error } = await supabase.from('announcements').delete().eq('id', id);
        if (error) {
            toast.error('Failed to delete announcement');
            throw error;
        }
        toast.success('Announcement deleted!');
        fetchData();
    };

    const addDeadline = async (deadline: Partial<Deadline>) => {
        const payload = {
            title: deadline.title || '',
            department: deadline.department || 'All',
            due_date: deadline.due_date || new Date().toISOString()
        };
        const { error } = await supabase.from('company_deadlines').insert(payload);
        if (error) {
            toast.error('Failed to add deadline');
            throw error;
        }
        toast.success('Deadline added!');
        fetchData();
    };

    const updateDeadline = async (id: string, updates: Partial<Deadline>) => {
        const { error } = await supabase.from('company_deadlines').update(updates).eq('id', id);
        if (error) {
            toast.error('Failed to update deadline');
            throw error;
        }
        toast.success('Deadline updated!');
        fetchData();
    };

    const deleteDeadline = async (id: string) => {
        const { error } = await supabase.from('company_deadlines').delete().eq('id', id);
        if (error) {
            toast.error('Failed to delete deadline');
            throw error;
        }
        toast.success('Deadline deleted!');
        fetchData();
    };

    return {
        announcements,
        deadlines,
        loading,
        refetch: fetchData,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        addDeadline,
        updateDeadline,
        deleteDeadline,
    };
};
