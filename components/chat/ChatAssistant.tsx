"use client";

import { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, X, Send, Brain, Sparkles, 
  ChevronRight, Copy, RefreshCw, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Olá! Sou o assistente de IA da TrackFY. Como posso ajudar com seus anúncios hoje?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: { spend: 12450, roas: 3.68, conversations: 842 }, // Example summarized context
          question: userMsg
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.text }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Erro ao consultar a IA. Tente novamente mais tarde." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <Button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-primary shadow-[0_10px_40px_rgba(108,92,231,0.5)] hover:scale-110 transition-all group"
        >
          <Sparkles className="w-6 h-6 text-primary-foreground group-hover:rotate-12 transition-transform" />
        </Button>
      )}

      {isOpen && (
        <Card className="w-[380px] h-[500px] border-border bg-card shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <CardHeader className="p-4 border-b border-border bg-muted/30 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Brain className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-black tracking-tighter uppercase">Inteligência TrackFY</CardTitle>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Online agora</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>

          <CardContent ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={cn(
                "flex flex-col max-w-[85%] space-y-1",
                msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
              )}>
                <div className={cn(
                  "px-4 py-2.5 rounded-2xl text-[13px] font-medium leading-relaxed",
                  msg.role === "user" 
                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                    : "bg-muted text-foreground rounded-tl-none border border-border"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="mr-auto items-start flex flex-col space-y-1 max-w-[85%]">
                <div className="bg-muted text-foreground px-4 py-2.5 rounded-2xl rounded-tl-none border border-border flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                  <span className="text-[11px] font-bold uppercase tracking-widest animate-pulse">Pensando...</span>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="p-4 border-t border-border">
            <div className="flex w-full gap-2 relative">
              <Input 
                value={input}
                onChange={(e: any) => setInput(e.target.value)}
                onKeyDown={(e: any) => e.key === "Enter" && handleSend()}
                placeholder="Pergunte algo sobre seus anúncios..."
                className="bg-muted/50 border-border h-11 pr-12 rounded-xl text-xs font-medium"
              />
              <Button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="absolute right-1.5 top-1.5 h-8 w-8 rounded-lg bg-primary p-0 hover:scale-105"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
