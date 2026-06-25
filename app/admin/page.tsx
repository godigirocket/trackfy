"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Crown, Gauge, Infinity, PlugZap, Plus, Shield, Trash2, UserRound } from "lucide-react";
import { TutorialHub } from "@/components/shared/TutorialHub";
import {
  formatLimit,
  getLocalUser,
  getLocalUserLimits,
  getLocalUsers,
  createLocalSession,
  isAdminEmail,
  PLAN_LABELS,
  removeLocalUser,
  setLocalUserPlan,
  setLocalUserRole,
  setLocalUserStatus,
  upsertLocalUser,
  type LocalPlan,
  type LocalRole,
  type LocalUser,
  type LocalUserStatus,
} from "@/lib/localAuth";

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<LocalUser | null>(null);
  const [users, setUsers] = useState<LocalUser[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<LocalRole>("user");
  const [plan, setPlan] = useState<LocalPlan>("starter");

  const isAdmin = currentUser?.role === "admin" || isAdminEmail(currentUser?.email ?? "");

  const refreshUsers = () => {
    setCurrentUser(getLocalUser());
    setUsers(getLocalUsers());
  };

  useEffect(() => {
    if (!getLocalUser()) {
      createLocalSession({ email: "emailjg4@gmail.com", name: "Juan Goes", role: "admin" });
    }
    refreshUsers();
  }, []);

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    members: users.filter((u) => u.role !== "admin").length,
    unlimited: users.filter((u) => u.plan === "unlimited").length,
  }), [users]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    upsertLocalUser({
      name: name.trim() || email.split("@")[0],
      email,
      role,
      plan,
      status: "active",
    });
    setName("");
    setEmail("");
    setRole("user");
    setPlan("starter");
    refreshUsers();
  };

  const handleRoleChange = (user: LocalUser, nextRole: LocalRole) => {
    setLocalUserRole(user.email, nextRole);
    refreshUsers();
  };

  const handleRemove = (user: LocalUser) => {
    removeLocalUser(user.email);
    refreshUsers();
  };

  const handlePlanChange = (user: LocalUser, nextPlan: LocalPlan) => {
    setLocalUserPlan(user.email, nextPlan);
    refreshUsers();
  };

  const handleStatusChange = (user: LocalUser, nextStatus: LocalUserStatus) => {
    setLocalUserStatus(user.email, nextStatus);
    refreshUsers();
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--bg)" }}>
        <div className="card p-6 max-w-md w-full text-center">
          <Shield className="w-9 h-9 mx-auto mb-3" style={{ color: "var(--blue)" }} strokeWidth={2.5} />
          <h1 className="text-[20px] font-bold" style={{ color: "var(--text-1)" }}>Área admin</h1>
          <p className="text-[13px] mt-2" style={{ color: "var(--text-4)" }}>
            Entre com o e-mail admin para gerenciar usuários.
          </p>
          <Link href="/login" className="btn-primary px-4 py-2.5 mt-5 inline-flex">
            Ir para login
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--bg)" }}>
        <div className="card p-6 max-w-md w-full text-center">
          <Shield className="w-9 h-9 mx-auto mb-3" style={{ color: "var(--red)" }} strokeWidth={2.5} />
          <h1 className="text-[20px] font-bold" style={{ color: "var(--text-1)" }}>Sem permissão</h1>
          <p className="text-[13px] mt-2" style={{ color: "var(--text-4)" }}>
            Sua conta atual não tem acesso administrativo.
          </p>
          <Link href="/dashboard" className="btn-secondary px-4 py-2.5 mt-5 inline-flex">
            Voltar ao dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <header className="h-[56px] flex items-center justify-between px-6 border-b" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="btn-icon w-8 h-8">
            <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
          </Link>
          <div>
            <h1 className="text-[18px] font-bold" style={{ color: "var(--text-1)" }}>Admin Trackfy</h1>
            <p className="text-[12px]" style={{ color: "var(--text-4)" }}>{currentUser.email}</p>
          </div>
        </div>
        <span className="badge badge-green">
          <Crown className="w-3.5 h-3.5" strokeWidth={2.5} />
          Admin
        </span>
      </header>

      <main className="max-w-[1100px] mx-auto p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[
            { label: "Usuários", value: stats.total, icon: UserRound, color: "var(--blue)" },
            { label: "Admins", value: stats.admins, icon: Crown, color: "var(--yellow)" },
            { label: "Membros", value: stats.members, icon: Shield, color: "var(--green)" },
            { label: "Sem limite", value: stats.unlimited, icon: Infinity, color: "var(--text-1)" },
          ].map((item) => (
            <div key={item.label} className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <item.icon className="w-4 h-4" style={{ color: item.color }} strokeWidth={2.5} />
                <span className="section-label" style={{ padding: 0 }}>{item.label}</span>
              </div>
              <p className="text-[24px] font-bold tabular-nums" style={{ color: "var(--text-1)" }}>{item.value}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddUser} className="card p-5">
          <h2 className="text-[14px] font-bold mb-4" style={{ color: "var(--text-1)" }}>Adicionar usuário</h2>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_130px_140px_auto] gap-3 items-end">
            <div>
              <label className="section-label mb-1.5 block" style={{ padding: 0 }}>Nome</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do usuário" className="input" />
            </div>
            <div>
              <label className="section-label mb-1.5 block" style={{ padding: 0 }}>E-mail</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="usuario@email.com" className="input" />
            </div>
            <div>
              <label className="section-label mb-1.5 block" style={{ padding: 0 }}>Permissão</label>
              <select value={role} onChange={(e) => setRole(e.target.value as LocalRole)} className="select w-full">
                <option value="user">Usuário</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="section-label mb-1.5 block" style={{ padding: 0 }}>Plano</label>
              <select value={plan} onChange={(e) => setPlan(e.target.value as LocalPlan)} className="select w-full">
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="unlimited">Ilimitado</option>
              </select>
            </div>
            <button type="submit" className="btn-primary px-4 py-2.5">
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Adicionar
            </button>
          </div>
        </form>

        <div className="card overflow-hidden">
          <div className="px-4 py-3.5 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Usuários locais</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ background: "var(--bg-subtle)", borderColor: "var(--border)" }}>
                  {["Nome", "E-mail", "Permissão", "Plano", "Status", "Limites", "Criado em", "Ações"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap"
                      style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-4)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const fixedAdmin = isAdminEmail(user.email);
                  const limits = getLocalUserLimits(user);
                  return (
                    <tr key={user.email} className="border-b last:border-b-0" style={{ borderColor: "var(--border)" }}>
                      <td className="px-4 py-3 text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>{user.name}</td>
                      <td className="px-4 py-3 text-[13px]" style={{ color: "var(--text-2)" }}>{user.email}</td>
                      <td className="px-4 py-3">
                        <select
                          value={fixedAdmin ? "admin" : user.role ?? "user"}
                          onChange={(e) => handleRoleChange(user, e.target.value as LocalRole)}
                          disabled={fixedAdmin}
                          className="select py-1.5 text-[12px] w-28"
                        >
                          <option value="user">Usuário</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={fixedAdmin ? "unlimited" : user.plan ?? "starter"}
                          onChange={(e) => handlePlanChange(user, e.target.value as LocalPlan)}
                          disabled={fixedAdmin}
                          className="select py-1.5 text-[12px] w-32"
                        >
                          <option value="starter">Starter</option>
                          <option value="pro">Pro</option>
                          <option value="unlimited">Ilimitado</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={fixedAdmin ? "active" : user.status ?? "active"}
                          onChange={(e) => handleStatusChange(user, e.target.value as LocalUserStatus)}
                          disabled={fixedAdmin}
                          className="select py-1.5 text-[12px] w-28"
                        >
                          <option value="active">Ativo</option>
                          <option value="blocked">Bloqueado</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-[12px] whitespace-nowrap" style={{ color: "var(--text-3)" }}>
                        {PLAN_LABELS[user.plan ?? "starter"]}: {formatLimit(limits.adAccounts)} contas, {formatLimit(limits.reports)} relatórios
                      </td>
                      <td className="px-4 py-3 text-[12px] whitespace-nowrap" style={{ color: "var(--text-4)" }}>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString("pt-BR") : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleRemove(user)}
                          disabled={fixedAdmin}
                          className="btn-icon w-8 h-8 disabled:opacity-40 disabled:cursor-not-allowed"
                          title={fixedAdmin ? "Admin principal não pode ser removido" : "Remover usuário"}
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={2} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Gauge className="w-4 h-4" style={{ color: "var(--blue)" }} strokeWidth={2.5} />
              <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Limites do admin principal</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(getLocalUserLimits(currentUser)).map(([key, value]) => (
                <div key={key} className="rounded-lg p-3" style={{ background: "var(--bg-muted)" }}>
                  <p className="section-label" style={{ padding: 0 }}>{key}</p>
                  <p className="text-[15px] font-bold mt-1" style={{ color: "var(--text-1)" }}>{formatLimit(value)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <PlugZap className="w-4 h-4" style={{ color: "var(--green)" }} strokeWidth={2.5} />
              <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Funcionalidade do Trackfy</h2>
            </div>
            <div className="space-y-3">
              {[
                { label: "Admin local com usuários e planos", done: true },
                { label: "Google Ads com Developer Token e Customer ID", done: true },
                { label: "Fallback local quando Supabase não responde", done: true },
                { label: "Persistência real multiusuário no Supabase", done: false },
                { label: "Convite por e-mail e recuperação de senha", done: false },
                { label: "Permissões aplicadas em todas as rotas sensíveis", done: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" style={{ color: item.done ? "var(--green)" : "var(--text-4)" }} strokeWidth={2.5} />
                  <span className="text-[13px] font-medium" style={{ color: item.done ? "var(--text-2)" : "var(--text-4)" }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <TutorialHub />
    </div>
  );
}
