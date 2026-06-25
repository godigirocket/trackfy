"use client";
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { useNotificationStore } from "@/store/useNotificationStore";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const icons  = { info: Info, success: CheckCircle, warning: AlertTriangle, error: XCircle };
const colors = { info: "#3b82f6", success: "#22c55e", warning: "#f59e0b", error: "#f87171" };

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markRead, markAllRead } = useNotificationStore();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="btn-icon relative"
      >
        <Bell className="w-[15px] h-[15px]" strokeWidth={2.5} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white flex items-center justify-center font-bold"
            style={{ background: "var(--red)", fontSize: 9 }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-10 z-50 w-80 overflow-hidden"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-xl)",
              boxShadow: "var(--shadow-xl)",
            }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-[13px] font-bold" style={{ color: "var(--text-1)" }}>Notificações</h3>
              {unreadCount > 0 && (
                <button onClick={markAllRead}
                  className="text-[12px] font-semibold flex items-center gap-1 transition-colors"
                  style={{ color: "var(--blue)" }}>
                  <CheckCheck className="w-3.5 h-3.5" strokeWidth={2.5} /> Marcar todas
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto divide-y" style={{ borderColor: "var(--border)" }}>
              {notifications.length === 0 ? (
                <p className="text-[13px] font-medium text-center py-8" style={{ color: "var(--text-4)" }}>Nenhuma notificação</p>
              ) : (
                notifications.map((n) => {
                  const Icon = icons[n.type];
                  return (
                    <div key={n.id} onClick={() => markRead(n.id)}
                      className="flex gap-3 px-4 py-3 cursor-pointer transition-colors duration-100"
                      style={{ background: !n.read ? "var(--blue-light)" : "transparent" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-subtle)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = !n.read ? "var(--blue-light)" : "transparent")}>
                      <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: colors[n.type] }} strokeWidth={2.5} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px]" style={{ color: "var(--text-1)", fontWeight: !n.read ? 700 : 500 }}>{n.title}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>{n.message}</p>
                        <p className="text-[10px] mt-1" style={{ color: "var(--text-4)" }}>
                          {formatDistanceToNow(n.createdAt, { addSuffix: true, locale: ptBR })}
                        </p>
                      </div>
                      {!n.read && <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: "var(--blue)" }} />}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
