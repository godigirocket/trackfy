"use client";
import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, ChevronDown } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { safeArray } from "@/lib/safeArray";
import { cn } from "@/lib/utils";

interface Message { id: string; role: "user" | "assistant"; content: string; time: string; }

const SUGGESTIONS = [
  "Quais campanhas têm melhor ROAS?",
  "O que devo pausar agora?",
  "Sugira 3 otimizações rápidas",
  "Qual meu melhor horário?",
];

export function ChatAssistant() {
  const [open, setOpen]         = useState(false);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    id: "0", role: "assistant",
    content: "Olá! Sou o assistente Trackfy.\nPosso analisar suas campanhas e sugerir otimizações.",
    time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  }]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const { campaigns } = useAppStore();

  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [messages, loading, open]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    const now = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    setMessages((m) => [...m, { id: Date.now().toString(), role: "user", content: msg, time: now }]);
    setInput("");
    setLoading(true);
    const list = safeArray(campaigns);
    const metrics = {
      totalSpend: list.reduce((s, c) => s + c.spend, 0).toFixed(2),
      totalConversions: list.reduce((s, c) => s + c.conversions, 0),
      avgCTR: (list.reduce((s, c) => s + c.ctr, 0) / Math.max(list.length, 1)).toFixed(2),
      avgCPL: (list.reduce((s, c) => s + c.cpl, 0) / Math.max(list.length, 1)).toFixed(2),
      topCampaign: [...list].sort((a, b) => b.conversions - a.conversions)[0]?.name ?? "N/A",
      activeCampaigns: list.filter((c) => c.status === "ACTIVE").length,
    };
    try {
      const res = await fetch("/api/gemini", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: msg, metrics }) });
      const data = await res.json();
      const t = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      setMessages((m) => [...m, { id: Date.now().toString(), role: "assistant", content: data.reply ?? "Não consegui processar.", time: t }]);
    } catch {
      const t = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      setMessages((m) => [...m, { id: Date.now().toString(), role: "assistant", content: "Configure sua chave Gemini em Configurações.", time: t }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      {/* FAB — clean square */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-40 w-12 h-12 flex items-center justify-center text-white transition-all duration-200",
          open && "opacity-0 pointer-events-none scale-90"
        )}
        style={{
          background: "var(--blue)",
          borderRadius: "var(--r-xl)",
          boxShadow: "0 4px 16px rgba(59,130,246,0.4), 0 1px 3px rgba(0,0,0,0.2)",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.05)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
        title="Assistente IA"
      >
        <Sparkles className="w-5 h-5" strokeWidth={2} />
      </button>

      {/* Panel */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.15)", backdropFilter: "blur(2px)" }} onClick={() => setOpen(false)} />
          <div
            className="fixed bottom-6 right-6 z-50 w-[360px] h-[540px] flex flex-col overflow-hidden"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-2xl)",
              boxShadow: "var(--shadow-xl)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3.5 border-b"
              style={{ background: "var(--bg-subtle)", borderColor: "var(--border)" }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center relative"
                style={{ background: "var(--blue)", boxShadow: "0 2px 8px rgba(59,130,246,0.3)" }}
              >
                <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                  style={{ background: "var(--green)", borderColor: "var(--bg-subtle)" }}
                />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold" style={{ color: "var(--text-1)" }}>Trackfy AI</p>
                <p className="text-[11px] font-medium" style={{ color: "var(--green)" }}>Online agora</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="btn-icon"
              >
                <ChevronDown className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ background: "var(--bg-subtle)" }}>
              {messages.map((m) => {
                const isUser = m.role === "user";
                return (
                  <div key={m.id} className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
                    <div
                      className="max-w-[82%] text-[13px] leading-relaxed px-3.5 py-2.5"
                      style={isUser
                        ? { background: "var(--blue)", color: "#fff", borderRadius: "14px 14px 4px 14px" }
                        : { background: "var(--surface)", color: "var(--text-2)", border: "1px solid var(--border)", borderRadius: "14px 14px 14px 4px", boxShadow: "var(--shadow-xs)" }
                      }
                    >
                      {m.content.split("\n").map((line, j) => (
                        <span key={j}>{line}{j < m.content.split("\n").length - 1 && <br />}</span>
                      ))}
                    </div>
                    <span className="text-[10px] mt-1 px-1" style={{ color: "var(--text-4)" }}>{m.time}</span>
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-start">
                  <div
                    className="px-3.5 py-2.5 flex gap-1.5 items-center"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px 14px 14px 4px", boxShadow: "var(--shadow-xs)" }}
                  >
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--text-4)", animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}

              {messages.length === 1 && !loading && (
                <div className="space-y-2 pt-1">
                  <p className="section-label text-center">Sugestões</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="text-left text-[12px] font-medium px-3 py-2.5 leading-relaxed transition-all duration-100"
                        style={{
                          background: "var(--surface)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--r-lg)",
                          color: "var(--text-3)",
                          boxShadow: "var(--shadow-xs)",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--blue)"; (e.currentTarget as HTMLElement).style.color = "var(--text-1)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-3)"; }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div
                className="flex items-center gap-2 px-3 py-2 transition-all duration-150"
                style={{
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--r-xl)",
                }}
                onFocusCapture={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--blue)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
                onBlurCapture={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                  placeholder="Mensagem..."
                  className="flex-1 bg-transparent text-[13px] font-medium focus:outline-none"
                  style={{ color: "var(--text-1)" }}
                  disabled={loading}
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim() || loading}
                  className="w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-150"
                  style={{
                    background: input.trim() ? "var(--blue)" : "transparent",
                    color: input.trim() ? "#fff" : "var(--text-4)",
                  }}
                >
                  <Send className="w-3.5 h-3.5" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
