'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Video, Zap, User, Menu, X, LayoutDashboard, TrendingUp, Layers, ChevronRight } from 'lucide-react';
import { getSessionUser } from '@/lib/auth';

export const Navbar: React.FC = () => {
  const user = getSessionUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0F0F13]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#FE2C55] via-[#8B5CF6] to-[#25F4EE] p-0.5 shadow-lg group-hover:scale-105 transition-transform shrink-0">
            <div className="w-full h-full bg-[#0F0F13] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
              DramaFlow <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-mono font-normal border border-violet-500/30">AI</span>
            </span>
          </div>
        </Link>

        {/* Navigation Links (Desktop) */}
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

        {/* Action Button & Profile & Mobile Hamburger */}
        <div className="flex items-center space-x-2.5 sm:space-x-4">
          {/* Quick Credit Badge on mobile */}
          <div className="md:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold">
            <Zap className="w-3 h-3 text-violet-400 fill-violet-400" />
            <span>{user.creditsRemaining}</span>
          </div>

          <Link
            href="/studio/new"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 shadow-md shadow-violet-500/20 hover:shadow-violet-500/40 transition-all hover:scale-[1.02]"
          >
            Crear Drama en 60s
          </Link>

          <Link href="/dashboard" className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 hover:text-white hover:border-violet-500 transition-colors">
            <User className="w-4 h-4" />
          </Link>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#0F0F13]/98 backdrop-blur-2xl px-4 py-5 space-y-4 animate-fadeIn">
          <div className="space-y-1">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-zinc-300 hover:text-white text-sm font-medium transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                  <LayoutDashboard className="w-4 h-4" />
                </div>
                <span>Panel Principal</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </Link>

            <Link
              href="/studio/new"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-zinc-300 hover:text-white text-sm font-medium transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
                  <Video className="w-4 h-4" />
                </div>
                <span>Crear Minidrama (Studio)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </Link>

            <Link
              href="/dashboard#trends"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-zinc-300 hover:text-white text-sm font-medium transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span>Ganchos Virales TikTok</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </Link>
          </div>

          <div className="pt-3 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-violet-500/10 border border-violet-500/25">
              <div className="flex items-center gap-2 text-violet-300 text-xs font-semibold">
                <Zap className="w-4 h-4 text-violet-400 fill-violet-400" />
                <span>Créditos de Generación:</span>
              </div>
              <span className="text-sm font-black text-white">{user.creditsRemaining} / 100</span>
            </div>

            <Link
              href="/studio/new"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 text-center"
            >
              <Sparkles className="w-4 h-4" />
              <span>Crear Drama en 60s</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

