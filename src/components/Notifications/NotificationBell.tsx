import { useState } from 'react';
import { Bell, Check, CheckCheck, Info, AlertTriangle, Megaphone, Sparkles, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

const typeIcon: Record<string, React.ReactNode> = {
  info: <Info className="w-4 h-4 text-info" />,
  success: <Sparkles className="w-4 h-4 text-success" />,
  warning: <AlertTriangle className="w-4 h-4 text-warning" />,
  announcement: <Megaphone className="w-4 h-4 text-purple" />,
};

interface Props {
  notifications: Notification[];
  unreadCount: number;
  unreadChatCount?: number;
  onChatClick?: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export const NotificationBell = ({ notifications, unreadCount, unreadChatCount = 0, onChatClick, onMarkRead, onMarkAllRead }: Props) => {
  const [open, setOpen] = useState(false);

  const totalUnread = unreadCount + unreadChatCount;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-primary-foreground hover:bg-card/20">
          <Bell className="w-5 h-5" />
          {totalUnread > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-600 text-white text-xs animate-bounce shadow-lg">
              {totalUnread > 9 ? '9+' : totalUnread}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={onMarkAllRead}>
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 && unreadChatCount === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
              <Bell className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {unreadChatCount > 0 && (
                <button
                  key="chat-notification"
                  onClick={() => {
                    if (onChatClick) onChatClick();
                    setOpen(false);
                  }}
                  className="w-full text-left p-4 hover:bg-muted/50 transition-colors flex gap-3 bg-red-500/10 cursor-pointer"
                >
                  <div className="mt-0.5 flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-red-600 leading-tight">
                      Unread Messages
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      You have {unreadChatCount} unread message{unreadChatCount !== 1 && 's'} waiting. Click to open the People Directory.
                    </p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-red-600 mt-1.5 flex-shrink-0 animate-pulse" />
                </button>
              )}
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => { onMarkRead(n.id); }}
                  className={cn(
                    'w-full text-left p-4 hover:bg-muted/50 transition-colors flex gap-3',
                    !n.read && 'bg-primary/5'
                  )}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {typeIcon[n.type] ?? typeIcon.info}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-medium leading-tight', !n.read && 'text-foreground')}>
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
