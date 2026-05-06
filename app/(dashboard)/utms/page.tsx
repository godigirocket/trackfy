import { UtmGenerator } from "@/components/utms/UtmGenerator";

export default function UtmsPage() {
  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase">Gerador de UTMs 🔗</h1>
        <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest">
          Rastreie a origem de cada venda com parâmetros profissionais.
        </p>
      </div>

      <UtmGenerator />
    </div>
  );
}
