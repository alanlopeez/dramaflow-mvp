'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { TikTokDramaComposition } from '@/remotion/TikTokDramaComposition';
import { DramaCompositionProps, WhisperXWord, CompositionScene } from '@/remotion/types';
import { DEMO_WHISPER_WORDS, DEFAULT_DRAMA_PROPS } from '@/remotion/Root';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Layers,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Music2,
  Sliders,
  Maximize2,
} from 'lucide-react';

import { generateWhisperXWordTimestamps } from '@/lib/subtitles-generator';

interface RemotionPlayerPreviewProps {
  title?: string;
  scenes?: CompositionScene[];
  whisperWords?: WhisperXWord[];
  audioUrl?: string;
  bgmUrl?: string;
  captionStyle?: 'karaoke_bounce' | 'cyberpunk_neon' | 'beast_bold' | 'minimal_cinema';
  enableParallax?: boolean;
  onCaptionStyleChange?: (style: 'karaoke_bounce' | 'cyberpunk_neon' | 'beast_bold' | 'minimal_cinema') => void;
}

export const RemotionPlayerPreview: React.FC<RemotionPlayerPreviewProps> = ({
  title = DEFAULT_DRAMA_PROPS.title,
  scenes = DEFAULT_DRAMA_PROPS.scenes,
  whisperWords,
  audioUrl,
  bgmUrl,
  captionStyle = 'karaoke_bounce',
  enableParallax = true,
  onCaptionStyleChange,
}) => {
  const playerRef = useRef<PlayerRef>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeStyle, setActiveStyle] = useState<'karaoke_bounce' | 'cyberpunk_neon' | 'beast_bold' | 'minimal_cinema'>(captionStyle);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Sync state with parent if changed
  useEffect(() => {
    setActiveStyle(captionStyle);
  }, [captionStyle]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (playerRef.current.isPlaying()) {
      playerRef.current.pause();
      setIsPlaying(false);
    } else {
      playerRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (playerRef.current.isMuted()) {
      playerRef.current.unmute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const restartVideo = () => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(0);
    playerRef.current.play();
    setIsPlaying(true);
  };

  // 100% full-drama word timestamps synchronized with WhisperX
  const effectiveWhisperWords = React.useMemo(() => {
    if (whisperWords && whisperWords.length > 0) return whisperWords;
    const generated = generateWhisperXWordTimestamps(scenes as any);
    return generated.length > 0 ? generated : DEMO_WHISPER_WORDS;
  }, [scenes, whisperWords]);

  // Calculate total duration in frames
  const fps = 30;
  const totalSeconds = scenes.reduce((acc, s) => acc + (s.duration_seconds || 4), 0);
  const durationInFrames = Math.max(90, Math.round(totalSeconds * fps));

  const compositionProps: DramaCompositionProps = {
    title,
    scenes,
    whisperWords: effectiveWhisperWords,
    audioUrl,
    bgmUrl,
    captionStyle: activeStyle,
    enableParallax,
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto select-none">
      {/* Top Header Pill */}
      <div className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-900/80 border border-violet-500/30 backdrop-blur-md text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200">Remotion 9:16 Core</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-mono">
            WhisperX Sync
          </span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          {totalSeconds}s • 30fps
        </div>
      </div>

      {/* 9:16 Mobile Device Frame */}
      <div className="relative w-full aspect-[9/16] rounded-[36px] overflow-hidden border-[6px] border-slate-800 bg-black shadow-2xl shadow-violet-950/40 group">
        {/* Dynamic Island / Camera Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-40 flex items-center justify-center pointer-events-none">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800/80 mr-4" />
          <div className="w-1.5 h-1.5 rounded-full bg-blue-900/50" />
        </div>

        {/* Remotion Canvas Player */}
        <Player
          ref={playerRef}
          component={TikTokDramaComposition as any}
          inputProps={compositionProps}
          durationInFrames={durationInFrames}
          fps={fps}
          compositionWidth={1080}
          compositionHeight={1920}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          controls={false}
          autoPlay
          loop
        />

        {/* TikTok Interactive Sidebar Overlay */}
        <div className="absolute right-3 bottom-24 flex flex-col items-center gap-4 z-40">
          {/* Avatar Profile */}
          <div className="relative group/avatar cursor-pointer">
            <div className="w-10 h-10 rounded-full border-2 border-pink-500 p-0.5 overflow-hidden bg-slate-800">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&q=80"
                alt="Creator"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-pink-500 text-white flex items-center justify-center text-[10px] font-bold">
              +
            </div>
          </div>

          {/* Like */}
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="flex flex-col items-center gap-0.5 transition-transform active:scale-90"
          >
            <div
              className={`p-2 rounded-full backdrop-blur-md ${
                isLiked ? 'bg-pink-500 text-white' : 'bg-black/40 text-white hover:bg-black/60'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current text-white' : ''}`} />
            </div>
            <span className="text-[10px] font-semibold text-white drop-shadow">
              {isLiked ? '48.2k' : '48.1k'}
            </span>
          </button>

          {/* Comments */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="p-2 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 cursor-pointer">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold text-white drop-shadow">1,240</span>
          </div>

          {/* Bookmark */}
          <button
            onClick={() => setIsSaved(!isSaved)}
            className="flex flex-col items-center gap-0.5 transition-transform active:scale-90"
          >
            <div
              className={`p-2 rounded-full backdrop-blur-md ${
                isSaved ? 'bg-amber-500 text-white' : 'bg-black/40 text-white hover:bg-black/60'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current text-white' : ''}`} />
            </div>
            <span className="text-[10px] font-semibold text-white drop-shadow">8.9k</span>
          </button>

          {/* Share */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="p-2 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 cursor-pointer">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold text-white drop-shadow">3.4k</span>
          </div>

          {/* Rotating Vinyl Audio Disc */}
          <div className="w-8 h-8 rounded-full border-2 border-slate-700 bg-slate-950 p-1 flex items-center justify-center animate-spin-slow">
            <Music2 className="w-3.5 h-3.5 text-pink-400" />
          </div>
        </div>

        {/* Bottom Metadata Info */}
        <div className="absolute left-3 right-16 bottom-4 z-40 text-left pointer-events-none">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs font-bold text-white drop-shadow">@dramaflow.ai</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-pink-500/80 text-white font-medium">
              Viral Hook
            </span>
          </div>
          <p className="text-[11px] text-slate-200 line-clamp-2 drop-shadow leading-tight mb-2">
            {title} #minidrama #retention #aicinema #growth
          </p>
          <div className="flex items-center gap-1 text-[10px] text-slate-300 drop-shadow">
            <Music2 className="w-3 h-3 text-violet-400 animate-pulse" />
            <span className="truncate">Audio original • F5-TTS Emotional Synthesis</span>
          </div>
        </div>

        {/* Center Play Overlay on Hover/Pause */}
        <div
          onClick={togglePlay}
          className={`absolute inset-0 z-30 flex items-center justify-center cursor-pointer transition-opacity duration-200 ${
            !isPlaying ? 'bg-black/35 opacity-100' : 'opacity-0 hover:opacity-100'
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-black/60 border border-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110">
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </div>
        </div>
      </div>

      {/* Playback & Caption Style Control Bar */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col gap-3 backdrop-blur-lg">
        {/* Playback Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="p-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-md shadow-violet-600/30"
              title={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={restartVideo}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
              title="Reiniciar"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={toggleMute}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
              title={isMuted ? 'Activar Sonido' : 'Mutear'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-pink-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>WhisperX Sync</span>
          </div>
        </div>

        {/* Caption Style Selector Quick Tabs */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Estilo de Subtítulos Dinámicos:
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'karaoke_bounce', label: '⚡ Karaoke Bounce' },
              { id: 'cyberpunk_neon', label: '🟣 Cyber Neon' },
              { id: 'beast_bold', label: '🟢 Beast Bold' },
              { id: 'minimal_cinema', label: '🎬 Minimal Cinema' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => {
                  const s = btn.id as any;
                  setActiveStyle(s);
                  if (onCaptionStyleChange) onCaptionStyleChange(s);
                }}
                className={`px-2 py-1.5 text-[11px] rounded-lg font-medium transition-all text-left ${
                  activeStyle === btn.id
                    ? 'bg-violet-600 text-white font-semibold shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
