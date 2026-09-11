'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, Heart, MessageCircle, Bookmark, Share2, Music2, Sparkles, Volume2, VolumeX, Eye } from 'lucide-react';
import { DramaScene } from '@/lib/gcp-vertex';

interface Props {
  title: string;
  hook: string;
  scenes: DramaScene[];
  activeSceneIndex: number;
  onSelectSceneIndex: (index: number) => void;
  captionStyle: string;
  isRendering?: boolean;
}

export const TikTokMobilePreview: React.FC<Props> = ({
  title,
  hook,
  scenes,
  activeSceneIndex,
  onSelectSceneIndex,
  captionStyle,
  isRendering = false,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [activeWordIndex, setActiveWordIndex] = useState<number>(0);

  const currentScene: DramaScene = scenes[activeSceneIndex] || scenes[0] || {
    scene_number: 1,
    dialogue: hook || "Generando gancho de alta tensión para el minidrama...",
    character: "Elena",
    visual_prompt: "Toma cinematográfica vertical",
    duration_seconds: 5,
    camera_motion: 'zoom_in',
    videoUrl: undefined,
  };

  const words = (currentScene.dialogue || '').split(' ');

  // Simulate word-by-word karaoke animation
  useEffect(() => {
    if (!isPlaying || words.length === 0) return;
    const interval = setInterval(() => {
      setActiveWordIndex((prev) => (prev + 1) % words.length);
    }, 450);
    return () => clearInterval(interval);
  }, [isPlaying, words.length, activeSceneIndex]);

  const [isMuted, setIsMuted] = useState<boolean>(true);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  // Sync video play/pause state
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, activeSceneIndex]);

  // Caption style classes
  const getCaptionContainerClass = () => {
    switch (captionStyle) {
      case 'bold_yellow':
      case 'mrbeast_yellow':
        return 'text-yellow-400 font-black text-xl drop-shadow-[0_4px_4px_rgba(0,0,0,1)] uppercase tracking-tight';
      case 'hormozi_glow':
        return 'text-emerald-400 font-black text-xl drop-shadow-[0_4px_10px_rgba(16,185,129,0.8)] uppercase tracking-tight';
      case 'minimal_clean':
      case 'cinematic_minimal':
        return 'text-white font-medium text-base tracking-wide bg-black/50 px-4 py-2 rounded-xl backdrop-blur-sm';
      case 'karaoke_bounce':
      default:
        return 'text-white font-extrabold text-lg drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]';
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-full px-2 sm:px-0">
      {/* 9:16 Phone Device Shell */}
      <div className="relative w-full max-w-[300px] xs:max-w-[320px] sm:max-w-[330px] aspect-[9/16] max-h-[580px] sm:max-h-[640px] bg-black rounded-[36px] sm:rounded-[44px] p-2.5 sm:p-3 shadow-2xl border-[3px] sm:border-4 border-zinc-800 ring-1 ring-white/10 overflow-hidden flex flex-col justify-between select-none mx-auto">
        
        {/* Dynamic Island / Top Camera Notch */}
        <div className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 w-24 sm:w-28 h-4 sm:h-5 bg-zinc-900 rounded-full z-30 flex items-center justify-end px-2">
          <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-zinc-800 border border-zinc-700" />
        </div>

        {/* Video Canvas Background */}
        <div className="absolute inset-0 z-0 bg-black overflow-hidden flex items-center justify-center">
          {currentScene.videoUrl ? (
            <div className="relative w-full h-full overflow-hidden">
              <video
                key={currentScene.videoUrl + '-' + activeSceneIndex}
                ref={videoRef}
                src={currentScene.videoUrl}
                poster={currentScene.imageUrl}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  isPlaying ? 'opacity-100' : 'opacity-90'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />
            </div>
          ) : currentScene.imageUrl ? (
            <div className="relative w-full h-full overflow-hidden">
              <img
                src={currentScene.imageUrl}
                alt={`Escena ${activeSceneIndex + 1}`}
                className={`w-full h-full object-cover transition-transform duration-[6000ms] ease-out ${
                  isPlaying ? 'scale-110 translate-y-[-2%]' : 'scale-100'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />
            </div>
          ) : (
            <div className="text-center px-6 z-10 space-y-4">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-violet-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center backdrop-blur-md">
                <Sparkles className="w-10 h-10 text-violet-400 animate-spin-slow" />
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-violet-400 mb-1">
                  Escena {activeSceneIndex + 1} de {scenes.length}
                </p>
                <p className="text-xs text-zinc-400 line-clamp-3 italic">
                  &ldquo;{currentScene.visual_prompt}&rdquo;
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Top Overlay (Live / Sound Info) */}
        <div className="relative z-20 pt-8 px-3 flex items-center justify-between text-xs text-white/90">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
            <Music2 className="w-3 h-3 text-pink-400" />
            <span className="font-medium text-[11px] truncate max-w-[130px]">Audio DramaFlow • Sonido Viral</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
              className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-zinc-400" /> : <Volume2 className="w-3.5 h-3.5 text-pink-400 animate-pulse" />}
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? 'Pausar' : 'Reproducir'}
              className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
            </button>
          </div>
        </div>

        {/* Center Subtitles Overlay (Dynamic TikTok Karaoke) */}
        <div className="relative z-20 px-4 text-center my-auto">
          <div className={`${getCaptionContainerClass()} transition-all leading-snug`}>
            {words.map((word, idx) => {
              const isCurrentWord = idx === activeWordIndex;
              return (
                <span
                  key={`word-${activeSceneIndex}-${idx}-${word}`}
                  className={`inline-block mx-1 transition-all transform duration-150 ${
                    isCurrentWord
                      ? 'scale-125 text-yellow-300 font-black animate-bounce'
                      : captionStyle === 'karaoke_bounce'
                      ? 'text-white opacity-80'
                      : ''
                  }`}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>

        {/* Right Side Engagement Action Icons (TikTok Style) */}
        <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center space-y-4 text-white">
          {/* Creator Avatar with Follow Plus */}
          <div className="relative mb-2">
            <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-tr from-pink-500 to-violet-600 flex items-center justify-center text-xs font-bold shadow-lg">
              DF
            </div>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#FE2C55] rounded-full flex items-center justify-center text-white text-[10px] font-bold">
              +
            </div>
          </div>

          {/* Like */}
          <button onClick={() => setIsLiked(!isLiked)} className="flex flex-col items-center group">
            <div className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart className={`w-5 h-5 ${isLiked ? 'text-[#FE2C55] fill-[#FE2C55]' : 'text-white'}`} />
            </div>
            <span className="text-[10px] font-semibold mt-1">128.4K</span>
          </button>

          {/* Comments */}
          <div className="flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-semibold mt-1">2,491</span>
          </div>

          {/* Bookmark */}
          <button onClick={() => setIsBookmarked(!isBookmarked)} className="flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center">
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'text-yellow-400 fill-yellow-400' : 'text-white'}`} />
            </div>
            <span className="text-[10px] font-semibold mt-1">18.9K</span>
          </button>

          {/* Share */}
          <div className="flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-semibold mt-1">8,320</span>
          </div>

          {/* Rotating Vinyl Record */}
          <div className={`w-8 h-8 rounded-full border-2 border-zinc-700 bg-zinc-900 flex items-center justify-center shadow-lg ${isPlaying ? 'animate-spin-slow' : ''}`}>
            <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-pink-500 to-violet-500" />
          </div>
        </div>

        {/* Bottom Metadata & Handle Overlay */}
        <div className="relative z-20 px-3 pb-3 space-y-2 text-white">
          <div className="space-y-1 max-w-[210px]">
            <p className="font-bold text-sm tracking-tight flex items-center gap-1.5">
              <span>@dramaflow.ai</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-violet-500/40 text-violet-200">PRO</span>
            </p>
            <p className="text-xs text-zinc-200 line-clamp-2 leading-relaxed">
              <span>{currentScene.character}: </span>
              <span>&ldquo;{currentScene.dialogue}&rdquo; </span>
              <span className="text-violet-300">#negocios #crecimiento #drama #{title?.toLowerCase().replace(/\s+/g, '') || 'viral'}</span>
            </p>
          </div>

          {/* Progress Timeline Bar */}
          <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-300"
              style={{ width: `${((activeSceneIndex + 1) / Math.max(1, scenes.length)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Scene Switcher Pills */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-full px-2">
        {scenes.map((_, i) => (
          <button
            key={i}
            onClick={() => onSelectSceneIndex(i)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all min-h-[36px] flex items-center justify-center ${
              activeSceneIndex === i
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30 ring-1 ring-violet-400'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700'
            }`}
          >
            Escena {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};
