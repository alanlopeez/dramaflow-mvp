'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Cpu,
  Zap,
  CheckCircle2,
  Volume2,
  Sliders,
  Film,
  Camera,
  Layers,
  Flame,
  Award
} from 'lucide-react';
import { NEXO_ROUTER_MODELS } from '@/lib/nexo-router';

interface EngineSuiteProps {
  selectedVoice: string;
  onSelectVoice: (voiceId: string) => void;
  selectedEmotion: string;
  onSelectEmotion: (emotion: string) => void;
  selectedEngine?: string;
  onSelectEngine?: (engine: string) => void;
  selectedAIModel?: string;
  onSelectAIModel?: (modelId: string) => void;
  enableParallax?: boolean;
  onToggleParallax?: (enabled: boolean) => void;
  resolutionMode?: string;
  onSelectResolution?: (mode: string) => void;
  niche?: string;
  liveContextData?: any;
}

const CINEMATIC_STYLES = [
  {
    id: 'hyperrealistic_8k',
    name: 'Hiperrealismo 8K Cinematográfico',
    description: 'Lente 85mm, profundidad de campo reducida, iluminación anamórfica y textura de piel natural.',
    badge: 'Recomendado',
    color: 'border-violet-500 bg-violet-500/10 text-violet-300'
  },
  {
    id: 'hbo_thriller',
    name: 'Serie HBO / Thriller Corporativo',
    description: 'Tonos fríos, claroscuro marcado, tensión psicológica y encuadre vertical envolvente.',
    badge: 'Alta Tensión',
    color: 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
  },
  {
    id: 'tiktok_viral',
    name: 'TikTok Viral / Neón & Glow',
    description: 'Contraste elevado, colores saturados, ritmo acelerado y ganchos visuales en los primeros 2s.',
    badge: 'Mayor Retención',
    color: 'border-pink-500 bg-pink-500/10 text-pink-300'
  },
  {
    id: 'forbes_documentary',
    name: 'Documental Ejecutivo Forbes',
    description: 'Luz natural de oficina moderna de rascacielos, estética sobria y elegancia empresarial.',
    badge: 'B2B & Ventas',
    color: 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
  }
];

const VOICES = [
  {
    id: 'founder_female',
    name: 'Elena — Protagonista Emprendedora',
    gender: 'Femenino',
    tone: 'Firme, segura y apasionada',
    previewText: 'Mirá bien las métricas. Automatizamos todo el flujo y multiplicamos las ventas por cuatro.',
  },
  {
    id: 'executive_male',
    name: 'Marcos — Ejecutivo / Antagonista',
    gender: 'Masculino',
    tone: 'Escéptico, desafiante y con autoridad',
    previewText: 'Pará un segundo... ¿cómo conseguiste estos números en tiempo récord?',
  },
];

export const EngineSuitePanel: React.FC<EngineSuiteProps> = ({
  selectedVoice,
  onSelectVoice,
  selectedEmotion,
  onSelectEmotion,
  selectedAIModel = 'anthropic/claude-3.5-sonnet',
  onSelectAIModel,
  resolutionMode = '1080p_fhd',
  onSelectResolution,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<string>('hyperrealistic_8k');
  const [isPlayingVoice, setIsPlayingVoice] = useState<string | null>(null);

  const handlePlayVoicePreview = (voiceId: string, text: string) => {
    setIsPlayingVoice(voiceId);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 1.05;
      utterance.onend = () => setIsPlayingVoice(null);
      utterance.onerror = () => setIsPlayingVoice(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingVoice(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner - Powered by OpenRouter */}
      <div className="p-5 rounded-2xl glass-panel-glow border border-violet-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/30">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-white tracking-tight">
                Motor Central Unificado OpenRouter AI
              </h3>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold border border-emerald-500/30">
                OPENROUTER_API_KEY CONECTADA
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Generación de guiones cinematográficos, actuación dramática y prompts visuales hiperrealistas 9:16.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-white/5">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Fidelidad de Guion: <strong>Máxima (SOTA)</strong></span>
        </div>
      </div>

      {/* 1. OpenRouter Model Selector */}
      <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Modelo de IA & Razonamiento Narrativo</h4>
              <p className="text-[11px] text-zinc-400">Seleccioná el cerebro de IA para la tensión dramática y los diálogos</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {NEXO_ROUTER_MODELS.map((m) => {
            const isSelected = selectedAIModel === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelectAIModel && onSelectAIModel(m.id)}
                className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-pink-500 bg-pink-500/15 text-white ring-2 ring-pink-500/40 shadow-lg shadow-pink-500/20'
                    : 'border-white/10 bg-zinc-900/60 text-zinc-400 hover:border-pink-500/40 hover:bg-zinc-800/80 hover:text-zinc-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-white leading-tight">{m.name}</span>
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-medium">
                        {m.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-snug">{m.description}</p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[9px]">
                  <span className="text-pink-400 font-medium">{m.provider}</span>
                  <span className="text-zinc-500">{m.recommendedFor}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Cinematic Visual Style Presets */}
      <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Estilo Visual Cinematográfico 9:16</h4>
            <p className="text-[11px] text-zinc-400">Define la iluminación, textura y acabado fotográfico de las escenas</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CINEMATIC_STYLES.map((style) => {
            const isSelected = selectedStyle === style.id;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => setSelectedStyle(style.id)}
                className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? `${style.color} ring-2 ring-violet-500/40 shadow-lg shadow-violet-500/20`
                    : 'border-white/10 bg-zinc-900/60 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-white">{style.name}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-medium">
                      {style.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-snug">{style.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Voice Actor Selector */}
      <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Perfil de Voces y Doblaje en Español</h4>
            <p className="text-[11px] text-zinc-400">Voces sincronizadas con la emoción del diálogo</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {VOICES.map((v) => {
            const isSelected = selectedVoice === v.id;
            return (
              <div
                key={v.id}
                onClick={() => onSelectVoice(v.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-violet-500 bg-violet-500/15 text-white ring-1 ring-violet-500 shadow-md shadow-violet-500/20'
                    : 'border-white/10 bg-zinc-900/60 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{v.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      {v.gender}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400">{v.tone}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayVoicePreview(v.id, v.previewText);
                    }}
                    className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-1 font-medium"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>{isPlayingVoice === v.id ? 'Reproduciendo...' : 'Escuchar muestra'}</span>
                  </button>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
