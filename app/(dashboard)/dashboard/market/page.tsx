"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileSearch,
  Globe2,
  Lightbulb,
  Link2,
  Loader2,
  Megaphone,
  Radar,
  Search,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

type Audit = {
  url: string;
  status: number;
  loadMs: number;
  score: number;
  title: string;
  description: string;
  h1: string;
  h2Count: number;
  imageCount: number;
  altCoverage: number;
  internalLinks: number;
  externalLinks: number;
  forms: number;
  ctas: number;
  canonical: string;
  schema: number;
  ogImage: string;
  noindex: boolean;
  opportunities: string[];
};

const COUNTRIES = [
  { label: "Brasil", value: "BR" },
  { label: "Estados Unidos", value: "US" },
  { label: "Portugal", value: "PT" },
  { label: "México", value: "MX" },
  { label: "Espanha", value: "ES" },
];

const VERTICALS = [
  "emagrecimento",
  "renda extra",
  "curso online",
  "beleza",
  "finanças",
  "imobiliária",
  "saúde",
  "pets",
  "software",
  "infoproduto",
];

function clean(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function slug(value: string) {
  return clean(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function copyText(value: string) {
  navigator.clipboard?.writeText(value);
}

function buildSpyLinks(query: string, country: string) {
  const q = encodeURIComponent(clean(query));
  const domain = clean(query).replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  return [
    { name: "Meta Ads Library", description: "Anúncios ativos no Facebook e Instagram.", url: `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=${country}&q=${q}&search_type=keyword_unordered&media_type=all` },
    { name: "TikTok Creative Center", description: "Criativos e trends públicos do TikTok.", url: `https://ads.tiktok.com/business/creativecenter/inspiration/topads/pc/en?keyword=${q}` },
    { name: "Google Ads Transparency", description: "Anúncios públicos de anunciantes no Google.", url: `https://adstransparency.google.com/?region=${country}&domain=${encodeURIComponent(domain)}` },
    { name: "Google SERP", description: "Concorrentes orgânicos e anúncios na busca.", url: `https://www.google.com/search?q=${q}` },
    { name: "YouTube", description: "VSLs, reviews, provas e ângulos em vídeo.", url: `https://www.youtube.com/results?search_query=${q}` },
    { name: "Google Trends", description: "Direção de demanda e sazonalidade.", url: `https://trends.google.com/trends/explore?geo=${country}&q=${q}` },
  ];
}

function keywordIdeas(seed: string) {
  const base = clean(seed).toLowerCase();
  if (!base) return [];
  const modifiers = ["preço", "vale a pena", "funciona", "como usar", "melhor", "alternativa", "review", "curso", "para iniciantes", "perto de mim", "antes e depois", "depoimentos"];
  return modifiers.map((modifier, index) => ({
    keyword: `${base} ${modifier}`,
    intent: index < 3 ? "Compra/validação" : index < 8 ? "Pesquisa" : "Descoberta",
    angle: index < 3 ? "Prova e objeção" : index < 8 ? "Educação e comparação" : "Volume e curiosidade",
    priority: Math.max(52, 94 - index * 4),
  }));
}

function analyzeAds(text: string) {
  const lines = text.split(/\n+/).map(clean).filter(Boolean);
  const joined = lines.join(" ").toLowerCase();
  const hooks = [
    { key: "dor", label: "Dor explícita", hits: ["cansado", "erro", "problema", "difícil", "trava", "perde", "dor"].filter((w) => joined.includes(w)).length },
    { key: "prova", label: "Prova", hits: ["depoimento", "resultado", "clientes", "case", "comprovado", "antes", "depois"].filter((w) => joined.includes(w)).length },
    { key: "urgencia", label: "Urgência", hits: ["hoje", "agora", "últimas", "vagas", "limitado", "promoção"].filter((w) => joined.includes(w)).length },
    { key: "mecanismo", label: "Mecanismo", hits: ["método", "passo", "sistema", "protocolo", "fórmula", "estratégia"].filter((w) => joined.includes(w)).length },
    { key: "cta", label: "CTA", hits: ["clique", "saiba", "compre", "comece", "garanta", "chame", "acesse"].filter((w) => joined.includes(w)).length },
  ];
  const score = Math.min(100, Math.round(lines.length * 8 + hooks.reduce((sum, hook) => sum + hook.hits * 8, 0)));
  const recommendations = [
    hooks.find((hook) => hook.key === "prova")?.hits ? "" : "Adicionar prova concreta: número, print, depoimento ou demonstração.",
    hooks.find((hook) => hook.key === "mecanismo")?.hits ? "" : "Nomear um mecanismo diferente para fugir de promessa genérica.",
    hooks.find((hook) => hook.key === "cta")?.hits ? "" : "Fechar o anúncio com CTA claro e próximo passo.",
    lines.length >= 4 ? "" : "Cole pelo menos 4 anúncios concorrentes para o padrão ficar mais confiável.",
  ].filter(Boolean);
  return { lines, hooks, score, recommendations };
}

function attackPlan(seed: string, competitor: string, audit?: Audit | null) {
  const topic = clean(seed) || "sua oferta";
  const rival = clean(competitor) || "concorrente principal";
  return [
    `Pesquisar 20 anúncios ativos de ${rival} e separar por promessa, prova, formato e CTA.`,
    `Criar 5 hooks de objeção para ${topic}: preço, confiança, tempo, facilidade e prova.`,
    `Montar uma landing com H1 direto, prova acima da dobra, CTA repetido e FAQ de objeções.`,
    `Criar campanha UTM: utm_source=facebook&utm_medium=cpc&utm_campaign=${slug(topic) || "campanha"}_spy_modelado.`,
    audit && audit.score < 75 ? `Corrigir a landing antes de escalar: ${audit.opportunities[0] || "melhorar estrutura e prova da página"}.` : "Subir teste pequeno com 3 criativos e 2 ângulos antes de aumentar verba.",
  ];
}

export default function MarketPage() {
  const [seed, setSeed] = useState("10 pila");
  const [competitor, setCompetitor] = useState("10pilaoficial.site");
  const [country, setCountry] = useState("BR");
  const [adsText, setAdsText] = useState("Aprenda a vender todos os dias mesmo começando do zero\nMétodo simples para montar sua primeira campanha\nVeja como transformar cliques em vendas com pouca verba");
  const [landingUrl, setLandingUrl] = useState("https://www.10pilaoficial.site");
  const [audit, setAudit] = useState<Audit | null>(null);
  const [auditError, setAuditError] = useState("");
  const [loadingAudit, setLoadingAudit] = useState(false);
  const links = useMemo(() => buildSpyLinks(competitor || seed, country), [competitor, seed, country]);
  const ideas = useMemo(() => keywordIdeas(seed), [seed]);
  const ads = useMemo(() => analyzeAds(adsText), [adsText]);
  const plan = useMemo(() => attackPlan(seed, competitor, audit), [seed, competitor, audit]);

  const runAudit = async () => {
    setLoadingAudit(true);
    setAuditError("");
    try {
      const response = await fetch("/api/market/landing-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: landingUrl }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível analisar a página.");
      setAudit(result);
    } catch (error) {
      setAuditError(error instanceof Error ? error.message : "Não foi possível analisar a página.");
    } finally {
      setLoadingAudit(false);
    }
  };

  return (
    <div className="max-w-[1320px] mx-auto space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radar className="w-5 h-5" style={{ color: "var(--blue)" }} />
            <h1 className="text-[20px] font-bold" style={{ color: "var(--text-1)" }}>Mercado/Spy</h1>
          </div>
          <p className="text-[13px] mt-1 max-w-2xl" style={{ color: "var(--text-4)" }}>
            Pesquisa concorrentes, anúncios públicos, keywords, landing pages e transforma tudo em um plano de teste para tráfego.
          </p>
        </div>
        <button type="button" onClick={() => copyText(plan.join("\n"))} className="btn-secondary px-4 py-2">
          <Copy className="w-4 h-4" /> Copiar plano
        </button>
      </div>

      <div className="card p-4 grid grid-cols-1 md:grid-cols-[1fr_1fr_150px] gap-3">
        <div>
          <label className="section-label mb-1.5 block" style={{ padding: 0 }}>Nicho/produto</label>
          <input value={seed} onChange={(event) => setSeed(event.target.value)} className="input" placeholder="Ex.: emagrecimento, renda extra, curso de maquiagem" />
        </div>
        <div>
          <label className="section-label mb-1.5 block" style={{ padding: 0 }}>Concorrente, marca ou domínio</label>
          <input value={competitor} onChange={(event) => setCompetitor(event.target.value)} className="input" placeholder="Ex.: dominio.com ou nome da marca" />
        </div>
        <div>
          <label className="section-label mb-1.5 block" style={{ padding: 0 }}>País</label>
          <select value={country} onChange={(event) => setCountry(event.target.value)} className="select">
            {COUNTRIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-5">
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between gap-3" style={{ borderColor: "var(--border)" }}>
            <div>
              <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Biblioteca de Ads</h2>
              <p className="text-[12px] mt-1" style={{ color: "var(--text-4)" }}>Atalhos para pesquisar anúncios públicos como um spy tool.</p>
            </div>
            <span className="badge badge-blue">{links.length} fontes</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-5">
            {links.map((link) => (
              <a key={link.name} href={link.url} target="_blank" rel="noreferrer" className="p-4 rounded-lg border transition-colors hover:bg-[var(--bg-muted)]" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-bold" style={{ color: "var(--text-1)" }}>{link.name}</p>
                    <p className="text-[12px] mt-1 leading-relaxed" style={{ color: "var(--text-4)" }}>{link.description}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 shrink-0" style={{ color: "var(--text-4)" }} />
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Radar de oportunidades</h2>
            <p className="text-[12px] mt-1" style={{ color: "var(--text-4)" }}>Keywords para SEO, Google Ads, TikTok e roteiro de conteúdo.</p>
          </div>
          <div className="max-h-[370px] overflow-auto">
            {ideas.map((idea) => (
              <div key={idea.keyword} className="px-5 py-3 border-b flex items-center justify-between gap-4" style={{ borderColor: "var(--border)" }}>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold truncate" style={{ color: "var(--text-2)" }}>{idea.keyword}</p>
                  <p className="text-[12px] mt-1" style={{ color: "var(--text-4)" }}>{idea.intent} · {idea.angle}</p>
                </div>
                <span className="badge badge-neutral">{idea.priority}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-5">
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4" style={{ color: "var(--blue)" }} />
            <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Leitor de anúncios concorrentes</h2>
          </div>
          <textarea value={adsText} onChange={(event) => setAdsText(event.target.value)} className="input min-h-[190px] font-mono text-[12px]" placeholder="Cole textos de anúncios da biblioteca, um por linha." />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {ads.hooks.map((hook) => (
              <div key={hook.key} className="rounded-lg p-3" style={{ background: hook.hits ? "var(--green-light)" : "var(--bg-muted)" }}>
                <p className="text-[11px] font-semibold" style={{ color: "var(--text-4)" }}>{hook.label}</p>
                <p className="text-[20px] font-bold mt-1" style={{ color: hook.hits ? "var(--green)" : "var(--text-3)" }}>{hook.hits}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg p-4" style={{ background: "var(--blue-light)" }}>
            <p className="text-[12px] font-bold" style={{ color: "var(--blue)" }}>Score de padrão: {ads.score}/100</p>
            <p className="text-[12px] mt-1 leading-relaxed" style={{ color: "var(--text-3)" }}>
              Quanto mais anúncios colados, melhor o Trackfy entende o padrão de promessa, prova, mecanismo e CTA do mercado.
            </p>
          </div>
          {ads.recommendations.map((item) => (
            <div key={item} className="flex gap-2 text-[12px]" style={{ color: "var(--text-3)" }}>
              <Lightbulb className="w-4 h-4 shrink-0" style={{ color: "var(--yellow)" }} /> {item}
            </div>
          ))}
        </div>

        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4" style={{ color: "var(--blue)" }} />
            <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Auditor de landing page</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input value={landingUrl} onChange={(event) => setLandingUrl(event.target.value)} className="input flex-1" placeholder="https://site.com/pagina" />
            <button type="button" onClick={runAudit} disabled={loadingAudit} className="btn-primary px-4 py-2">
              {loadingAudit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Analisar
            </button>
          </div>
          {auditError && (
            <div className="rounded-lg p-4 flex gap-2" style={{ background: "var(--red-light)" }}>
              <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: "var(--red)" }} />
              <p className="text-[12px]" style={{ color: "var(--text-3)" }}>{auditError}</p>
            </div>
          )}
          {audit ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { label: "Score", value: `${audit.score}/100` },
                  { label: "Status", value: audit.status },
                  { label: "Load", value: `${audit.loadMs}ms` },
                  { label: "CTAs", value: audit.ctas },
                ].map((metric) => (
                  <div key={metric.label} className="rounded-lg p-3" style={{ background: "var(--bg-muted)" }}>
                    <p className="text-[11px] font-semibold" style={{ color: "var(--text-4)" }}>{metric.label}</p>
                    <p className="text-[18px] font-bold mt-1" style={{ color: "var(--text-1)" }}>{metric.value}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-[12px]"><strong>Título:</strong> {audit.title || "Não encontrado"}</p>
                <p className="text-[12px]"><strong>H1:</strong> {audit.h1 || "Não encontrado"}</p>
                <p className="text-[12px]"><strong>Description:</strong> {audit.description || "Não encontrada"}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { label: "H2", value: audit.h2Count },
                  { label: "Alt imgs", value: `${audit.altCoverage}%` },
                  { label: "Schema", value: audit.schema },
                  { label: "Noindex", value: audit.noindex ? "Sim" : "Não" },
                ].map((metric) => (
                  <div key={metric.label} className="rounded-lg p-3 border" style={{ borderColor: "var(--border)" }}>
                    <p className="text-[11px] font-semibold" style={{ color: "var(--text-4)" }}>{metric.label}</p>
                    <p className="text-[15px] font-bold mt-1" style={{ color: "var(--text-1)" }}>{metric.value}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {(audit.opportunities.length ? audit.opportunities : ["Estrutura básica ok. Próximo passo: melhorar prova, oferta e criativos."]).map((item) => (
                  <div key={item} className="flex gap-2 text-[12px]" style={{ color: "var(--text-3)" }}>
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "var(--green)" }} /> {item}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg p-6 text-center" style={{ background: "var(--bg-muted)" }}>
              <FileSearch className="w-8 h-8 mx-auto" style={{ color: "var(--text-4)" }} />
              <p className="text-[13px] font-semibold mt-2" style={{ color: "var(--text-2)" }}>Cole uma landing sua ou do concorrente.</p>
              <p className="text-[12px] mt-1" style={{ color: "var(--text-4)" }}>O Trackfy avalia SEO, estrutura, CTA, prova técnica e oportunidades.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-5">
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
            <Trophy className="w-4 h-4" style={{ color: "var(--blue)" }} />
            <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Matriz competitiva</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead style={{ background: "var(--bg-subtle)" }}>
                <tr>{["Sinal", "O que olhar", "Como usar"].map((column) => <th key={column} className="px-5 py-3 text-[11px] uppercase" style={{ color: "var(--text-4)" }}>{column}</th>)}</tr>
              </thead>
              <tbody>
                {[
                  ["Promessa", "Resultado específico, tempo e dor", "Criar 3 hooks com promessa mais clara"],
                  ["Prova", "Print, depoimento, demonstração, autoridade", "Subir prova acima da dobra da landing"],
                  ["Mecanismo", "Nome do método, sistema ou processo", "Diferenciar sua oferta sem copiar marca"],
                  ["CTA", "Próximo passo pedido no anúncio", "Testar CTA direto vs. CTA consultivo"],
                  ["Formato", "VSL, imagem, carrossel, UGC, review", "Produzir 2 variações do formato dominante"],
                ].map((row) => (
                  <tr key={row[0]} className="border-t" style={{ borderColor: "var(--border)" }}>
                    {row.map((cell, index) => <td key={cell} className={`px-5 py-3 text-[13px] ${index === 0 ? "font-bold" : ""}`} style={{ color: index === 0 ? "var(--text-2)" : "var(--text-3)" }}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color: "var(--blue)" }} />
            <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Plano de ataque</h2>
          </div>
          <div className="space-y-3">
            {plan.map((item, index) => (
              <div key={item} className="flex gap-3">
                <span className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold" style={{ background: "var(--blue-muted)", color: "var(--blue)" }}>{index + 1}</span>
                <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-3)" }}>{item}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {VERTICALS.slice(0, 8).map((vertical) => (
              <button key={vertical} type="button" onClick={() => setSeed(vertical)} className="btn-secondary px-3 py-2 justify-start text-[12px]">
                <Target className="w-3.5 h-3.5" /> {vertical}
              </button>
            ))}
          </div>
          <div className="rounded-lg p-4 flex gap-2" style={{ background: "var(--yellow-light)" }}>
            <Link2 className="w-4 h-4 shrink-0" style={{ color: "var(--yellow)" }} />
            <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-3)" }}>
              Use os links oficiais para pesquisa pública. O diferencial do Trackfy fica em juntar sinais de anúncios, SEO, landing e UTM em uma direção de teste.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
