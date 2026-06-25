"use client";

import { useMemo, useState } from "react";
import {
  BadgeDollarSign,
  CheckCircle2,
  Code2,
  Copy,
  ExternalLink,
  FileText,
  Gauge,
  LayoutTemplate,
  Megaphone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

function onlyPublisherId(value: string) {
  return value.trim().replace(/^ca-/, "").replace(/[^a-z0-9-]/gi, "");
}

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function copy(text: string) {
  navigator.clipboard?.writeText(text);
}

const placements = [
  {
    name: "Topo depois do primeiro bloco",
    type: "Display responsivo",
    note: "Bom para blog, notícia, review e página com conteúdo. Evite colocar antes do usuário entender a página.",
  },
  {
    name: "Meio do conteúdo",
    type: "In-article",
    note: "Funciona melhor entre seções, depois de 2 ou 3 parágrafos. Não coloque colado em botão de compra.",
  },
  {
    name: "Sidebar desktop",
    type: "Display fixo/responsivo",
    note: "Útil em páginas com leitura longa. No mobile, deixe cair para baixo ou remova.",
  },
  {
    name: "Final da página",
    type: "Multiplex ou display",
    note: "Bom para capturar saída sem atrapalhar conversão principal.",
  },
];

const checklist = [
  "Conta AdSense aprovada e site adicionado em Sites.",
  "Código AdSense instalado em todas as páginas onde anúncios podem aparecer.",
  "Arquivo ads.txt publicado na raiz do domínio.",
  "Política de privacidade, contato e conteúdo original visíveis.",
  "Não clicar nos próprios anúncios e não pedir clique para usuário.",
  "Não colocar anúncio perto de botão de checkout de forma enganosa.",
];

export default function MonetizacaoPage() {
  const [publisherId, setPublisherId] = useState("pub-0000000000000000");
  const [slotId, setSlotId] = useState("0000000000");
  const [siteUrl, setSiteUrl] = useState("https://www.10pilaoficial.site");
  const [monthlyViews, setMonthlyViews] = useState("50000");
  const [rpm, setRpm] = useState("8");
  const cleanPub = onlyPublisherId(publisherId);
  const clientId = cleanPub ? `ca-${cleanPub}` : "";
  const adsTxt = cleanPub ? `google.com, ${cleanPub}, DIRECT, f08c47fec0942fa0` : "";

  const headSnippet = useMemo(() => {
    if (!clientId) return "";
    return `<!-- Google AdSense Auto Ads -->\n<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}" crossorigin="anonymous"></script>`;
  }, [clientId]);

  const manualSnippet = useMemo(() => {
    if (!clientId || !slotId.trim()) return "";
    return `<ins class="adsbygoogle"\n     style="display:block"\n     data-ad-client="${clientId}"\n     data-ad-slot="${slotId.trim()}"\n     data-ad-format="auto"\n     data-full-width-responsive="true"></ins>\n<script>\n     (adsbygoogle = window.adsbygoogle || []).push({});\n</script>`;
  }, [clientId, slotId]);

  const nextComponent = useMemo(() => {
    if (!clientId || !slotId.trim()) return "";
    return `"use client";\n\nimport { useEffect } from "react";\n\nexport function AdsenseBlock() {\n  useEffect(() => {\n    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch {}\n  }, []);\n\n  return (\n    <ins\n      className="adsbygoogle"\n      style={{ display: "block" }}\n      data-ad-client="${clientId}"\n      data-ad-slot="${slotId.trim()}"\n      data-ad-format="auto"\n      data-full-width-responsive="true"\n    />\n  );\n}`;
  }, [clientId, slotId]);

  const estimatedRevenue = useMemo(() => {
    const views = Number(monthlyViews.replace(/\D/g, "")) || 0;
    const rpmValue = Number(rpm.replace(",", ".")) || 0;
    return (views / 1000) * rpmValue;
  }, [monthlyViews, rpm]);

  return (
    <div className="max-w-[1280px] mx-auto space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BadgeDollarSign className="w-5 h-5" style={{ color: "var(--green)" }} />
            <h1 className="text-[20px] font-bold" style={{ color: "var(--text-1)" }}>Monetização</h1>
          </div>
          <p className="text-[13px] mt-1 max-w-2xl" style={{ color: "var(--text-4)" }}>
            Gere os códigos para monetizar páginas com Google AdSense: Auto Ads, blocos manuais e ads.txt.
          </p>
        </div>
        <a href="https://www.google.com/adsense/start/" target="_blank" rel="noreferrer" className="btn-secondary px-4 py-2">
          <ExternalLink className="w-4 h-4" /> Abrir AdSense
        </a>
      </div>

      <div className="rounded-lg p-4 flex gap-3" style={{ background: "var(--yellow-light)", border: "1px solid rgba(202,138,4,0.18)" }}>
        <Megaphone className="w-5 h-5 shrink-0" style={{ color: "var(--yellow)" }} />
        <div>
          <p className="text-[13px] font-bold" style={{ color: "var(--text-2)" }}>Google Ads não monetiza site.</p>
          <p className="text-[12px] mt-1 leading-relaxed" style={{ color: "var(--text-3)" }}>
            Para ganhar dinheiro exibindo anúncios nas suas páginas, use Google AdSense. Google Ads/AdWords é para comprar tráfego.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-5">
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" style={{ color: "var(--blue)" }} />
            <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Configuração</h2>
          </div>
          <div>
            <label className="section-label mb-1.5 block" style={{ padding: 0 }}>Publisher ID do AdSense</label>
            <input value={publisherId} onChange={(event) => setPublisherId(event.target.value)} className="input font-mono" placeholder="pub-0000000000000000" />
            <p className="text-[11px] mt-1" style={{ color: "var(--text-4)" }}>No AdSense aparece como pub-xxxxxxxxxxxxxxxx.</p>
          </div>
          <div>
            <label className="section-label mb-1.5 block" style={{ padding: 0 }}>Ad Slot ID para bloco manual</label>
            <input value={slotId} onChange={(event) => setSlotId(event.target.value)} className="input font-mono" placeholder="1234567890" />
            <p className="text-[11px] mt-1" style={{ color: "var(--text-4)" }}>Use quando criar unidade de anúncio manual no AdSense.</p>
          </div>
          <div>
            <label className="section-label mb-1.5 block" style={{ padding: 0 }}>Site</label>
            <input value={siteUrl} onChange={(event) => setSiteUrl(event.target.value)} className="input" placeholder="https://seudominio.com" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="section-label mb-1.5 block" style={{ padding: 0 }}>Pageviews/mês</label>
              <input value={monthlyViews} onChange={(event) => setMonthlyViews(event.target.value)} inputMode="numeric" className="input" />
            </div>
            <div>
              <label className="section-label mb-1.5 block" style={{ padding: 0 }}>RPM estimado</label>
              <input value={rpm} onChange={(event) => setRpm(event.target.value)} inputMode="decimal" className="input" />
            </div>
          </div>
          <div className="rounded-lg p-4" style={{ background: "var(--green-light)" }}>
            <p className="text-[12px] font-semibold" style={{ color: "var(--green)" }}>Receita estimada/mês</p>
            <p className="text-[26px] font-bold mt-1" style={{ color: "var(--text-1)" }}>{money(estimatedRevenue)}</p>
            <p className="text-[11px] mt-1" style={{ color: "var(--text-4)" }}>Estimativa simples: pageviews / 1000 x RPM. O valor real varia por nicho, país e qualidade do tráfego.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between gap-3" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4" style={{ color: "var(--blue)" }} />
                <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>1. Código do head</h2>
              </div>
              <button type="button" onClick={() => copy(headSnippet)} className="btn-secondary px-3 py-2"><Copy className="w-4 h-4" /> Copiar</button>
            </div>
            <pre className="p-4 overflow-auto text-[12px] leading-relaxed" style={{ background: "var(--bg-subtle)", color: "var(--text-2)" }}>{headSnippet || "Informe o Publisher ID para gerar o código."}</pre>
          </div>

          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between gap-3" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4" style={{ color: "var(--blue)" }} />
                <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>2. Bloco manual</h2>
              </div>
              <button type="button" onClick={() => copy(manualSnippet)} className="btn-secondary px-3 py-2"><Copy className="w-4 h-4" /> Copiar</button>
            </div>
            <pre className="p-4 overflow-auto text-[12px] leading-relaxed max-h-[240px]" style={{ background: "var(--bg-subtle)", color: "var(--text-2)" }}>{manualSnippet || "Informe Publisher ID e Ad Slot ID."}</pre>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between gap-3" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" style={{ color: "var(--blue)" }} />
              <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>3. ads.txt</h2>
            </div>
            <button type="button" onClick={() => copy(adsTxt)} className="btn-secondary px-3 py-2"><Copy className="w-4 h-4" /> Copiar</button>
          </div>
          <div className="p-5 space-y-3">
            <pre className="p-4 overflow-auto text-[12px]" style={{ background: "var(--bg-subtle)", color: "var(--text-2)" }}>{adsTxt || "Informe o Publisher ID."}</pre>
            <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-4)" }}>
              Publique isso em <span className="font-mono">{siteUrl.replace(/\/$/, "")}/ads.txt</span>. O Google pode levar alguns dias para reconhecer.
            </p>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
            <Gauge className="w-4 h-4" style={{ color: "var(--blue)" }} />
            <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Onde colocar anúncios</h2>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {placements.map((item) => (
              <div key={item.name} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[13px] font-bold" style={{ color: "var(--text-1)" }}>{item.name}</p>
                  <span className="badge badge-neutral">{item.type}</span>
                </div>
                <p className="text-[12px] mt-1 leading-relaxed" style={{ color: "var(--text-4)" }}>{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-5">
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between gap-3" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: "var(--blue)" }} />
              <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Componente Next.js</h2>
            </div>
            <button type="button" onClick={() => copy(nextComponent)} className="btn-secondary px-3 py-2"><Copy className="w-4 h-4" /> Copiar</button>
          </div>
          <pre className="p-4 overflow-auto text-[12px] leading-relaxed max-h-[360px]" style={{ background: "var(--bg-subtle)", color: "var(--text-2)" }}>{nextComponent || "Informe Publisher ID e Ad Slot ID."}</pre>
        </div>

        <div className="card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" style={{ color: "var(--green)" }} />
            <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Checklist para aprovar e evitar problema</h2>
          </div>
          {checklist.map((item) => (
            <div key={item} className="flex gap-2 text-[13px] leading-relaxed" style={{ color: "var(--text-3)" }}>
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--green)" }} />
              {item}
            </div>
          ))}
          <div className="rounded-lg p-4 mt-4" style={{ background: "var(--blue-light)" }}>
            <p className="text-[12px] font-bold" style={{ color: "var(--blue)" }}>Fluxo rápido</p>
            <p className="text-[12px] mt-1 leading-relaxed" style={{ color: "var(--text-3)" }}>
              Primeiro instale Auto Ads no head. Depois, se quiser controlar posição, crie unidades no AdSense e use os blocos manuais onde fizer sentido.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
