"use client";
import { Globe } from "lucide-react";
import { ConnectGuide } from "@/components/shared/ConnectGuide";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MainChart } from "@/components/dashboard/MainChart";
import { FilterBar } from "@/components/dashboard/FilterBar";

const KWAI_STEPS = [
  {
    title: "Acesse o Kwai for Business",
    description: "Crie ou acesse sua conta no Kwai for Business.",
    link: { label: "Abrir Kwai for Business", url: "https://business.kwai.com" },
  },
  {
    title: "Acesse o Kwai Ads Manager",
    description: "No painel, vá em Ferramentas → API de Marketing para solicitar acesso.",
    link: { label: "Abrir Kwai Ads Manager", url: "https://ads.kwai.com" },
  },
  {
    title: "Solicite acesso à API",
    description: "Preencha o formulário de solicitação de acesso à Marketing API do Kwai. O processo pode levar 1-3 dias úteis.",
  },
  {
    title: "Crie um App e obtenha o App Key",
    description: "Após aprovação, crie um app no portal de desenvolvedores e copie o App Key e App Secret.",
  },
  {
    title: "Gere um Access Token",
    description: "Use o fluxo OAuth 2.0 do Kwai para obter um Access Token com permissões de leitura de anúncios.",
  },
  {
    title: "Encontre seu Advertiser ID",
    description: "No Kwai Ads Manager, o Advertiser ID aparece nas configurações da conta.",
  },
  {
    title: "Cole as credenciais no Trackfy",
    description: "Vá em Configurações → Kwai Ads → cole o Access Token e o Advertiser ID → salve.",
  },
];

export default function KwaiPage() {
  const kwaiToken = typeof window !== "undefined" ? localStorage.getItem("tf_kwai") : null;
  const isConnected = !!kwaiToken;

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center">
          <Globe className="w-4 h-4 text-orange-400" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Kwai Ads</h1>
          <p className="text-sm text-[#4a5568]">Performance das campanhas Kwai</p>
        </div>
      </div>

      <ErrorBoundary><FilterBar /></ErrorBoundary>

      {!isConnected ? (
        <ConnectGuide
          platform="Kwai Ads"
          icon={<Globe className="w-5 h-5 text-orange-400" strokeWidth={2} />}
          color="bg-orange-500/20"
          steps={KWAI_STEPS}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["Gasto Total", "Impressões", "Conversões", "CPM"].map((k) => (
              <div key={k} className="bg-[#13161f] border border-[#1e2130] rounded-xl p-4">
                <p className="text-xs font-semibold text-[#8892a4] uppercase tracking-wider">{k}</p>
                <p className="text-2xl font-bold mt-1.5 text-[#4a5568]">—</p>
              </div>
            ))}
          </div>
          <div className="bg-[#13161f] border border-[#1e2130] rounded-xl p-5">
            <h2 className="text-sm font-bold text-white mb-4">Performance Kwai Ads</h2>
            <ErrorBoundary><MainChart /></ErrorBoundary>
          </div>
        </>
      )}
    </div>
  );
}
