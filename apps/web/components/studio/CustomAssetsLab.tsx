'use client';

import React, { useState, useRef } from 'react';
import {
  Users,
  Image as ImageIcon,
  Package,
  Plus,
  Trash2,
  Upload,
  Sparkles,
  Scissors,
  CheckCircle2,
  Sliders,
  Layers,
  Volume2,
  Play,
  Wand2,
  RefreshCw,
  Eye,
  Camera
} from 'lucide-react';

export interface CustomCharacter {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
  voiceProfile: string;
}

export interface CustomProp {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  sceneTarget: number;
}

export interface CustomLocation {
  id: string;
  name: string;
  imageUrl: string;
  sceneNumber: number;
}

interface Props {
  characters: CustomCharacter[];
  onUpdateCharacters: (chars: CustomCharacter[]) => void;
  propsList: CustomProp[];
  onUpdateProps: (props: CustomProp[]) => void;
  locations: CustomLocation[];
  onUpdateLocations: (locs: CustomLocation[]) => void;
}

// Preset Face Library for Instant Selection
const AVATAR_PRESETS = [
  { name: 'Elena', role: 'Protagonista / Fundadora', voice: 'founder_female', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80', desc: 'Fundadora 30 años, blazer crema' },
  { name: 'Marcos', role: 'Antagonista / Directivo', voice: 'executive_male', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&auto=format&fit=crop&q=80', desc: 'Directivo 39 años, traje italiano' },
  { name: 'David', role: 'Inversor VC / Broker', voice: 'investor_male', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80', desc: 'Inversor 47 años, traje navy' },
  { name: 'Sofía', role: 'Ingeniera IA / Tech Lead', voice: 'innovator_female', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80', desc: 'Especialista tech 27 años' },
  { name: 'Lucía', role: 'Emprendedora / Realtor', voice: 'spanish_female', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&auto=format&fit=crop&q=80', desc: 'Arquitecta / Broker 31 años' },
  { name: 'Carlos', role: 'Gerente Comercial', voice: 'spanish_male', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80', desc: 'Gerente 42 años, blazer carbón' },
  { name: 'Valeria', role: 'Mentora / Consultora', voice: 'founder_female', img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&auto=format&fit=crop&q=80', desc: 'Consultora ejecutiva 35 años' },
  { name: 'Mateo', role: 'Growth Hacker / Creativo', voice: 'executive_male', img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80', desc: 'Innovador joven 28 años' }
];

// Preset Location Library
const LOCATION_PRESETS = [
  { name: 'Sala de Directorio en Rascacielos', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80', desc: 'Vista panorámica urbana, mesa de vidrio' },
  { name: 'Casa de Lujo Contemporánea', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80', desc: 'Arquitectura moderna, iluminación dorada' },
  { name: 'Estudio de Innovación con Neón', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80', desc: 'Ambiente startup tech, pantallas y monitores' },
  { name: 'Edificio Corporativo / Skyscraper', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80', desc: 'Fachada de vidrio vanguardista' },
  { name: 'Oficina Ejecutiva Minimalista', img: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&auto=format&fit=crop&q=80', desc: 'Estilo nórdico, luz natural' },
  { name: 'Cafetería de Negocios Exclusiva', img: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80', desc: 'Entorno de reunión distendido y elegante' }
];

// Preset Props Library
const PROP_PRESETS = [
  { name: 'Tablet Holográfica con Dashboard IA', cat: 'Software / SaaS', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80' },
  { name: 'Llave de Propiedad / Inmueble de Lujo', cat: 'Bienes Raíces', img: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80' },
  { name: 'Packaging de Producto Premium', cat: 'Producto Físico', img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80' },
  { name: 'Smartphone con Ventas en Tiempo Real', cat: 'E-commerce', img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80' },
  { name: 'Contrato Ejecutivo Firmado', cat: 'Legal / Finanzas', img: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80' },
  { name: 'Dispositivo Smartwatch Deportivo', cat: 'Fitness & Salud', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80' }
];

export const CustomAssetsLab: React.FC<Props> = ({
  characters,
  onUpdateCharacters,
  propsList,
  onUpdateProps,
  locations,
  onUpdateLocations,
}) => {
  const [activeTab, setActiveTab] = useState<'characters' | 'locations' | 'props'>('characters');
  const [testingVoiceId, setTestingVoiceId] = useState<string | null>(null);
  const [showPresetPicker, setShowPresetPicker] = useState<boolean>(false);
  const [currentEditIndex, setCurrentEditIndex] = useState<number | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [customAiPrompt, setCustomAiPrompt] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Play voice sample
  const handleTestVoice = (voiceId: string, charName: string) => {
    setTestingVoiceId(voiceId);
    const audioUrl = `/api/tts?voiceId=${voiceId}&text=${encodeURIComponent(`Hola, soy ${charName} y esta es mi voz en el minidrama.`)}&t=${Date.now()}`;
    const audio = new Audio(audioUrl);
    audio.onended = () => setTestingVoiceId(null);
    audio.onerror = () => setTestingVoiceId(null);
    audio.play().catch(() => setTestingVoiceId(null));
  };

  // Add Character handler
  const handleAddCharacter = () => {
    const nextPreset = AVATAR_PRESETS[characters.length % AVATAR_PRESETS.length];
    const newChar: CustomCharacter = {
      id: `char_${Date.now()}`,
      name: nextPreset.name,
      role: nextPreset.role,
      imageUrl: nextPreset.img,
      voiceProfile: nextPreset.voice,
    };
    onUpdateCharacters([...characters, newChar]);
  };

  // Add Prop handler
  const handleAddProp = () => {
    const nextPreset = PROP_PRESETS[propsList.length % PROP_PRESETS.length];
    const newProp: CustomProp = {
      id: `prop_${Date.now()}`,
      name: nextPreset.name,
      category: nextPreset.cat,
      imageUrl: nextPreset.img,
      sceneTarget: Math.min(propsList.length + 1, 4),
    };
    onUpdateProps([...propsList, newProp]);
  };

  // Add Location handler
  const handleAddLocation = () => {
    const nextPreset = LOCATION_PRESETS[locations.length % LOCATION_PRESETS.length];
    const newLoc: CustomLocation = {
      id: `loc_${Date.now()}`,
      name: nextPreset.name,
      imageUrl: nextPreset.img,
      sceneNumber: Math.min(locations.length + 1, 4),
    };
    onUpdateLocations([...locations, newLoc]);
  };

  // Handle local user image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, targetType: 'character' | 'location' | 'prop', targetIndex: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        if (targetType === 'character') {
          const updated = [...characters];
          updated[targetIndex].imageUrl = base64Url;
          onUpdateCharacters(updated);
        } else if (targetType === 'location') {
          const updated = [...locations];
          updated[targetIndex].imageUrl = base64Url;
          onUpdateLocations(updated);
        } else if (targetType === 'prop') {
          const updated = [...propsList];
          updated[targetIndex].imageUrl = base64Url;
          onUpdateProps(updated);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate Asset with AI
  const handleGenerateWithAi = async (targetType: 'character' | 'location' | 'prop', targetIndex: number) => {
    setIsGeneratingAi(true);
    try {
      let prompt = customAiPrompt.trim();
      if (!prompt) {
        if (targetType === 'character') {
          prompt = `8k cinematic portrait of ${characters[targetIndex]?.role || 'professional executive'}, photorealistic, 85mm f/1.4 lens, volumetric lighting, vertical 9:16`;
        } else if (targetType === 'location') {
          prompt = `8k cinematic modern architectural interior or city view for ${locations[targetIndex]?.name || 'modern executive space'}, vertical 9:16`;
        } else {
          prompt = `8k product studio photo of ${propsList[targetIndex]?.name || 'modern technology item'}, clean backdrop, depth of field`;
        }
      }

      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          characterName: targetType === 'character' ? characters[targetIndex]?.name : undefined,
          sceneNumber: 1
        })
      });

      const data = await res.json();
      if (data.imageUrl) {
        if (targetType === 'character') {
          const updated = [...characters];
          updated[targetIndex].imageUrl = data.imageUrl;
          onUpdateCharacters(updated);
        } else if (targetType === 'location') {
          const updated = [...locations];
          updated[targetIndex].imageUrl = data.imageUrl;
          onUpdateLocations(updated);
        } else if (targetType === 'prop') {
          const updated = [...propsList];
          updated[targetIndex].imageUrl = data.imageUrl;
          onUpdateProps(updated);
        }
      }
    } catch (err) {
      console.error('AI generation error:', err);
    } finally {
      setIsGeneratingAi(false);
      setShowPresetPicker(false);
      setCustomAiPrompt('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-900/90 border border-white/10">
        {[
          { id: 'characters', label: '1. Personajes y Rostros', icon: Users, count: characters.length },
          { id: 'locations', label: '2. Escenarios y Fondos', icon: ImageIcon, count: locations.length },
          { id: 'props', label: '3. Objetos y Productos', icon: Package, count: propsList.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                isSelected
                  ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-lg shadow-violet-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 font-mono">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 1. Characters Section */}
      {activeTab === 'characters' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-violet-950/20 border border-violet-500/20">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-400" />
                Elenco de Personajes y Asignación de Rostros
              </h3>
              <p className="text-xs text-zinc-400">
                Elegí un rostro del catálogo, subí una foto propia o generalo con IA. Rembg aislará al personaje automáticamente.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddCharacter}
              className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-violet-600/20 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Personaje</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {characters.map((char, index) => (
              <div
                key={char.id}
                className="p-4 rounded-2xl glass-panel border border-white/10 space-y-3 relative group hover:border-violet-500/40 transition-all"
              >
                <div className="flex items-start gap-3.5">
                  {/* Avatar Image & Actions */}
                  <div className="space-y-1.5 shrink-0">
                    <div className="relative w-20 h-24 rounded-xl overflow-hidden border border-violet-500/50 bg-zinc-800 shadow-md">
                      <img
                        src={char.imageUrl}
                        alt={char.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-black/75 py-0.5 text-[8px] text-center text-emerald-400 font-bold flex items-center justify-center gap-0.5">
                        <Scissors className="w-2 h-2" /> Rembg Activo
                      </div>
                    </div>

                    {/* Change face buttons */}
                    <div className="flex items-center gap-1">
                      <label className="flex-1 py-1 px-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[9px] text-zinc-300 hover:text-white font-semibold cursor-pointer text-center border border-white/10 flex items-center justify-center gap-1">
                        <Camera className="w-2.5 h-2.5" /> Subir
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'character', index)}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentEditIndex(index);
                          setShowPresetPicker(true);
                        }}
                        className="py-1 px-1.5 rounded-lg bg-violet-600/30 hover:bg-violet-600/50 text-[9px] text-violet-300 font-semibold border border-violet-500/30 flex items-center justify-center gap-0.5"
                      >
                        <Wand2 className="w-2.5 h-2.5" /> Rostros
                      </button>
                    </div>
                  </div>

                  {/* Character Info Fields */}
                  <div className="flex-1 space-y-2">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Nombre del Personaje</label>
                      <input
                        type="text"
                        value={char.name}
                        onChange={(e) => {
                          const updated = [...characters];
                          updated[index].name = e.target.value;
                          onUpdateCharacters(updated);
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/15 text-white text-xs font-bold focus:ring-1 focus:ring-violet-500"
                        placeholder="Ej: Elena"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Rol en el Minidrama</label>
                      <input
                        type="text"
                        value={char.role}
                        onChange={(e) => {
                          const updated = [...characters];
                          updated[index].role = e.target.value;
                          onUpdateCharacters(updated);
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-zinc-200 text-[11px]"
                        placeholder="Ej: Protagonista / Fundadora Tech"
                      />
                    </div>

                    {/* Voice Assignment & Live Voice Tester */}
                    <div className="pt-1.5 border-t border-white/5 space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Sliders className="w-2.5 h-2.5 text-pink-400" />
                          Voz Asignada:
                        </span>
                        <button
                          type="button"
                          onClick={() => handleTestVoice(char.voiceProfile, char.name)}
                          disabled={testingVoiceId === char.voiceProfile}
                          className="text-[10px] text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1 bg-pink-500/10 hover:bg-pink-500/20 px-2 py-0.5 rounded-md border border-pink-500/20 transition-all"
                        >
                          <Volume2 className={`w-3 h-3 ${testingVoiceId === char.voiceProfile ? 'animate-bounce' : ''}`} />
                          <span>{testingVoiceId === char.voiceProfile ? 'Sonando...' : 'Probar Voz'}</span>
                        </button>
                      </label>
                      <select
                        value={char.voiceProfile}
                        onChange={(e) => {
                          const updated = [...characters];
                          updated[index].voiceProfile = e.target.value;
                          onUpdateCharacters(updated);
                        }}
                        className="w-full px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/10 text-zinc-200 text-xs focus:ring-1 focus:ring-pink-500"
                      >
                        <option value="founder_female">Elena (Femenina • es-AR)</option>
                        <option value="executive_male">Marcos (Masculina • es-AR)</option>
                        <option value="investor_male">David (Masculina VC • es-MX)</option>
                        <option value="innovator_female">Sofía (Femenina Tech • es-MX)</option>
                        <option value="spanish_female">Lucía (Femenina • es-ES)</option>
                        <option value="spanish_male">Carlos (Masculina • es-ES)</option>
                      </select>
                    </div>
                  </div>

                  {/* Delete Character */}
                  {characters.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onUpdateCharacters(characters.filter((_, i) => i !== index))}
                      className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="Eliminar personaje"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Locations Section */}
      {activeTab === 'locations' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                Escenarios, Locaciones y Fondos Reales
              </h3>
              <p className="text-xs text-zinc-400">
                Elegí escenarios cinemáticos, subí fotos de tu oficina o capturas de tu software SaaS para ambientar el minidrama.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddLocation}
              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-600/20 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Escenario</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {locations.map((loc, index) => (
              <div
                key={loc.id}
                className="p-4 rounded-2xl glass-panel border border-white/10 space-y-3 group hover:border-cyan-500/40 transition-all"
              >
                <div className="h-36 rounded-xl overflow-hidden border border-white/10 relative bg-zinc-800">
                  <img
                    src={loc.imageUrl}
                    alt={loc.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-black/80 text-[10px] text-cyan-300 font-bold border border-cyan-500/30">
                    Aparece en Escena #{loc.sceneNumber}
                  </div>

                  {/* Upload photo button */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2">
                    <label className="flex-1 py-1.5 px-2.5 rounded-lg bg-black/70 hover:bg-black/90 text-xs text-white font-bold backdrop-blur-md cursor-pointer text-center border border-white/20 flex items-center justify-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-cyan-400" /> Subir Foto de Fondo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'location', index)}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Nombre del Escenario</label>
                    <input
                      type="text"
                      value={loc.name}
                      onChange={(e) => {
                        const updated = [...locations];
                        updated[index].name = e.target.value;
                        onUpdateLocations(updated);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs font-bold"
                      placeholder="Ej: Sala de Directorio Moderna"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Escena</label>
                    <select
                      value={loc.sceneNumber}
                      onChange={(e) => {
                        const updated = [...locations];
                        updated[index].sceneNumber = Number(e.target.value);
                        onUpdateLocations(updated);
                      }}
                      className="px-2 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-cyan-300 text-xs font-bold"
                    >
                      <option value={1}>Escena 1</option>
                      <option value={2}>Escena 2</option>
                      <option value={3}>Escena 3</option>
                      <option value={4}>Escena 4</option>
                    </select>
                  </div>

                  {locations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onUpdateLocations(locations.filter((_, i) => i !== index))}
                      className="text-zinc-500 hover:text-rose-400 p-2 rounded-lg hover:bg-rose-500/10 transition-colors self-end"
                      title="Eliminar escenario"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Props Section */}
      {activeTab === 'props' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-pink-950/20 border border-pink-500/20">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-pink-400" />
                Objetos, Productos y Elementos Clave
              </h3>
              <p className="text-xs text-zinc-400">
                El producto físico, dispositivo o llave que los personajes sostienen o muestran como revelación del clímax.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddProp}
              className="px-3.5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-pink-600/20 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Producto</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {propsList.map((prop, index) => (
              <div
                key={prop.id}
                className="p-4 rounded-2xl glass-panel border border-white/10 space-y-3 group hover:border-pink-500/40 transition-all"
              >
                <div className="flex items-start gap-3.5">
                  <div className="space-y-1.5 shrink-0">
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-pink-500/40 shrink-0 bg-zinc-800 relative">
                      <img
                        src={prop.imageUrl}
                        alt={prop.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <label className="block py-1 px-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[9px] text-zinc-300 font-semibold cursor-pointer text-center border border-white/10">
                      <Camera className="w-2.5 h-2.5 inline mr-1" /> Foto
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'prop', index)}
                      />
                    </label>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Nombre del Producto u Objeto</label>
                      <input
                        type="text"
                        value={prop.name}
                        onChange={(e) => {
                          const updated = [...propsList];
                          updated[index].name = e.target.value;
                          onUpdateProps(updated);
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs font-bold"
                        placeholder="Ej: Llave de Propiedades Exclusivas"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                      <span className="text-[10px] text-zinc-400 font-semibold">Aparece en:</span>
                      <select
                        value={prop.sceneTarget}
                        onChange={(e) => {
                          const updated = [...propsList];
                          updated[index].sceneTarget = Number(e.target.value);
                          onUpdateProps(updated);
                        }}
                        className="px-2 py-1 rounded bg-zinc-900 border border-white/10 text-pink-300 text-xs font-bold"
                      >
                        <option value={1}>Escena 1 (Gancho)</option>
                        <option value={2}>Escena 2 (Escalada)</option>
                        <option value={3}>Escena 3 (Giro)</option>
                        <option value={4}>Escena 4 (Clímax/Solución)</option>
                      </select>
                    </div>
                  </div>

                  {propsList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onUpdateProps(propsList.filter((_, i) => i !== index))}
                      className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preset Avatar Selection Modal */}
      {showPresetPicker && currentEditIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full p-6 rounded-3xl glass-panel-glow border border-violet-500/40 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-violet-400">
                <Wand2 className="w-5 h-5" />
                <h3 className="text-base font-extrabold text-white">Catálogo de Rostros Hiperrealistas</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPresetPicker(false)}
                className="text-zinc-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-zinc-800"
              >
                Cerrar
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-violet-950/30 border border-violet-500/20">
              <p className="text-xs text-zinc-300">
                Elegí un rostro de alta fidelidad o cargá una foto propia desde tu computadora:
              </p>
              <label className="py-1.5 px-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md shadow-violet-600/30">
                <Camera className="w-3.5 h-3.5" />
                <span>Subir Mi Foto</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    handleFileUpload(e, 'character', currentEditIndex);
                    setShowPresetPicker(false);
                  }}
                />
              </label>
            </div>

            {/* Preset Face Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {AVATAR_PRESETS.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    const updated = [...characters];
                    updated[currentEditIndex].imageUrl = preset.img;
                    updated[currentEditIndex].name = preset.name;
                    updated[currentEditIndex].role = preset.role;
                    updated[currentEditIndex].voiceProfile = preset.voice;
                    onUpdateCharacters(updated);
                    setShowPresetPicker(false);
                  }}
                  className="p-2 rounded-xl border border-white/10 bg-zinc-900 hover:border-violet-500 hover:bg-violet-500/10 cursor-pointer space-y-1.5 text-center group transition-all"
                >
                  <div className="w-full h-24 rounded-lg overflow-hidden bg-zinc-800">
                    <img src={preset.img} alt={preset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="text-xs font-bold text-white truncate">{preset.name}</div>
                  <div className="text-[9px] text-zinc-400 truncate">{preset.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
