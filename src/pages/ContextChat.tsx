import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Bot, User, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const aiResponses: Record<string, string> = {
  'what should i focus on today': "Here are your 3 priorities for Day {day}: 1) Complete HR paperwork 2) Set up development environment 3) Meet your team lead. You're doing great! 🎉",
  'what should i do now': "You're doing great! For Day {day}, let's focus on: 1) Review the codebase architecture (2 hours) 2) Complete your first small bug fix. Take it one step at a time - you've got this! 👍",
  'im confused': "I understand Day {day} can feel overwhelming. Let me help you prioritize: Start with the most important task from your day plan. Would you like me to break it down into smaller steps?",
  'default': "I'm here to help you navigate Day {day} of your onboarding. Based on your role as a {role} in {department}, I can provide personalized guidance. What specific area would you like help with?",
};

const getAIResponse = (query: string, day: number, role: string, department: string): string => {
  const lowerQuery = query.toLowerCase();
  
  let response = aiResponses.default;
  
  for (const [key, value] of Object.entries(aiResponses)) {
    if (key !== 'default' && lowerQuery.includes(key)) {
      response = value;
      break;
    }
  }
  
  return response
    .replace(/{day}/g, day.toString())
    .replace(/{role}/g, role)
    .replace(/{department}/g, department);
};

const ContextChat = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(input, user.currentDay, user.role, user.department),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000);
  };

  if (!user) return null;

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
              <h1 className="text-xl font-bold">Context-Aware Chat</h1>
              <p className="text-sm opacity-80">AI assistant tailored to your role & day</p>
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
                <span className="font-medium text-success">{user.role}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Department:</span>
                <span className="font-medium text-info">{user.department}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Day:</span>
                <span className="font-medium text-warning">Day {user.currentDay}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Messages */}
      <main className="flex-1 container mx-auto px-4 py-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-green mx-auto mb-4 flex items-center justify-center">
              <Bot className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-semibold mb-2">How can I help you today?</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              I'm aware of your role, department, and current progress. Ask me anything about your onboarding!
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {['What should I focus on today?', 'I\'m confused about my tasks'].map((q) => (
                <Button
                  key={q}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setInput(q)}
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
                  <p className="text-sm">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-warning flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-warning-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your onboarding..."
              className="flex-1 h-12"
            />
            <Button type="submit" size="icon" className="h-12 w-12 bg-gradient-green">
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContextChat;
