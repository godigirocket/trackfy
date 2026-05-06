import { CampaignsTable } from "@/components/meta/CampaignsTable";

export default function MetaCampaignsPage() {
  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase">Meta Ads Manager 🟦</h1>
        <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest">
          Gerencie suas campanhas, conjuntos e anúncios do Facebook & Instagram.
        </p>
      </div>

      <CampaignsTable />
    </div>
  );
}
