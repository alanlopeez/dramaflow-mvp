'use client';

import React from 'react';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  Film,
  Cpu,
  Layers,
  Volume2,
  Subtitles,
  ShieldCheck,
  Video,
  Activity,
} from 'lucide-react';

interface AutonomousEngineStatusProps {
  niche?: string;
  enableParallax: boolean;
  onToggleParallax: (val: boolean) => void;
  sceneCount: number;
}

export const AutonomousEngineStatus: React.FC<AutonomousEngineStatusProps> = ({
  niche = 'Negocios & SaaS',
  enableParallax,
  onToggleParallax,
  sceneCount,
}) => {
  const PIPELINE_MODULES = [
    {
      title: 'Consistencia Facial InstantID',
      desc: 'Bloqueo biométrico del rostro para mantener los mismos personajes en las 4 escenas.',
      badge: 'InstantID + InsightFace',
      icon: Layers,
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/10 border-violet-500/30',
      status: 'ACTIVO',
    },
    {
      title: 'Microexpresiones & Lip-Sync LivePortrait',
      desc: 'Sincronización labial y respiración orgánica a 30 FPS impulsada por el audio.',
      badge: 'LivePortrait 30fps',
      icon: Video,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10 border-pink-500/30',
      status: 'ACTIVO',
    },
    {
      title: 'Síntesis Vocal Emocional Multi-Personaje',
      desc: 'Voces diferenciadas: Marcos (Antagonista furioso) y Elena (Fundadora segura).',
      badge: 'F5-TTS / Neural2',
      icon: Volume2,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/30',
      status: 'ACTIVO',
    },
    {
      title: 'Alineación Forzada de Subtítulos WhisperX',
      desc: 'Subtitulado dinámico palabra por palabra en el 100% de las escenas sin cortes.',
      badge: 'WhisperX Word-Level',
      icon: Subtitles,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/30',
      status: 'SINCRONIZADO',
    },
    {
      title: 'Composición Vertical Remotion 9:16',
      desc: 'Cámara cinemática Ken Burns, audio ducking (-18dB) y rebote karaoke para TikTok.',
      badge: 'Remotion Engine',
      icon: Film,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/30',
      status: 'EN VIVO',
    },
  ];

  return (
    <div className="p-6 rounded-2xl glass-panel-glow border border-violet-500/30 space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              Pipeline Cinematográfico Autónomo SOTA
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Combinación automática del stack completo de IA generativa para maximizar retención en TikTok y Reels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>Stack Unificado Activo</span>
          </span>
        </div>
      </div>

      {/* Grid of Autonomous Engines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {PIPELINE_MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.title}
              className={`p-3.5 rounded-xl border ${mod.bgColor} flex items-start gap-3 transition-all hover:bg-white/[0.04]`}
            >
              <div className={`p-2 rounded-lg bg-black/40 ${mod.color} shrink-0 mt-0.5`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-bold text-white truncate">{mod.title}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 font-mono shrink-0">
                    {mod.status}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">{mod.desc}</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="text-[10px] text-zinc-500 font-mono">Motor:</span>
                  <span className={`text-[10px] font-semibold font-mono ${mod.color}`}>
                    {mod.badge}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Quality Enhancements */}
      <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-violet-400" />
          <div>
            <span className="font-semibold text-zinc-200">Profundidad Cinemática 2.5D:</span>
            <p className="text-[11px] text-zinc-400">
              Capa de personajes recortada en primer plano con desenfoque de fondo y paralaje.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onToggleParallax(!enableParallax)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            enableParallax
              ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
              : 'bg-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          {enableParallax ? '✓ Activado' : 'Desactivado'}
        </button>
      </div>
    </div>
  );
};
