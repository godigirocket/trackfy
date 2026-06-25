"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { createLocalSession, findLocalUser, getLocalUser, isAdminEmail } from "@/lib/localAuth";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab]         = useState<"login" | "register">("login");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]       = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (err) {
        if (err.message.includes("Failed to fetch")) {
          const localUser = getLocalUser();
          if (isAdminEmail(email)) {
            createLocalSession({ email, name: "Juan Goes", role: "admin" });
            router.push("/dashboard");
            return;
          }
          const listedUser = findLocalUser(email);
          if (listedUser?.status === "blocked") {
            setError("Usuário bloqueado pelo admin.");
            return;
          }
          if (listedUser) {
            createLocalSession(listedUser);
            router.push("/dashboard");
            return;
          }
          if (localUser?.email.toLowerCase() === email.toLowerCase()) {
            createLocalSession(localUser);
            router.push("/dashboard");
            return;
          }
          setError("Supabase indisponível. Crie uma conta local neste navegador para continuar testando.");
          return;
        }
        if (err.message.includes("Email not confirmed")) setError("E-mail não confirmado. Desative a confirmação no painel Supabase (Authentication → Providers → Email → desmarcar 'Confirm email').");
        else if (err.message.includes("Invalid login credentials")) setError("E-mail ou senha incorretos.");
        else setError(err.message);
        return;
      }
      router.push("/dashboard");
    } catch (e: any) {
      setLoading(false);
      const localUser = getLocalUser();
      if (isAdminEmail(email)) {
        createLocalSession({ email, name: "Juan Goes", role: "admin" });
        router.push("/dashboard");
        return;
      }
      const listedUser = findLocalUser(email);
      if (listedUser?.status === "blocked") {
        setError("Usuário bloqueado pelo admin.");
        return;
      }
      if (listedUser) {
        createLocalSession(listedUser);
        router.push("/dashboard");
        return;
      }
      if (localUser?.email.toLowerCase() === email.toLowerCase()) {
        createLocalSession(localUser);
        router.push("/dashboard");
        return;
      }
      setError("Supabase indisponível. Crie uma conta local neste navegador para continuar testando.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError("Senha deve ter pelo menos 8 caracteres."); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      const { data, error: err } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
      setLoading(false);
      if (err) {
        if (err.message.includes("Failed to fetch")) {
          createLocalSession({ email, name: name || email.split("@")[0] });
          router.push("/dashboard");
          return;
        }
        setError(err.message);
        return;
      }
      if (data.session) { router.push("/dashboard"); }
      else setSuccess("Conta criada! Verifique seu e-mail ou desative a confirmação no Supabase.");
    } catch (e: any) {
      setLoading(false);
      createLocalSession({ email, name: name || email.split("@")[0] });
      router.push("/dashboard");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--bg)" }}
    >
      {/* Subtle background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, var(--blue) 0%, transparent 70%)" }} />
      </div>

      <div className="w-full max-w-[380px] relative">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "var(--blue)", boxShadow: "0 4px 16px rgba(59,130,246,0.35)" }}>
            <TrendingUp className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[20px] font-bold tracking-tight" style={{ color: "var(--text-1)" }}>Trackfy</span>
        </div>

        {/* Card */}
        <div className="card p-6">
          {/* Tabs */}
          <div className="flex p-0.5 rounded-lg mb-5" style={{ background: "var(--bg-muted)" }}>
            {(["login", "register"] as const).map((t) => (
              <button key={t} onClick={() => { setTab(t); setError(""); setSuccess(""); }}
                className="flex-1 py-2 rounded-md text-[13px] font-semibold transition-all duration-150"
                style={{
                  background: tab === t ? "var(--surface)" : "transparent",
                  color: tab === t ? "var(--text-1)" : "var(--text-4)",
                  boxShadow: tab === t ? "var(--shadow-sm)" : "none",
                }}>
                {t === "login" ? "Entrar" : "Criar conta"}
              </button>
            ))}
          </div>

          <form onSubmit={tab === "login" ? handleLogin : handleRegister} className="space-y-3">
            {tab === "register" && (
              <div>
                <label className="section-label mb-1.5 block" style={{ padding: 0 }}>Nome completo</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                  placeholder="Seu nome" className="input" />
              </div>
            )}

            <div>
              <label className="section-label mb-1.5 block" style={{ padding: 0 }}>E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                placeholder="seu@email.com" className="input" />
            </div>

            <div>
              <label className="section-label mb-1.5 block" style={{ padding: 0 }}>Senha</label>
              <div className="relative">
                <input type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                  placeholder={tab === "register" ? "Mínimo 8 caracteres" : "••••••••"}
                  className="input pr-10" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 btn-icon w-6 h-6">
                  {showPwd ? <EyeOff className="w-3.5 h-3.5" strokeWidth={2} /> : <Eye className="w-3.5 h-3.5" strokeWidth={2} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl text-[12px]"
                style={{ background: "var(--red-light)", border: "1px solid rgba(220,38,38,0.15)", color: "var(--red)" }}>
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" strokeWidth={2} /> {error}
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 p-3 rounded-xl text-[12px]"
                style={{ background: "var(--green-light)", border: "1px solid rgba(22,163,74,0.15)", color: "var(--green)" }}>
                <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" strokeWidth={2} /> {success}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-1 text-[14px]">
              {loading ? "Aguarde..." : tab === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>
        </div>

        <p className="text-center text-[12px] mt-4" style={{ color: "var(--text-4)" }}>
          Trackfy — Gestão inteligente de Meta Ads
        </p>
      </div>
    </div>
  );
}
