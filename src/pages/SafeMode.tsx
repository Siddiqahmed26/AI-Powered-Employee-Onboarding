import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Bot, User, Shield, Heart, Lightbulb, ThumbsUp, Sparkles, AlertCircle } from 'lucide-react';
import { useSafeModeChat } from '@/hooks/useSafeModeChat';

const SafeMode = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, error, sendMessage } = useSafeModeChat();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

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

  const principles = [
    { icon: Shield, label: 'Psychological safety first', color: 'text-success' },
    { icon: Heart, label: 'Non-judgmental responses', color: 'text-coral' },
    { icon: Sparkles, label: 'Empathetic communication', color: 'text-purple' },
    { icon: ThumbsUp, label: 'Confidence building', color: 'text-info' },
  ];

  const rules = [
    { title: 'Never Judge Questions', desc: 'All questions are valid and welcome' },
    { title: 'Never Suggest "Ask Manager"', desc: 'AI provides direct answers' },
    { title: 'Encourage Curiosity', desc: 'Promote learning and exploration' },
    { title: 'Build Confidence', desc: 'Supportive and empowering responses' },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
            <div className="flex-1">
              <h1 className="text-xl font-bold">Safe Questions Mode</h1>
              <p className="text-sm opacity-80">Ask anything without judgment</p>
            </div>
            <div className="bg-card/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <span className="text-xs font-medium flex items-center gap-1">
                <Shield className="w-3 h-3" />
                SAFE MODE
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 grid gap-4 lg:grid-cols-3">
        {/* Principles */}
        <div className="lg:col-span-1">
          <Card className="border-2 border-success shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-coral">
                <Heart className="w-4 h-4" />
                Core Principles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {principles.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-sm bg-success/5 p-2 rounded-lg">
                  <p.icon className={`w-4 h-4 ${p.color}`} />
                  <span>{p.label}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="mt-4 bg-gradient-pink text-primary-foreground border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                AI Prompting Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {rules.map((rule, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-card/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs">{i + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{rule.title}</p>
                    <p className="text-xs opacity-80">{rule.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Chat */}
        <div className="lg:col-span-2 flex flex-col h-[calc(100vh-200px)] min-h-[400px]">
          <Card className="flex-1 flex flex-col shadow-lg border-0 overflow-hidden">
            <CardHeader className="border-b bg-muted/30 py-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-pink flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-sm">Safe Questions Assistant</CardTitle>
                  <p className="text-xs text-muted-foreground">Your safe space to learn</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4">
              {/* Error Alert */}
              {error && (
                <div className="mb-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg px-4 py-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-pink mx-auto mb-4 flex items-center justify-center">
                    <Shield className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h2 className="text-lg font-semibold mb-2">Safe Space Activated</h2>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-4">
                    No question is too basic here. I'll never judge or redirect you to "ask your manager."
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      'This might be a stupid question, but...',
                      'How do I access the company VPN?',
                      "I'm feeling overwhelmed, what should I do?",
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
                        <div className="w-8 h-8 rounded-lg bg-gradient-pink flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-warning/10 border border-warning/20 italic'
                            : 'bg-success/10 border border-success/20'
                        }`}
                      >
                        <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                          {message.role === 'assistant' ? (
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          ) : (
                            <p className="m-0">{message.content}</p>
                          )}
                        </div>
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
                      <div className="w-8 h-8 rounded-lg bg-gradient-pink flex items-center justify-center">
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
            </CardContent>

            <div className="border-t p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  name="message"
                  placeholder="Ask your 'basic' question here... it's safe!"
                  className="flex-1 h-11"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="h-11 w-11 bg-gradient-pink"
                  disabled={isLoading}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SafeMode;
