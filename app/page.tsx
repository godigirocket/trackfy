import Link from "next/link";
import { TrendingUp, Facebook, Zap, Tag, DollarSign, Bot, ArrowRight, CheckCircle, Shield, BarChart2, Target, Users, Sparkles } from "lucide-react";

const features = [
  { icon: Facebook,   title: "Meta Ads Manager",    desc: "Tabela expansível com campanhas, conjuntos e anúncios. Edição inline, toggles e duplicação." },
  { icon: Bot,        title: "IA Integrada",         desc: "Assistente com Gemini AI que analisa métricas e sugere otimizações em tempo real." },
  { icon: Zap,        title: "Automações",           desc: "Regras automáticas: pausar campanhas com CPL alto, escalar as vencedoras e muito mais." },
  { icon: Tag,        title: "Gerador de UTMs",      desc: "Crie e gerencie parâmetros UTM para rastrear a origem de cada conversão." },
  { icon: DollarSign, title: "Módulo Financeiro",    desc: "Importe vendas via CSV e calcule ROAS, lucro e receita bruta automaticamente." },
  { icon: BarChart2,  title: "Relatórios Avançados", desc: "Funil de conversão, heatmap de horários, audiência e exportação CSV/PDF." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--text-1)" }}>
      {/* Nav */}
      <nav
        className="sticky top-0 z-10 border-b"
        style={{ background: "var(--overlay)", backdropFilter: "blur(20px)", borderColor: "var(--border)" }}
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--blue)", boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 11L5.5 7L8.5 9.5L11.5 5L14 7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="14" cy="7" r="1.2" fill="white"/>
              </svg>
            </div>
            <span className="font-bold text-[15px] tracking-tight" style={{ color: "var(--text-1)" }}>Trackfy</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[14px] font-medium transition-colors" style={{ color: "var(--text-3)" }}>
              Entrar
            </Link>
            <Link href="/login" className="btn-primary px-4 py-2">Começar gratis</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-[12px] font-semibold"
          style={{ background: "var(--blue-light)", border: "1px solid rgba(37,99,235,0.2)", color: "var(--blue)" }}
        >
          <Sparkles className="w-3.5 h-3.5" strokeWidth={2.5} />
          Novo: Integração com Gemini AI
        </div>
        <h1 className="text-[44px] md:text-[56px] font-bold tracking-tight max-w-3xl mx-auto leading-[1.15]" style={{ color: "var(--text-1)", letterSpacing: "-0.03em" }}>
          Gerencie seus Meta Ads com{" "}
          <span className="text-gradient">inteligência artificial</span>
        </h1>
        <p className="mt-5 text-[18px] max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--text-3)" }}>
          Plataforma completa para gestão de campanhas Meta Ads. Tabela expansível, automações, análise de criativos e IA integrada.
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          <Link href="/login" className="btn-primary px-6 py-3 text-[15px]">
            Começar gratis <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
          <Link href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[15px] font-semibold transition-all duration-150"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-2)", boxShadow: "var(--shadow-sm)" }}>
            Ver demo
          </Link>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-4)", marginTop: 16 }}>Sem cartão de crédito. Gratis para sempre no plano básico.</p>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-[28px] font-bold tracking-tight" style={{ color: "var(--text-1)", letterSpacing: "-0.02em" }}>
            Tudo que você precisa para escalar
          </h2>
          <p style={{ fontSize: 16, color: "var(--text-3)", marginTop: 8 }}>
            Ferramentas profissionais para gestores de tráfego e agências
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: "var(--blue-light)" }}>
                <f.icon className="w-[18px] h-[18px]" style={{ color: "var(--blue)" }} strokeWidth={2} />
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 6, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="border-y py-12" style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 24 }}>
            Confiado por gestores de tráfego em todo o Brasil
          </p>
          <div className="grid grid-cols-3 gap-8">
            {[
              { value: "R$ 2M+", label: "Gerenciados mensalmente" },
              { value: "500+",   label: "Campanhas ativas" },
              { value: "98%",    label: "Satisfação dos usuários" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-[28px] font-bold tracking-tight" style={{ color: "var(--blue)", letterSpacing: "-0.02em" }}>{s.value}</p>
                <p style={{ fontSize: 13, color: "var(--text-4)", marginTop: 4 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-[28px] font-bold tracking-tight" style={{ color: "var(--text-1)", letterSpacing: "-0.02em" }}>
          Pronto para otimizar suas campanhas?
        </h2>
        <p style={{ fontSize: 15, color: "var(--text-3)", marginTop: 8, marginBottom: 24 }}>
          Configure em menos de 5 minutos. Sem instalação necessária.
        </p>
        <div className="flex items-center justify-center gap-5 flex-wrap mb-8">
          {["Sem cartão de crédito", "Dados seguros", "Suporte em português"].map((item) => (
            <div key={item} className="flex items-center gap-2" style={{ fontSize: 14, color: "var(--text-3)" }}>
              <CheckCircle className="w-4 h-4" style={{ color: "var(--green)" }} strokeWidth={2.5} />
              {item}
            </div>
          ))}
        </div>
        <Link href="/login" className="btn-primary px-8 py-3 text-[15px]">
          Criar conta gratis <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t py-6" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "var(--blue)" }}>
              <TrendingUp className="w-3 h-3 text-white" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-2)" }}>Trackfy</span>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-4)" }}>2024 Trackfy. Todos os direitos reservados.</p>
          <div className="flex items-center gap-1.5" style={{ fontSize: 12, color: "var(--text-4)" }}>
            <Shield className="w-3.5 h-3.5" strokeWidth={2} /> Dados protegidos
          </div>
        </div>
      </footer>
    </div>
  );
}
