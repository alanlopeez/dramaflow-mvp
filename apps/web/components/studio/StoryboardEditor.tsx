'use client';

import React, { useState } from 'react';
import { DramaScriptPayload, DramaScene } from '@/lib/gcp-vertex';
import {
  Sparkles,
  RefreshCw,
  Film,
  Volume2,
  Video,
  Clock,
  Trash2,
  Plus,
  ArrowRight,
  ArrowLeft,
  Users,
  Image as ImageIcon,
  Package,
  Layers,
  Scissors,
  Wand2,
  Send,
  UserCheck,
  Building,
  BarChart3,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { CustomCharacter, CustomProp, CustomLocation } from './CustomAssetsLab';
import { CHARACTER_DNA_REGISTRY, resolveCharacterDNA } from '@/lib/character-logic';

interface Props {
  script: DramaScriptPayload;
  onUpdateScript: (updated: DramaScriptPayload) => void;
  onProceedToPreview: () => void;
  onBack: () => void;
  onRegenerateHook: () => Promise<void>;
  isRegeneratingHook: boolean;
  customCharacters?: CustomCharacter[];
  customProps?: CustomProp[];
  customLocations?: CustomLocation[];
}

export const StoryboardEditor: React.FC<Props> = ({
  script,
  onUpdateScript,
  onProceedToPreview,
  onBack,
  onRegenerateHook,
  isRegeneratingHook,
  customCharacters = [],
  customProps = [],
  customLocations = [],
}) => {
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);
  const [isGeneratingSceneImage, setIsGeneratingSceneImage] = useState<boolean>(false);
  const [userInstructionInput, setUserInstructionInput] = useState<string>('');
  const [lastAppliedInstruction, setLastAppliedInstruction] = useState<string | null>(null);

  const handleSceneChange = (index: number, field: keyof DramaScene, value: any) => {
    const updatedScenes = [...script.scenes];
    updatedScenes[index] = {
      ...updatedScenes[index],
      [field]: value,
    };
    onUpdateScript({
      ...script,
      scenes: updatedScenes,
    });
  };

  const handleAddScene = () => {
    const newSceneNumber = script.scenes.length + 1;
    const isOdd = newSceneNumber % 2 !== 0;
    const charName = isOdd ? 'Marcos' : 'Elena';
    const dna = resolveCharacterDNA(charName);

    const newScene: DramaScene = {
      scene_number: newSceneNumber,
      duration_seconds: 5,
      character: charName,
      dialogue: 'Nueva revelación dramática para la escena.',
      visual_prompt: `Confrontación tensa en sala de directorio, ${dna.gender === 'male' ? 'hombre ejecutivo en traje' : 'mujer fundadora en blazer'}, formato vertical 9:16.`,
      imageUrl: dna.defaultImageUrl,
      camera_motion: 'zoom_in',
      sound_effect: 'dramatic_whoosh',
    };
    onUpdateScript({
      ...script,
      scenes: [...script.scenes, newScene],
    });
    setActiveSceneIndex(script.scenes.length);
  };

  const handleDeleteScene = (index: number) => {
    if (script.scenes.length <= 1) return;
    const updated = script.scenes.filter((_, i) => i !== index);
    onUpdateScript({ ...script, scenes: updated });
    setActiveSceneIndex(Math.max(0, index - 1));
  };

  // AI Image Generation with Logic Guard & User Custom Direction
  const handleRegenerateSceneImage = async (index: number, explicitInstruction?: string) => {
    const scene = script.scenes[index];
    if (!scene) return;
    setIsGeneratingSceneImage(true);

    const instructionToSend = explicitInstruction !== undefined ? explicitInstruction : userInstructionInput;

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: scene.visual_prompt,
          characterName: scene.character,
          sceneNumber: scene.scene_number || index + 1,
          userInstruction: instructionToSend,
        }),
      });

      const data = await res.json();
      if (data.status === 'SUCCESS' && data.imageUrl) {
        handleSceneChange(index, 'imageUrl', data.imageUrl);
        if (instructionToSend) {
          setLastAppliedInstruction(instructionToSend);
        }
      }
    } catch (e) {
      console.error('Failed generating scene image:', e);
    } finally {
      setIsGeneratingSceneImage(false);
    }
  };

  // Quick Character Archetype switch
  const handleSwitchCharacter = (charName: string) => {
    const customChar = script.characters?.find((c: any) => c.name.toLowerCase() === charName.toLowerCase());
    const dna = resolveCharacterDNA(charName);
    const targetImg = customChar?.imageUrl || dna.defaultImageUrl;
    const targetRole = customChar?.role || dna.role;

    const updatedScenes = [...script.scenes];
    updatedScenes[activeSceneIndex] = {
      ...updatedScenes[activeSceneIndex],
      character: charName,
      imageUrl: targetImg,
      visual_prompt: `Confrontación cinematográfica con ${charName} (${targetRole}), iluminación dramática, formato 9:16.`,
    };
    onUpdateScript({ ...script, scenes: updatedScenes });
  };

  const currentScene = script.scenes[activeSceneIndex];
  const currentDNA = currentScene ? resolveCharacterDNA(currentScene.character) : resolveCharacterDNA('Elena');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner & Title */}
      <div className="p-6 rounded-2xl glass-panel-glow border border-violet-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Film className="w-4 h-4" />
            <span>Paso 2 de 3: Storyboard, Personajes y Copiloto de Dirección</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">{script.title}</h2>
          <p className="text-xs text-zinc-400 mt-1">{script.logline}</p>
        </div>

        {/* 1-Click Viral Hook Re-generator */}
        <button
          onClick={onRegenerateHook}
          disabled={isRegeneratingHook}
          className="px-4 py-2.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-violet-300 text-xs font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingHook ? 'animate-spin' : ''}`} />
          <span>Regenerar Gancho</span>
        </button>
      </div>

      {/* Opening Hook Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-pink-950/40 via-violet-950/30 to-zinc-900 border border-pink-500/30 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-pink-400">Gancho Inicial de Retención (0-3s)</p>
          <p className="text-sm font-semibold text-white mt-0.5">&ldquo;{script.hook}&rdquo;</p>
        </div>
      </div>

      {/* Scene Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {script.scenes.map((scene, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setActiveSceneIndex(idx);
              setUserInstructionInput('');
              setLastAppliedInstruction(null);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeSceneIndex === idx
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30 ring-1 ring-violet-400'
                : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <span>Escena {scene.scene_number || idx + 1}</span>
            <span className="text-[10px] opacity-75 font-mono">({scene.duration_seconds}s)</span>
          </button>
        ))}

        {script.scenes.length < 6 && (
          <button
            type="button"
            onClick={handleAddScene}
            className="px-3 py-2.5 rounded-xl text-xs font-semibold bg-zinc-900/50 border border-dashed border-white/20 text-zinc-400 hover:text-white hover:border-violet-500 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar Escena
          </button>
        )}
      </div>

      {/* Active Scene Editor Panel with Logic Guard + Creative Copilot */}
      {currentScene && (
        <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-violet-600/30 text-violet-300 flex items-center justify-center text-xs font-bold">
                #{activeSceneIndex + 1}
              </span>
              <span>Escena {activeSceneIndex + 1}: Personaje, Diálogo y Creativos</span>
            </h3>

            {script.scenes.length > 1 && (
              <button
                type="button"
                onClick={() => handleDeleteScene(activeSceneIndex)}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar Escena
              </button>
            )}
          </div>

          {/* Visual Frame + Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Left: 9:16 Scene Visual Frame */}
            <div className="md:col-span-4 space-y-2">
              <div className="relative aspect-[9/16] rounded-2xl overflow-hidden border-2 border-violet-500/30 bg-black group shadow-xl">
                <img
                  src={currentScene.imageUrl || currentDNA.defaultImageUrl}
                  alt={`Escena ${activeSceneIndex + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/80 text-[10px] text-violet-300 font-mono border border-violet-500/40 flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-emerald-400" />
                  <span>{currentScene.character} ({currentDNA.gender === 'male' ? 'Hombre' : 'Mujer'})</span>
                </div>

                <div className="absolute inset-x-2 bottom-2">
                  <button
                    type="button"
                    onClick={() => handleRegenerateSceneImage(activeSceneIndex)}
                    disabled={isGeneratingSceneImage}
                    className="w-full py-2.5 px-3 rounded-xl bg-violet-600/90 hover:bg-violet-600 text-white text-xs font-bold shadow-lg flex items-center justify-center gap-1.5 backdrop-blur-md transition-colors"
                  >
                    <Wand2 className={`w-3.5 h-3.5 ${isGeneratingSceneImage ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingSceneImage ? 'Generando Fotograma...' : 'Regenerar con IA'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Scene Parameters & Character Switcher */}
            <div className="md:col-span-8 space-y-4">
              
              {/* Character Identity Selector (Logic Guard) */}
              <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-white/10 space-y-2">
                <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-violet-400" />
                    Asignar Personaje a la Escena:
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Lógica & Género Bloqueados
                  </span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {/* If script has custom characters, prioritize them */}
                  {(script.characters && script.characters.length > 0
                    ? script.characters.map((c: any) => ({
                        id: c.name,
                        label: `${c.name}`,
                        desc: c.role || 'Personaje Personalizado',
                        gender: c.voice_type?.includes('female') ? 'female' : 'male'
                      }))
                    : [
                        { id: 'Marcos', label: 'Marcos (Hombre)', desc: 'Directivo Ejecutivo', gender: 'male' },
                        { id: 'Elena', label: 'Elena (Mujer)', desc: 'Fundadora Tech', gender: 'female' },
                        { id: 'David', label: 'David (Hombre)', desc: 'Inversor VC / Broker', gender: 'male' },
                        { id: 'Sofia', label: 'Sofía (Mujer)', desc: 'Ingeniera IA', gender: 'female' },
                        { id: 'Lucia', label: 'Lucía (Mujer)', desc: 'Emprendedora / Realtor', gender: 'female' },
                        { id: 'Carlos', label: 'Carlos (Hombre)', desc: 'Gerente Comercial', gender: 'male' },
                      ]
                  ).map((char: any) => {
                    const isSelected = currentScene.character.toLowerCase() === char.id.toLowerCase() || currentScene.character.toLowerCase().includes(char.id.toLowerCase());
                    return (
                      <button
                        key={char.id}
                        type="button"
                        onClick={() => handleSwitchCharacter(char.id as any)}
                        className={`p-2 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'border-violet-500 bg-violet-500/20 text-white ring-1 ring-violet-500 shadow-md shadow-violet-500/10'
                            : 'border-white/5 bg-zinc-800/60 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                        }`}
                      >
                        <div className="text-xs font-bold truncate">{char.label}</div>
                        <div className="text-[10px] text-zinc-400 truncate">{char.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dialogue & Camera Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-violet-400" />
                    Duración (Segundos)
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={15}
                    value={currentScene.duration_seconds}
                    onChange={(e) => handleSceneChange(activeSceneIndex, 'duration_seconds', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm focus:ring-1 focus:ring-violet-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-violet-400" />
                    Movimiento de Cámara
                  </label>
                  <select
                    value={currentScene.camera_motion}
                    onChange={(e) => handleSceneChange(activeSceneIndex, 'camera_motion', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm focus:ring-1 focus:ring-violet-500 focus:outline-none"
                  >
                    <option value="zoom_in">Ken Burns: Zoom In Dramático</option>
                    <option value="zoom_out">Ken Burns: Zoom Out Revelación</option>
                    <option value="pan_up">Ken Burns: Pan Hacia Arriba</option>
                    <option value="shake">Sacudida de Acción</option>
                    <option value="static">Foco Fijo</option>
                  </select>
                </div>
              </div>

              {/* Spoken Dialogue Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-pink-400" />
                  Diálogo Hablado (Voz Sintetizada de {currentScene.character})
                </label>
                <textarea
                  rows={2}
                  value={currentScene.dialogue}
                  onChange={(e) => handleSceneChange(activeSceneIndex, 'dialogue', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Visual Prompt for Imagen 3 */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Prompt Visual de la Escena (Generación 9:16 con Imagen 3)
                </label>
                <textarea
                  rows={2}
                  value={currentScene.visual_prompt}
                  onChange={(e) => handleSceneChange(activeSceneIndex, 'visual_prompt', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-zinc-900/60 border border-white/10 text-zinc-300 text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* AI CREATIVE COPILOT & USER NATURAL LANGUAGE DIRECTION */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/30 via-zinc-900 to-pink-950/30 border border-violet-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
                  Copiloto de Dirección Creativa (Instrucciones del Usuario)
                </h4>
              </div>
              <span className="text-[10px] text-zinc-400">
                Pedí cambios en lenguaje natural y la IA ajustará el fotograma
              </span>
            </div>

            {/* Natural language instruction input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={userInstructionInput}
                onChange={(e) => setUserInstructionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleRegenerateSceneImage(activeSceneIndex);
                  }
                }}
                placeholder={`Ej: Hacé que ${currentScene.character} tenga cara de furioso mirando una tablet con gráficos rojos...`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs placeholder-zinc-500 focus:ring-2 focus:ring-pink-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleRegenerateSceneImage(activeSceneIndex)}
                disabled={isGeneratingSceneImage || !userInstructionInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-violet-600/30 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Aplicar Cambio</span>
              </button>
            </div>

            {/* Quick 1-click Preset Modification Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] text-zinc-500 font-semibold">Ajustes rápidos:</span>
              {[
                { label: 'Hombre Ejecutivo en Traje', icon: UserCheck, inst: 'Male corporate executive in sharp dark suit, intense look' },
                { label: 'Mujer Fundadora en Blazer', icon: UserCheck, inst: 'Female tech founder in modern stylish blazer, confident posture' },
                { label: 'Directorio Rascacielos', icon: Building, inst: 'Luxury high-rise modern boardroom overlooking skyline at night' },
                { label: 'Tablet con Gráficos', icon: BarChart3, inst: 'Holding transparent holographic tablet with glowing green metrics' },
                { label: 'Tensión / Furia Extrema', icon: Flame, inst: 'Furious angry facial expression, shouting in tense confrontation' },
              ].map((chip, idx) => {
                const Icon = chip.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setUserInstructionInput(chip.inst);
                      handleRegenerateSceneImage(activeSceneIndex, chip.inst);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-black/40 hover:bg-violet-600/20 border border-white/10 text-[11px] text-zinc-300 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <Icon className="w-3 h-3 text-pink-400" />
                    <span>{chip.label}</span>
                  </button>
                );
              })}
            </div>

            {lastAppliedInstruction && (
              <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Último cambio aplicado: &ldquo;{lastAppliedInstruction}&rdquo;</span>
              </div>
            )}
          </div>

          {/* Custom Assets Overlay Tag for this Scene */}
          <div className="p-4 rounded-xl bg-zinc-900/80 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-pink-400" />
                Elementos Asignados a esta Escena:
              </span>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <Scissors className="w-3 h-3" /> Rembg Parallax 2.5D OK
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-400 shrink-0" />
                <div className="truncate">
                  <p className="text-[10px] text-zinc-500">Personaje en pantalla:</p>
                  <p className="font-semibold text-white truncate">{currentScene.character} ({currentDNA.gender === 'male' ? 'Hombre' : 'Mujer'})</p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="truncate">
                  <p className="text-[10px] text-zinc-500">Locación / Fondo:</p>
                  <p className="font-semibold text-white truncate">
                    {customLocations[activeSceneIndex]?.name || 'Escenario Cinemático IA'}
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center gap-2">
                <Package className="w-4 h-4 text-pink-400 shrink-0" />
                <div className="truncate">
                  <p className="text-[10px] text-zinc-500">Objeto / Prop clave:</p>
                  <p className="font-semibold text-white truncate">
                    {customProps.find(p => p.sceneTarget === (activeSceneIndex + 1))?.name || (activeSceneIndex === 3 ? 'Dashboard / Producto Final' : 'Ninguno')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 rounded-xl border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-900 text-sm font-semibold flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Concepto
        </button>

        <button
          type="button"
          onClick={onProceedToPreview}
          className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 shadow-lg shadow-violet-600/30 flex items-center gap-2 transition-all hover:scale-105"
        >
          <span>Ir a la Previsualización 9:16</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
