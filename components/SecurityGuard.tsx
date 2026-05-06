"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

const PUBLIC_ROUTES = ["/", "/auth-callback"];

export function SecurityGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, setIsAuthenticated, setUserEmail } = useAppStore();
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const client = supabase.client;
      
      if (client) {
        const { data: { session } } = await client.auth.getSession();
        if (session) {
          setIsAuthenticated(true);
          setUserEmail(session.user.email || "");
        } else {
          // If no session but state says authenticated, we might need to clear it
          // unless we are in demo mode (which we'll handle by checking persistence)
        }
      } else {
        // No supabase — we rely on the persisted store state for "Demo Mode"
      }
      
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes if supabase is active
    const client = supabase.client;
    if (client) {
      const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
        if (session) {
          setIsAuthenticated(true);
          setUserEmail(session.user.email || "");
        } else {
          setIsAuthenticated(false);
          setUserEmail("");
        }
      });
      return () => subscription.unsubscribe();
    }
  }, [setIsAuthenticated, setUserEmail]);

  useEffect(() => {
    if (!loading) {
      const isPublic = PUBLIC_ROUTES.includes(pathname);
      if (!isAuthenticated && !isPublic) {
        router.push("/");
      }
    }
  }, [loading, isAuthenticated, pathname, router]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#050505] z-[999]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-accent animate-spin" />
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Autenticando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
