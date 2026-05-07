"use client";

import { cn } from "@/lib/utils";
import { 
  Bell, 
  Search, 
  Sun, 
  Moon, 
  User, 
  ChevronDown,
  Layout,
  Trophy,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function Topbar() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-16 border-b border-gray-100 bg-white flex items-center justify-between px-8 sticky top-0 z-50">
      {/* Page Title & Icons */}
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-bold text-gray-700 tracking-tight">Dashboard - Principal</h2>
        <div className="flex items-center gap-3">
           <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <Sun size={16} />
           </button>
           <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <Layout size={16} />
           </button>
           <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <ExternalLink size={16} />
           </button>
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-6">
        {/* Language */}
        <div className="flex items-center gap-1.5 cursor-pointer">
           <div className="w-5 h-4 bg-green-600 rounded-sm relative overflow-hidden flex items-center justify-center">
              <div className="w-2 h-2 bg-yellow-400 rotate-45" />
           </div>
           <span className="text-[10px] font-black text-gray-400 uppercase">PT-BR</span>
           <ChevronDown size={12} className="text-gray-400" />
        </div>

        {/* Awards */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
           <Trophy size={14} className="text-blue-600" />
           <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Prêmios</span>
           <div className="h-4 w-[1px] bg-blue-200 mx-1" />
           <span className="text-[10px] font-bold text-gray-500 uppercase">R$ 0,00 / R$ 1M</span>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
          <div className="flex flex-col items-end leading-none">
             <span className="text-xs font-black text-gray-700">Juan S T Gonz</span>
             <span className="text-[10px] font-bold text-gray-400 uppercase">Usuário</span>
          </div>
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-black">
              JG
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          </div>
        </div>
      </div>
    </header>
  );
}
