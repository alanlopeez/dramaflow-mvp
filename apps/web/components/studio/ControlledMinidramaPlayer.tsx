'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DramaScriptPayload } from '@/lib/gcp-vertex';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Film,
  ArrowRight,
  X,
  Maximize,
} from 'lucide-react';

interface ControlledMinidramaPlayerProps {
  script: DramaScriptPayload;
  selectedVoice?: string;
  onSelectVoice?: (voiceId: string) => void;
  onBackToScript: () => void;
  onResetToStep1?: () => void;
  projectId: string;
}

export const ControlledMinidramaPlayer: React.FC<ControlledMinidramaPlayerProps> = ({
  script,
  onBackToScript,
  onResetToStep1,
  projectId,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(26);
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState<boolean>(false);
  const [hasDownloaded, setHasDownloaded] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Direct master video url
  const masterVideoUrl = '/videos/dramaflow_active_minidrama_1080p.mp4';

  // Toggle Play / Pause with audio enabled
  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      // Unmute on explicit user interaction if desired
      videoRef.current.muted = isMuted;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Toggle Mute
  const handleToggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  // Restart video from beginning
  const handleRestart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 26);
      // Attempt play unmuted on load, catch autoplay policy
      videoRef.current.muted = isMuted;
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // If browser blocks unmuted autoplay, mute initially but keep playing
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play().catch(() => {});
        }
      });
    }
  };

  // Seek bar
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  // Trigger Download
  const handleDownload = () => {
    setHasDownloaded(true);
    const safeTitle = (script.title || 'dramaflow_minidrama')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_');
    const a = document.createElement('a');
    a.href = masterVideoUrl;
    a.download = `${safeTitle}_1080p.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Format seconds to mm:ss
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Confirm Regenerate
  const handleConfirmRegenerate = () => {
    setIsRegenerateModalOpen(false);
    if (onResetToStep1) {
      onResetToStep1();
    } else {
      onBackToScript();
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-5 sm:space-y-6 animate-fadeIn pb-12 sm:pb-16">
      {/* Top Notification Badge */}
      <div className="p-4 sm:p-5 rounded-2xl glass-panel-glow border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase tracking-wider">
                Paso 3 de 3: Minidrama Listo
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
              ¡Tu Minidrama ha sido generado con éxito!
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-400">
              Formato vertical 9:16 (1080p) • Subtítulos dinámicos • Voces de ElevenLabs
            </p>
          </div>
        </div>

        {/* Unmute quick hint if muted */}
        {isMuted && (
          <button
            type="button"
            onClick={handleToggleMute}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-amber-500/30 transition-all animate-pulse min-h-[40px]"
          >
            <VolumeX className="w-4 h-4" />
            <span>Hacer clic para activar audio</span>
          </button>
        )}
      </div>

      {/* Main Presentation Container */}
      <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-6 w-full px-1">
        {/* Smartphone 9:16 Mockup */}
        <div className="relative w-full max-w-[290px] xs:max-w-[310px] sm:max-w-[340px] aspect-[9/16] rounded-[32px] sm:rounded-[38px] overflow-hidden border-4 sm:border-[6px] border-zinc-800 bg-black shadow-2xl shadow-violet-950/40 group mx-auto">
          {/* Camera Notch / Speaker */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-3.5 sm:h-4 bg-zinc-950 rounded-full z-40 flex items-center justify-center pointer-events-none">
            <div className="w-2 h-2 rounded-full bg-zinc-800 mr-2.5 sm:mr-3" />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-900/60" />
          </div>

          {/* Master Video Element */}
          <video
            ref={videoRef}
            src={masterVideoUrl}
            playsInline
            loop
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            className="w-full h-full object-cover cursor-pointer"
            onClick={handleTogglePlay}
          />

          {/* Top Floating Badge */}
          <div className="absolute top-8 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
            <div className="px-3 py-1 rounded-full bg-black/70 border border-white/20 backdrop-blur-md flex items-center gap-2 text-[11px] font-bold text-white shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>MINIDRAMA COMPLETO</span>
            </div>

            <div className="px-2.5 py-1 rounded-full bg-violet-600/80 border border-violet-400/50 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-md">
              1080P • ELEVENLABS
            </div>
          </div>

          {/* Big Center Play/Pause Overlay */}
          <div
            onClick={handleTogglePlay}
            className={`absolute inset-0 z-20 flex items-center justify-center cursor-pointer transition-opacity duration-200 ${
              !isPlaying ? 'bg-black/40 opacity-100' : 'opacity-0 hover:opacity-100'
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-black/70 border border-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform">
              {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
            </div>
          </div>

          {/* Sound State Badge Overlay */}
          <div className="absolute bottom-4 right-4 z-30">
            <button
              type="button"
              onClick={handleToggleMute}
              className="p-2.5 rounded-full bg-black/70 border border-white/20 text-white backdrop-blur-md hover:bg-black/90 transition-all"
              title={isMuted ? 'Activar sonido' : 'Silenciar'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>
        </div>

        {/* Video Scrubber & Play Controls Bar */}
        <div className="w-full max-w-[290px] xs:max-w-[310px] sm:max-w-[340px] p-3 rounded-2xl bg-zinc-900 border border-white/10 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 26}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="mx-3 flex-1 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
            />
            <span>{formatTime(duration)}</span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-white/5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/30 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center"
                title={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={handleRestart}
                className="p-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white transition-all min-h-[40px] min-w-[40px] flex items-center justify-center"
                title="Reiniciar video"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleToggleMute}
              className="px-3 py-2 rounded-xl bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all min-h-[40px]"
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sin Audio</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Con Audio</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2 MAIN ACTION BUTTONS REQUESTED BY USER */}
        <div className="w-full max-w-[290px] xs:max-w-[310px] sm:max-w-md space-y-3 pt-2">
          {/* Button 1: Download Video */}
          <button
            type="button"
            onClick={handleDownload}
            className="w-full py-3.5 sm:py-4 px-4 sm:px-6 rounded-2xl font-black text-sm sm:text-base text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-xl shadow-emerald-950/40 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.98] min-h-[48px]"
          >
            <Download className="w-5 h-5 shrink-0" />
            <span className="truncate">Descargar Video Completo (1080p)</span>
          </button>

          {/* Button 2: Generate New Video (triggers warning modal) */}
          <button
            type="button"
            onClick={() => setIsRegenerateModalOpen(true)}
            className="w-full py-3 sm:py-3.5 px-4 sm:px-6 rounded-2xl font-bold text-xs sm:text-sm text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-white/10 flex items-center justify-center gap-2 transition-all min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4 text-violet-400 shrink-0" />
            <span>Volver a generar nuevo video</span>
          </button>
        </div>
      </div>

      {/* CONFIRMATION WARNING MODAL */}
      {isRegenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl glass-panel-glow border border-amber-500/40 p-5 sm:p-7 md:p-8 space-y-4 sm:space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsRegenerateModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-amber-400">
              <div className="p-2.5 sm:p-3 rounded-2xl bg-amber-500/20 border border-amber-500/30 shrink-0">
                <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                ¿Está seguro que quiere volver a generar el video?
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Se perderá el video hecho si no lo descargaste hasta ahora. Lo podés hacer antes de volver a generar un video nuevo.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              {/* Option to download first */}
              <button
                type="button"
                onClick={() => {
                  handleDownload();
                  setIsRegenerateModalOpen(false);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg min-h-[44px]"
              >
                <Download className="w-4 h-4" />
                <span>Descargar video ahora</span>
              </button>

              {/* Option to confirm regenerate anyway */}
              <button
                type="button"
                onClick={handleConfirmRegenerate}
                className="py-3 px-4 rounded-xl bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all min-h-[44px]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Sí, volver a generar</span>
              </button>

              {/* Cancel */}
              <button
                type="button"
                onClick={() => setIsRegenerateModalOpen(false)}
                className="py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold min-h-[44px]"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
