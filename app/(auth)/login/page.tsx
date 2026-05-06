"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Search, Zap } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const handleMetaLogin = () => {
    window.location.href = "/api/meta/auth";
  };

  const handleGoogleLogin = () => {
    window.location.href = "/api/google/auth";
  };

  return (
    <Card className="border-border bg-card shadow-2xl">
      <CardHeader className="space-y-4 text-center pb-8">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <Zap className="w-7 h-7 text-primary-foreground" />
        </div>
        <div className="space-y-2">
          <CardTitle className="text-3xl font-black tracking-tighter uppercase">TrackFY</CardTitle>
          <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Growth OS — Marketing Command Center
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleMetaLogin}
          className="w-full h-14 bg-[#1877F2] hover:bg-[#166fe5] text-white font-black text-sm uppercase tracking-widest gap-3 rounded-2xl"
        >
          <Globe className="w-5 h-5 fill-white" />
          Conectar Meta Ads
        </Button>
        <Button 
          onClick={handleGoogleLogin}
          variant="outline"
          className="w-full h-14 border-border hover:bg-muted text-foreground font-black text-sm uppercase tracking-widest gap-3 rounded-2xl"
        >
          <Search className="w-5 h-5" />
          Conectar Google Ads
        </Button>

        <div className="pt-6 text-center">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
            Ao entrar, você concorda com nossos <br />
            <Link href="#" className="text-primary hover:underline">Termos de Uso</Link> e <Link href="#" className="text-primary hover:underline">Privacidade</Link>.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
