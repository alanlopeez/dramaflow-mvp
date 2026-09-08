'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Video, Zap, User, CreditCard } from 'lucide-react';
import { getSessionUser } from '@/lib/auth';

export const Navbar: React.FC = () => {
  const user = getSessionUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0F0F13]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FE2C55] via-[#8B5CF6] to-[#25F4EE] p-0.5 shadow-lg group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0F0F13] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
              DramaFlow <span className="text-xs px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-mono font-normal border border-violet-500/30">AI</span>
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-zinc-400">
          <Link href="/dashboard" className="hover:text-white transition-colors">Panel Principal</Link>
          <Link href="/studio/new" className="hover:text-white transition-colors flex items-center gap-1">
            <Video className="w-4 h-4 text-violet-400" />
            Nuevo Minidrama
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs">
            <Zap className="w-3.5 h-3.5 text-violet-400 fill-violet-400" />
            <span>{user.creditsRemaining} Créditos</span>
          </div>
        </nav>

        {/* Action Button & Profile */}
        <div className="flex items-center space-x-4">
          <Link
            href="/studio/new"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 shadow-md shadow-violet-500/20 hover:shadow-violet-500/40 transition-all hover:scale-[1.02]"
          >
            Crear Drama en 60s
          </Link>
          <Link href="/dashboard" className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 hover:text-white hover:border-violet-500 transition-colors">
            <User className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
};
