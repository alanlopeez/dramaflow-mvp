'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Film, Sparkles, TrendingUp, Settings, HelpCircle, Layers } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Panel Principal', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Drama Studio', href: '/studio/new', icon: Film },
  { label: 'Ganchos Virales', href: '/dashboard#trends', icon: TrendingUp },
  { label: 'Plantillas', href: '/dashboard#templates', icon: Layers },
  { label: 'Ajustes y API', href: '/dashboard#settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-white/10 bg-[#0F0F13] flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Navegación</p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-violet-600/15 text-violet-300 border border-violet-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-violet-400' : 'text-zinc-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="p-4 rounded-xl glass-panel-glow border border-violet-500/30 space-y-3">
          <div className="flex items-center gap-2 text-violet-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Acceso Beta Exclusivo</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Generá minidramas virales 9:16 sin límites con Vertex AI y Cloud Run.
          </p>
          <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-violet-500 to-pink-500 h-full w-3/4 rounded-full" />
          </div>
          <p className="text-[11px] text-zinc-500 text-right">48 / 100 Créditos consumidos</p>
        </div>
      </div>

      <div className="pt-4 border-t border-white/10 text-xs text-zinc-500 flex items-center justify-between">
        <span>GCP: us-central1</span>
        <span className="text-emerald-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Activo
        </span>
      </div>
    </aside>
  );
};
