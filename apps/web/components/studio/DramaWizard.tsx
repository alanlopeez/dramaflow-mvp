'use client';
import React, { useState } from 'react';
import { Sparkles, ArrowRight, Target, Flame, Lightbulb, ShieldAlert, Cpu, Sliders, Users, Image as ImageIcon, Package, Bot, CheckCircle2 } from 'lucide-react';
import { CustomAssetsLab, CustomCharacter, CustomProp, CustomLocation } from './CustomAssetsLab';
import { NEXO_ROUTER_MODELS } from '@/lib/nexo-router';

export interface WizardFormData {
  generationMode: 'ai_autonomous' | 'custom_assets';
  niche: string;
  valueProp: string;
  archetype: string;
  targetAudience: string;
  customInstructions: string;
  model?: string;
  customCharacters?: CustomCharacter[];
  customProps?: CustomProp[];
  customLocations?: CustomLocation[];
}

const ARCHETYPES = [
  {
    id: 'Fundador Subestimado vs Cliente Escéptico',
    title: 'Fundador Subestimado vs Cliente Escéptico',
    description: 'Confrontación tensa donde un cliente incrédulo queda mudo al ver resultados imposibles en vivo.',
    icon: Flame,
    color: 'from-amber-500/20 to-orange-500/20 border-orange-500/30 text-orange-400',
  },
  {
    id: 'Crisis a Medianoche en la Empresa',
    title: 'Crisis a Medianoche en la Empresa',
    description: 'Un fallo crítico amenaza el negocio entero hasta que tu producto lo resuelve en tiempo récord.',
    icon: ShieldAlert,
    color: 'from-rose-500/20 to-pink-500/20 border-pink-500/30 text-pink-400',
  },
  {
    id: 'Descubrimiento del Secreto Prohibido',
    title: 'Descubrimiento del Secreto Prohibido',
    description: 'Un empleado rebelde o innovador destapa el truco exacto que la competencia oculta a toda costa.',
    icon: Cpu,
    color: 'from-violet-500/20 to-cyan-500/20 border-cyan-500/30 text-cyan-400',
  },
  {
    id: 'Transformación de Cero a Héroe',
    title: 'Transformación de Cero a Héroe',
    description: 'Un dueño de negocio agotado logra un giro de 180 grados automatizando todo su laburo.',
    icon: Lightbulb,
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
  },
];

const NICHES = [
  'E-commerce y Tiendas Online',
  'SaaS B2B y Herramientas de IA',
  'Agencias de Marketing y Crecimiento',
  'Bienes Raíces e Inmobiliarias',
  'Fitness y Coaching de Salud',
  'Finanzas, Inversiones y Cripto',
];

const INITIAL_CHARACTERS: CustomCharacter[] = [
  {
    id: 'char_1',
    name: 'Elena (Fundadora)',
    role: 'Protagonista / Emprendedora',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    voiceProfile: 'founder_female',
  },
  {
    id: 'char_2',
    name: 'Marcos (Directivo)',
    role: 'Antagonista / Cliente Escéptico',
    imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80',
    voiceProfile: 'executive_male',
  }
];

const INITIAL_PROPS: CustomProp[] = [
  {
    id: 'prop_1',
    name: 'Tablet Holográfica con Dashboard IA',
    category: 'Software / Dispositivo',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&auto=format&fit=crop&q=80',
    sceneTarget: 2,
  },
  {
    id: 'prop_2',
    name: 'Packaging de Producto Premium',
    category: 'Producto Físico',
    imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&auto=format&fit=crop&q=80',
    sceneTarget: 4,
  }
];

const INITIAL_LOCATIONS: CustomLocation[] = [
  {
    id: 'loc_1',
    name: 'Sala de Directorio en Rascacielos',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&auto=format&fit=crop&q=80',
    sceneNumber: 1,
  },
  {
    id: 'loc_2',
    name: 'Estudio de Innovación y Laboratorio Moderno',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop&q=80',
    sceneNumber: 4,
  }
];

interface Props {
  initialData?: Partial<WizardFormData>;
  onSubmit: (data: WizardFormData) => void;
  isLoading: boolean;
}

export const DramaWizard: React.FC<Props> = ({ initialData, onSubmit, isLoading }) => {
  const [generationMode, setGenerationMode] = useState<'ai_autonomous' | 'custom_assets'>('ai_autonomous');
  const [niche, setNiche] = useState<string>(initialData?.niche || NICHES[0]);
  const [valueProp, setValueProp] = useState<string>(initialData?.valueProp || 'Automatiza la captación de clientes y duplica las ventas en 48 horas');
  const [archetype, setArchetype] = useState<string>(initialData?.archetype || ARCHETYPES[0].id);
  const [targetAudience, setTargetAudience] = useState<string>(initialData?.targetAudience || 'Dueños de negocios que buscan escalar rápido');
  const [customInstructions, setCustomInstructions] = useState<string>(initialData?.customInstructions || '');
  const [selectedModel, setSelectedModel] = useState<string>(initialData?.model || 'google/gemini-2.0-flash-001');

  // Custom Assets State
  const [customCharacters, setCustomCharacters] = useState<CustomCharacter[]>(INITIAL_CHARACTERS);
  const [customProps, setCustomProps] = useState<CustomProp[]>(INITIAL_PROPS);
  const [customLocations, setCustomLocations] = useState<CustomLocation[]>(INITIAL_LOCATIONS);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      generationMode,
      niche,
      valueProp,
      archetype,
      targetAudience,
      customInstructions,
      model: selectedModel,
      customCharacters: generationMode === 'custom_assets' ? customCharacters : undefined,
      customProps: generationMode === 'custom_assets' ? customProps : undefined,
      customLocations: generationMode === 'custom_assets' ? customLocations : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 max-w-3xl mx-auto w-full">
      {/* Header Banner */}
      <div className="p-4 sm:p-6 rounded-2xl glass-panel-glow border border-violet-500/30 space-y-2">
        <div className="flex items-center gap-2 text-violet-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>Paso 1 de 3: Modo de Generación y Concepto</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Elegí cómo querés crear tu Minidrama
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          Podés generar un video 100% con inteligencia artificial o tomar el control total subiendo personajes con foto real, escenarios y productos.
        </p>
      </div>

      {/* Niche Selection */}
      <div className="space-y-3">
        <label className="text-xs sm:text-sm font-semibold text-zinc-300 flex items-center gap-2">
          <Target className="w-4 h-4 text-violet-400 shrink-0" />
          Elegí tu Nicho o Industria
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
          {NICHES.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setNiche(n)}
              className={`p-2.5 sm:p-3 rounded-xl text-xs font-medium border text-left transition-all min-h-[44px] flex items-center ${
                niche === n
                  ? 'border-violet-500 bg-violet-500/15 text-white ring-1 ring-violet-500 shadow-md shadow-violet-500/10'
                  : 'border-white/10 bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <span className="truncate">{n}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Business Value Proposition */}
      <div className="space-y-2">
        <label className="text-xs sm:text-sm font-semibold text-zinc-300">
          Propuesta de Valor de tu Negocio / Arma Secreta
        </label>
        <input
          type="text"
          value={valueProp}
          onChange={(e) => setValueProp(e.target.value)}
          placeholder="Ej: Software de IA que reduce los costos operativos un 50% en una semana"
          required
          className="w-full px-3.5 sm:px-4 py-3 rounded-xl bg-zinc-900/80 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-xs sm:text-sm transition-all min-h-[46px]"
        />
        <p className="text-[11px] sm:text-xs text-zinc-500">
          Esta será la revelación clímax que resuelve el conflicto en la última escena.
        </p>
      </div>

      {/* Drama Archetype Cards */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-zinc-300">
          Elegí el Arquetipo de Tensión
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {ARCHETYPES.map((arch) => {
            const Icon = arch.icon;
            const isSelected = archetype === arch.id;
            return (
              <div
                key={arch.id}
                onClick={() => setArchetype(arch.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/15 ring-1 ring-violet-500'
                    : 'border-white/10 bg-zinc-900/50 hover:bg-zinc-900/80 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-tr ${arch.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-white">{arch.title}</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{arch.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Audience & Tone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-300">Público Objetivo</label>
          <input
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/80 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-300">Instrucciones Adicionales (Opcional)</label>
          <input
            type="text"
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="Ej: Incluir fondo de oficina moderna, ritmo picado"
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/80 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
          />
        </div>
      </div>

      {/* Autonomous AI Engine Pipeline Active Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-gradient-to-r from-violet-950/40 via-purple-950/30 to-slate-900/50 border border-violet-500/25">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <div className="absolute w-4 h-4 rounded-full bg-emerald-400/40 animate-ping" />
          </div>
          <span className="text-xs font-bold text-white">Pipeline Autónomo Cinematográfico SOTA</span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300 font-mono">
            Full Auto Stack
          </span>
        </div>
        <div className="text-[11px] text-zinc-400 font-medium">
          Multi-Agente CrewAI • LivePortrait • F5-TTS • WhisperX Sync
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 min-h-[48px]"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
            <span className="truncate">Generando minidrama personalizado con IA...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 shrink-0" />
            <span className="truncate">Crear Minidrama ({generationMode === 'custom_assets' ? 'Con Tus Personajes' : '100% IA'})</span>
            <ArrowRight className="w-5 h-5 shrink-0" />
          </>
        )}
      </button>
    </form>
  );
};
