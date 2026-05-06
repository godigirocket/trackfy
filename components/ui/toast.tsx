"use client";
import { useState, useCallback, createContext, useContext, ReactNode } from "react";
import { CheckCircle, XCircle, AlertCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";
interface ToastItem { id: string; message: string; type: ToastType; }
interface ToastCtx { toast: (msg: string, type?: ToastType) => void; }
const Ctx = createContext<ToastCtx>({ toast: () => {} });
export const useToast = () => useContext(Ctx);

const playIosSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Smooth, pleasant "ding"
    osc.type = "sine";
    osc.frequency.setValueAtTime(1046.50, ctx.currentTime); // C6
    osc.frequency.exponentialRampToValueAtTime(1318.51, ctx.currentTime + 0.1); // E6
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch(e) {
    // Ignore errors (e.g. if user hasn't interacted with page yet)
  }
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  
  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(p => [...p, { id, message, type }]);
    playIosSound();
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-3 w-[90%] max-w-sm pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={cn(
            "flex items-center gap-4 p-3 pr-5 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.2)] pointer-events-auto",
            "animate-in slide-in-from-top-10 fade-in duration-400 ease-out",
            "bg-[var(--surface)]/70 backdrop-blur-2xl border border-[var(--border-2)]"
          )}>
            
            {/* App Icon / Status Icon */}
            <div className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner",
              t.type === "success" ? "bg-green-500/10 text-green-500" :
              t.type === "error"   ? "bg-red-500/10 text-red-500" :
                                     "bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-white"
            )}>
              {t.type === "success" ? <CheckCircle className="w-5 h-5" /> :
               t.type === "error"   ? <XCircle className="w-5 h-5" /> :
                                      <Zap className="w-5 h-5" />}
            </div>

            <div className="flex flex-col gap-0.5 justify-center flex-1 min-w-0">
              <span className="text-[11px] font-bold tracking-widest uppercase text-[var(--text-3)]">
                {t.type === "success" ? "Sucesso" : t.type === "error" ? "Erro" : "Aviso"}
              </span>
              <span className="text-[13.5px] font-semibold text-[var(--text)] leading-tight truncate">
                {t.message}
              </span>
            </div>

          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
