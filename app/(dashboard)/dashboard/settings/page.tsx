"use client";
import { useState, useEffect } from "react";
import { Save, Eye, EyeOff, RefreshCw, CheckCircle, AlertCircle, Shield, Bell, Globe, ChevronDown, ExternalLink, Copy } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { runRefresh } from "@/hooks/useMetaData";
import { getLocalUser } from "@/lib/localAuth";
import { BrandIcon } from "@/components/shared/BrandIcon";

const INTEGRATIONS = [
  { id: "meta",   name: "Meta Ads",   brand: "meta",   color: "#1877f2", tokenKey: "tf_token",   accountKey: "tf_account", placeholder: "EAAxxxxxxxxxxxxxxxx", accountPlaceholder: "123456789012345", accountLabel: "Ad Account ID", accountHint: "Sem o prefixo 'act_'" },
  { id: "google", name: "Google Ads", brand: "google", color: "#ea4335", tokenKey: "tf_google_connection", accountKey: "tf_google_customer", placeholder: "OAuth automático", accountPlaceholder: "1234567890", accountLabel: "Customer ID", accountHint: "Sem hífens. Ex.: 1234567890", managerKey: "tf_google_manager", managerPlaceholder: "0987654321" },
  { id: "tiktok", name: "TikTok Ads", brand: "tiktok", color: "#000000", tokenKey: "tf_tiktok",  accountKey: "tf_tiktok_account", placeholder: "xxxxxxxx-xxxx-xxxx-xxxx", accountPlaceholder: "1234567890", accountLabel: "Advertiser ID" },
  { id: "gemini", name: "Gemini AI",  brand: "gemini", color: "#8b5cf6", tokenKey: "tf_gemini",  placeholder: "AIzaSy...", hint: "Obtenha em makersuite.google.com" },
];

const INTEGRATION_GUIDES: Record<string, {
  title: string;
  note: string;
  steps: { title: string; description: string; link?: { label: string; url: string } }[];
}> = {
  meta: {
    title: "Como pegar as credenciais Meta Ads",
    note: "Você precisa de um token com permissão de leitura de anúncios e o ID da conta de anúncios.",
    steps: [
      {
        title: "Abra o Meta for Developers",
        description: "Entre com a conta que tem acesso ao Gerenciador de Anúncios e crie ou selecione um app do tipo Business.",
        link: { label: "Meta for Developers", url: "https://developers.facebook.com/apps/" },
      },
      {
        title: "Adicione a Marketing API",
        description: "No app, vá em Produtos e adicione Marketing API. Ela libera os endpoints usados para campanhas, conjuntos e anúncios.",
      },
      {
        title: "Gere um Access Token",
        description: "Use o Graph API Explorer ou o painel da Marketing API e inclua permissões como ads_read e ads_management.",
        link: { label: "Graph API Explorer", url: "https://developers.facebook.com/tools/explorer/" },
      },
      {
        title: "Copie o Ad Account ID",
        description: "No Gerenciador de Anúncios, copie o ID da conta. No Trackfy cole só os números, sem o prefixo act_.",
        link: { label: "Gerenciador de Anúncios", url: "https://www.facebook.com/adsmanager/" },
      },
      {
        title: "Cole e teste no Trackfy",
        description: "Preencha Access Token e Ad Account ID, clique em Salvar e depois em Testar conexão.",
      },
    ],
  },
  google: {
    title: "Como pegar as credenciais Google Ads",
    note: "Google Ads usa OAuth com refresh token. Você conecta uma vez e o Trackfy renova o acesso no backend.",
    steps: [
      {
        title: "Ative a Google Ads API",
        description: "No Google Cloud Console, selecione seu projeto, abra APIs e Serviços e ative Google Ads API.",
        link: { label: "Google Cloud Console", url: "https://console.cloud.google.com/apis/library/googleads.googleapis.com" },
      },
      {
        title: "Crie credenciais OAuth 2.0",
        description: "Na tela Google Auth Platform, se aparecer 'Você ainda não configurou nenhum cliente OAuth', clique em Clientes no menu lateral, depois em Criar cliente. Escolha Aplicativo da Web.",
        link: { label: "Credenciais Google Cloud", url: "https://console.cloud.google.com/apis/credentials" },
      },
      {
        title: "Configure consentimento se pedir",
        description: "Se o Google pedir configuração, abra Branding/Consent screen, informe nome do app, e-mail de suporte e público Externo em teste. Adicione seu e-mail em Test users.",
        link: { label: "Google Auth Platform", url: "https://console.cloud.google.com/auth/overview" },
      },
      {
        title: "Solicite o Developer Token",
        description: "No Google Ads, abra Ferramentas e configurações, API Center, e copie o Developer Token aprovado ou em modo teste.",
        link: { label: "Google Ads API Center", url: "https://ads.google.com/aw/apicenter" },
      },
      {
        title: "Copie o Customer ID",
        description: "No canto superior da conta Google Ads, copie o ID da conta e cole no Trackfy sem hífens.",
        link: { label: "Google Ads", url: "https://ads.google.com/" },
      },
      {
        title: "Informe MCC se existir",
        description: "Se você acessa a conta por uma conta manager, cole o ID da MCC em Login Customer ID. Caso contrário, deixe em branco.",
      },
    ],
  },
  tiktok: {
    title: "Como pegar as credenciais TikTok Ads",
    note: "Você precisa criar um app no TikTok for Developers e copiar o access token e Advertiser ID.",
    steps: [
      {
        title: "Acesse TikTok for Developers",
        description: "Entre com uma conta que tenha acesso ao TikTok Business Center e crie um app.",
        link: { label: "TikTok for Developers", url: "https://developers.tiktok.com/" },
      },
      {
        title: "Ative Marketing API",
        description: "No app, solicite acesso ao produto Marketing API e conclua as configurações obrigatórias.",
      },
      {
        title: "Autorize a conta de anúncios",
        description: "Faça o fluxo OAuth para autorizar o anunciante e gerar o access token.",
        link: { label: "TikTok Business", url: "https://business.tiktok.com/" },
      },
      {
        title: "Copie o Advertiser ID",
        description: "No TikTok Ads Manager ou Business Center, copie o ID do anunciante e cole no Trackfy.",
      },
      {
        title: "Salve no Trackfy",
        description: "Preencha Access Token e Advertiser ID. A sincronização real do TikTok ainda precisa ser ligada aos endpoints.",
      },
    ],
  },
  gemini: {
    title: "Como pegar a chave Gemini AI",
    note: "Essa chave libera as respostas da IA dentro do assistente do Trackfy.",
    steps: [
      {
        title: "Abra o Google AI Studio",
        description: "Entre com sua conta Google e acesse a área de chaves de API.",
        link: { label: "Google AI Studio", url: "https://aistudio.google.com/app/apikey" },
      },
      {
        title: "Crie uma API key",
        description: "Clique para criar uma chave nova e selecione o projeto Google Cloud correspondente, se solicitado.",
      },
      {
        title: "Copie a chave",
        description: "A chave normalmente começa com AIza. Guarde com cuidado e não compartilhe publicamente.",
      },
      {
        title: "Cole no Trackfy",
        description: "Preencha o campo Access Token da integração Gemini AI e clique em Salvar.",
      },
    ],
  },
};

export default function SettingsPage() {
  const { token, accountId, setToken, setAccountId, _hydrate } = useAppStore();
  const [tokens, setTokens]   = useState<Record<string, string>>({});
  const [accounts, setAccounts] = useState<Record<string, string>>({});
  const [extras, setExtras] = useState<Record<string, string>>({});
  const [show, setShow]       = useState<Record<string, boolean>>({});
  const [openGuides, setOpenGuides] = useState<Record<string, boolean>>({ google: true });
  const [testing, setTesting] = useState(false);
  const [googleConnecting, setGoogleConnecting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [saved, setSaved]     = useState(false);
  const [activeSection, setActiveSection] = useState("integrations");
  const [googleConnections, setGoogleConnections] = useState<any[]>([]);
  const [googleConfig, setGoogleConfig] = useState({
    oauthConfigured: false,
    developerTokenConfigured: false,
    clientIdConfigured: false,
    clientSecretConfigured: false,
    redirectUriConfigured: false,
    redirectUri: "",
    apiVersion: "v22",
  });
  const [googleSetup, setGoogleSetup] = useState({
    clientId: "",
    clientSecret: "",
    redirectUri: "",
    developerToken: "",
    apiVersion: "v22",
  });
  const [localUser, setLocalUser] = useState<ReturnType<typeof getLocalUser>>(null);
  const [currentOrigin, setCurrentOrigin] = useState("http://localhost:3002");

  const currentUserId = () => localUser?.email ?? getLocalUser()?.email ?? "";

  useEffect(() => {
    _hydrate();
    setLocalUser(getLocalUser());
    setCurrentOrigin(window.location.origin);
    const t: Record<string, string> = {};
    const a: Record<string, string> = {};
    INTEGRATIONS.forEach((i) => {
      t[i.id] = typeof window !== "undefined" ? localStorage.getItem(i.tokenKey) ?? "" : "";
      if (i.accountKey) a[i.id] = typeof window !== "undefined" ? localStorage.getItem(i.accountKey) ?? "" : "";
      if ("managerKey" in i && i.managerKey) {
        a[`${i.id}_manager`] = typeof window !== "undefined" ? localStorage.getItem(i.managerKey) ?? "" : "";
      }
    });
    t["meta"] = token; a["meta"] = accountId;
    setTokens(t); setAccounts(a); setExtras(a);
  }, [token, accountId]);

  const loadGoogleConnections = async () => {
    const userId = currentUserId();
    if (!userId) {
      setGoogleConnections([]);
      return;
    }
    try {
      const res = await fetch(`/api/google-ads/connections?user_id=${encodeURIComponent(userId)}`);
      const data = await res.json();
      setGoogleConnections(data.connections ?? []);
      setGoogleConfig({
        oauthConfigured: !!data.oauthConfigured,
        developerTokenConfigured: !!data.developerTokenConfigured,
        clientIdConfigured: !!data.clientIdConfigured,
        clientSecretConfigured: !!data.clientSecretConfigured,
        redirectUriConfigured: !!data.redirectUriConfigured,
        redirectUri: data.redirectUri ?? "",
        apiVersion: data.apiVersion ?? "v22",
      });
      setGoogleSetup((current) => ({
        ...current,
        redirectUri: current.redirectUri || data.redirectUri || `${window.location.origin}/api/google-ads/oauth/callback`,
        apiVersion: data.apiVersion ?? current.apiVersion,
      }));
    } catch {
      setGoogleConnections([]);
    }
  };

  useEffect(() => {
    loadGoogleConnections();
  }, []);

  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.source !== "trackfy-google-ads-oauth") return;
      setGoogleConnecting(false);
      if (event.data.ok) {
        setTestResult({ ok: true, msg: "Google Ads conectado. A conexão já foi salva no Trackfy." });
        await loadGoogleConnections();
      } else {
        setTestResult({ ok: false, msg: event.data.message ?? "Não foi possível conectar o Google Ads." });
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const handleSave = () => {
    INTEGRATIONS.forEach((i) => {
      if (tokens[i.id]) localStorage.setItem(i.tokenKey, tokens[i.id]);
      if (i.accountKey && accounts[i.id]) localStorage.setItem(i.accountKey, accounts[i.id]);
      if ("managerKey" in i && i.managerKey) localStorage.setItem(i.managerKey, extras[`${i.id}_manager`] ?? "");
    });
    setToken(tokens["meta"] ?? ""); setAccountId(accounts["meta"] ?? "");
    setSaved(true); setTimeout(() => setSaved(false), 2500);
  };

  const handleSaveAndSync = async () => { handleSave(); await runRefresh(); };

  const testMeta = async () => {
    const t = tokens["meta"];
    if (!t) { setTestResult({ ok: false, msg: "Token não informado." }); return; }
    setTesting(true); setTestResult(null);
    try {
      const res = await fetch(`https://graph.facebook.com/v19.0/me?access_token=${t}`);
      const data = await res.json();
      if (data.id) setTestResult({ ok: true, msg: `Conectado como: ${data.name} (ID: ${data.id})` });
      else setTestResult({ ok: false, msg: data.error?.message ?? "Token inválido." });
    } catch { setTestResult({ ok: false, msg: "Erro de rede." }); }
    finally { setTesting(false); }
  };

  const connectGoogleAds = () => {
    const googleReady = googleConfig.oauthConfigured && googleConfig.developerTokenConfigured;
    const userId = currentUserId();
    const customerId = (accounts.google ?? "").replace(/\D/g, "");
    const loginCustomerId = (extras.google_manager ?? "").replace(/\D/g, "");
    if (!googleReady) {
      setTestResult({ ok: false, msg: "Google Ads ainda não foi liberado no Trackfy. Configure o app uma vez no setup técnico para ativar a conexão dos usuários." });
      return;
    }
    if (!userId) {
      setTestResult({ ok: false, msg: "Entre na sua conta Trackfy antes de conectar o Google Ads." });
      return;
    }
    if (!customerId) {
      setTestResult({ ok: false, msg: "Informe o Customer ID do Google Ads sem hífens." });
      return;
    }
    const params = new URLSearchParams({
      customer_id: customerId,
      login_customer_id: loginCustomerId,
      user_id: userId,
      popup: "1",
    });
    const width = 560;
    const height = 700;
    const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2);
    const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2);
    const popup = window.open(
      `/api/google-ads/oauth/start?${params}`,
      "trackfy-google-ads-oauth",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
    if (!popup) {
      window.location.href = `/api/google-ads/oauth/start?${params}`;
      return;
    }
    setGoogleConnecting(true);
    setTestResult({ ok: true, msg: "Abrimos o Google em uma janela. Autorize a conta e volte para o Trackfy." });
  };

  const testGoogleConnection = async (id: string) => {
    setTesting(true);
    setTestResult(null);
    try {
      const userId = currentUserId();
      const res = await fetch(`/api/google-ads/test-connection/${id}?user_id=${encodeURIComponent(userId)}`);
      const data = await res.json();
      setTestResult({ ok: !!data.ok, msg: data.message ?? data.error ?? "Teste concluído." });
      await loadGoogleConnections();
    } catch {
      setTestResult({ ok: false, msg: "Erro ao testar conexão Google Ads." });
    } finally {
      setTesting(false);
    }
  };

  const saveGoogleSetup = async () => {
    const userId = currentUserId();
    if (!userId) {
      setTestResult({ ok: false, msg: "Entre como admin para configurar o Google Ads." });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/google-ads/config?user_id=${encodeURIComponent(userId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(googleSetup),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao salvar setup Google Ads.");
      setGoogleConfig({
        oauthConfigured: !!data.config.oauthConfigured,
        developerTokenConfigured: !!data.config.developerTokenConfigured,
        clientIdConfigured: !!data.config.clientIdConfigured,
        clientSecretConfigured: !!data.config.clientSecretConfigured,
        redirectUriConfigured: !!data.config.redirectUriConfigured,
        redirectUri: data.config.redirectUri ?? "",
        apiVersion: data.config.apiVersion ?? "v22",
      });
      setGoogleSetup((current) => ({
        ...current,
        clientSecret: "",
        developerToken: "",
        redirectUri: data.config.redirectUri ?? current.redirectUri,
        apiVersion: data.config.apiVersion ?? current.apiVersion,
      }));
      setTestResult({ ok: true, msg: "Setup Google Ads salvo. Agora os usuários podem conectar pelo OAuth." });
      await loadGoogleConnections();
    } catch (e: any) {
      setTestResult({ ok: false, msg: e.message ?? "Erro ao salvar setup Google Ads." });
    } finally {
      setTesting(false);
    }
  };

  const sections = [
    { id: "integrations", label: "Integrações", icon: Globe },
    { id: "notifications", label: "Notificações", icon: Bell },
    { id: "security", label: "Segurança", icon: Shield },
  ];

  const inputStyle = "input font-mono text-[12px]";
  const currentUser = localUser;
  const isAdmin = currentUser?.role === "admin";
  const googleReady = googleConfig.oauthConfigured && googleConfig.developerTokenConfigured;
  const localRedirectUri = `${currentOrigin}/api/google-ads/oauth/callback`;
  const hostedRedirectUri = "https://SEU-DOMINIO.com/api/google-ads/oauth/callback";

  return (
    <div className="max-w-[900px] mx-auto space-y-6">
      <div>
        <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "var(--text-1)" }}>Configurações</h1>
        <p className="text-[13px] mt-0.5" style={{ color: "var(--text-4)" }}>Gerencie suas integrações e preferências</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <div className="w-44 shrink-0 space-y-0.5">
          {sections.map((s) => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-100"
              style={{
                background: activeSection === s.id ? "var(--blue-muted)" : "transparent",
                color: activeSection === s.id ? "var(--blue)" : "var(--text-3)",
                fontWeight: activeSection === s.id ? 600 : 500,
              }}
              onMouseEnter={(e) => { if (activeSection !== s.id) { (e.currentTarget as HTMLElement).style.background = "var(--bg-muted)"; (e.currentTarget as HTMLElement).style.color = "var(--text-2)"; } }}
              onMouseLeave={(e) => { if (activeSection !== s.id) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-3)"; } }}
            >
              <s.icon className="w-4 h-4 shrink-0" strokeWidth={activeSection === s.id ? 2.5 : 2} style={{ color: activeSection === s.id ? "var(--blue)" : "var(--text-4)" }} />
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-4">
          {activeSection === "integrations" && (
            <>
              {INTEGRATIONS.map((integ) => (
                <div key={integ.id} className="card p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${integ.color}15` }}>
                      <BrandIcon brand={integ.brand as "meta" | "google" | "tiktok" | "gemini"} className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>{integ.name}</h3>
                      {tokens[integ.id] && (
                        <span className="badge badge-green mt-0.5">Configurado</span>
                      )}
                    </div>
                  </div>

                  <div
                    className="rounded-xl border overflow-hidden"
                    style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenGuides((g) => ({ ...g, [integ.id]: !g[integ.id] }))}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors duration-100"
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-muted)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <div>
                        <p className="text-[13px] font-bold" style={{ color: "var(--text-1)" }}>
                          {INTEGRATION_GUIDES[integ.id].title}
                        </p>
                        <p className="text-[12px] mt-0.5" style={{ color: "var(--text-4)" }}>
                          {INTEGRATION_GUIDES[integ.id].note}
                        </p>
                      </div>
                      <ChevronDown
                        className="w-4 h-4 shrink-0 transition-transform duration-200"
                        style={{
                          color: "var(--text-4)",
                          transform: openGuides[integ.id] ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                        strokeWidth={2.5}
                      />
                    </button>

                    {openGuides[integ.id] && (
                      <div className="px-4 pb-4 space-y-3">
                        {INTEGRATION_GUIDES[integ.id].steps.map((step, index) => (
                          <div key={step.title} className="flex gap-3">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold"
                              style={{ background: `${integ.color}18`, color: integ.color }}
                            >
                              {index + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[12px] font-bold" style={{ color: "var(--text-1)" }}>{step.title}</p>
                              <p className="text-[12px] leading-relaxed mt-0.5" style={{ color: "var(--text-3)" }}>
                                {step.description}
                              </p>
                              {step.link && (
                                <a
                                  href={step.link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 mt-1.5 text-[12px] font-semibold"
                                  style={{ color: "var(--blue)" }}
                                >
                                  {step.link.label}
                                  <ExternalLink className="w-3 h-3" strokeWidth={2.5} />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {integ.id !== "google" && (
                      <div>
                        <label className="block mb-1.5" style={{ fontSize: 11, fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          Access Token
                        </label>
                        <div className="relative">
                          <input
                            type={show[integ.id] ? "text" : "password"}
                            value={tokens[integ.id] ?? ""}
                            onChange={(e) => setTokens((t) => ({ ...t, [integ.id]: e.target.value }))}
                            placeholder={integ.placeholder}
                            className={inputStyle + " pr-10"}
                          />
                          <button type="button" onClick={() => setShow((s) => ({ ...s, [integ.id]: !s[integ.id] }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 btn-icon w-6 h-6">
                            {show[integ.id] ? <EyeOff className="w-3.5 h-3.5" strokeWidth={2} /> : <Eye className="w-3.5 h-3.5" strokeWidth={2} />}
                          </button>
                        </div>
                        {"hint" in integ && integ.hint && (
                          <p style={{ fontSize: 11, color: "var(--text-4)", marginTop: 4 }}>{integ.hint}</p>
                        )}
                      </div>
                    )}

                    {"accountKey" in integ && integ.accountKey && (
                      <div>
                        <label className="block mb-1.5" style={{ fontSize: 11, fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          {"accountLabel" in integ ? integ.accountLabel : "Account ID"}
                        </label>
                        <input
                          type="text"
                          value={accounts[integ.id] ?? ""}
                          onChange={(e) => setAccounts((a) => ({ ...a, [integ.id]: e.target.value }))}
                          placeholder={"accountPlaceholder" in integ ? integ.accountPlaceholder : ""}
                          className={inputStyle}
                        />
                        {"accountHint" in integ && integ.accountHint && (
                          <p style={{ fontSize: 11, color: "var(--text-4)", marginTop: 4 }}>{integ.accountHint}</p>
                        )}
                      </div>
                    )}

                    {integ.id === "google" && "managerKey" in integ && (
                      <>
                        <div>
                          <label className="block mb-1.5" style={{ fontSize: 11, fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            Login Customer ID (MCC opcional)
                          </label>
                          <input
                            type="text"
                            value={extras[`${integ.id}_manager`] ?? ""}
                            onChange={(e) => setExtras((x) => ({ ...x, [`${integ.id}_manager`]: e.target.value }))}
                            placeholder={integ.managerPlaceholder}
                            className={inputStyle}
                          />
                          <p style={{ fontSize: 11, color: "var(--text-4)", marginTop: 4 }}>Use apenas se acessa a conta por uma conta manager.</p>
                        </div>
                      </>
                    )}
                  </div>

                  {integ.id === "google" && (
                    <div className="space-y-3">
                      {!googleReady && (
                        <div className="flex items-start gap-2 p-3 rounded-xl text-[12px]"
                          style={{ background: "var(--yellow-light)", border: "1px solid rgba(217,119,6,0.15)", color: "var(--yellow)" }}>
                          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" strokeWidth={2} />
                          Google Ads ainda não está liberado neste Trackfy. Assim que o setup técnico for concluído, cada usuário poderá conectar a própria conta com um clique.
                        </div>
                      )}

                      {(isAdmin || !googleReady) && (
                        <details open className="rounded-xl border p-3 text-[12px]" style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}>
                          <summary className="cursor-pointer font-bold" style={{ color: "var(--text-2)" }}>Setup técnico do Google Ads</summary>
                          <div className="mt-3 space-y-3">
                            <div className="rounded-xl border p-3 space-y-3" style={{ borderColor: "rgba(59,130,246,0.2)", background: "var(--blue-light)" }}>
                              <div className="flex items-start gap-2">
                                <BrandIcon brand="google" className="w-5 h-5 shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-bold" style={{ color: "var(--text-1)" }}>Tutorial rápido: o que colocar na URL?</p>
                                  <p className="mt-1 leading-relaxed" style={{ color: "var(--text-3)" }}>
                                    No Google Cloud, em <b>Authorized redirect URIs</b>, cole exatamente a mesma URL do campo Redirect URI aqui do Trackfy.
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 gap-2">
                                <div className="rounded-lg p-2" style={{ background: "var(--surface)" }}>
                                  <p className="font-bold" style={{ color: "var(--text-2)" }}>Rodando local agora</p>
                                  <div className="mt-1 flex items-center gap-2">
                                    <code className="flex-1 break-all text-[11px]" style={{ color: "var(--text-3)" }}>{localRedirectUri}</code>
                                    <button
                                      type="button"
                                      onClick={() => setGoogleSetup((s) => ({ ...s, redirectUri: localRedirectUri }))}
                                      className="btn-secondary px-2 py-1 text-[11px]"
                                    >
                                      Usar
                                    </button>
                                  </div>
                                </div>
                                <div className="rounded-lg p-2" style={{ background: "var(--surface)" }}>
                                  <p className="font-bold" style={{ color: "var(--text-2)" }}>Quando hospedar</p>
                                  <code className="block mt-1 break-all text-[11px]" style={{ color: "var(--text-3)" }}>{hostedRedirectUri}</code>
                                  <p className="mt-1 leading-relaxed" style={{ color: "var(--text-4)" }}>
                                    Troque <b>SEU-DOMINIO.com</b> pelo domínio real do Trackfy. Ex.: https://trackfy.com.br/api/google-ads/oauth/callback
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block mb-1.5 font-bold uppercase tracking-wide" style={{ color: "var(--text-4)", fontSize: 11 }}>OAuth Client ID</label>
                                <input
                                  value={googleSetup.clientId}
                                  onChange={(e) => setGoogleSetup((s) => ({ ...s, clientId: e.target.value }))}
                                  placeholder={googleConfig.clientIdConfigured ? "Client ID já salvo" : "xxxx.apps.googleusercontent.com"}
                                  className={inputStyle}
                                />
                              </div>
                              <div>
                                <label className="block mb-1.5 font-bold uppercase tracking-wide" style={{ color: "var(--text-4)", fontSize: 11 }}>OAuth Client Secret</label>
                                <input
                                  type="password"
                                  value={googleSetup.clientSecret}
                                  onChange={(e) => setGoogleSetup((s) => ({ ...s, clientSecret: e.target.value }))}
                                  placeholder={googleConfig.clientSecretConfigured ? "Client Secret já salvo" : "GOCSPX-..."}
                                  className={inputStyle}
                                />
                              </div>
                              <div>
                                <label className="block mb-1.5 font-bold uppercase tracking-wide" style={{ color: "var(--text-4)", fontSize: 11 }}>Redirect URI</label>
                                <div className="relative">
                                  <input
                                    value={googleSetup.redirectUri}
                                    onChange={(e) => setGoogleSetup((s) => ({ ...s, redirectUri: e.target.value }))}
                                    placeholder={localRedirectUri}
                                    className={inputStyle + " pr-10"}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => navigator.clipboard?.writeText(googleSetup.redirectUri || localRedirectUri)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 btn-icon w-6 h-6"
                                    title="Copiar Redirect URI"
                                  >
                                    <Copy className="w-3.5 h-3.5" strokeWidth={2} />
                                  </button>
                                </div>
                                <p className="mt-1" style={{ color: "var(--text-4)" }}>
                                  Essa URL precisa estar igual no Google Cloud e aqui no Trackfy.
                                </p>
                              </div>
                              <div>
                                <label className="block mb-1.5 font-bold uppercase tracking-wide" style={{ color: "var(--text-4)", fontSize: 11 }}>Developer Token</label>
                                <input
                                  type="password"
                                  value={googleSetup.developerToken}
                                  onChange={(e) => setGoogleSetup((s) => ({ ...s, developerToken: e.target.value }))}
                                  placeholder={googleConfig.developerTokenConfigured ? "Developer Token já salvo" : "Token do API Center"}
                                  className={inputStyle}
                                />
                              </div>
                              <div>
                                <label className="block mb-1.5 font-bold uppercase tracking-wide" style={{ color: "var(--text-4)", fontSize: 11 }}>API Version</label>
                                <input
                                  value={googleSetup.apiVersion}
                                  onChange={(e) => setGoogleSetup((s) => ({ ...s, apiVersion: e.target.value }))}
                                  placeholder="v22"
                                  className={inputStyle}
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <p style={{ color: "var(--text-4)" }}>
                                Salve aqui uma vez. O cliente final verá só o botão para conectar a própria conta Google Ads.
                              </p>
                              <button type="button" onClick={saveGoogleSetup} disabled={testing} className="btn-secondary px-4 py-2">
                                {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" strokeWidth={2.5} /> : <Save className="w-3.5 h-3.5" strokeWidth={2.5} />}
                                Salvar setup Google
                              </button>
                            </div>
                          </div>
                        </details>
                      )}

                      <div className="flex gap-2 flex-wrap">
                        <button onClick={connectGoogleAds} disabled={!googleReady || googleConnecting} className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed">
                          {googleConnecting ? <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={2.5} /> : <BrandIcon brand="google" className="w-4 h-4" />}
                          {googleConnecting ? "Aguardando Google..." : googleConnections.length ? "Reconectar com Google" : "Conectar com Google"}
                        </button>
                        {googleConnections[0] && (
                          <button onClick={() => testGoogleConnection(googleConnections[0].id)} disabled={testing} className="btn-secondary px-4 py-2">
                            {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" strokeWidth={2.5} /> : <CheckCircle className="w-3.5 h-3.5" strokeWidth={2.5} />}
                            Testar conexão
                          </button>
                        )}
                      </div>

                      {googleConnections.map((connection) => (
                        <div key={connection.id} className="p-3 rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}>
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-[13px] font-bold" style={{ color: "var(--text-1)" }}>Customer ID {connection.customer_id}</p>
                              <p className="text-[12px]" style={{ color: "var(--text-4)" }}>
                                MCC {connection.login_customer_id || "não informado"} · {connection.status}
                              </p>
                            </div>
                            <span className={connection.status === "active" ? "badge badge-green" : "badge badge-yellow"}>
                              {connection.status === "needs_reauth" ? "Reconectar" : connection.status}
                            </span>
                          </div>
                          {connection.last_error && (
                            <p className="text-[12px] mt-2" style={{ color: "var(--red)" }}>{connection.last_error}</p>
                          )}
                        </div>
                      ))}

                      {testResult && (
                        <div className="flex items-start gap-2 p-3 rounded-xl text-[12px]"
                          style={{ background: testResult.ok ? "var(--green-light)" : "var(--red-light)", border: `1px solid ${testResult.ok ? "rgba(22,163,74,0.15)" : "rgba(220,38,38,0.15)"}`, color: testResult.ok ? "var(--green)" : "var(--red)" }}>
                          {testResult.ok ? <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" strokeWidth={2} /> : <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" strokeWidth={2} />}
                          {testResult.msg}
                        </div>
                      )}
                    </div>
                  )}

                  {integ.id === "meta" && (
                    <>
                      {testResult && (
                        <div className="flex items-start gap-2 p-3 rounded-xl text-[12px]"
                          style={{ background: testResult.ok ? "var(--green-light)" : "var(--red-light)", border: `1px solid ${testResult.ok ? "rgba(22,163,74,0.15)" : "rgba(220,38,38,0.15)"}`, color: testResult.ok ? "var(--green)" : "var(--red)" }}>
                          {testResult.ok ? <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" strokeWidth={2} /> : <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" strokeWidth={2} />}
                          {testResult.msg}
                        </div>
                      )}
                      <button onClick={testMeta} disabled={testing || !tokens["meta"]} className="btn-secondary px-4 py-2">
                        {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" strokeWidth={2.5} /> : <CheckCircle className="w-3.5 h-3.5" strokeWidth={2.5} />}
                        {testing ? "Testando..." : "Testar conexão"}
                      </button>
                    </>
                  )}
                </div>
              ))}

              <div className="flex gap-3">
                <button onClick={handleSave} className="btn-secondary px-5 py-2.5">
                  {saved ? <><CheckCircle className="w-4 h-4 text-green-500" strokeWidth={2.5} /> Salvo!</> : <><Save className="w-4 h-4" strokeWidth={2.5} /> Salvar</>}
                </button>
                <button onClick={handleSaveAndSync} className="btn-primary px-5 py-2.5">
                  <RefreshCw className="w-4 h-4" strokeWidth={2.5} /> Salvar e Sincronizar
                </button>
              </div>
            </>
          )}

          {activeSection === "notifications" && (
            <div className="card p-5 space-y-4">
              <h3 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Preferências de Notificação</h3>
              {[
                { label: "Alertas de performance crítica", desc: "CPL alto, ROAS baixo, orçamento esgotando", def: true },
                { label: "Resumo diário por e-mail",       desc: "Receba um resumo das campanhas todo dia",   def: true },
                { label: "Sugestões da IA semanais",       desc: "Insights e otimizações automáticas",        def: false },
                { label: "Regra de automação executada",   desc: "Notificação quando uma regra for acionada", def: true },
                { label: "Token Meta expirando",           desc: "Aviso 7 dias antes do token expirar",       def: true },
              ].map((n) => (
                <div key={n.label} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>{n.label}</p>
                    <p style={{ fontSize: 12, color: "var(--text-4)", marginTop: 2 }}>{n.desc}</p>
                  </div>
                  <button
                    className="relative rounded-full transition-colors duration-200 shrink-0"
                    style={{ width: 40, height: 22, background: n.def ? "var(--blue)" : "var(--border-2)" }}
                  >
                    <span className="absolute top-0.5 rounded-full bg-white" style={{ width: 18, height: 18, left: n.def ? 20 : 2, boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeSection === "security" && (
            <div className="space-y-4">
              <div className="card p-5 space-y-4">
                <h3 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Alterar Senha</h3>
                {["Senha atual", "Nova senha", "Confirmar nova senha"].map((label) => (
                  <div key={label}>
                    <label className="block mb-1.5" style={{ fontSize: 11, fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
                    <input type="password" placeholder="••••••••" className="input" />
                  </div>
                ))}
                <button className="btn-primary px-5 py-2.5">Atualizar senha</button>
              </div>
              <div className="card p-5">
                <h3 className="text-[14px] font-bold mb-1" style={{ color: "var(--text-1)" }}>Autenticação de Dois Fatores</h3>
                <p style={{ fontSize: 13, color: "var(--text-4)", marginBottom: 16 }}>Adicione uma camada extra de segurança à sua conta.</p>
                <button className="btn-secondary px-4 py-2">Ativar 2FA</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
