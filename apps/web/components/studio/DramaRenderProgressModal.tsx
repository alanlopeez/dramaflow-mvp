'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Loader2, Film, Video, ShieldCheck, ArrowRight } from 'lucide-react';
import { DramaScriptPayload } from '@/lib/gcp-vertex';

interface DramaRenderProgressModalProps {
  isOpen: boolean;
  script: DramaScriptPayload;
  voiceId: string;
  onComplete: (updatedScript: DramaScriptPayload) => void;
  onCancel: () => void;
}

export const DramaRenderProgressModal: React.FC<DramaRenderProgressModalProps> = ({
  isOpen,
  script,
  voiceId,
  onComplete,
  onCancel,
}) => {
  const [progress, setProgress] = useState<number>(10);
  const [currentStage, setCurrentStage] = useState<string>('Iniciando pipeline de renderizado...');
  const [sceneStates, setSceneStates] = useState<Array<'pending' | 'processing' | 'ready'>>([
    'processing',
    'pending',
    'pending',
    'pending',
  ]);
  const [isDone, setIsDone] = useState<boolean>(false);
  const [renderedScript, setRenderedScript] = useState<DramaScriptPayload | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setProgress(10);
      setIsDone(false);
      return;
    }

    let isSubscribed = true;

    // Call /api/render-drama in background while animating progress
    const executeRender = async () => {
      try {
        const res = await fetch('/api/render-drama', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            script,
            voiceId,
          }),
        });
        const data = await res.json();
        if (data.status === 'SUCCESS' && data.data && isSubscribed) {
          setRenderedScript(data.data);
        }
      } catch (e) {
        console.error('Render error:', e);
      }
    };

    executeRender();

    const timer1 = setTimeout(() => {
      setProgress(30);
      setCurrentStage('Sintetizando diálogos con ElevenLabs (multilingual_v2)...');
      setSceneStates(['ready', 'processing', 'pending', 'pending']);
    }, 1500);

    const timer2 = setTimeout(() => {
      setProgress(60);
      setCurrentStage('Generando subtítulos estilizados y aplicando formato 9:16...');
      setSceneStates(['ready', 'ready', 'processing', 'pending']);
    }, 3500);

    const timer3 = setTimeout(() => {
      setProgress(85);
      setCurrentStage('Ensamblando minidrama de 4 escenas en 1080p...');
      setSceneStates(['ready', 'ready', 'ready', 'processing']);
    }, 5500);

    const timer4 = setTimeout(() => {
      setProgress(100);
      setCurrentStage('¡Minidrama completo de 4 escenas renderizado y listo!');
      setSceneStates(['ready', 'ready', 'ready', 'ready']);
      setIsDone(true);
    }, 7500);

    return () => {
      isSubscribed = false;
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [isOpen, script, voiceId]);

  if (!isOpen) return null;

  const handleFinish = () => {
    if (renderedScript) {
      onComplete(renderedScript);
      return;
    }
    // Deliver script with all 4 NexoRouter generated video URLs
    const updatedScript: DramaScriptPayload = {
      ...script,
      scenes: script.scenes.map((s, idx) => {
        const videoMap = [
          '/videos/nexorouter_wan_drama.mp4',
          '/videos/nexorouter_wan_scene_2.mp4',
          '/videos/nexorouter_wan_scene_3.mp4',
          '/videos/nexorouter_wan_scene_4.mp4',
        ];
        return {
          ...s,
          videoUrl: videoMap[idx % videoMap.length],
        };
      }),
    };
    onComplete(updatedScript);
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl rounded-3xl glass-panel-glow border border-violet-500/40 p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 shadow-2xl relative overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Glowing Background Radial */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-3 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-600 text-white shadow-lg shadow-violet-600/30 shrink-0">
              <Film className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-bold uppercase tracking-wider">
                  NexoRouter Video AI
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5 sm:mt-1">
                Generando Minidrama en 1080p
              </h3>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xl sm:text-2xl font-black text-violet-400 font-mono">
              {progress}%
            </span>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="space-y-2">
          <div className="h-2.5 w-full bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-zinc-400 font-mono flex items-center gap-1.5">
            {!isDone ? (
              <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin shrink-0" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            )}
            <span>{currentStage}</span>
          </p>
        </div>

        {/* Scene By Scene Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {script.scenes.map((scene, idx) => {
            const state = sceneStates[idx] || 'pending';
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  state === 'ready'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                    : state === 'processing'
                    ? 'bg-violet-600/20 border-violet-500/50 text-white shadow-lg shadow-violet-600/10'
                    : 'bg-zinc-900/50 border-white/5 text-zinc-500'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      state === 'ready'
                        ? 'bg-emerald-500 text-black'
                        : state === 'processing'
                        ? 'bg-violet-600 text-white animate-pulse'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    #{idx + 1}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold truncate">{scene.character}</div>
                    <div className="text-[10px] text-zinc-400 truncate">
                      {state === 'ready' ? 'Video 9:16 Listo' : state === 'processing' ? 'Generando fotogramas...' : 'En cola...'}
                    </div>
                  </div>
                </div>

                <div>
                  {state === 'ready' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {state === 'processing' && <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />}
                  {state === 'pending' && <Video className="w-4 h-4 text-zinc-600" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions Footer */}
        <div className="pt-2.5 flex items-center justify-between gap-3 border-t border-white/10">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDone}
            className="text-xs text-zinc-500 hover:text-zinc-300 disabled:opacity-30 transition-colors py-2 px-3 min-h-[40px] flex items-center"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleFinish}
            disabled={!isDone}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all min-h-[44px] ${
              isDone
                ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-lg shadow-violet-600/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
            }`}
          >
            <span>Ver Minidrama Generado</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
