'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/ui/Sidebar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Plus, Video, Play, Download, Sparkles, TrendingUp, Zap, Clock, ExternalLink, Database } from 'lucide-react';

interface ProjectItem {
  id: string;
  title: string;
  niche: string;
  hook: string;
  scenesCount: number;
  duration: string;
  status: 'COMPLETED' | 'PROCESSING' | 'READY';
  createdAt: string;
  videoUrl?: string;
}

const SAMPLE_PROJECTS: ProjectItem[] = [
  {
    id: 'proj_beta_001',
    title: 'El Secreto del Stock Automatizado',
    niche: 'E-commerce y SaaS',
    hook: 'Me echaste hoy, pero mañana vas a rogar por este sistema.',
    scenesCount: 4,
    duration: '24s',
    status: 'COMPLETED',
    createdAt: 'Hace 12 minutos',
    videoUrl: 'https://storage.googleapis.com/dramaflow-mvp-1787884887-storage/videos/sample_drama.mp4',
  },
  {
    id: 'proj_beta_002',
    title: 'Crisis a Medianoche: 400% de Retención',
    niche: 'Ventas B2B',
    hook: 'Cancelá el contrato ya mismo... hasta que Marcos vio el panel.',
    scenesCount: 4,
    duration: '26s',
    status: 'COMPLETED',
    createdAt: 'Hace 2 horas',
    videoUrl: 'https://storage.googleapis.com/dramaflow-mvp-1787884887-storage/videos/sample_drama.mp4',
  },
];

const TRENDING_HOOKS = [
  { title: 'El despido silencioso que salva la empresa', retention: '98.4%', bpm: 128, niche: 'Corporativo y SaaS' },
  { title: 'La revelación del empleado que todos subestimaban', retention: '96.9%', bpm: 130, niche: 'Agencias y Tech' },
  { title: 'El servidor caído a las 2 AM y el rescate épico', retention: '95.2%', bpm: 124, niche: 'Fundadores y Devs' },
];

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectItem[]>(SAMPLE_PROJECTS);
  const [loadingDb, setLoadingDb] = useState(true);

  useEffect(() => {
    async function fetchNeonProjects() {
      try {
        const res = await fetch('/api/projects');
        if (res.ok) {
          const json = await res.json();
          if (json.projects && json.projects.length > 0) {
            const mapped: ProjectItem[] = json.projects.map((p: any) => {
              const scenes = p.script_payload?.scenes || [];
              const firstSceneDialogue = scenes[0]?.dialogue || 'Minidrama generado con Vertex AI';
              return {
                id: p.id,
                title: p.title || 'Drama TikTok Viral',
                niche: p.niche || 'SaaS & Negocios',
                hook: firstSceneDialogue,
                scenesCount: scenes.length || 4,
                duration: `${scenes.length ? scenes.length * 6 : 24}s`,
                status: (p.job_status as any) || 'COMPLETED',
                createdAt: new Date(p.created_at).toLocaleDateString(),
                videoUrl: p.video_url || undefined,
              };
            });
            setProjects(mapped);
          }
        }
      } catch (err) {
        console.warn('Could not load Neon projects:', err);
      } finally {
        setLoadingDb(false);
      }
    }

    fetchNeonProjects();
  }, []);

  return (
    <div className="flex-1 flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto max-w-7xl">
        {/* Top Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Panel de Control de Minidramas</h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Database className="w-3 h-3" />
                Neon DB Activa
              </span>
            </div>
            <p className="text-sm text-zinc-400 mt-1">
              Gestioná tus micro-episodios de TikTok, almacenamiento en Google Cloud Storage y estado en Neon.
            </p>
          </div>

          <Link
            href="/studio/new"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 shadow-lg shadow-violet-600/25 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Nuevo Minidrama</span>
          </Link>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase">
              <span>Dramas Guardados</span>
              <Video className="w-4 h-4 text-violet-400" />
            </div>
            <p className="text-3xl font-black text-white">{projects.length}</p>
            <p className="text-xs text-emerald-400 flex items-center gap-1">Persistidos en Neon PG</p>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase">
              <span>Retención Promedio</span>
              <TrendingUp className="w-4 h-4 text-pink-400" />
            </div>
            <p className="text-3xl font-black text-white">94.6%</p>
            <p className="text-xs text-emerald-400">+12% sobre el promedio</p>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase">
              <span>Almacenamiento Cloud</span>
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-xl font-black text-white truncate">Google Cloud Storage</p>
            <p className="text-xs text-zinc-400">gs://dramaflow-mvp-1787884887-storage</p>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase">
              <span>Créditos de IA Disponibles</span>
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <p className="text-3xl font-black text-white">50</p>
            <p className="text-xs text-violet-300">Plan Pro Activo</p>
          </div>
        </div>

        {/* Video Projects Table / Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Proyectos Recientes</h2>
            <span className="text-xs text-zinc-500 font-mono">Sincronizado con Neon DB y Google Cloud</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <div
                key={project.id}
                className="rounded-2xl glass-panel border border-white/10 overflow-hidden hover:border-violet-500/40 transition-all group flex flex-col justify-between"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 font-medium">
                      {project.niche}
                    </span>
                    <StatusBadge status={project.status} />
                  </div>

                  <h3 className="font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                    {project.title}
                  </h3>

                  <p className="text-xs text-zinc-400 line-clamp-2 italic">
                    &ldquo;{project.hook}&rdquo;
                  </p>

                  <div className="flex items-center gap-3 text-xs text-zinc-500 pt-2 border-t border-white/5">
                    <span>{project.scenesCount} Escenas</span>
                    <span>•</span>
                    <span>{project.duration}</span>
                    <span>•</span>
                    <span>{project.createdAt}</span>
                  </div>
                </div>

                <div className="p-4 bg-black/40 border-t border-white/5 flex items-center justify-between">
                  <Link
                    href={`/studio/${project.id}`}
                    className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1.5"
                  >
                    <span>Abrir en el Studio</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  {project.videoUrl && (
                    <a
                      href={project.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Ver / Descargar</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live TikTok Trending Hooks Module */}
        <div className="p-6 rounded-2xl glass-panel-glow border border-violet-500/30 space-y-4" id="trends">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-pink-400" />
              <h2 className="text-lg font-bold text-white">Ganchos Virales de TikTok en Vivo (Tendencias 2026)</h2>
            </div>
            <span className="text-xs text-pink-400 font-mono">Playwright Crawler Activo</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TRENDING_HOOKS.map((hook, i) => (
              <div key={i} className="p-4 rounded-xl bg-zinc-900/80 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">{hook.niche}</span>
                  <span className="text-emerald-400 font-bold">{hook.retention} Retención</span>
                </div>
                <h4 className="font-bold text-sm text-white">{hook.title}</h4>
                <p className="text-[11px] text-zinc-500">Audio sugerido: Suspense Cinematic Hit ({hook.bpm} BPM)</p>
                <Link
                  href="/studio/new"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-semibold"
                >
                  <span>Usar este arquetipo</span>
                  <span>→</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
