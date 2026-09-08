'use client';

import React, { useState, useRef } from 'react';
import { DramaScriptPayload, DramaScene } from '@/lib/gcp-vertex';
import {
  FileText,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  Users,
  Flame,
  Film,
  Edit3,
  Copy,
  Check,
  Volume2,
  Play,
  Pause,
} from 'lucide-react';

interface ScriptReviewScreenProps {
  script: DramaScriptPayload;
  selectedVoice?: string;
  onSelectVoice?: (voiceId: string) => void;
  onUpdateScript: (updated: DramaScriptPayload) => void;
  onConfirmScript: () => void;
  onBackToConcept: () => void;
  onRegenerate: () => void;
  isRegenerating?: boolean;
}

export const VOICE_OPTIONS = [
  {
    id: 'ejecutivo_latino',
    label: 'Ejecutivo Firme',
    speaker: 'Roger (ElevenLabs)',
    tag: 'Masculina',
    desc: 'Voz autoritaria, seria y convincente',
    sampleText: 'Soy Roger. Esta es mi voz ejecutiva para tu minidrama.',
  },
  {
    id: 'fundadora_pro',
    label: 'Fundadora Dinámica',
    speaker: 'Sarah (ElevenLabs)',
    tag: 'Femenina',
    desc: 'Voz moderna, persuasiva y profesional',
    sampleText: 'Soy Sarah. Esta es mi voz de fundadora para tu minidrama.',
  },
  {
    id: 'narrador_epico',
    label: 'Narrador Dramático',
    speaker: 'George (ElevenLabs)',
    tag: 'Cinemática',
    desc: 'Tono cinematográfico de suspenso y tensión',
    sampleText: 'Soy George. Esta es mi voz de suspenso y misterio.',
  },
  {
    id: 'tiktoker_rapido',
    label: 'Creador Viral',
    speaker: 'Liam (ElevenLabs)',
    tag: 'Alta Energía',
    desc: 'Ritmo rápido y dinámico estilo TikTok',
    sampleText: '¡Ey qué tal! Soy Liam con el ritmo viral y alta energía.',
  },
];

export const getSceneDefaultVoice = (characterName: string): string => {
  const isFemale = /elena|sofia|fundadora|mujer|female|chica|ana|maria|laura|directora|socia/i.test(
    characterName || ''
  );
  return isFemale ? 'fundadora_pro' : 'ejecutivo_latino';
};

export const ScriptReviewScreen: React.FC<ScriptReviewScreenProps> = ({
  script,
  onUpdateScript,
  onConfirmScript,
  onBackToConcept,
  onRegenerate,
  isRegenerating = false,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  const handleTitleChange = (newTitle: string) => {
    onUpdateScript({ ...script, title: newTitle });
  };

  const handleHookChange = (newHook: string) => {
    onUpdateScript({
      ...script,
      hook: newHook,
      scenes: script.scenes.map((s, idx) => (idx === 0 ? { ...s, dialogue: newHook } : s)),
    });
  };

  const handleSceneDialogueChange = (sceneIndex: number, newDialogue: string) => {
    const updatedScenes = [...script.scenes];
    updatedScenes[sceneIndex] = {
      ...updatedScenes[sceneIndex],
      dialogue: newDialogue,
    };
    onUpdateScript({ ...script, scenes: updatedScenes });
  };

  const handleSceneCharacterChange = (sceneIndex: number, newCharacter: string) => {
    const updatedScenes = [...script.scenes];
    const previousVoice = updatedScenes[sceneIndex].voice_id;
    // If voice was not explicitly changed by user, adapt default
    const newDefaultVoice = getSceneDefaultVoice(newCharacter);
    updatedScenes[sceneIndex] = {
      ...updatedScenes[sceneIndex],
      character: newCharacter,
      voice_id: previousVoice || newDefaultVoice,
    };
    onUpdateScript({ ...script, scenes: updatedScenes });
  };

  const playVoicePreview = (vId: string) => {
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
    }
    const sample = VOICE_OPTIONS.find((v) => v.id === vId);
    const sampleText = sample?.sampleText || 'Prueba de voz en DramaFlow';
    const url = `/api/tts?voiceId=${vId}&text=${encodeURIComponent(sampleText)}`;

    const audio = new Audio(url);
    audioPreviewRef.current = audio;
    setPlayingVoiceId(vId);

    audio.play().catch(() => {});
    audio.onended = () => setPlayingVoiceId(null);
    audio.onerror = () => setPlayingVoiceId(null);
  };

  const handleSceneVoiceChange = (sceneIndex: number, vId: string) => {
    playVoicePreview(vId);
    const updatedScenes = [...script.scenes];
    updatedScenes[sceneIndex] = {
      ...updatedScenes[sceneIndex],
      voice_id: vId,
    };
    onUpdateScript({ ...script, scenes: updatedScenes });
  };

  const handleCopyScriptText = () => {
    let fullText = `TÍTULO: ${script.title}\nGANCHO (3s): "${script.hook}"\nLOGLINE: ${script.logline}\n\nPERSONAJES:\n`;
    (script.characters || []).forEach((c) => {
      fullText += `• ${c.name} (${c.role})\n`;
    });
    fullText += `\nESCENAS:\n`;
    script.scenes.forEach((s, idx) => {
      const v = s.voice_id || getSceneDefaultVoice(s.character);
      fullText += `\n[ESCENA ${idx + 1} - ${s.duration_seconds || 6}s] ${s.character} (Voz: ${v}):\n"${s.dialogue}"\nVisual: ${s.visual_prompt}\n`;
    });

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6 animate-fadeIn pb-12">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl glass-panel-glow border border-violet-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-bold uppercase tracking-wider">
                  Paso 2 de 3: Confirmar Guión y Voces por Escena
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h2 className="text-2xl font-black text-white mt-1">
                Guión y Voces de Diálogo por Escena
              </h2>
            </div>
          </div>

          {/* Action Buttons Header */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyScriptText}
              className="px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado' : 'Copiar Texto'}</span>
            </button>

            <button
              type="button"
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>Regenerar Guión</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Revisá el guión, editá los diálogos y elegí la voz para cada escena. Al hacer clic en una voz, escucharás una muestra de audio al instante. Por defecto, cada personaje tiene su voz asignada automáticamente.
        </p>

        {/* Title & Hook Direct Edit Box */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-3 border-t border-white/10">
          <div className="md:col-span-6 space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-violet-400" />
              <span>Título del Minidrama</span>
            </label>
            <input
              type="text"
              value={script.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="md:col-span-6 space-y-1.5">
            <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Gancho de los Primeros 3 Segundos (Hook)</span>
            </label>
            <input
              type="text"
              value={script.hook}
              onChange={(e) => handleHookChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Characters Involved */}
        <div className="pt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-violet-400" />
            Personajes:
          </span>
          {(script.characters || [
            { name: 'Marcos', role: 'Antagonista / Escéptico' },
            { name: 'Elena', role: 'Protagonista / Estratega' },
          ]).map((char, idx) => {
            const isFemale = /elena|sofia|fundadora|mujer|female|chica|ana|maria|laura/i.test(char.name || '');
            return (
              <div
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-zinc-200 flex items-center gap-1.5"
              >
                <span className={`w-2 h-2 rounded-full ${isFemale ? 'bg-pink-400' : 'bg-blue-400'}`} />
                <span className="font-bold">{char.name}</span>
                <span className="text-zinc-500">({char.role})</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 font-mono">
                  {isFemale ? 'Voz Femenina (Sarah)' : 'Voz Masculina (Roger)'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Script Scenes Detail (1 to 4) */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
          <span>Escenas del Minidrama ({script.scenes.length} Escenas en Secuencia)</span>
          <span className="text-xs text-violet-400 font-normal">
            Elegí la voz para cada escena • Clic para escuchar muestra
          </span>
        </h3>

        {script.scenes.map((scene: DramaScene, index: number) => {
          const isMarcos =
            (scene.character || '').toLowerCase().includes('marcos') ||
            (scene.character || '').toLowerCase().includes('directivo') ||
            (scene.character || '').toLowerCase().includes('cliente');

          const defaultVoice = getSceneDefaultVoice(scene.character);
          const activeVoiceId = scene.voice_id || defaultVoice;

          return (
            <div
              key={scene.scene_number || index}
              className="p-5 rounded-2xl bg-zinc-900/90 border border-white/10 space-y-4 hover:border-violet-500/40 transition-all shadow-lg"
            >
              {/* Scene Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-lg bg-violet-600/20 text-violet-300 font-mono font-bold text-xs border border-violet-500/30">
                    ESCENA {index + 1}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    Duración: {scene.duration_seconds || 6}s
                  </span>
                </div>

                {/* Character Speaker Badge / Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-zinc-400">Habla:</span>
                  <input
                    type="text"
                    value={scene.character}
                    onChange={(e) => handleSceneCharacterChange(index, e.target.value)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                      isMarcos
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                        : 'bg-pink-500/10 border-pink-500/30 text-pink-300'
                    }`}
                  />
                </div>
              </div>

              {/* Dialogue Box (Editable) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                  <Edit3 className="w-3 h-3 text-violet-400" />
                  <span>Diálogo Hablado:</span>
                </label>
                <textarea
                  rows={2}
                  value={scene.dialogue}
                  onChange={(e) => handleSceneDialogueChange(index, e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none transition-all leading-relaxed"
                />
              </div>

              {/* Per-Scene Voice Selection */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-violet-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    <span>Voz para Escena {index + 1} ({scene.character}):</span>
                  </label>
                  <span className="text-[10px] text-zinc-400">
                    {activeVoiceId === defaultVoice ? '(Voz por defecto según personaje)' : '(Personalizada)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {VOICE_OPTIONS.map((v) => {
                    const isSelected = activeVoiceId === v.id;
                    const isAuditioning = playingVoiceId === v.id;

                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleSceneVoiceChange(index, v.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-violet-600/25 border-violet-400 ring-1 ring-violet-400 shadow-md shadow-violet-900/30'
                            : 'bg-black/40 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-xs font-bold text-white truncate">
                              {v.label}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            )}
                          </div>
                          <span
                            className={`inline-block text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                              v.tag === 'Femenina'
                                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                                : v.tag === 'Masculina'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            }`}
                          >
                            {v.speaker}
                          </span>
                        </div>

                        {/* Audio preview button / state */}
                        <div className="mt-2 pt-1 border-t border-white/5 flex items-center justify-between text-[10px]">
                          <span className="text-zinc-400 truncate">{v.tag}</span>
                          <div
                            className={`flex items-center gap-1 font-semibold ${
                              isAuditioning
                                ? 'text-emerald-400 animate-pulse'
                                : 'text-violet-300'
                            }`}
                          >
                            <Volume2 className={`w-3 h-3 ${isAuditioning ? 'animate-bounce' : ''}`} />
                            <span>{isAuditioning ? 'Escuchando' : 'Escuchar'}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Visual Prompt Description */}
              <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-start gap-2 text-xs text-zinc-400">
                <Film className="w-3.5 h-3.5 text-zinc-500 mt-0.5 shrink-0" />
                <div className="leading-snug">
                  <span className="font-semibold text-zinc-300">Visual de Cámara: </span>
                  <span>{scene.visual_prompt}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Bottom Confirmation Bar */}
      <div className="sticky bottom-4 z-40 p-4 rounded-2xl bg-zinc-950/95 border border-violet-500/40 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackToConcept}
          className="px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Concepto</span>
        </button>

        <button
          type="button"
          onClick={onConfirmScript}
          className="flex-1 py-3.5 px-6 rounded-xl font-black text-sm text-white bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 shadow-xl shadow-violet-600/30 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span>Confirmar Guión y Voces para Crear Minidrama (Video + Diálogo)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
