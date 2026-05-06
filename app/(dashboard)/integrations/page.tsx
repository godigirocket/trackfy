import { IntegrationCard } from "@/components/integrations/IntegrationCard";
import { WebhookSection } from "@/components/integrations/WebhookSection";

export default function IntegrationsPage() {
  const integrations = [
    {
      name: "Stripe",
      description: "Sincronize pagamentos e assinaturas automaticamente.",
      logo: "S",
      webhookUrl: "https://api.trackfy.io/webhooks/stripe/v1/user_abc123",
      supportedEvents: ["payment_intent.succeeded", "customer.subscription.created"],
      status: "Ativo" as const,
      color: "bg-indigo-500/10 text-indigo-500"
    },
    {
      name: "Hotmart",
      description: "Capture vendas de produtos digitais da Hotmart.",
      logo: "H",
      webhookUrl: "https://api.trackfy.io/webhooks/hotmart/v1/user_abc123",
      supportedEvents: ["PURCHASE_APPROVED", "SUBSCRIPTION_CANCELED"],
      color: "bg-orange-500/10 text-orange-500"
    },
    {
      name: "Kiwify",
      description: "Integre vendas da Kiwify ao seu dashboard.",
      logo: "K",
      webhookUrl: "https://api.trackfy.io/webhooks/kiwify/v1/user_abc123",
      supportedEvents: ["order_approved", "order_refunded"],
      color: "bg-emerald-500/10 text-emerald-500"
    },
    {
      name: "Shopify",
      description: "Sincronize pedidos da sua loja Shopify.",
      logo: "S",
      webhookUrl: "https://api.trackfy.io/webhooks/shopify/v1/user_abc123",
      supportedEvents: ["orders/create", "orders/paid"],
      color: "bg-emerald-600/10 text-emerald-600"
    }
  ];

  return (
    <div className="space-y-8 pb-20 max-w-[1200px] mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase">Integrações</h1>
        <p className="text-[14px] font-bold text-muted-foreground uppercase tracking-widest">
          Conecte seu ecossistema de vendas à Trackfy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((item) => (
          <IntegrationCard key={item.name} {...item} />
        ))}
      </div>

      <WebhookSection />
    </div>
  );
}
