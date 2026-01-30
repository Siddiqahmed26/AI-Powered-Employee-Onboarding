import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Bot, User, AlertCircle } from 'lucide-react';
import { useOnboardingChat } from '@/hooks/useOnboardingChat';

const ContextChat = () => {
  const { profile, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentDay = profile?.current_day || 1;
  const role = profile?.role || 'Software Engineer';
  const department = profile?.department || 'Engineering';

  const { messages, isLoading, error, sendMessage } = useOnboardingChat({
    context: {
      role,
      department,
      currentDay,
    },
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem('message') as HTMLInputElement;
    if (input.value.trim()) {
      sendMessage(input.value);
      input.value = '';
    }
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  if (loading || !profile) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-gradient-green text-primary-foreground sticky top-0 z-10">
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
            <div>
              <h1 className="text-xl font-bold">AI Onboarding Assistant</h1>
              <p className="text-sm opacity-80">Get personalized help for your onboarding journey</p>
            </div>
          </div>
        </div>
      </header>

      {/* Context Info */}
      <div className="container mx-auto px-4 py-4">
        <Card className="border-l-4 border-l-success shadow-sm">
          <CardContent className="py-3">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Role:</span>
                <span className="font-medium text-success">{role}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Department:</span>
                <span className="font-medium text-info">{department}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Day:</span>
                <span className="font-medium text-warning">Day {currentDay}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="container mx-auto px-4">
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg px-4 py-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <main className="flex-1 container mx-auto px-4 py-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-green mx-auto mb-4 flex items-center justify-center">
              <Bot className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-semibold mb-2">How can I help you today?</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              I'm your AI onboarding assistant, aware of your role, department, and progress. Ask me anything about your onboarding!
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {[
                'What should I focus on today?',
                "I'm confused about my tasks",
                'Who should I meet this week?',
              ].map((q) => (
                <Button
                  key={q}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleQuickQuestion(q)}
                  disabled={isLoading}
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-green flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-warning/10 border border-warning/20 text-foreground'
                      : 'bg-coral/10 border border-coral/20 text-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-warning flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-warning-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-green flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.1s]" />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input */}
      <div className="sticky bottom-0 bg-background border-t p-4">
        <div className="container mx-auto max-w-3xl">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              name="message"
              placeholder="Ask about your onboarding..."
              className="flex-1 h-12"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="h-12 w-12 bg-gradient-green"
              disabled={isLoading}
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContextChat;
