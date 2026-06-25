"use client";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  Calculator,
  CheckCircle,
  ClipboardCheck,
  Copy,
  Download,
  ExternalLink,
  FileSearch,
  FlaskConical,
  Workflow,
  Globe2,
  ImageOff,
  KeyRound,
  Landmark,
  Link2,
  Megaphone,
  MessageCircle,
  Music2,
  PackageCheck,
  Radar,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Upload,
  Users,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "arsenal" | "keywords" | "prospector" | "spy" | "offer" | "copy" | "whatsapp" | "zap" | "calendar" | "funnel" | "abtest" | "roi" | "url" | "image" | "pix" | "compliance" | "contingency";

const TOOL_TUTORIALS: Record<Tab, { title: string; steps: string[]; tip: string }> = {
  arsenal: {
    title: "Como usar Arsenal 100",
    steps: [
      "Escolha uma ferramenta por objetivo: vídeo, copy, funil, pesquisa, criativo, produto ou operação.",
      "Preencha contexto, oferta e canal para o Trackfy montar o prompt/brief.",
      "Use Gerar com IA quando tiver chave configurada ou copie o prompt para usar com sua própria API.",
      "Salve os melhores outputs como roteiro, checklist, criativo ou hipótese de teste.",
    ],
    tip: "A versão barata pode vender volume: muitas ferramentas locais + IA opcional por chave do cliente para não estourar custo.",
  },
  keywords: {
    title: "Como usar Keywords",
    steps: [
      "Cole nichos, produtos ou dores em linhas separadas.",
      "Preencha a oferta para o Trackfy gerar termos mais alinhados ao funil.",
      "Leia intenção, score e sugestão de match/hook.",
      "Clique em Copiar plano e leve para Google Ads, TikTok ou briefing de criativos.",
    ],
    tip: "Use seeds amplas para descobrir ideias e seeds especificas para montar campanha de fundo de funil.",
  },
  prospector: {
    title: "Como usar Prospector",
    steps: [
      "Cole sua Google Places API key.",
      "Digite o tipo de negócio e a cidade ou região.",
      "Clique em Buscar para trazer empresas, telefone, site, rating e score.",
      "Use Exportar CSV para montar lista comercial e cole textos no extrator para capturar emails.",
    ],
    tip: "Priorize empresas com telefone, poucas avaliações ou sem site, pois costumam ter dor mais clara.",
  },
  spy: {
    title: "Como usar Spy",
    steps: [
      "Digite nicho, produto ou promessa que quer estudar.",
      "Abra Meta Ads Library, TikTok Creative Center, Google Transparency e YouTube.",
      "Anote promessa, prova, CTA, formato e objeção respondida.",
      "Transforme padrões recorrentes em novos ângulos de criativo.",
    ],
    tip: "Pesquisar concorrência serve para modelar padrões públicos, não copiar marca, criativo ou promessa enganosa.",
  },
  offer: {
    title: "Como usar Oferta",
    steps: [
      "Preencha avatar, resultado desejado, tempo, mecanismo, preço e bônus.",
      "Leia a promessa montada e veja se ela parece clara em uma frase.",
      "Ajuste mecanismo e prova para reduzir objeção.",
      "Copie a oferta e use em página, direct, VSL ou anúncio.",
    ],
    tip: "Oferta boa deixa claro para quem é, qual resultado entrega e por que o mecanismo é diferente.",
  },
  copy: {
    title: "Como usar Copy",
    steps: [
      "Informe avatar, dor, oferta e mecanismo.",
      "Gere hooks e ângulos para criativos de topo e meio de funil.",
      "Separe os melhores por emoção: dor, desejo, prova, curiosidade e objeção.",
      "Copie e teste variações em criativos diferentes.",
    ],
    tip: "Não teste dez coisas ao mesmo tempo: mude hook ou promessa primeiro.",
  },
  whatsapp: {
    title: "Como usar Direct",
    steps: [
      "Preencha origem do lead, dor, produto e prova.",
      "Use a sequência gerada como roteiro manual de atendimento.",
      "Adapte a linguagem para o tom da sua marca.",
      "Copie e cole no CRM ou WhatsApp, respeitando consentimento do lead.",
    ],
    tip: "Lead frio precisa de contexto antes de oferta; lead quente precisa de clareza e próximo passo.",
  },
  zap: {
    title: "Como usar Zap API",
    steps: [
      "Configure token e Phone Number ID da WhatsApp Cloud API oficial.",
      "Escolha texto livre para conversas permitidas ou template aprovado para envio ativo.",
      "Cole contatos no formato telefone;nome;opt-in.",
      "Envie apenas para contatos com consentimento e acompanhe o log.",
    ],
    tip: "Para escala real, prefira templates aprovados e lista com opt-in registrado.",
  },
  calendar: {
    title: "Como usar Plano",
    steps: [
      "Use o plano de 7 dias como roteiro de execução.",
      "Comece por pesquisa, depois oferta, criativos, página, tracking e escala.",
      "Copie as tarefas para sua rotina ou equipe.",
      "Revise resultados antes de repetir investimento.",
    ],
    tip: "Plano bom separa criação, validação e escala. Misturar tudo atrapalha leitura de dados.",
  },
  funnel: {
    title: "Como usar Funil",
    steps: [
      "Preencha as visitas e cada etapa que realmente aconteceu no seu site.",
      "Leia a taxa entre cada etapa para encontrar a maior perda.",
      "Copie os atributos de evento para os botões da landing page.",
      "Depois de instalar o Trackfy, os mesmos números passam a aparecer em Dados no Trackfy.",
    ],
    tip: "O funil não cria vendas sozinho: ele mostra exatamente onde a pessoa está desistindo para você corrigir a próxima etapa.",
  },
  abtest: {
    title: "Como usar Teste A/B",
    steps: [
      "Coloque visitas e conversões da versão A e da versão B.",
      "Compare a taxa e o ganho percentual da nova variação.",
      "Espere volume suficiente antes de trocar a página ou criativo vencedor.",
      "Teste uma variável por vez: hook, CTA, preço, prova ou página.",
    ],
    tip: "Teste A/B é comparação justa: envie tráfego parecido para as duas versões e não mude tudo no meio do teste.",
  },
  roi: {
    title: "Como usar ROI",
    steps: [
      "Informe preço, custo, CPC, conversão e orçamento.",
      "Veja vendas estimadas, receita, lucro, ROAS e CPC de equilíbrio.",
      "Ajuste conversão e CPC para simular cenários.",
      "Use o CPA máximo para saber quanto pode pagar por venda.",
    ],
    tip: "Antes de escalar, confirme se o lucro continua positivo depois de taxas e reembolsos.",
  },
  url: {
    title: "Como usar URL",
    steps: [
      "Cole a URL final da campanha.",
      "Confira domínio, caminho e UTMs obrigatórias.",
      "Corrija utm_source, utm_medium e utm_campaign quando faltar.",
      "Copie o link padronizado para anúncios e bio.",
    ],
    tip: "Sem UTM padronizada, você vende mas não sabe qual campanha trouxe o resultado.",
  },
  image: {
    title: "Como usar Metadados",
    steps: [
      "Faça upload de imagem ou vídeo criativo.",
      "Ajuste brilho, contraste, saturação, blur e sharpness quando quiser diferenciar variações.",
      "Para imagem, exporte uma nova versão sem metadados.",
      "Use nomes de arquivo organizados por nicho, ângulo e data.",
    ],
    tip: "Ajuste visual não salva criativo ruim, mas ajuda a criar variações rápidas de um criativo vencedor.",
  },
  pix: {
    title: "Como usar Pix",
    steps: [
      "Preencha chave Pix, nome, cidade, valor e descrição.",
      "Confira se nome e cidade estão corretos.",
      "Copie o código Pix gerado.",
      "Teste com valor baixo antes de usar em página ou checkout manual.",
    ],
    tip: "Para venda profissional, use gateway ou banco com webhook para confirmar pagamento automaticamente.",
  },
  compliance: {
    title: "Como usar Compliance",
    steps: [
      "Cole os principais textos da landing page ou oferta.",
      "Veja se falta política, termos, contato, preço ou clareza.",
      "Remova promessas garantidas, milagre, antes/depois sensível e alegações arriscadas.",
      "Revise antes de subir tráfego em Meta, Google ou TikTok.",
    ],
    tip: "Compliance reduz bloqueio e aumenta vida útil da conta de anúncios.",
  },
  contingency: {
    title: "Como usar Contingência",
    steps: [
      "Cadastre os ativos oficiais: Business Manager, contas de anúncio, domínios, pixels, GTM, formas de pagamento e responsáveis.",
      "Veja o score de risco e corrija pontos frágeis antes de escalar.",
      "Copie o plano de recuperação para saber o que fazer se uma conta cair ou uma campanha for reprovada.",
      "Use os links oficiais para criar/verificar ativos, sem automação de contas em massa ou aquecimento artificial.",
    ],
    tip: "Contingência boa é governança: documentação, backup, pagamento saudável, domínio verificado e políticas em dia.",
  },
};

const MEGA_TOOLS = [
  "Roteiro de vídeo curto", "Hook de Reels", "Hook de TikTok", "Roteiro UGC", "VSL curta", "VSL longa", "Storyboard de anúncio", "Prompt para avatar IA", "Prompt para imagem IA", "Prompt para vídeo IA",
  "Ideias de criativo", "Variações de thumbnail", "Análise de criativo vencedor", "Checklist de criativo", "Ângulos de dor", "Ângulos de desejo", "Ângulos de prova", "Ângulos de objeção", "CTA para anúncio", "Legenda para criativo",
  "Headline de landing", "Subheadline", "Oferta irresistível", "Stack de bônus", "Garantia", "FAQ de objeções", "Copy de checkout", "Copy de upsell", "Copy de downsell", "Copy de obrigado",
  "Sequência WhatsApp", "Follow-up 24h", "Follow-up 72h", "Recuperação de checkout", "Mensagem de Pix pendente", "Script de call", "DM Instagram", "Resposta para objeção preço", "Resposta para objeção confiança", "Script de fechamento",
  "Keywords Google", "Negativas Google", "Grupos de anúncio", "Termos fundo de funil", "Termos meio de funil", "Ideias TikTok Search", "Ideias YouTube", "Perguntas do público", "Cluster SEO", "Título de artigo SEO",
  "Spy Meta", "Spy TikTok", "Spy Google", "Mapa de concorrentes", "Matriz de promessas", "Biblioteca de provas", "Tabela de diferenciais", "Análise de página concorrente", "Brief de modelagem", "Radar de tendência",
  "Funil AIDA", "Funil PAS", "Funil direct offer", "Funil low ticket", "Funil tripwire", "Funil WhatsApp", "Funil lançamento simples", "Funil perpétuo", "Mapa de eventos", "Plano de teste 7 dias",
  "Calculadora CPA", "Simulador ROAS", "Break-even CPC", "Meta de margem", "Orçamento por campanha", "Plano de escala", "Plano de corte", "Leitura de métricas", "Diagnóstico de ROI", "Relatório executivo",
  "Checklist compliance Meta", "Checklist compliance Google", "Auditoria de promessas", "Auditoria de página", "Auditoria de checkout", "Política de privacidade base", "Termos base", "Aviso de risco", "Checklist domínio", "Checklist pixel/tag",
  "Prospector local", "Pitch para comércio", "Email frio", "Proposta de serviço", "Diagnóstico de negócio", "Script de reunião", "Plano de entrega", "Onboarding cliente", "Relatório cliente", "Renovação/upsell",
] as const;

function toolCategory(index: number) {
  if (index < 10) return "Vídeo IA";
  if (index < 20) return "Criativos";
  if (index < 30) return "Landing";
  if (index < 40) return "WhatsApp";
  if (index < 50) return "Keywords";
  if (index < 60) return "Spy";
  if (index < 70) return "Funil";
  if (index < 80) return "Métricas";
  if (index < 90) return "Compliance";
  return "Vendas B2B";
}

function buildMegaPrompt(tool: string, context: string, channel: string, offer: string) {
  return [
    `Ferramenta: ${tool}`,
    `Canal: ${channel || "digital"}`,
    `Oferta/produto: ${offer || "produto digital ou serviço"}`,
    `Contexto: ${context || "iniciante no digital, baixo orçamento, precisa vender com clareza"}`,
    "",
    "Crie uma resposta prática em português do Brasil, pronta para copiar e usar.",
    "Estruture com: objetivo, passo a passo, versão pronta, checklist de validação e próximo teste.",
    "Evite promessas enganosas, claims impossíveis e qualquer orientação para burlar plataformas.",
  ].join("\n");
}

function copyText(text: string) {
  if (!text) return;
  navigator.clipboard?.writeText(text);
}

function normalizeText(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function crc16(payload: string) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function emv(id: string, value: string) {
  return `${id}${value.length.toString().padStart(2, "0")}${value}`;
}

function buildPixPayload({ key, name, city, amount, description }: {
  key: string;
  name: string;
  city: string;
  amount: string;
  description: string;
}) {
  if (!key || !name || !city) return "";
  const merchantInfo = emv("00", "BR.GOV.BCB.PIX") + emv("01", key.trim()) + (description ? emv("02", description.slice(0, 50)) : "");
  const tx = [
    emv("00", "01"),
    emv("26", merchantInfo),
    emv("52", "0000"),
    emv("53", "986"),
    amount ? emv("54", Number(amount.replace(",", ".")).toFixed(2)) : "",
    emv("58", "BR"),
    emv("59", name.trim().slice(0, 25).toUpperCase()),
    emv("60", city.trim().slice(0, 15).toUpperCase()),
    emv("62", emv("05", "***")),
  ].join("");
  const withoutCrc = `${tx}6304`;
  return `${withoutCrc}${crc16(withoutCrc)}`;
}

export default function ToolsPage() {
  const [tab, setTab] = useState<Tab>("arsenal");
  const [seed, setSeed] = useState("curso de maquiagem\nemagrecer rapido\nrenda extra online");
  const [offer, setOffer] = useState("produto digital para meio de funil");
  const [megaSearch, setMegaSearch] = useState("");
  const [megaContext, setMegaContext] = useState("Quero vender um produto digital low ticket para iniciantes, com pouco orçamento, usando tráfego pago e conteúdo curto.");
  const [megaOffer, setMegaOffer] = useState("Trackfy Lite por R$ 59/mês para quem quer UTMs, métricas e ferramentas de marketing digital");
  const [megaChannel, setMegaChannel] = useState("TikTok, Reels, Meta Ads e WhatsApp");
  const [megaProvider, setMegaProvider] = useState<"gemini" | "openai" | "anthropic">("gemini");
  const [megaApiKey, setMegaApiKey] = useState("");
  const [selectedMegaTool, setSelectedMegaTool] = useState<string>(MEGA_TOOLS[0]);
  const [megaOutput, setMegaOutput] = useState("");
  const [megaLoading, setMegaLoading] = useState(false);
  const [imageStatus, setImageStatus] = useState("");
  const [cleanImageUrl, setCleanImageUrl] = useState("");
  const [creativeFile, setCreativeFile] = useState<{ url: string; type: "image" | "video"; name: string } | null>(null);
  const [filters, setFilters] = useState({ brightness: 100, contrast: 100, saturate: 100, blur: 0, sharpness: 0 });
  const [pix, setPix] = useState({ key: "", name: "JUAN GOES", city: "SAO PAULO", amount: "", description: "Trackfy" });
  const [landing, setLanding] = useState("promessa clara\npreco visivel\npolitica de privacidade\ncontato\ntermos de uso\nsem antes e depois\nsem promessa garantida");
  const [copyInput, setCopyInput] = useState({ avatar: "mulheres que querem renda extra", dor: "nao conseguem vender todo dia", oferta: "mentoria de vendas no WhatsApp", mecanismo: "roteiro de conversas + ofertas de meio de funil" });
  const [roi, setRoi] = useState({ price: "97", cost: "22", cpc: "1.80", conversion: "2.5", budget: "100" });
  const [funnelInput, setFunnelInput] = useState({ visits: "1000", viewItem: "420", leads: "180", checkout: "92", purchases: "31" });
  const [abTest, setAbTest] = useState({ aVisitors: "500", aConversions: "25", bVisitors: "500", bConversions: "36" });
  const [urlInput, setUrlInput] = useState("https://seudominio.com/oferta?utm_source=google&utm_medium=cpc&utm_campaign=meio_funil");
  const [prospector, setProspector] = useState({
    apiKey: "",
    query: "clinica estetica",
    location: "Sao Paulo SP",
    emailText: "Cole aqui textos, CSVs, assinaturas ou paginas exportadas com emails comerciais.",
  });
  const [places, setPlaces] = useState<Array<{ id: string; name: string; address: string; rating: number | null; reviews: number; phone: string; website: string; mapsUrl: string; status: string }>>([]);
  const [prospectorStatus, setProspectorStatus] = useState("");
  const [spyInput, setSpyInput] = useState({ niche: "renda extra online", competitor: "concorrente 1\nconcorrente 2", promise: "vender todos os dias no WhatsApp" });
  const [offerInput, setOfferInput] = useState({ avatar: "iniciante que quer vender online", result: "fazer as primeiras vendas", time: "7 dias", mechanism: "roteiro de oferta + follow-up", price: "97", bonus: "checklist de criativos" });
  const [whatsInput, setWhatsInput] = useState({ lead: "lead do Instagram", pain: "tem interesse mas esta inseguro", product: "mentoria de vendas", proof: "alunos vendendo no primeiro funil" });
  const [zap, setZap] = useState({
    token: "",
    phoneNumberId: "",
    mode: "text",
    templateName: "hello_world",
    templateLanguage: "pt_BR",
    text: "Oi {{nome}}, vi seu interesse e queria te mandar o proximo passo.",
    contacts: "5511999999999;Juan;sim\n5511888888888;Maria;sim",
  });
  const [zapLog, setZapLog] = useState<string[]>([]);
  const [contingency, setContingency] = useState({
    business: "BM principal 10PILA",
    domain: "tf.digirocket.site",
    owner: "juan@empresa.com",
    policy: "medio",
    payment: "ok",
    documents: "parcial",
    backupDomain: "nao",
    pixels: "1",
    adAccounts: "1",
    spendLevel: "baixo",
    notes: "Criar checklist de acesso, verificar dominio, adicionar 2FA e registrar responsaveis.",
  });

  const keywordRows = useMemo(() => {
    const base = seed
      .split(/\n|,/)
      .map((x) => normalizeText(x))
      .filter(Boolean);
    const modifiers = ["comprar", "melhor", "como", "para iniciantes", "preco", "review", "vale a pena", "perto de mim"];
    return base.flatMap((kw) => {
      const words = kw.split(" ").filter(Boolean);
      const intent = /(comprar|preco|valor|curso|consultoria|agendar|contratar)/.test(kw) ? "Alta" : words.length >= 3 ? "Media" : "Exploratoria";
      const score = Math.min(99, 38 + words.length * 11 + (intent === "Alta" ? 28 : intent === "Media" ? 16 : 7));
      return [
        { keyword: kw, channel: "Google", intent, score, type: "Exata", suggestion: `[${kw}]` },
        { keyword: `${kw} ${modifiers[score % modifiers.length]}`, channel: "Google", intent: "Media", score: Math.max(35, score - 12), type: "Frase", suggestion: `"${kw}"` },
        { keyword: `${kw} ${offer ? normalizeText(offer).split(" ").slice(0, 3).join(" ") : "oferta"}`, channel: "TikTok", intent: "Criativo", score: Math.max(40, score - 5), type: "Hook", suggestion: `3 erros sobre ${kw}` },
      ];
    });
  }, [seed, offer]);

  const pixPayload = useMemo(() => buildPixPayload(pix), [pix]);
  const megaTools = useMemo(() => MEGA_TOOLS
    .map((name, index) => ({ name, index, category: toolCategory(index) }))
    .filter((item) => !megaSearch || normalizeText(`${item.name} ${item.category}`).includes(normalizeText(megaSearch))),
  [megaSearch]);
  const selectedMegaPrompt = useMemo(() => buildMegaPrompt(selectedMegaTool, megaContext, megaChannel, megaOffer), [selectedMegaTool, megaContext, megaChannel, megaOffer]);

  const generateMegaTool = async () => {
    setMegaLoading(true); setMegaOutput("");
    try {
      const response = await fetch("/api/ai-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: megaProvider, apiKey: megaApiKey, prompt: selectedMegaPrompt }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível gerar.");
      setMegaOutput(result.output || "");
    } catch (error) {
      setMegaOutput(error instanceof Error ? error.message : "Não foi possível gerar com IA.");
    } finally {
      setMegaLoading(false);
    }
  };

  const compliance = useMemo(() => {
    const text = normalizeText(landing);
    const checks = [
      { label: "Tem politica de privacidade", ok: text.includes("politica de privacidade") },
      { label: "Tem contato ou suporte", ok: text.includes("contato") || text.includes("suporte") || text.includes("whatsapp") },
      { label: "Tem termos de uso", ok: text.includes("termos") },
      { label: "Evita promessa garantida", ok: !/(garantido|100%|resultado garantido|ganhe dinheiro facil)/.test(text) },
      { label: "Evita antes e depois sensivel", ok: !/(antes e depois|perca peso rapido|cura|milagre)/.test(text) },
      { label: "Oferta e preco claros", ok: text.includes("preco") || text.includes("valor") || text.includes("oferta") },
    ];
    return checks;
  }, [landing]);

  const contingencyChecks = useMemo(() => {
    const adAccounts = Number(contingency.adAccounts) || 0;
    const pixels = Number(contingency.pixels) || 0;
    return [
      { label: "Business Manager identificado", ok: contingency.business.trim().length > 2, fix: "Nomeie o BM e registre dono, admins e e-mail de recuperação." },
      { label: "Domínio principal cadastrado", ok: contingency.domain.includes("."), fix: "Cadastre e verifique o domínio oficial no Business Manager e no Google Search Console." },
      { label: "Responsável definido", ok: contingency.owner.includes("@") || contingency.owner.length > 3, fix: "Defina responsável interno, contato financeiro e contato técnico." },
      { label: "Documentação completa", ok: contingency.documents === "ok", fix: "Guarde contrato social, comprovante de domínio, print de políticas e comprovantes de pagamento." },
      { label: "Pagamento saudável", ok: contingency.payment === "ok", fix: "Use método de pagamento válido, limite suficiente e dados consistentes com a empresa." },
      { label: "Domínio reserva legítimo", ok: contingency.backupDomain === "sim", fix: "Tenha domínio reserva de marca/conteúdo real, não cópia para burlar revisão." },
      { label: "Pixel/Tag com backup", ok: pixels >= 2, fix: "Configure pixel/tag principal e evento server-side ou tag reserva documentada." },
      { label: "Conta de anúncio oficial", ok: adAccounts >= 1, fix: "Crie contas apenas pelos fluxos oficiais do BM/Google Ads, com dados reais." },
      { label: "Risco de política controlado", ok: contingency.policy === "baixo", fix: "Revise promessa, página, checkout, prova, antes/depois e claims sensíveis." },
    ];
  }, [contingency]);

  const contingencyScore = useMemo(() => {
    const ok = contingencyChecks.filter((item) => item.ok).length;
    return Math.round((ok / contingencyChecks.length) * 100);
  }, [contingencyChecks]);

  const contingencyPlan = useMemo(() => {
    const pending = contingencyChecks.filter((item) => !item.ok);
    return [
      `Plano de contingência - ${contingency.business || "Operação"}`,
      `Domínio principal: ${contingency.domain || "não informado"}`,
      `Responsável: ${contingency.owner || "não informado"}`,
      "",
      "Ações prioritárias:",
      ...(pending.length ? pending.map((item, index) => `${index + 1}. ${item.fix}`) : ["1. Manter auditoria semanal de políticas, pagamentos e eventos."]),
      "",
      "Rotina saudável:",
      "- Revisar políticas antes de subir nova oferta.",
      "- Manter 2FA em todos os admins.",
      "- Registrar alterações de domínio, pixel, pagamento e permissões.",
      "- Usar contas e domínios oficiais, com dados reais da empresa.",
    ].join("\n");
  }, [contingency, contingencyChecks]);

  const copyIdeas = useMemo(() => {
    const avatar = copyInput.avatar || "seu publico";
    const dor = copyInput.dor || "o problema principal";
    const oferta = copyInput.oferta || "sua oferta";
    const mecanismo = copyInput.mecanismo || "seu metodo";
    return [
      `Voce ainda tenta vender ${oferta} sem resolver isto: ${dor}.`,
      `O jeito simples para ${avatar} sair do travamento: ${mecanismo}.`,
      `3 sinais de que ${dor} esta derrubando suas vendas.`,
      `Pare de empurrar oferta fria. Use ${mecanismo} para aquecer o lead antes.`,
      `Se ${avatar} viu sua pagina e nao comprou, mostre esta ponte: ${oferta}.`,
      `Antes de pedir o Pix, prove uma coisa: por que ${mecanismo} resolve ${dor}.`,
    ];
  }, [copyInput]);

  const roiCalc = useMemo(() => {
    const price = Number(roi.price.replace(",", ".")) || 0;
    const cost = Number(roi.cost.replace(",", ".")) || 0;
    const cpc = Number(roi.cpc.replace(",", ".")) || 0;
    const conversion = (Number(roi.conversion.replace(",", ".")) || 0) / 100;
    const budget = Number(roi.budget.replace(",", ".")) || 0;
    const clicks = cpc > 0 ? budget / cpc : 0;
    const sales = clicks * conversion;
    const revenue = sales * price;
    const productCost = sales * cost;
    const profit = revenue - productCost - budget;
    const maxCpa = Math.max(0, price - cost);
    const breakevenCpc = conversion > 0 ? maxCpa * conversion : 0;
    return { clicks, sales, revenue, profit, maxCpa, breakevenCpc, roas: budget > 0 ? revenue / budget : 0 };
  }, [roi]);

  const funnelCalc = useMemo(() => {
    const steps = [
      { key: "visits", label: "Visitas", value: Number(funnelInput.visits) || 0, event: "page_view" },
      { key: "viewItem", label: "Viu a oferta", value: Number(funnelInput.viewItem) || 0, event: "view_item" },
      { key: "leads", label: "Lead", value: Number(funnelInput.leads) || 0, event: "generate_lead" },
      { key: "checkout", label: "Checkout", value: Number(funnelInput.checkout) || 0, event: "begin_checkout" },
      { key: "purchases", label: "Compra", value: Number(funnelInput.purchases) || 0, event: "purchase" },
    ];
    const transitions = steps.slice(1).map((step, index) => {
      const previous = steps[index].value;
      const rate = previous > 0 ? (step.value / previous) * 100 : 0;
      return { from: steps[index].label, to: step.label, rate, loss: Math.max(0, previous - step.value) };
    });
    const bottleneck = transitions.reduce((worst, item) => item.rate < worst.rate ? item : worst, transitions[0] ?? { from: "", to: "", rate: 0, loss: 0 });
    const finalRate = steps[0].value > 0 ? (steps.at(-1)!.value / steps[0].value) * 100 : 0;
    return { steps, transitions, bottleneck, finalRate };
  }, [funnelInput]);

  const abCalc = useMemo(() => {
    const aVisitors = Number(abTest.aVisitors) || 0;
    const aConversions = Number(abTest.aConversions) || 0;
    const bVisitors = Number(abTest.bVisitors) || 0;
    const bConversions = Number(abTest.bConversions) || 0;
    const aRate = aVisitors > 0 ? aConversions / aVisitors : 0;
    const bRate = bVisitors > 0 ? bConversions / bVisitors : 0;
    const lift = aRate > 0 ? ((bRate - aRate) / aRate) * 100 : 0;
    const pooled = aVisitors + bVisitors > 0 ? (aConversions + bConversions) / (aVisitors + bVisitors) : 0;
    const se = aVisitors > 0 && bVisitors > 0 ? Math.sqrt(pooled * (1 - pooled) * (1 / aVisitors + 1 / bVisitors)) : 0;
    const z = se > 0 ? Math.abs(bRate - aRate) / se : 0;
    return { aRate, bRate, lift, z, enough: aVisitors >= 100 && bVisitors >= 100 && aConversions >= 10 && bConversions >= 10 };
  }, [abTest]);

  const urlAudit = useMemo(() => {
    try {
      const url = new URL(urlInput.startsWith("http") ? urlInput : `https://${urlInput}`);
      const params = url.searchParams;
      return {
        ok: true,
        host: url.hostname,
        path: url.pathname,
        source: params.get("utm_source") ?? "",
        medium: params.get("utm_medium") ?? "",
        campaign: params.get("utm_campaign") ?? "",
        missing: ["utm_source", "utm_medium", "utm_campaign"].filter((p) => !params.get(p)),
      };
    } catch {
      return { ok: false, host: "", path: "", source: "", medium: "", campaign: "", missing: ["url valida"] };
    }
  }, [urlInput]);

  const extractedEmails = useMemo(() => {
    const matches = prospector.emailText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [];
    return Array.from(new Set(matches.map((email) => email.toLowerCase())));
  }, [prospector.emailText]);

  const prospectRows = useMemo(() => places.map((place) => {
    const hasWebsite = !!place.website;
    const hasPhone = !!place.phone;
    const reviews = Number(place.reviews ?? 0);
    const rating = Number(place.rating ?? 0);
    const score = Math.min(100, 25 + (hasPhone ? 20 : 0) + (!hasWebsite ? 25 : 5) + (reviews < 30 ? 18 : 6) + (rating < 4.2 ? 12 : 5));
    const angle = !hasWebsite
      ? "Oferta de site/landing + Google Business"
      : reviews < 30
        ? "Oferta de reputacao/avaliacoes + trafego local"
        : "Oferta de criativos/ads para capturar demanda local";
    return { ...place, score, angle };
  }), [places]);

  const exportProspectsCsv = () => {
    const rows = [
      "name,address,phone,website,rating,reviews,score,angle,mapsUrl",
      ...prospectRows.map((p) => [p.name, p.address, p.phone, p.website, p.rating ?? "", p.reviews, p.score, p.angle, p.mapsUrl]
        .map((x) => `"${String(x).replaceAll('"', '""')}"`).join(",")),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trackfy-prospects.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const spyRows = useMemo(() => {
    const niche = normalizeText(spyInput.niche) || "nicho";
    return [
      { source: "Meta Ads Library", query: niche, angle: `Mapear criativos ativos sobre ${niche}`, url: `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&q=${encodeURIComponent(niche)}` },
      { source: "TikTok Creative Center", query: niche, angle: `Ver hooks, formatos e sons para ${niche}`, url: `https://ads.tiktok.com/business/creativecenter/inspiration/topads/pc/en?region=BR` },
      { source: "Google Ads Transparency", query: niche, angle: `Encontrar anunciantes e ofertas no Google para ${niche}`, url: `https://adstransparency.google.com/?region=BR` },
      { source: "YouTube Search", query: niche, angle: `Buscar VSLs e reviews longos para ${niche}`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${niche} depoimento oferta`)}` },
    ];
  }, [spyInput.niche]);

  const offerBlocks = useMemo(() => {
    const { avatar, result, time, mechanism, price, bonus } = offerInput;
    return [
      { label: "Promessa", value: `Para ${avatar}: ${result} em ${time} usando ${mechanism}.` },
      { label: "Oferta direta", value: `${result} sem complicar a operacao. Entrada por R$ ${price}, com ${bonus}.` },
      { label: "Garantia/risco reverso", value: `Se nao sair com um plano pronto e aplicavel, revise o funil com suporte antes de escalar trafego.` },
      { label: "Stack", value: `Produto principal + ${bonus} + modelo de criativo + roteiro de follow-up + checklist de pagina.` },
      { label: "CTA", value: `Quero montar meu funil agora` },
    ];
  }, [offerInput]);

  const whatsScripts = useMemo(() => {
    const { lead, pain, product, proof } = whatsInput;
    return [
      `Oi, vi que voce veio de ${lead}. Hoje seu maior bloqueio e ${pain} ou voce ja esta comparando solucoes?`,
      `Se fizer sentido, te mando em 2 minutos como o ${product} resolve isso usando um funil simples de meio de funil.`,
      `O ponto principal: nao e empurrar oferta fria. E aquecer com prova, contexto e uma proxima acao clara. Temos ${proof}.`,
      `Quer que eu te mande o plano com investimento, entregaveis e proximo passo?`,
      `Passando aqui so para fechar o ciclo: se ainda quiser resolver ${pain}, eu consigo te orientar pelo caminho mais curto hoje.`,
    ];
  }, [whatsInput]);

  const campaignCalendar = useMemo(() => [
    { day: "D1", task: "Pesquisa de concorrentes", output: "20 anuncios salvos + 5 angulos" },
    { day: "D2", task: "Oferta e pagina", output: "Promessa, stack, CTA e checkout" },
    { day: "D3", task: "Criativos", output: "5 hooks, 3 videos, 2 imagens" },
    { day: "D4", task: "Campanhas teste", output: "Google Search + TikTok/Meta interesse amplo" },
    { day: "D5", task: "WhatsApp/direct", output: "Roteiros de abordagem e follow-up" },
    { day: "D6", task: "Otimizar", output: "Pausar pior 40%, duplicar melhor angulo" },
    { day: "D7", task: "Escala controlada", output: "Subir budget 20-30% se CPA permitir" },
  ], []);

  const creativeFilter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%) blur(${filters.blur}px)`;

  const zapContacts = useMemo(() => zap.contacts
    .split("\n")
    .map((line) => {
      const [phone = "", name = "", optin = ""] = line.split(";").map((x) => x.trim());
      return {
        phone: phone.replace(/\D/g, ""),
        name: name || "lead",
        optin: /^(sim|yes|1|true|optin)$/i.test(optin),
      };
    })
    .filter((c) => c.phone),
  [zap.contacts]);

  const zapOptinContacts = useMemo(() => zapContacts.filter((c) => c.optin), [zapContacts]);

  const zapMessageFor = (name: string) => zap.text.replaceAll("{{nome}}", name);

  const exportZapCsv = () => {
    const rows = ["phone,name,optin", ...zapContacts.map((c) => `${c.phone},${c.name},${c.optin ? "yes" : "no"}`)];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trackfy-whatsapp-contatos.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportContingencyCsv = () => {
    const rows = [
      "item,status,acao",
      ...contingencyChecks.map((item) => [
        item.label,
        item.ok ? "ok" : "pendente",
        item.fix,
      ].map((x) => `"${String(x).replaceAll('"', '""')}"`).join(",")),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trackfy-contingencia.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImage = async (file: File | null) => {
    if (!file) return;
    const inputUrl = URL.createObjectURL(file);
    const type = file.type.startsWith("video/") ? "video" : "image";
    setCreativeFile({ url: inputUrl, type, name: file.name });
    setCleanImageUrl("");
    setImageStatus(type === "video" ? "Video carregado para preview com filtros." : "Imagem carregada. Ajuste os filtros e exporte.");
  };

  const exportFilteredImage = () => {
    if (!creativeFile || creativeFile.type !== "image") return;
    setImageStatus("Exportando criativo...");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.filter = creativeFilter;
      ctx.drawImage(img, 0, 0);
      if (filters.sharpness > 0) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const src = imageData.data;
        const out = new Uint8ClampedArray(src);
        const w = canvas.width;
        const h = canvas.height;
        const amount = filters.sharpness / 100;
        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const i = (y * w + x) * 4;
            for (let c = 0; c < 3; c++) {
              const value = src[i + c] * (1 + 4 * amount)
                - src[i - 4 + c] * amount
                - src[i + 4 + c] * amount
                - src[i - w * 4 + c] * amount
                - src[i + w * 4 + c] * amount;
              out[i + c] = Math.max(0, Math.min(255, value));
            }
          }
        }
        ctx.putImageData(new ImageData(out, w, h), 0, 0);
      }
      const output = canvas.toDataURL(creativeFile.name.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg", 0.92);
      setCleanImageUrl(output);
      setImageStatus("Criativo exportado sem metadados e com filtros aplicados.");
    };
    img.onerror = () => setImageStatus("Nao consegui exportar essa imagem.");
    img.src = creativeFile.url;
  };

  const sendZapTest = async () => {
    const first = zapOptinContacts[0];
    if (!first) {
      setZapLog((l) => ["Nenhum contato com opt-in.", ...l]);
      return;
    }
    setZapLog((l) => [`Enviando teste para ${first.phone}...`, ...l]);
    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: zap.token,
          phoneNumberId: zap.phoneNumberId,
          to: first.phone,
          mode: zap.mode,
          text: zapMessageFor(first.name),
          templateName: zap.templateName,
          templateLanguage: zap.templateLanguage,
        }),
      });
      const data = await res.json();
      setZapLog((l) => [`${res.ok ? "OK" : "Erro"} ${first.phone}: ${JSON.stringify(data)}`, ...l]);
    } catch (e: any) {
      setZapLog((l) => [`Erro: ${e.message}`, ...l]);
    }
  };

  const searchPlaces = async () => {
    setProspectorStatus("Buscando negocios...");
    setPlaces([]);
    try {
      const res = await fetch("/api/prospector/google-places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: prospector.apiKey,
          query: prospector.query,
          location: prospector.location,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setProspectorStatus(data.error ?? "Erro na busca.");
        return;
      }
      setPlaces(data.places ?? []);
      setProspectorStatus(`${(data.places ?? []).length} negocios encontrados.`);
    } catch (e: any) {
      setProspectorStatus(e.message ?? "Erro na busca.");
    }
  };

  const tabs = [
    { id: "arsenal", label: "Arsenal 100", icon: PackageCheck },
    { id: "keywords", label: "Keywords", icon: KeyRound },
    { id: "prospector", label: "Prospector", icon: Radar },
    { id: "spy", label: "Spy", icon: FileSearch },
    { id: "offer", label: "Oferta", icon: PackageCheck },
    { id: "copy", label: "Copy", icon: Megaphone },
    { id: "whatsapp", label: "Direct", icon: MessageCircle },
    { id: "zap", label: "Zap API", icon: Send },
    { id: "calendar", label: "Plano", icon: CalendarDays },
    { id: "funnel", label: "Funil", icon: Workflow },
    { id: "abtest", label: "Teste A/B", icon: FlaskConical },
    { id: "roi", label: "ROI", icon: Calculator },
    { id: "url", label: "URL", icon: Link2 },
    { id: "image", label: "Metadados", icon: ImageOff },
    { id: "pix", label: "Pix", icon: Landmark },
    { id: "compliance", label: "Compliance", icon: ShieldCheck },
    { id: "contingency", label: "Contingência", icon: ShieldAlert },
  ] as const;

  return (
    <div className="max-w-[1380px] mx-auto space-y-5">
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4" style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(16,185,129,0.06))" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--blue-muted)" }}>
              <Wrench className="w-5 h-5" style={{ color: "var(--blue)" }} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-[22px] font-bold tracking-tight" style={{ color: "var(--text-1)" }}>Ferramentas Trackfy</h1>
              <p className="text-[13px]" style={{ color: "var(--text-4)" }}>Pesquisa, oferta, criativos, WhatsApp, Pix, compliance e contingência em um só painel.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 min-w-[280px]">
            {[
              { label: "Ferramentas", value: tabs.length },
              { label: "Leads", value: prospectRows.length },
              { label: "Checklist", value: `${contingencyChecks.filter((item) => item.ok).length}/${contingencyChecks.length}` },
            ].map((item) => (
              <div key={item.label} className="rounded-lg px-3 py-2" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--text-4)" }}>{item.label}</p>
                <p className="text-[18px] font-bold tabular-nums" style={{ color: "var(--text-1)" }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { label: "Pesquisa e demanda", value: `${keywordRows.length} ideias`, icon: Search, tone: "var(--blue)", text: "Keywords, spy e prospecção para achar onde tem intenção." },
          { label: "Oferta e conversão", value: `${funnelCalc.finalRate.toFixed(1)}% funil`, icon: Workflow, tone: "var(--green)", text: "Oferta, copy, direct, funil e teste A/B para melhorar resposta." },
          { label: "Operação comercial", value: `${zapOptinContacts.length} opt-ins`, icon: MessageCircle, tone: "#f97316", text: "WhatsApp, calendário, Pix e ROI para executar sem bagunça." },
          { label: "Risco operacional", value: `${contingencyScore}% ok`, icon: ShieldCheck, tone: contingencyScore >= 70 ? "var(--green)" : "var(--yellow)", text: "Compliance e contingência para reduzir bloqueios e perda de dados." },
        ].map((item) => (
          <div key={item.label} className="card p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${item.tone}14` }}>
                <item.icon className="w-4 h-4" style={{ color: item.tone }} strokeWidth={2.4} />
              </div>
              <span className="text-[12px] font-bold tabular-nums" style={{ color: item.tone }}>{item.value}</span>
            </div>
            <p className="text-[13px] font-bold mt-3" style={{ color: "var(--text-1)" }}>{item.label}</p>
            <p className="text-[12px] mt-1 leading-relaxed" style={{ color: "var(--text-4)" }}>{item.text}</p>
          </div>
        ))}
      </div>

      <div className="card p-4 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex-1">
          <p className="text-[12px] font-bold uppercase" style={{ color: "var(--text-4)" }}>Ferramenta ativa</p>
          <p className="text-[15px] font-bold mt-1" style={{ color: "var(--text-1)" }}>{tabs.find((item) => item.id === tab)?.label}</p>
          <p className="text-[12px] mt-1" style={{ color: "var(--text-4)" }}>{TOOL_TUTORIALS[tab].tip}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 w-full lg:w-auto">
          {[
            { label: "Funil", value: `${funnelCalc.finalRate.toFixed(1)}%` },
            { label: "ROI", value: roiCalc.roas.toFixed(2) },
            { label: "A/B", value: `${abCalc.lift.toFixed(1)}%` },
          ].map((item) => (
            <div key={item.label} className="rounded-lg px-3 py-2 min-w-[90px]" style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
              <p className="text-[10px] font-bold uppercase" style={{ color: "var(--text-4)" }}>{item.label}</p>
              <p className="text-[17px] font-bold tabular-nums" style={{ color: "var(--text-1)" }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1 p-1.5 rounded-xl" style={{ background: "var(--bg-muted)" }}>
        {tabs.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12px] font-semibold transition-all"
            style={{
              background: tab === item.id ? "var(--surface)" : "transparent",
              color: tab === item.id ? "var(--text-1)" : "var(--text-4)",
              boxShadow: tab === item.id ? "var(--shadow-sm)" : "none",
            }}
          >
            <item.icon className="w-4 h-4" strokeWidth={2.5} />
            {item.label}
          </button>
        ))}
      </div>

      <div className="card p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--blue-muted)" }}>
            <CheckCircle className="w-4 h-4" style={{ color: "var(--blue)" }} strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>{TOOL_TUTORIALS[tab].title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
              {TOOL_TUTORIALS[tab].steps.map((step, index) => (
                <div key={step} className="flex gap-2 text-[12px] leading-relaxed" style={{ color: "var(--text-3)" }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold" style={{ background: "var(--bg-muted)", color: "var(--text-2)" }}>
                    {index + 1}
                  </span>
                  {step}
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-lg px-3 py-2 text-[12px]" style={{ background: "var(--yellow-light)", color: "var(--yellow)" }}>
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" strokeWidth={2.5} />
              {TOOL_TUTORIALS[tab].tip}
            </div>
          </div>
        </div>
      </div>

      {tab === "arsenal" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-5">
            <div className="card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-4 h-4" style={{ color: "var(--blue)" }} strokeWidth={2.5} />
                <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Gerador IA multi-ferramentas</h2>
              </div>
              <div>
                <label className="section-label mb-1.5 block" style={{ padding: 0 }}>Ferramenta selecionada</label>
                <select value={selectedMegaTool} onChange={(e) => setSelectedMegaTool(e.target.value)} className="select">
                  {MEGA_TOOLS.map((tool, index) => <option key={tool} value={tool}>{index + 1}. {toolCategory(index)} - {tool}</option>)}
                </select>
              </div>
              <div>
                <label className="section-label mb-1.5 block" style={{ padding: 0 }}>Oferta/produto</label>
                <textarea value={megaOffer} onChange={(e) => setMegaOffer(e.target.value)} className="input min-h-[80px]" />
              </div>
              <div>
                <label className="section-label mb-1.5 block" style={{ padding: 0 }}>Contexto do cliente/campanha</label>
                <textarea value={megaContext} onChange={(e) => setMegaContext(e.target.value)} className="input min-h-[110px]" />
              </div>
              <div>
                <label className="section-label mb-1.5 block" style={{ padding: 0 }}>Canal</label>
                <input value={megaChannel} onChange={(e) => setMegaChannel(e.target.value)} className="input" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="section-label mb-1.5 block" style={{ padding: 0 }}>IA</label>
                  <select value={megaProvider} onChange={(e) => setMegaProvider(e.target.value as typeof megaProvider)} className="select">
                    <option value="gemini">Gemini</option>
                    <option value="openai">ChatGPT/OpenAI</option>
                    <option value="anthropic">Claude</option>
                  </select>
                </div>
                <div>
                  <label className="section-label mb-1.5 block" style={{ padding: 0 }}>API privada opcional</label>
                  <input value={megaApiKey} onChange={(e) => setMegaApiKey(e.target.value)} placeholder="Deixe vazio para usar servidor" className="input" type="password" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={generateMegaTool} disabled={megaLoading} className="btn-primary px-4 py-2.5">
                  <FlaskConical className="w-4 h-4" strokeWidth={2.5} />
                  {megaLoading ? "Gerando..." : "Gerar com IA"}
                </button>
                <button onClick={() => copyText(selectedMegaPrompt)} className="btn-secondary px-4 py-2.5">
                  <Copy className="w-4 h-4" strokeWidth={2.5} />
                  Copiar prompt
                </button>
              </div>
            </div>

            <div className="space-y-5">
              <div className="card p-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Saída</h2>
                  <button onClick={() => copyText(megaOutput || selectedMegaPrompt)} className="btn-secondary px-3 py-2">
                    <Copy className="w-4 h-4" strokeWidth={2.5} />
                    Copiar
                  </button>
                </div>
                <textarea readOnly value={megaOutput || selectedMegaPrompt} className="input min-h-[360px] font-mono text-[12px]" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Ferramentas", value: MEGA_TOOLS.length },
                  { label: "Categorias", value: 10 },
                  { label: "Custo base", value: "Local" },
                  { label: "IA", value: "Opcional" },
                ].map((item) => (
                  <div key={item.label} className="card p-4">
                    <p className="text-[10px] font-bold uppercase" style={{ color: "var(--text-4)" }}>{item.label}</p>
                    <p className="text-[22px] font-bold mt-1 tabular-nums" style={{ color: "var(--text-1)" }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Biblioteca de 100 ferramentas</h2>
                <p className="text-[12px] mt-1" style={{ color: "var(--text-4)" }}>Clique em qualquer card para carregar o prompt no gerador.</p>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-4)" }} strokeWidth={2.5} />
                <input value={megaSearch} onChange={(e) => setMegaSearch(e.target.value)} placeholder="Buscar ferramenta..." className="input pl-9" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 max-h-[680px] overflow-auto pr-1">
              {megaTools.map((tool) => (
                <button key={tool.name} onClick={() => setSelectedMegaTool(tool.name)} className={cn("text-left rounded-lg border p-3 transition-all", selectedMegaTool === tool.name && "shadow-md")} style={{ borderColor: selectedMegaTool === tool.name ? "rgba(37,99,235,0.35)" : "var(--border)", background: selectedMegaTool === tool.name ? "var(--blue-light)" : "var(--surface)" }}>
                  <p className="text-[10px] font-bold uppercase" style={{ color: "var(--text-4)" }}>{tool.index + 1} · {tool.category}</p>
                  <p className="text-[12px] font-bold mt-1" style={{ color: "var(--text-1)" }}>{tool.name}</p>
                  <p className="text-[11px] mt-1" style={{ color: "var(--text-4)" }}>{tool.category === "Vídeo IA" ? "Prompt/roteiro para IA de vídeo" : "Prompt pronto + checklist"}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "keywords" && (
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5">
          <div className="card p-5 space-y-4">
            <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Modelador Google/TikTok</h2>
            <div>
              <label className="section-label mb-1.5 block" style={{ padding: 0 }}>Seeds ou nichos</label>
              <textarea value={seed} onChange={(e) => setSeed(e.target.value)} className="input min-h-[150px]" />
            </div>
            <div>
              <label className="section-label mb-1.5 block" style={{ padding: 0 }}>Oferta</label>
              <input value={offer} onChange={(e) => setOffer(e.target.value)} className="input" />
            </div>
            <button onClick={() => copyText(keywordRows.map((r) => `${r.channel};${r.keyword};${r.intent};${r.suggestion}`).join("\n"))} className="btn-secondary w-full py-2.5">
              <Copy className="w-4 h-4" strokeWidth={2.5} />
              Copiar plano
            </button>
          </div>

          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
              <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Sugestoes de campanha</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ background: "var(--bg-subtle)", borderColor: "var(--border)" }}>
                    {["Canal", "Keyword/Hook", "Intencao", "Score", "Tipo", "Sugestao"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left whitespace-nowrap section-label" style={{ paddingTop: 12, paddingBottom: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {keywordRows.map((row, index) => (
                    <tr key={`${row.channel}-${row.keyword}-${index}`} className="border-b last:border-b-0" style={{ borderColor: "var(--border)" }}>
                      <td className="px-4 py-3">
                        <span className={cn("badge", row.channel === "Google" ? "badge-blue" : "badge-neutral")}>
                          {row.channel === "Google" ? <Search className="w-3 h-3" /> : <Music2 className="w-3 h-3" />}
                          {row.channel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>{row.keyword}</td>
                      <td className="px-4 py-3 text-[13px]" style={{ color: "var(--text-2)" }}>{row.intent}</td>
                      <td className="px-4 py-3 text-[13px] font-bold tabular-nums" style={{ color: row.score >= 70 ? "var(--green)" : "var(--yellow)" }}>{row.score}</td>
                      <td className="px-4 py-3 text-[13px]" style={{ color: "var(--text-2)" }}>{row.type}</td>
                      <td className="px-4 py-3 text-[13px] font-mono" style={{ color: "var(--text-2)" }}>{row.suggestion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "prospector" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 xl:grid-cols-[390px_1fr] gap-5">
            <div className="card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Radar className="w-4 h-4" style={{ color: "var(--blue)" }} strokeWidth={2.5} />
                <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Super Prospector Local</h2>
              </div>
              <div>
                <label className="section-label mb-1.5 block" style={{ padding: 0 }}>Google Places API key</label>
                <input value={prospector.apiKey} onChange={(e) => setProspector((p) => ({ ...p, apiKey: e.target.value }))} className="input font-mono text-[12px]" placeholder="AIza..." />
              </div>
              <div>
                <label className="section-label mb-1.5 block" style={{ padding: 0 }}>Tipo de negocio</label>
                <input value={prospector.query} onChange={(e) => setProspector((p) => ({ ...p, query: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="section-label mb-1.5 block" style={{ padding: 0 }}>Cidade/regiao</label>
                <input value={prospector.location} onChange={(e) => setProspector((p) => ({ ...p, location: e.target.value }))} className="input" />
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={searchPlaces} className="btn-primary px-4 py-2.5">
                  <Search className="w-4 h-4" strokeWidth={2.5} />
                  Buscar
                </button>
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(`${prospector.query} ${prospector.location}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary px-4 py-2.5"
                >
                  Maps
                </a>
                <a
                  href={`https://trends.google.com/trends/explore?geo=BR&q=${encodeURIComponent(prospector.query)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary px-4 py-2.5"
                >
                  Trends
                </a>
              </div>
              {prospectorStatus && <p className="text-[13px] font-semibold" style={{ color: "var(--text-3)" }}>{prospectorStatus}</p>}
            </div>

            <div className="card p-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Extrator de emails comerciais</h2>
                <button onClick={() => copyText(extractedEmails.join("\n"))} className="btn-secondary px-3 py-2">
                  <Copy className="w-4 h-4" strokeWidth={2.5} />
                  Copiar
                </button>
              </div>
              <textarea value={prospector.emailText} onChange={(e) => setProspector((p) => ({ ...p, emailText: e.target.value }))} className="input min-h-[120px]" />
              <div className="flex flex-wrap gap-2">
                {extractedEmails.length === 0 ? (
                  <span className="text-[13px]" style={{ color: "var(--text-4)" }}>Nenhum email encontrado.</span>
                ) : extractedEmails.map((email) => (
                  <span key={email} className="badge badge-blue">{email}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
              <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Leads locais</h2>
              <button onClick={exportProspectsCsv} disabled={prospectRows.length === 0} className="btn-secondary px-3 py-2">
                <Download className="w-4 h-4" strokeWidth={2.5} />
                Exportar CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ background: "var(--bg-subtle)", borderColor: "var(--border)" }}>
                    {["Negocio", "Contato", "Rating", "Score", "Oportunidade", "Links"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left section-label whitespace-nowrap" style={{ paddingTop: 12, paddingBottom: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {prospectRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-[13px]" style={{ color: "var(--text-4)" }}>
                        Busque por um tipo de negocio para montar sua lista.
                      </td>
                    </tr>
                  ) : prospectRows.map((lead) => (
                    <tr key={lead.id} className="border-b last:border-b-0" style={{ borderColor: "var(--border)" }}>
                      <td className="px-4 py-3 min-w-[260px]">
                        <p className="text-[13px] font-bold" style={{ color: "var(--text-1)" }}>{lead.name}</p>
                        <p className="text-[12px]" style={{ color: "var(--text-4)" }}>{lead.address}</p>
                      </td>
                      <td className="px-4 py-3 text-[13px]" style={{ color: "var(--text-2)" }}>{lead.phone || "sem telefone"}</td>
                      <td className="px-4 py-3 text-[13px] tabular-nums" style={{ color: "var(--text-2)" }}>{lead.rating ?? "-"} ({lead.reviews})</td>
                      <td className="px-4 py-3">
                        <span className="badge" style={{ background: lead.score >= 70 ? "var(--green-light)" : "var(--yellow-light)", color: lead.score >= 70 ? "var(--green)" : "var(--yellow)" }}>{lead.score}</span>
                      </td>
                      <td className="px-4 py-3 text-[13px]" style={{ color: "var(--text-2)" }}>{lead.angle}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {lead.website && <a href={lead.website} target="_blank" rel="noopener noreferrer" className="btn-secondary px-3 py-1.5 text-[12px]">Site</a>}
                          {lead.mapsUrl && <a href={lead.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary px-3 py-1.5 text-[12px]">Maps</a>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "spy" && (
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5">
          <div className="card p-5 space-y-4">
            <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Pesquisa competitiva</h2>
            <div>
              <label className="section-label mb-1.5 block" style={{ padding: 0 }}>Nicho/produto</label>
              <input value={spyInput.niche} onChange={(e) => setSpyInput((s) => ({ ...s, niche: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="section-label mb-1.5 block" style={{ padding: 0 }}>Concorrentes</label>
              <textarea value={spyInput.competitor} onChange={(e) => setSpyInput((s) => ({ ...s, competitor: e.target.value }))} className="input min-h-[120px]" />
            </div>
            <div>
              <label className="section-label mb-1.5 block" style={{ padding: 0 }}>Promessa que voce quer mapear</label>
              <input value={spyInput.promise} onChange={(e) => setSpyInput((s) => ({ ...s, promise: e.target.value }))} className="input" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {spyRows.map((row) => (
                <a key={row.source} href={row.url} target="_blank" rel="noopener noreferrer" className="card p-4 block">
                  <p className="text-[13px] font-bold" style={{ color: "var(--text-1)" }}>{row.source}</p>
                  <p className="text-[12px] mt-1" style={{ color: "var(--text-3)" }}>{row.angle}</p>
                </a>
              ))}
            </div>
            <div className="card p-5">
              <h2 className="text-[14px] font-bold mb-3" style={{ color: "var(--text-1)" }}>Planilha de leitura rapida</h2>
              {[
                "Promessa principal",
                "Dor atacada",
                "Prova usada",
                "Formato do criativo",
                "Oferta/bonus",
                "CTA",
                "Objeção respondida",
              ].map((item) => (
                <div key={item} className="flex items-center justify-between py-2 border-b last:border-b-0" style={{ borderColor: "var(--border)" }}>
                  <span className="text-[13px] font-semibold" style={{ color: "var(--text-2)" }}>{item}</span>
                  <span className="text-[12px]" style={{ color: "var(--text-4)" }}>preencher</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "offer" && (
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5">
          <div className="card p-5 space-y-3">
            <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Construtor de oferta</h2>
            {[
              { key: "avatar", label: "Avatar" },
              { key: "result", label: "Resultado" },
              { key: "time", label: "Tempo" },
              { key: "mechanism", label: "Mecanismo" },
              { key: "price", label: "Preco" },
              { key: "bonus", label: "Bonus" },
            ].map((field) => (
              <div key={field.key}>
                <label className="section-label mb-1.5 block" style={{ padding: 0 }}>{field.label}</label>
                <input value={offerInput[field.key as keyof typeof offerInput]} onChange={(e) => setOfferInput((o) => ({ ...o, [field.key]: e.target.value }))} className="input" />
              </div>
            ))}
          </div>
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Oferta montada</h2>
              <button onClick={() => copyText(offerBlocks.map((b) => `${b.label}: ${b.value}`).join("\n"))} className="btn-secondary px-3 py-2">
                <Copy className="w-4 h-4" strokeWidth={2.5} />
                Copiar
              </button>
            </div>
            {offerBlocks.map((block) => (
              <div key={block.label} className="p-3 rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}>
                <p className="section-label mb-1" style={{ padding: 0 }}>{block.label}</p>
                <p className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>{block.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "copy" && (
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5">
          <div className="card p-5 space-y-3">
            <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Gerador de hooks e angulos</h2>
            {[
              { key: "avatar", label: "Avatar" },
              { key: "dor", label: "Dor principal" },
              { key: "oferta", label: "Oferta" },
              { key: "mecanismo", label: "Mecanismo" },
            ].map((field) => (
              <div key={field.key}>
                <label className="section-label mb-1.5 block" style={{ padding: 0 }}>{field.label}</label>
                <input
                  value={copyInput[field.key as keyof typeof copyInput]}
                  onChange={(e) => setCopyInput((c) => ({ ...c, [field.key]: e.target.value }))}
                  className="input"
                />
              </div>
            ))}
          </div>
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Ideias prontas para criativo</h2>
              <button onClick={() => copyText(copyIdeas.join("\n"))} className="btn-secondary px-3 py-2">
                <Copy className="w-4 h-4" strokeWidth={2.5} />
                Copiar
              </button>
            </div>
            {copyIdeas.map((idea, index) => (
              <div key={idea} className="p-3 rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}>
                <p className="text-[12px] font-bold mb-1" style={{ color: "var(--blue)" }}>Angulo {index + 1}</p>
                <p className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>{idea}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "whatsapp" && (
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5">
          <div className="card p-5 space-y-3">
            <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Scripts para direct/WhatsApp</h2>
            {[
              { key: "lead", label: "Origem do lead" },
              { key: "pain", label: "Dor/objeção" },
              { key: "product", label: "Produto" },
              { key: "proof", label: "Prova" },
            ].map((field) => (
              <div key={field.key}>
                <label className="section-label mb-1.5 block" style={{ padding: 0 }}>{field.label}</label>
                <input value={whatsInput[field.key as keyof typeof whatsInput]} onChange={(e) => setWhatsInput((w) => ({ ...w, [field.key]: e.target.value }))} className="input" />
              </div>
            ))}
          </div>
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Sequencia pronta</h2>
              <button onClick={() => copyText(whatsScripts.join("\n\n"))} className="btn-secondary px-3 py-2">
                <Copy className="w-4 h-4" strokeWidth={2.5} />
                Copiar
              </button>
            </div>
            {whatsScripts.map((script, index) => (
              <div key={script} className="p-3 rounded-lg" style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
                <p className="text-[12px] font-bold mb-1" style={{ color: "var(--blue)" }}>Mensagem {index + 1}</p>
                <p className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>{script}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "zap" && (
        <div className="grid grid-cols-1 xl:grid-cols-[390px_1fr] gap-5">
          <div className="card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4" style={{ color: "var(--green)" }} strokeWidth={2.5} />
              <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>WhatsApp Cloud API</h2>
            </div>
            <div>
              <label className="section-label mb-1.5 block" style={{ padding: 0 }}>Access token</label>
              <input value={zap.token} onChange={(e) => setZap((z) => ({ ...z, token: e.target.value }))} className="input font-mono text-[12px]" placeholder="EAAG..." />
            </div>
            <div>
              <label className="section-label mb-1.5 block" style={{ padding: 0 }}>Phone Number ID</label>
              <input value={zap.phoneNumberId} onChange={(e) => setZap((z) => ({ ...z, phoneNumberId: e.target.value }))} className="input font-mono text-[12px]" placeholder="1234567890" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="section-label mb-1.5 block" style={{ padding: 0 }}>Modo</label>
                <select value={zap.mode} onChange={(e) => setZap((z) => ({ ...z, mode: e.target.value }))} className="select">
                  <option value="text">Texto 24h</option>
                  <option value="template">Template</option>
                </select>
              </div>
              <div>
                <label className="section-label mb-1.5 block" style={{ padding: 0 }}>Idioma</label>
                <input value={zap.templateLanguage} onChange={(e) => setZap((z) => ({ ...z, templateLanguage: e.target.value }))} className="input" />
              </div>
            </div>
            {zap.mode === "template" ? (
              <div>
                <label className="section-label mb-1.5 block" style={{ padding: 0 }}>Nome do template</label>
                <input value={zap.templateName} onChange={(e) => setZap((z) => ({ ...z, templateName: e.target.value }))} className="input" />
              </div>
            ) : (
              <div>
                <label className="section-label mb-1.5 block" style={{ padding: 0 }}>Mensagem</label>
                <textarea value={zap.text} onChange={(e) => setZap((z) => ({ ...z, text: e.target.value }))} className="input min-h-[110px]" />
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={sendZapTest} className="btn-primary px-4 py-2.5">
                <Send className="w-4 h-4" strokeWidth={2.5} />
                Enviar teste
              </button>
              <button onClick={exportZapCsv} className="btn-secondary px-4 py-2.5">
                <Download className="w-4 h-4" strokeWidth={2.5} />
                CSV
              </button>
            </div>
          </div>

          <div className="space-y-5">
            <div className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" style={{ color: "var(--blue)" }} strokeWidth={2.5} />
                  <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Contatos opt-in</h2>
                </div>
                <span className="badge badge-blue">{zapOptinContacts.length}/{zapContacts.length} liberados</span>
              </div>
              <textarea value={zap.contacts} onChange={(e) => setZap((z) => ({ ...z, contacts: e.target.value }))} className="input min-h-[150px] font-mono text-[12px]" />
              <p className="text-[12px]" style={{ color: "var(--text-4)" }}>Formato: telefone;nome;sim</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {zapOptinContacts.slice(0, 6).map((contact) => (
                  <a
                    key={contact.phone}
                    href={`https://wa.me/${contact.phone}?text=${encodeURIComponent(zapMessageFor(contact.name))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary justify-start px-3 py-2"
                  >
                    <MessageCircle className="w-4 h-4" strokeWidth={2.5} />
                    {contact.name} no wa.me
                  </a>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h2 className="text-[14px] font-bold mb-3" style={{ color: "var(--text-1)" }}>Log de envio</h2>
              <div className="space-y-2 max-h-[220px] overflow-auto">
                {zapLog.length === 0 ? (
                  <p className="text-[13px]" style={{ color: "var(--text-4)" }}>Nenhum envio nesta sessao.</p>
                ) : zapLog.map((line, index) => (
                  <p key={`${line}-${index}`} className="text-[12px] font-mono p-2 rounded-lg" style={{ background: "var(--bg-muted)", color: "var(--text-2)" }}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "calendar" && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Plano de 7 dias para direct offer</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ background: "var(--bg-subtle)", borderColor: "var(--border)" }}>
                  {["Dia", "Tarefa", "Entrega"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left section-label" style={{ paddingTop: 12, paddingBottom: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaignCalendar.map((item) => (
                  <tr key={item.day} className="border-b last:border-b-0" style={{ borderColor: "var(--border)" }}>
                    <td className="px-4 py-3 text-[13px] font-bold" style={{ color: "var(--blue)" }}>{item.day}</td>
                    <td className="px-4 py-3 text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>{item.task}</td>
                    <td className="px-4 py-3 text-[13px]" style={{ color: "var(--text-2)" }}>{item.output}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "funnel" && (
        <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-5">
          <div className="card p-5 space-y-3">
            <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Funil real da sua página</h2>
            <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-4)" }}>Preencha números do período. Quando o script Trackfy estiver instalado, confira esses eventos em UTMs → Dados no Trackfy.</p>
            {[
              { key: "visits", label: "Visitas", event: "page_view" },
              { key: "viewItem", label: "Pessoas que viram a oferta", event: "view_item" },
              { key: "leads", label: "Leads", event: "generate_lead" },
              { key: "checkout", label: "Checkout iniciado", event: "begin_checkout" },
              { key: "purchases", label: "Compras confirmadas", event: "purchase" },
            ].map((field) => (
              <div key={field.key}>
                <label className="section-label mb-1.5 block" style={{ padding: 0 }}>{field.label} <span className="font-mono normal-case" style={{ color: "var(--text-4)" }}>({field.event})</span></label>
                <input inputMode="numeric" value={funnelInput[field.key as keyof typeof funnelInput]} onChange={(e) => setFunnelInput((value) => ({ ...value, [field.key]: e.target.value.replace(/[^0-9]/g, "") }))} className="input" />
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {funnelCalc.steps.map((step, index) => {
                const previous = funnelCalc.steps[index - 1]?.value ?? step.value;
                const rate = index === 0 ? 100 : previous > 0 ? (step.value / previous) * 100 : 0;
                return <div key={step.key} className="card p-4"><p className="text-[11px] font-bold uppercase" style={{ color: "var(--text-4)" }}>{step.label}</p><p className="text-[23px] font-bold mt-2" style={{ color: "var(--text-1)" }}>{step.value}</p><p className="text-[12px] mt-1" style={{ color: "var(--blue)" }}>{rate.toFixed(1)}% da etapa anterior</p></div>;
              })}
            </div>
            <div className="card p-5">
              <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Leitura do funil</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <div className="rounded-lg p-4" style={{ background: "var(--blue-light)" }}><p className="text-[12px] font-bold" style={{ color: "var(--blue)" }}>Conversão total</p><p className="text-[25px] font-bold mt-1" style={{ color: "var(--text-1)" }}>{funnelCalc.finalRate.toFixed(2)}%</p><p className="text-[12px] mt-1" style={{ color: "var(--text-3)" }}>Da visita até uma compra confirmada.</p></div>
                <div className="rounded-lg p-4" style={{ background: "var(--yellow-light)" }}><p className="text-[12px] font-bold" style={{ color: "var(--yellow)" }}>Maior gargalo</p><p className="text-[16px] font-bold mt-1" style={{ color: "var(--text-1)" }}>{funnelCalc.bottleneck.from} → {funnelCalc.bottleneck.to}</p><p className="text-[12px] mt-1" style={{ color: "var(--text-3)" }}>{funnelCalc.bottleneck.rate.toFixed(1)}% avançam; {funnelCalc.bottleneck.loss} pessoas não avançaram.</p></div>
              </div>
            </div>
            <div className="card p-5 space-y-3">
              <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Eventos para marcar na landing</h2>
              <p className="text-[12px]" style={{ color: "var(--text-4)" }}>Cole estes atributos nos elementos correspondentes. O script Trackfy já precisa estar no <code>&lt;head&gt;</code>.</p>
              <pre className="rounded-lg p-4 overflow-auto text-[11px] leading-relaxed" style={{ background: "#0f172a", color: "#dbeafe" }}><code>{`<button data-trackfy-funnel="view_item">Ver oferta</button>\n<button data-trackfy-funnel="generate_lead">Quero saber mais</button>\n<button data-trackfy-funnel="begin_checkout">Ir para pagamento</button>\n\n// Somente no webhook/página confirmada:\nwindow.trackfyPurchase({ transaction_id: "PEDIDO-123", value: 97, currency: "BRL" });`}</code></pre>
              <button onClick={() => copyText(`<button data-trackfy-funnel="view_item">Ver oferta</button>\n<button data-trackfy-funnel="generate_lead">Quero saber mais</button>\n<button data-trackfy-funnel="begin_checkout">Ir para pagamento</button>\nwindow.trackfyPurchase({ transaction_id: "PEDIDO-123", value: 97, currency: "BRL" });`)} className="btn-secondary px-4 py-2"><Copy className="w-4 h-4" />Copiar eventos</button>
            </div>
          </div>
        </div>
      )}

      {tab === "abtest" && (
        <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-5">
          <div className="card p-5 space-y-4">
            <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Comparador de página ou criativo</h2>
            {[{ prefix: "a", label: "Versão A (controle)" }, { prefix: "b", label: "Versão B (variação)" }].map((version) => <div key={version.prefix} className="rounded-lg p-4 space-y-3" style={{ background: "var(--bg-subtle)" }}><p className="text-[13px] font-bold" style={{ color: "var(--text-2)" }}>{version.label}</p><div><label className="section-label mb-1 block" style={{ padding: 0 }}>Visitas</label><input inputMode="numeric" value={abTest[`${version.prefix}Visitors` as keyof typeof abTest]} onChange={(e) => setAbTest((value) => ({ ...value, [`${version.prefix}Visitors`]: e.target.value.replace(/[^0-9]/g, "") }))} className="input" /></div><div><label className="section-label mb-1 block" style={{ padding: 0 }}>Conversões</label><input inputMode="numeric" value={abTest[`${version.prefix}Conversions` as keyof typeof abTest]} onChange={(e) => setAbTest((value) => ({ ...value, [`${version.prefix}Conversions`]: e.target.value.replace(/[^0-9]/g, "") }))} className="input" /></div></div>)}
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[{ label: "Taxa A", value: `${(abCalc.aRate * 100).toFixed(2)}%` }, { label: "Taxa B", value: `${(abCalc.bRate * 100).toFixed(2)}%` }, { label: "Ganho da B", value: `${abCalc.lift >= 0 ? "+" : ""}${abCalc.lift.toFixed(1)}%` }].map((item) => <div key={item.label} className="card p-5"><p className="section-label" style={{ padding: 0 }}>{item.label}</p><p className="text-[26px] font-bold mt-2" style={{ color: item.label === "Ganho da B" && abCalc.lift < 0 ? "var(--red)" : "var(--text-1)" }}>{item.value}</p></div>)}
            </div>
            <div className="card p-5">
              <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Decisão</h2>
              <p className="text-[14px] mt-3 leading-relaxed" style={{ color: "var(--text-2)" }}>{!abCalc.enough ? "Ainda há pouco volume para uma decisão segura. Busque pelo menos 100 visitas e 10 conversões por versão." : abCalc.z < 1.96 ? "A diferença ainda pode ser ruído. Continue o teste sem trocar a versão vencedora." : abCalc.lift > 0 ? "A versão B tem vantagem estatística aproximada. Valide mais um período e considere promovê-la." : "A versão A está melhor neste recorte. Mantenha-a e teste uma nova hipótese na versão B."}</p>
              <div className="rounded-lg p-3 mt-4" style={{ background: "var(--bg-subtle)" }}><p className="text-[12px]" style={{ color: "var(--text-3)" }}>Indicador técnico: z-score {abCalc.z.toFixed(2)}. A referência de 1,96 é uma aproximação comum para 95% de confiança; ela não substitui uma análise estatística completa.</p></div>
            </div>
          </div>
        </div>
      )}

      {tab === "roi" && (
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5">
          <div className="card p-5 space-y-3">
            <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Calculadora de campanha</h2>
            {[
              { key: "price", label: "Preco do produto" },
              { key: "cost", label: "Custo por venda" },
              { key: "cpc", label: "CPC esperado" },
              { key: "conversion", label: "Conversao da pagina (%)" },
              { key: "budget", label: "Orcamento diario" },
            ].map((field) => (
              <div key={field.key}>
                <label className="section-label mb-1.5 block" style={{ padding: 0 }}>{field.label}</label>
                <input value={roi[field.key as keyof typeof roi]} onChange={(e) => setRoi((r) => ({ ...r, [field.key]: e.target.value }))} className="input" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "Cliques/dia", value: roiCalc.clicks.toFixed(0) },
              { label: "Vendas/dia", value: roiCalc.sales.toFixed(2) },
              { label: "Faturamento", value: `R$ ${roiCalc.revenue.toFixed(2)}` },
              { label: "Lucro estimado", value: `R$ ${roiCalc.profit.toFixed(2)}` },
              { label: "CPA maximo", value: `R$ ${roiCalc.maxCpa.toFixed(2)}` },
              { label: "CPC breakeven", value: `R$ ${roiCalc.breakevenCpc.toFixed(2)}` },
              { label: "ROAS", value: roiCalc.roas.toFixed(2) },
            ].map((item) => (
              <div key={item.label} className="card p-4">
                <p className="section-label" style={{ padding: 0 }}>{item.label}</p>
                <p className="text-[22px] font-bold mt-2 tabular-nums" style={{ color: item.label.includes("Lucro") && roiCalc.profit < 0 ? "var(--red)" : "var(--text-1)" }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "url" && (
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-5">
          <div className="card p-5 space-y-4">
            <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Analisador de URL/UTM</h2>
            <textarea value={urlInput} onChange={(e) => setUrlInput(e.target.value)} className="input min-h-[160px] font-mono text-[12px]" />
          </div>
          <div className="card p-5 space-y-3">
            <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Diagnostico</h2>
            {[
              { label: "URL valida", ok: urlAudit.ok, value: urlAudit.host },
              { label: "utm_source", ok: !!urlAudit.source, value: urlAudit.source },
              { label: "utm_medium", ok: !!urlAudit.medium, value: urlAudit.medium },
              { label: "utm_campaign", ok: !!urlAudit.campaign, value: urlAudit.campaign },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 p-3 rounded-lg" style={{ background: item.ok ? "var(--green-light)" : "var(--red-light)" }}>
                <span className="text-[13px] font-semibold" style={{ color: item.ok ? "var(--green)" : "var(--red)" }}>{item.label}</span>
                <span className="text-[12px] font-mono" style={{ color: "var(--text-2)" }}>{item.value || "faltando"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "image" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" style={{ color: "var(--blue)" }} strokeWidth={2.5} />
              <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Editor de criativos</h2>
            </div>
            <label className="btn-primary w-fit px-4 py-2.5 cursor-pointer">
              <Upload className="w-4 h-4" strokeWidth={2.5} />
              Escolher imagem/video
              <input type="file" accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime" className="hidden" onChange={(e) => handleImage(e.target.files?.[0] ?? null)} />
            </label>
            <div className="grid grid-cols-1 gap-3">
              {[
                { key: "brightness", label: "Brilho", min: 40, max: 180, suffix: "%" },
                { key: "contrast", label: "Contraste", min: 40, max: 180, suffix: "%" },
                { key: "saturate", label: "Saturacao", min: 0, max: 240, suffix: "%" },
                { key: "blur", label: "Blur", min: 0, max: 8, suffix: "px" },
                { key: "sharpness", label: "Sharpness", min: 0, max: 100, suffix: "%" },
              ].map((control) => (
                <div key={control.key}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="section-label" style={{ padding: 0 }}>{control.label}</label>
                    <span className="text-[12px] font-bold tabular-nums" style={{ color: "var(--text-3)" }}>
                      {filters[control.key as keyof typeof filters]}{control.suffix}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={control.min}
                    max={control.max}
                    value={filters[control.key as keyof typeof filters]}
                    onChange={(e) => setFilters((f) => ({ ...f, [control.key]: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setFilters({ brightness: 100, contrast: 100, saturate: 100, blur: 0, sharpness: 0 })} className="btn-secondary px-4 py-2.5">
                Reset
              </button>
              <button onClick={exportFilteredImage} disabled={!creativeFile || creativeFile.type !== "image"} className="btn-primary px-4 py-2.5">
                <Download className="w-4 h-4" strokeWidth={2.5} />
                Exportar imagem
              </button>
            </div>
            {imageStatus && <p className="text-[13px]" style={{ color: "var(--text-3)" }}>{imageStatus}</p>}
          </div>
          <div className="card p-5">
            {creativeFile ? (
              <div className="space-y-3">
                {creativeFile.type === "image" ? (
                  <img src={creativeFile.url} alt="" className="w-full max-h-[360px] object-contain rounded-lg" style={{ background: "var(--bg-muted)", filter: creativeFilter }} />
                ) : (
                  <video src={creativeFile.url} controls className="w-full max-h-[360px] rounded-lg" style={{ background: "var(--bg-muted)", filter: creativeFilter }} />
                )}
                <p className="text-[12px] font-semibold" style={{ color: "var(--text-4)" }}>{creativeFile.name}</p>
                {cleanImageUrl && (
                  <a href={cleanImageUrl} download="trackfy-criativo-editado.png" className="btn-secondary px-4 py-2.5 w-fit">
                    <Download className="w-4 h-4" strokeWidth={2.5} />
                    Baixar exportado
                  </a>
                )}
              </div>
            ) : (
              <div className="min-h-[260px] flex items-center justify-center text-center" style={{ color: "var(--text-4)" }}>
                <div>
                  <ImageOff className="w-10 h-10 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-[13px] font-semibold">Preview do criativo</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "pix" && (
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-5">
          <div className="card p-5 space-y-3">
            <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Gerador Pix copia e cola</h2>
            {[
              { key: "key", label: "Chave Pix", placeholder: "email, CPF, CNPJ, telefone ou aleatoria" },
              { key: "name", label: "Nome recebedor", placeholder: "NOME DA CONTA" },
              { key: "city", label: "Cidade", placeholder: "SAO PAULO" },
              { key: "amount", label: "Valor opcional", placeholder: "97.00" },
              { key: "description", label: "Descricao", placeholder: "Pedido Trackfy" },
            ].map((field) => (
              <div key={field.key}>
                <label className="section-label mb-1.5 block" style={{ padding: 0 }}>{field.label}</label>
                <input
                  value={pix[field.key as keyof typeof pix]}
                  onChange={(e) => setPix((p) => ({ ...p, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="input"
                />
              </div>
            ))}
          </div>
          <div className="card p-5 space-y-4">
            <textarea readOnly value={pixPayload} className="input min-h-[180px] font-mono text-[12px]" placeholder="Preencha chave, nome e cidade para gerar..." />
            <button onClick={() => copyText(pixPayload)} disabled={!pixPayload} className="btn-primary px-4 py-2.5 w-fit">
              <Copy className="w-4 h-4" strokeWidth={2.5} />
              Copiar Pix
            </button>
          </div>
        </div>
      )}

      {tab === "compliance" && (
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-5">
          <div className="card p-5 space-y-4">
            <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Auditoria de landing page</h2>
            <textarea value={landing} onChange={(e) => setLanding(e.target.value)} className="input min-h-[220px]" />
          </div>
          <div className="card p-5 space-y-3">
            <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Checklist</h2>
            {compliance.map((item) => (
              <div key={item.label} className="flex items-center gap-2 p-3 rounded-lg" style={{ background: item.ok ? "var(--green-light)" : "var(--red-light)" }}>
                {item.ok ? <CheckCircle className="w-4 h-4" style={{ color: "var(--green)" }} /> : <AlertTriangle className="w-4 h-4" style={{ color: "var(--red)" }} />}
                <span className="text-[13px] font-semibold" style={{ color: item.ok ? "var(--green)" : "var(--red)" }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "contingency" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-5">
            <div className="card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" style={{ color: "var(--blue)" }} strokeWidth={2.5} />
                <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Centro de contingência oficial</h2>
              </div>
              {[
                { key: "business", label: "Business/empresa", placeholder: "BM principal" },
                { key: "domain", label: "Domínio principal", placeholder: "seudominio.com" },
                { key: "owner", label: "Responsável", placeholder: "nome ou email" },
                { key: "pixels", label: "Pixels/tags ativos", placeholder: "2" },
                { key: "adAccounts", label: "Contas oficiais ativas", placeholder: "1" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="section-label mb-1.5 block" style={{ padding: 0 }}>{field.label}</label>
                  <input
                    value={contingency[field.key as keyof typeof contingency]}
                    onChange={(e) => setContingency((c) => ({ ...c, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="input"
                  />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "policy", label: "Risco política", options: [["baixo", "Baixo"], ["medio", "Médio"], ["alto", "Alto"]] },
                  { key: "payment", label: "Pagamento", options: [["ok", "Ok"], ["atencao", "Atenção"], ["risco", "Risco"]] },
                  { key: "documents", label: "Documentos", options: [["ok", "Completo"], ["parcial", "Parcial"], ["nao", "Faltando"]] },
                  { key: "backupDomain", label: "Domínio reserva", options: [["sim", "Sim"], ["nao", "Não"]] },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="section-label mb-1.5 block" style={{ padding: 0 }}>{field.label}</label>
                    <select
                      value={contingency[field.key as keyof typeof contingency]}
                      onChange={(e) => setContingency((c) => ({ ...c, [field.key]: e.target.value }))}
                      className="select"
                    >
                      {field.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              <div>
                <label className="section-label mb-1.5 block" style={{ padding: 0 }}>Notas operacionais</label>
                <textarea value={contingency.notes} onChange={(e) => setContingency((c) => ({ ...c, notes: e.target.value }))} className="input min-h-[95px]" />
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { label: "Score saúde", value: `${contingencyScore}%`, color: contingencyScore >= 75 ? "var(--green)" : contingencyScore >= 50 ? "var(--yellow)" : "var(--red)" },
                  { label: "Pendências", value: contingencyChecks.filter((item) => !item.ok).length, color: "var(--text-1)" },
                  { label: "Ativos oficiais", value: Number(contingency.adAccounts || 0) + Number(contingency.pixels || 0), color: "var(--blue)" },
                ].map((item) => (
                  <div key={item.label} className="card p-4">
                    <p className="section-label" style={{ padding: 0 }}>{item.label}</p>
                    <p className="text-[26px] font-bold mt-2 tabular-nums" style={{ color: item.color }}>{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="card p-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4" style={{ color: "var(--green)" }} strokeWidth={2.5} />
                    <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Checklist de resiliência</h2>
                  </div>
                  <button onClick={exportContingencyCsv} className="btn-secondary px-3 py-2">
                    <Download className="w-4 h-4" strokeWidth={2.5} />
                    CSV
                  </button>
                </div>
                {contingencyChecks.map((item) => (
                  <div key={item.label} className="rounded-lg border p-3" style={{ borderColor: "var(--border)", background: item.ok ? "var(--green-light)" : "var(--bg-subtle)" }}>
                    <div className="flex items-center gap-2">
                      {item.ok ? <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "var(--green)" }} strokeWidth={2.5} /> : <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: "var(--yellow)" }} strokeWidth={2.5} />}
                      <p className="text-[13px] font-bold" style={{ color: "var(--text-1)" }}>{item.label}</p>
                    </div>
                    {!item.ok && <p className="text-[12px] mt-1.5 leading-relaxed" style={{ color: "var(--text-3)" }}>{item.fix}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="card p-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" style={{ color: "var(--blue)" }} strokeWidth={2.5} />
                  <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Plano copiável</h2>
                </div>
                <button onClick={() => copyText(contingencyPlan)} className="btn-secondary px-3 py-2">
                  <Copy className="w-4 h-4" strokeWidth={2.5} />
                  Copiar
                </button>
              </div>
              <textarea readOnly value={contingencyPlan} className="input min-h-[260px] font-mono text-[12px]" />
            </div>

            <div className="card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4" style={{ color: "var(--blue)" }} strokeWidth={2.5} />
                <h2 className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>Links oficiais</h2>
              </div>
              {[
                { label: "Meta Business Settings", desc: "Criar ativos, verificar domínio, revisar admins e pixels.", url: "https://business.facebook.com/settings" },
                { label: "Meta Account Quality", desc: "Verificar restrições, qualidade da conta e solicitações de revisão.", url: "https://business.facebook.com/accountquality" },
                { label: "Google Ads", desc: "Criar contas oficialmente, gerenciar faturamento e acessos.", url: "https://ads.google.com" },
                { label: "Google Ads Policy Manager", desc: "Revisar reprovações, políticas e recursos.", url: "https://ads.google.com/aw/policymanager" },
                { label: "Google Search Console", desc: "Verificar domínio e acompanhar saúde orgânica/técnica.", url: "https://search.google.com/search-console" },
              ].map((link) => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-[var(--bg-muted)]" style={{ borderColor: "var(--border)" }}>
                  <span>
                    <span className="block text-[13px] font-bold" style={{ color: "var(--text-1)" }}>{link.label}</span>
                    <span className="block text-[12px] mt-0.5" style={{ color: "var(--text-4)" }}>{link.desc}</span>
                  </span>
                  <ExternalLink className="w-4 h-4 shrink-0" style={{ color: "var(--text-4)" }} strokeWidth={2.5} />
                </a>
              ))}
              <div className="rounded-xl p-3 text-[12px] leading-relaxed" style={{ background: "var(--yellow-light)", color: "var(--yellow)" }}>
                O Trackfy não automatiza criação em massa, aquecimento artificial ou troca de identidade para contornar bloqueios. O módulo ajuda a manter operação legítima, documentada e recuperável.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
