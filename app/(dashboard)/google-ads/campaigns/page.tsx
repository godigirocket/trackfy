import { GoogleCampaignsTable } from "@/components/google/GoogleCampaignsTable";

export default function GoogleCampaignsPage() {
  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase">Google Ads Manager 🟦</h1>
        <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest">
          Gerencie suas campanhas de Pesquisa, PMax, Display e YouTube.
        </p>
      </div>

      <GoogleCampaignsTable />
    </div>
  );
}
