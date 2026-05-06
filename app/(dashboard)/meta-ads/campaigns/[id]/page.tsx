import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function CampaignDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/meta-ads/campaigns">
          <Button variant="outline" size="icon" className="rounded-full">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black text-foreground tracking-tighter uppercase">Detalhes da Campanha</h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ID: {params.id}</p>
        </div>
      </div>

      <div className="p-20 text-center border border-dashed border-border rounded-3xl opacity-30">
        <p className="text-xs font-bold uppercase tracking-widest">Visualização detalhada em desenvolvimento.</p>
      </div>
    </div>
  );
}
