'use client';

import React from 'react';
import { Type, Sparkles, Zap, Check } from 'lucide-react';

export interface CaptionPreset {
  id: string;
  name: string;
  description: string;
  previewBg: string;
  textColor: string;
  highlightColor: string;
}

export const CAPTION_PRESETS: CaptionPreset[] = [
  {
    id: 'karaoke_bounce',
    name: 'TikTok Karaoke Rebote',
    description: 'Resaltado palabra por palabra en amarillo/cyan con rebote dinámico para máxima retención',
    previewBg: 'bg-zinc-900',
    textColor: 'text-white',
    highlightColor: 'text-yellow-300 font-extrabold',
  },
  {
    id: 'hormozi_glow',
    name: 'Hormozi Neón Glow',
    description: 'Mayúsculas de alto impacto con resplandor verde neón y amarillo para frases clave',
    previewBg: 'bg-zinc-900',
    textColor: 'text-white font-black tracking-tight',
    highlightColor: 'text-emerald-400 font-black',
  },
  {
    id: 'mrbeast_yellow',
    name: 'MrBeast Amarillo Viral',
    description: 'Tipografía pesada con trazo negro grueso y amarillo eléctrico dominante',
    previewBg: 'bg-zinc-900',
    textColor: 'text-yellow-400 font-black tracking-tight',
    highlightColor: 'text-white font-bold',
  },
  {
    id: 'cinematic_minimal',
    name: 'Minimalista Ejecutivo',
    description: 'Estética limpia y moderna ideal para marcas B2B y contenido corporativo',
    previewBg: 'bg-zinc-900',
    textColor: 'text-zinc-200 font-medium tracking-wide',
    highlightColor: 'text-violet-400 font-semibold',
  },
];

interface Props {
  selectedStyle: string;
  onSelectStyle: (styleId: string) => void;
}

export const CaptionStyleSelector: React.FC<Props> = ({ selectedStyle, onSelectStyle }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
          <Type className="w-4 h-4 text-violet-400" />
          <span>Subtítulos Dinámicos y Tipografía con OpenAI Whisper</span>
        </label>
        <span className="text-xs text-zinc-500 font-mono">Sincronización ASS / SRT</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {CAPTION_PRESETS.map((preset) => {
          const isSelected = selectedStyle === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectStyle(preset.id)}
              className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/10 ring-1 ring-violet-500'
                  : 'border-white/10 bg-zinc-900/60 hover:border-white/20 hover:bg-zinc-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-xs text-white">{preset.name}</span>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-2">{preset.description}</p>
              </div>

              {/* Mini Preview Chip */}
              <div className="mt-3 py-2 px-2.5 rounded-lg bg-black/60 border border-white/5 flex items-center justify-center text-center">
                <span className={`text-[11px] ${preset.textColor}`}>
                  Secreto <span className={preset.highlightColor}>Minidrama</span> Viral
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
