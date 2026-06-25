"use client";
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { useNotificationStore } from "@/store/useNotificationStore";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const icons  = { info: Info, success: CheckCircle, warning: AlertTriangle, error: XCircle };
const colors = { info: "#3b82f6", success: "#22c55e", warning: "#f59e0b", error: "#f87171" };
const bgs    = {
  info:    { bg: "rgba(59,130,246,0.06)",  border: "rgba(59,130,246,0.15)" },
  success: { bg: "rgba(34,197,94,0.06)",   border: "rgba(34,197,94,0.15)" },
  warning: { bg: "rgba(245,158,11,0.06)",  border: "rgba(245,158,11,0.15)" },
  error:   { bg: "rgba(248,113,113,0.06)", border: "rgba(248,113,113,0.15)" },
};

export default function NotificationsPage() {
  const { notifications, unreadCount, markRead, markAllRead, clear } = useNotificationStore();

  return (
    <div className="max-w-[700px] mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "var(--text-1)" }}>Notificações</h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--text-4)" }}>
            {unreadCount > 0 ? `${unreadCount} não lida${unreadCount !== 1 ? "s" : ""}` : "Todas lidas"}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn-secondary px-3.5 py-2">
              <CheckCheck className="w-3.5 h-3.5" strokeWidth={2.5} /> Marcar todas
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={clear} className="btn-ghost px-3.5 py-2" style={{ color: "var(--red)" }}>
              <Trash2 className="w-3.5 h-3.5" strokeWidth={2.5} /> Limpar
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "var(--bg-muted)" }}>
            <Bell className="w-6 h-6" style={{ color: "var(--text-4)" }} strokeWidth={1.5} />
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-3)" }}>Nenhuma notificação</p>
          <p style={{ fontSize: 13, color: "var(--text-4)", marginTop: 4 }}>Você será notificado sobre eventos importantes</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = icons[n.type];
            const style = bgs[n.type];
            return (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                className="flex gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-150"
                style={{
                  background: !n.read ? style.bg : "var(--surface)",
                  borderColor: !n.read ? style.border : "var(--border)",
                  boxShadow: "var(--shadow-xs)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${colors[n.type]}15` }}
                >
                  <Icon className="w-4 h-4" style={{ color: colors[n.type] }} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p style={{ fontSize: 14, fontWeight: !n.read ? 700 : 500, color: "var(--text-1)" }}>{n.title}</p>
                    {!n.read && <div className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ background: "var(--blue)" }} />}
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 2 }}>{n.message}</p>
                  <p style={{ fontSize: 11, color: "var(--text-4)", marginTop: 6 }}>
                    {formatDistanceToNow(n.createdAt, { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
