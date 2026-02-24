-- Create messages table for real-time employee chat
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can insert their own messages" ON public.messages
    FOR INSERT WITH CHECK (
        sender_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can read their own sent and received messages" ON public.messages
    FOR SELECT USING (
        sender_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        OR
        receiver_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update their received messages" ON public.messages
    FOR UPDATE USING (
        receiver_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Add database replication for real-time updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
