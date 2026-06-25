export interface TutorialStep {
  title: string;
  description: string;
}

export interface TutorialGuide {
  title: string;
  description: string;
  steps: TutorialStep[];
  tips?: string[];
  action?: { label: string; href: string };
}

export const PAGE_TUTORIALS: Record<string, TutorialGuide> = {
  "/dashboard": {
    title: "Painel principal",
    description: "Use esta tela para enxergar o estado geral da operação e decidir onde agir primeiro.",
    steps: [
      { title: "Escolha o periodo", description: "Use o filtro do topo para comparar hoje, ontem, 7 dias, 30 dias ou o periodo maximo." },
      { title: "Leia os KPIs principais", description: "Confira faturamento, gasto, ROAS, lucro e ROI antes de tomar qualquer decisao." },
      { title: "Abra os detalhes", description: "Se algum KPI estiver ruim, entre em Campanhas, Criativos ou Financeiro para achar a causa." },
      { title: "Conecte fontes de dados", description: "Se aparecer dado zerado, va em Configuracoes e conecte Meta Ads, Google Ads ou outras integrações." },
    ],
    tips: ["Use esta tela como check-up diario.", "Quando ROAS e lucro divergirem, revise taxas, impostos e custos."],
    action: { label: "Abrir configurações", href: "/dashboard/settings" },
  },
  "/dashboard/resumo": {
    title: "Resumo executivo",
    description: "Mostra os indicadores em formato rapido para acompanhamento diario.",
    steps: [
      { title: "Veja o bloco de KPIs", description: "Comece por faturamento, gasto, lucro, ROI e conversoes." },
      { title: "Compare o periodo", description: "Altere o periodo para entender se a queda e pontual ou recorrente." },
      { title: "Procure alertas", description: "Use os alertas para priorizar campanhas, criativos ou custos." },
    ],
    tips: ["Ideal para abrir todo dia antes de mexer em campanha."],
  },
  "/dashboard/campaigns": {
    title: "Campanhas Meta Ads",
    description: "Analise campanhas, conjuntos e anuncios sincronizados da Meta.",
    steps: [
      { title: "Conecte a Meta", description: "Va em Configuracoes, cole Access Token e Ad Account ID, depois teste a conexão." },
      { title: "Escolha o nivel", description: "Alterne entre campanhas, conjuntos e anuncios para achar onde o problema nasceu." },
      { title: "Ordene por gasto", description: "Comece pelos itens que mais gastaram, pois eles impactam mais o resultado." },
      { title: "Aja pelo indicador", description: "CTR baixo pede criativo; CPC alto pede publico/angulo; conversao baixa pede oferta ou pagina." },
    ],
    action: { label: "Configurar Meta Ads", href: "/dashboard/settings" },
  },
  "/dashboard/google": {
    title: "Google Ads",
    description: "Sincronize campanhas do Google Ads por OAuth, sem access token manual.",
    steps: [
      { title: "Setup do app", description: "O admin salva Client ID, Client Secret, Redirect URI e Developer Token uma vez em Configuracoes." },
      { title: "Informe Customer ID", description: "Cole o ID da conta Google Ads sem hifens. Exemplo: 7504158568." },
      { title: "Use MCC se existir", description: "Se a conta vem por manager account, preencha Login Customer ID com o ID da MCC." },
      { title: "Conecte pelo OAuth", description: "Clique em Conectar Google Ads, autorize no Google e volte ao Trackfy." },
      { title: "Teste e sincronize", description: "Use Testar conexao; se der 403, revise acesso do email, Customer ID, MCC e Developer Token." },
    ],
    action: { label: "Abrir integrações", href: "/dashboard/settings" },
  },
  "/dashboard/tiktok": {
    title: "TikTok Ads",
    description: "Area para acompanhar e preparar a integração com TikTok Ads.",
    steps: [
      { title: "Crie app TikTok", description: "Acesse TikTok for Developers, crie app e solicite Marketing API." },
      { title: "Autorize o anunciante", description: "Faça OAuth com a conta que tem acesso ao TikTok Ads Manager." },
      { title: "Cole Advertiser ID", description: "Pegue o Advertiser ID no Business Center e salve em Configuracoes." },
      { title: "Analise por aba", description: "Use campanhas, criativos e insights para encontrar hooks vencedores." },
    ],
    action: { label: "Configurar TikTok", href: "/dashboard/settings" },
  },
  "/dashboard/kwai": {
    title: "Kwai Ads",
    description: "Guia para conectar e acompanhar contas Kwai quando a API estiver habilitada.",
    steps: [
      { title: "Solicite API", description: "No painel Kwai for Business, solicite acesso a Marketing API." },
      { title: "Crie credenciais", description: "Gere credenciais do app e autorize a conta de anuncios." },
      { title: "Salve a conta", description: "Registre o ID da conta no Trackfy para cruzar dados depois." },
    ],
  },
  "/dashboard/creatives": {
    title: "Criativos",
    description: "Use para encontrar criativos cansados, vencedores e oportunidades de variação.",
    steps: [
      { title: "Filtre por periodo", description: "Analise criativos no mesmo periodo das campanhas para nao misturar sinais." },
      { title: "Compare CTR e conversao", description: "CTR mostra força do hook; conversao mostra promessa, pagina e oferta." },
      { title: "Crie variações", description: "Pegue vencedores e gere novas versões com angulo, abertura, prova e CTA diferentes." },
      { title: "Use Metadados", description: "Na pagina Ferramentas, limpe metadados e aplique ajustes visuais em imagens e videos." },
    ],
    action: { label: "Abrir Metadados", href: "/dashboard/tools" },
  },
  "/dashboard/finance": {
    title: "Financeiro",
    description: "Central para transformar venda bruta em lucro real.",
    steps: [
      { title: "Cadastre custos", description: "Inclua custo de produto, taxa de plataforma, imposto, frete e despesas fixas." },
      { title: "Compare com Ads", description: "Veja se o ROAS ainda sustenta lucro depois dos custos reais." },
      { title: "Use ponto de equilibrio", description: "Descubra o CPA maximo e CPC maximo para escalar sem prejuizo." },
    ],
    action: { label: "Abrir calculadora ROI", href: "/dashboard/tools" },
  },
  "/dashboard/taxas": {
    title: "Taxas e impostos",
    description: "Use para calcular o impacto de taxas, impostos e custos variáveis no lucro.",
    steps: [
      { title: "Liste as taxas", description: "Inclua gateway, checkout, plataforma, antifraude, parcelamento e saque." },
      { title: "Informe impostos", description: "Cadastre percentual ou valor estimado conforme seu regime." },
      { title: "Compare cenários", description: "Veja como lucro muda quando preço, taxa ou custo aumentam." },
      { title: "Atualize o financeiro", description: "Use os valores para deixar ROI e lucro mais próximos da realidade." },
    ],
  },
  "/dashboard/relatorios": {
    title: "Relatórios",
    description: "Monte leituras para clientes, equipe ou acompanhamento semanal.",
    steps: [
      { title: "Escolha o periodo", description: "Defina a janela analisada antes de exportar qualquer leitura." },
      { title: "Revise KPIs", description: "Inclua gasto, receita, lucro, ROAS, ROI, conversões e principais alertas." },
      { title: "Explique causas", description: "Relatório bom não só mostra número: aponta motivo provável e próxima ação." },
      { title: "Salve histórico", description: "Compare relatórios semanais para enxergar evolução." },
    ],
  },
  "/dashboard/notifications": {
    title: "Notificações",
    description: "Acompanhe avisos de performance, conexão e tarefas importantes.",
    steps: [
      { title: "Leia alertas críticos", description: "Priorize quedas de ROAS, aumento de CPL, gasto sem conversão e token expirado." },
      { title: "Abra a origem", description: "Clique ou navegue para a área relacionada ao alerta." },
      { title: "Resolva e monitore", description: "Depois de agir, acompanhe o próximo periodo antes de mexer de novo." },
    ],
  },
  "/dashboard/utms": {
    title: "UTMs",
    description: "Padronize links para saber qual canal, campanha, criativo e oferta geraram resultado.",
    steps: [
      { title: "Preencha origem", description: "Use utm_source para canal: meta, google, tiktok, email ou whatsapp." },
      { title: "Defina meio", description: "Use utm_medium para tipo de trafego: cpc, organic, direct, influencer." },
      { title: "Nomeie campanha", description: "Use padrão consistente: nicho_oferta_periodo_objetivo." },
      { title: "Teste o link", description: "Abra a URL antes de anunciar e confira se os parametros continuam nela." },
    ],
  },
  "/dashboard/rules": {
    title: "Regras e automações",
    description: "Crie regras para receber alerta e padronizar ações de gestão.",
    steps: [
      { title: "Escolha uma métrica", description: "Comece com gasto, CPL, CPA, ROAS, CTR ou frequencia." },
      { title: "Defina limite", description: "Use limites conservadores no começo para nao pausar campanha boa por pouco dado." },
      { title: "Escolha ação", description: "Use alerta primeiro; depois evolua para pausa, orçamento ou etiqueta." },
      { title: "Revise diariamente", description: "Regra automatica precisa ser auditada para nao matar aprendizado." },
    ],
  },
  "/dashboard/tools": {
    title: "Ferramentas Trackfy",
    description: "Conjunto de utilitarios para pesquisa, oferta, criativos, WhatsApp, Pix e compliance.",
    steps: [
      { title: "Escolha uma ferramenta", description: "Use as abas: Keywords, Prospector, Spy, Oferta, Copy, Direct, Zap API, Plano, ROI, URL, Metadados, Pix e Compliance." },
      { title: "Preencha os campos", description: "Cada ferramenta vem com exemplo pronto. Troque pelos dados do seu nicho e oferta." },
      { title: "Copie ou exporte", description: "Use Copiar, Exportar CSV ou Baixar imagem para levar o resultado para campanha." },
      { title: "Valide compliance", description: "Antes de anunciar, passe oferta e pagina pela checklist de compliance." },
    ],
  },
  "/dashboard/settings": {
    title: "Configurações",
    description: "Conecte plataformas e ajuste preferências da conta.",
    steps: [
      { title: "Abra Integrações", description: "Escolha Meta, Google, TikTok ou Gemini." },
      { title: "Leia o guia da plataforma", description: "Clique em Como pegar as credenciais para abrir o passo a passo daquela integração." },
      { title: "Cole credenciais", description: "Preencha apenas os campos pedidos. No Google, o admin faz setup do app e o usuario conecta por OAuth." },
      { title: "Teste conexão", description: "Use o botão de teste antes de tentar sincronizar dados." },
    ],
  },
  "/dashboard/profile": {
    title: "Perfil",
    description: "Veja dados do usuario, plano e informações da conta.",
    steps: [
      { title: "Confira email e plano", description: "Garanta que esta usando a conta certa antes de conectar plataformas." },
      { title: "Revise limites", description: "Planos podem limitar usuarios, contas de anuncio, relatórios e automações." },
    ],
  },
  "/admin": {
    title: "Admin",
    description: "Area para controlar usuarios, planos, status e limites.",
    steps: [
      { title: "Adicione usuarios", description: "Cadastre nome e email para liberar acesso." },
      { title: "Defina plano", description: "Escolha Starter, Pro ou Ilimitado conforme o cliente." },
      { title: "Controle status", description: "Bloqueie usuarios inadimplentes ou reative quando necessario." },
      { title: "Revise funções", description: "Use a checklist para acompanhar o que ja esta funcional no Trackfy." },
    ],
  },
};

export const DEFAULT_TUTORIAL: TutorialGuide = {
  title: "Como usar esta tela",
  description: "Siga este roteiro simples para explorar a função atual do Trackfy.",
  steps: [
    { title: "Leia os campos", description: "Comece pelos campos e filtros no topo da tela." },
    { title: "Preencha dados reais", description: "Troque os exemplos por dados do seu negócio, campanha ou cliente." },
    { title: "Analise o resultado", description: "Use cards, tabelas e alertas para decidir o proximo passo." },
    { title: "Salve ou copie", description: "Quando existir botão de salvar, copiar ou exportar, use para reaproveitar o trabalho." },
  ],
};
