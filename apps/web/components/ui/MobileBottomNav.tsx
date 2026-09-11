'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutDashboard, Plus, Film, User, Zap } from 'lucide-react';
import { getSessionUser } from '@/lib/auth';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const user = getSessionUser();

  const navItems = [
    {
      label: 'Inicio',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      label: 'Panel',
      href: '/dashboard',
      icon: LayoutDashboard,
      isActive: pathname === '/dashboard',
    },
    {
      label: 'Crear',
      href: '/studio/new',
      isCenterAction: true,
      isActive: pathname.startsWith('/studio'),
    },
    {
      label: 'Studio',
      href: '/studio/new',
      icon: Film,
      isActive: pathname.startsWith('/studio') && pathname !== '/studio/new',
    },
    {
      label: `${user.creditsRemaining} Cr.`,
      href: '/dashboard#settings',
      icon: Zap,
      isActive: false,
    },
  ];

  return (
    <nav
      aria-label="Navegación Móvil"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0F0F13]/95 backdrop-blur-xl border-t border-white/10 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.8)]"
    >
      <div className="flex items-center justify-around px-2 py-2 h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          if (item.isCenterAction) {
            return (
              <Link
                key="create-action"
                href={item.href}
                className="group relative -top-3 flex flex-col items-center focus:outline-none"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FE2C55] via-[#8B5CF6] to-[#25F4EE] p-0.5 shadow-lg shadow-violet-600/40 group-active:scale-95 transition-transform">
                  <div className="w-full h-full bg-[#0F0F13] rounded-[14px] flex items-center justify-center group-hover:bg-transparent transition-colors">
                    <Plus className="w-6 h-6 text-white stroke-[2.5]" />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-white tracking-tight mt-0.5">
                  Crear
                </span>
              </Link>
            );
          }

          const Icon = item.icon!;
          const active = item.isActive;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 min-w-[56px] rounded-xl transition-all active:scale-95 ${
                active
                  ? 'text-violet-400 font-bold'
                  : 'text-zinc-400 hover:text-white font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 ${
                    active ? 'text-violet-400 scale-110' : 'text-zinc-400'
                  } transition-transform`}
                />
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-400 shadow-sm shadow-violet-400" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
