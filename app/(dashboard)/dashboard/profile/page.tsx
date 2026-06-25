"use client";
import { useState, useEffect } from "react";
import { Save, Trophy, Target, TrendingUp, Award, Star, CheckCircle, Camera } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/store/useAppStore";
import { LEVELS } from "@/lib/constants";
import { fmtCurrency } from "@/lib/utils";
import { safeArray } from "@/lib/safeArray";

const ACHIEVEMENTS = [
  { id: "a1", name: "Primeira campanha",  desc: "Criou sua primeira campanha",  earned: true,  icon: Target },
  { id: "a2", name: "ROAS 2x",            desc: "Atingiu ROAS de 2x",           earned: true,  icon: TrendingUp },
  { id: "a3", name: "ROAS 3x",            desc: "Atingiu ROAS de 3x",           earned: true,  icon: TrendingUp },
  { id: "a4", name: "R$ 10k investidos",  desc: "Investiu R$ 10.000 em ads",    earned: false, icon: Trophy },
  { id: "a5", name: "Otimização IA",      desc: "Aplicou 5 sugestões da IA",    earned: false, icon: Award },
  { id: "a6", name: "Elite",              desc: "Faturou R$ 100k em vendas",    earned: false, icon: Star },
];

export default function ProfilePage() {
  const { campaigns } = useAppStore();
  const [user, setUser]       = useState<any>(null);
  const [name, setName]       = useState("");
  const [company, setCompany] = useState("");
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        setName(data.user.user_metadata?.name ?? "");
        setCompany(data.user.user_metadata?.company ?? "");
      }
    });
  }, []);

  const list       = safeArray(campaigns);
  const totalSpend = list.reduce((s, c) => s + c.spend, 0);
  const totalConv  = list.reduce((s, c) => s + c.conversions, 0);
  const level      = LEVELS.find((l) => totalSpend >= l.min && totalSpend < l.max) ?? LEVELS[0];
  const nextLevel  = LEVELS[LEVELS.indexOf(level) + 1];
  const progress   = nextLevel ? ((totalSpend - level.min) / (nextLevel.min - level.min)) * 100 : 100;
  const initials   = name ? name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase() : "US";

  const handleSave = async () => {
    await supabase.auth.updateUser({ data: { name, company } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-[900px] mx-auto space-y-6">
      <div>
        <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "var(--text-1)" }}>Perfil</h1>
        <p className="text-[13px] mt-0.5" style={{ color: "var(--text-4)" }}>Suas informações e conquistas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile card */}
        <div className="card p-6 flex flex-col items-center text-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
              style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
            >
              {initials}
            </div>
            <button
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "var(--surface)", border: "2px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
            >
              <Camera className="w-3.5 h-3.5" style={{ color: "var(--text-3)" }} strokeWidth={2} />
            </button>
          </div>

          <div>
            <p className="text-[16px] font-bold" style={{ color: "var(--text-1)" }}>{name || "Usuário"}</p>
            <p className="text-[12px] mt-0.5" style={{ color: "var(--text-4)" }}>{user?.email}</p>
            <span className="badge badge-blue mt-2 inline-flex">{level.name}</span>
          </div>

          {/* Level progress */}
          <div className="w-full">
            <div className="flex justify-between mb-1.5">
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-4)" }}>{level.name}</span>
              {nextLevel && <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-4)" }}>{nextLevel.name}</span>}
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-muted)" }}>
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, progress)}%`, background: "var(--blue)" }} />
            </div>
            <p style={{ fontSize: 11, color: "var(--text-4)", marginTop: 6, textAlign: "center" }}>
              {fmtCurrency(totalSpend)} / {nextLevel ? fmtCurrency(nextLevel.min) : "MAX"}
            </p>
          </div>

          {/* Stats */}
          <div className="w-full grid grid-cols-2 gap-2 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
            {[
              { label: "Campanhas",  value: list.length },
              { label: "Conversões", value: totalConv },
              { label: "Investido",  value: fmtCurrency(totalSpend) },
              { label: "Nível",      value: level.name },
            ].map((s) => (
              <div key={s.label} className="text-center p-2 rounded-lg" style={{ background: "var(--bg-subtle)" }}>
                <p className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>{s.value}</p>
                <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Edit + Achievements */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5 space-y-4">
            <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Dados pessoais</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block mb-1.5" style={{ fontSize: 11, fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Nome completo</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Seu nome" />
              </div>
              <div>
                <label className="block mb-1.5" style={{ fontSize: 11, fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>E-mail</label>
                <input value={user?.email ?? ""} disabled className="input opacity-50 cursor-not-allowed" />
              </div>
              <div>
                <label className="block mb-1.5" style={{ fontSize: 11, fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Empresa</label>
                <input value={company} onChange={(e) => setCompany(e.target.value)} className="input" placeholder="Nome da empresa" />
              </div>
            </div>
            <button onClick={handleSave} className="btn-primary px-5 py-2.5">
              {saved ? <><CheckCircle className="w-4 h-4" strokeWidth={2.5} /> Salvo!</> : <><Save className="w-4 h-4" strokeWidth={2.5} /> Salvar alterações</>}
            </button>
          </div>

          {/* Achievements */}
          <div className="card p-5">
            <h2 className="text-[14px] font-bold mb-4" style={{ color: "var(--text-1)" }}>Conquistas</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ACHIEVEMENTS.map((a) => (
                <div
                  key={a.id}
                  className="p-3.5 rounded-xl border text-center transition-all duration-150"
                  style={{
                    background: a.earned ? "var(--blue-light)" : "var(--bg-subtle)",
                    borderColor: a.earned ? "rgba(37,99,235,0.2)" : "var(--border)",
                    opacity: a.earned ? 1 : 0.5,
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2"
                    style={{ background: a.earned ? "var(--blue-muted)" : "var(--bg-muted)" }}
                  >
                    <a.icon className="w-4.5 h-4.5" style={{ color: a.earned ? "var(--blue)" : "var(--text-4)" }} strokeWidth={2} />
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-1)" }}>{a.name}</p>
                  <p style={{ fontSize: 11, color: "var(--text-4)", marginTop: 2 }}>{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
