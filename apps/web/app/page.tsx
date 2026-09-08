'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Zap, Video, ShieldCheck, TrendingUp, Users, CheckCircle2, Play, Layers } from 'lucide-react';
import { TikTokMobilePreview } from '@/components/studio/TikTokMobilePreview';

const DEMO_SCENES = [
  {
    scene_number: 1,
    duration_seconds: 5,
    character: 'Marcos (CEO)',
    dialogue: 'Tu campaña fue un desastre, Sofía. Cancelá el contrato ahora mismo.',
    visual_prompt: 'Confrontación tensa en sala de directorio moderna, iluminación cinematográfica lateral, retrato vertical 9:16 en 8k.',
    imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1080&h=1920&fit=crop&q=80',
    videoUrl: '/videos/sample_drama.mp4',
    camera_motion: 'zoom_in' as const,
  },
  {
    scene_number: 2,
    duration_seconds: 6,
    character: 'Sofía (Fundadora)',
    dialogue: 'Mirá las métricas en vivo, Marcos. No perdimos clientes, automatizamos todo el flujo y subió 400%.',
    visual_prompt: 'Fundadora joven y segura sosteniendo tablet holográfica con gráficos de crecimiento exponencial.',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1080&h=1920&fit=crop&q=80',
    videoUrl: '/videos/dramaflow_proj_master_01.mp4',
    camera_motion: 'pan_up' as const,
  },
  {
    scene_number: 3,
    duration_seconds: 7,
    character: 'Sofía (Fundadora)',
    dialogue: 'DramaFlow AI te genera y renderiza 20 micro-dramas para TikTok en menos de un minuto.',
    visual_prompt: 'Retrato cinematográfico de estudio moderno con luces de neón violeta y magenta.',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1080&h=1920&fit=crop&q=80',
    videoUrl: '/videos/dramaflow_proj_inmobiliaria_01.mp4',
    camera_motion: 'zoom_out' as const,
  },
];

export default function LandingPage() {
  const [activeScene, setActiveScene] = React.useState<number>(0);

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-violet-600/20 via-pink-600/20 to-cyan-400/10 blur-[130px] -z-10 rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Value Prop */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel-glow border border-violet-500/30 text-xs font-semibold text-violet-300">
                <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-spin-slow" />
                <span>Acceso exclusivo: primeros 10 usuarios beta</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
                Creá <span className="tiktok-gradient-text">Minidramas Virales</span> para TikTok en 60 Segundos
              </h1>

              <p className="text-lg text-zinc-300 max-w-2xl leading-relaxed">
                Transformá cualquier producto o servicio en episodios verticales 9:16 de altísima retención. Impulsado por <strong className="text-white">Vertex AI Gemini 2.0 Flash</strong>, voces neuronales con emoción, recorte de fondos 2.5D y subtítulos dinámicos sincronizados al milisegundo con Whisper.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link
                  href="/studio/new"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 shadow-xl shadow-violet-600/30 flex items-center justify-center gap-3 transition-all hover:scale-105"
                >
                  <Zap className="w-5 h-5 fill-white" />
                  <span>Empezar Gratis en el Studio</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto px-6 py-4 rounded-xl font-semibold text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 flex items-center justify-center gap-2 transition-colors"
                >
                  <Video className="w-4 h-4" />
                  <span>Ver Proyectos de Ejemplo</span>
                </Link>
              </div>

              {/* Feature Badges */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-white/10 text-left">
                <div>
                  <p className="text-2xl font-black text-white">92.8%</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Retención en los primeros 3s</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">&lt; 60s</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Renderizado en 1080p</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">10x</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Más clicks que un anuncio común</p>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Phone Simulator */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-tr from-violet-600/30 to-pink-600/30 rounded-[52px] blur-xl opacity-60 -z-10" />
                <TikTokMobilePreview
                  title="El Giro Inesperado"
                  hook="Tu campaña fue un desastre, Sofía. Cancelá el contrato ahora mismo."
                  scenes={DEMO_SCENES}
                  activeSceneIndex={activeScene}
                  onSelectSceneIndex={setActiveScene}
                  captionStyle="karaoke_bounce"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 bg-[#0c0c10] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-violet-400">Diseñado para la Viralidad</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">Todo el Laboratorio de Producción en un Solo Lugar</p>
            <p className="text-sm text-zinc-400">Las herramientas clave para romper el algoritmo de TikTok, Reels y YouTube Shorts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4 hover:border-violet-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center border border-violet-500/30">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Estructura Dramática en 3 Actos</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Gemini 2.0 Flash arma ganchos irresistibles en los primeros 3 segundos y remata con la propuesta de valor de tu negocio en el clímax emocional.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4 hover:border-pink-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-pink-600/20 text-pink-400 flex items-center justify-center border border-pink-500/30">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Subtítulos Karaoke con Whisper</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Sincronización milimétrica palabra por palabra con efectos de rebote estilo CapCut que retienen la atención de punta a punta.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4 hover:border-cyan-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Renderizado 9:16 con FFmpeg y Upscayl</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Efectos Ken Burns de cámara, atenuación automática de música bajo el diálogo y exportación en 1080p o 4K lista para publicar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-16 bg-gradient-to-b from-[#0c0c10] to-[#0F0F13] border-t border-white/10 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl font-extrabold text-white">¿Listo para crear tu primer minidrama?</h2>
          <p className="text-zinc-400 text-sm max-w-xl mx-auto">
            Sumate a los primeros 10 negocios que están escalando videos verticales con inteligencia artificial.
          </p>
          <Link
            href="/studio/new"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 shadow-xl shadow-violet-600/30 transition-all hover:scale-105"
          >
            <span>Abrir el Studio y Empezar</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
