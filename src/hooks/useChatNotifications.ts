import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useChatNotifications = () => {
    const { profile, isAuthenticated } = useAuth();
    const [unreadChatCount, setUnreadChatCount] = useState(0);

    useEffect(() => {
        if (!isAuthenticated || !profile?.id) return;

        let channel: any;

        const fetchUnreadChats = async () => {
            const { count, error } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('receiver_id', profile.id)
                .eq('is_read', false);

            if (!error && count !== null) {
                setUnreadChatCount(count);
            }
        };

        fetchUnreadChats();

        // Subscribe to new incoming messages directed at this user
        channel = supabase
            .channel('global_chat_notifications')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'messages',
                    filter: `receiver_id=eq.${profile.id}`
                },
                () => {
                    // Whenever any message meant for us changes (inserted or marked read), recalculate
                    fetchUnreadChats();
                }
            )
            .subscribe();

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [isAuthenticated, profile?.id]);

    return { unreadChatCount };
};
