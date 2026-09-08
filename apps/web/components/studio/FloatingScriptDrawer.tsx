'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Copy,
  Check,
  Sparkles,
  ClipboardPaste,
  Wand2,
  X,
  RefreshCw,
  Sliders,
  Send,
  Eye,
  CheckCircle2,
  Edit3,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { DramaScriptPayload } from '@/lib/gcp-vertex';

interface Props {
  script: DramaScriptPayload | null;
  onApplyScript: (newScript: DramaScriptPayload) => void;
}

export const FloatingScriptDrawer: React.FC<Props> = ({
  script,
  onApplyScript
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'view' | 'paste' | 'prompt'>('view');
  const [pastedText, setPastedText] = useState('');
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<DramaScriptPayload | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Format script into clean readable text
  const getFormattedScriptText = (s: DramaScriptPayload | null) => {
    if (!s) return 'No hay ningún guión cargado todavía.';
    let text = `🎬 TÍTULO: ${s.title}\n`;
    text += `🔥 GANCHO: "${s.hook}"\n`;
    text += `📖 LOGLINE: ${s.logline}\n\n`;
    text += `👥 PERSONAJES:\n`;
    s.characters?.forEach((c) => {
      text += `  • ${c.name} (${c.role || 'Personaje'})\n`;
    });
    text += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    s.scenes?.forEach((sc) => {
      text += `[ESCENA ${sc.scene_number} - ${sc.duration_seconds || 7}s] 👤 ${sc.character}:\n`;
      text += `"${sc.dialogue}"\n`;
      text += `🎥 Visual: ${sc.visual_prompt}\n`;
      text += `🔊 Efecto: ${sc.sound_effect || 'dramatic_boom'} | Cámara: ${sc.camera_motion || 'zoom_in'}\n\n`;
    });
    return text;
  };

  // Copy full script to clipboard
  const handleCopy = () => {
    const text = getFormattedScriptText(script);
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Click "Editar Guión" -> Preload text and switch to edit tab
  const handleStartEditing = () => {
    const formatted = getFormattedScriptText(script);
    setPastedText(formatted);
    setActiveTab('paste');
    setStatusMessage('Texto del guión cargado en el editor. Hacé tus cambios y presioná "Procesar y Confirmar".');
  };

  // Parse pasted or edited external script
  const handleProcessScript = async () => {
    if (!pastedText.trim()) return;
    setIsParsing(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/parse-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawScript: pastedText })
      });
      const data = await res.json();
      if (data.status === 'SUCCESS' && data.data) {
        setParsedPreview(data.data);
        setShowConfirmationModal(true);
      } else {
        setStatusMessage('No se pudo procesar el guión. Verificá que contenga al menos 4 líneas de diálogo.');
      }
    } catch (err: any) {
      setStatusMessage(`Error al procesar: ${err.message}`);
    } finally {
      setIsParsing(false);
    }
  };

  // AI Autocomplete
  const handleAiAutocomplete = async () => {
    if (!aiPromptInput.trim()) return;
    setIsParsing(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/parse-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawScript: `Tema e instrucciones de guión: ${aiPromptInput}. Guión de referencia: ${JSON.stringify(script?.scenes)}`
        })
      });
      const data = await res.json();
      if (data.status === 'SUCCESS' && data.data) {
        setParsedPreview(data.data);
        setShowConfirmationModal(true);
      }
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsParsing(false);
    }
  };

  // Final Confirmation: Apply parsed script to project state
  const handleConfirmAndApply = () => {
    if (parsedPreview) {
      onApplyScript(parsedPreview);
      setShowConfirmationModal(false);
      setParsedPreview(null);
      setPastedText('');
      setAiPromptInput('');
      setActiveTab('view');
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* 1. Floating Action Button (Always Visible) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group px-4 py-3 rounded-full bg-gradient-to-r from-violet-600 via-pink-600 to-amber-500 text-white font-extrabold text-xs shadow-2xl shadow-violet-600/50 hover:shadow-violet-600/80 border border-white/20 flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 backdrop-blur-md animate-pulse hover:animate-none"
          title="Abrir Copiloto de Guión en Texto y Adaptador IA"
        >
          <FileText className="w-4 h-4 text-white" />
          <span className="tracking-wide">Copiloto de Guión (Texto / Pegar)</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </button>
      </div>

      {/* 2. Slide-Over Modal Window */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="max-w-3xl w-full h-[85vh] bg-zinc-950/95 rounded-3xl border border-violet-500/40 shadow-2xl flex flex-col overflow-hidden relative">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-zinc-900/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    Copiloto de Guión y Adaptador Inteligente
                  </h3>
                  <p className="text-xs text-zinc-400">Visualizá en texto, editá, pegá desde cualquier app o autocompletá con IA</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sub-Tabs */}
            <div className="flex items-center gap-2 p-2 border-b border-white/10 bg-zinc-900/40">
              {[
                { id: 'view', label: '1. Ver Guión en Texto', icon: Eye },
                { id: 'paste', label: '2. Pegar / Editar Guión', icon: ClipboardPaste },
                { id: 'prompt', label: '3. Autocompletar / Prompt IA', icon: Wand2 }
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setStatusMessage(null);
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
              
              {/* Status Notice */}
              {statusMessage && (
                <div className="p-3 rounded-xl bg-violet-950/40 border border-violet-500/30 text-violet-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {/* Tab 1: View Formatted Script */}
              {activeTab === 'view' && (
                <div className="space-y-3 h-full flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400 font-mono">Texto completo sincronizado con el Storyboard:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleStartEditing}
                        className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-violet-600/30 hover:scale-105"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar Guión</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopy}
                        className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/10"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? '¡Copiado!' : 'Copiar Texto'}</span>
                      </button>
                    </div>
                  </div>

                  <textarea
                    readOnly
                    value={getFormattedScriptText(script)}
                    className="w-full flex-1 min-h-[350px] p-4 rounded-2xl bg-zinc-900 border border-white/10 text-zinc-200 font-mono text-xs leading-relaxed focus:outline-none resize-none select-all"
                  />
                </div>
              )}

              {/* Tab 2: Paste / Edit External Script */}
              {activeTab === 'paste' && (
                <div className="space-y-3 h-full flex flex-col">
                  <p className="text-xs text-zinc-400">
                    Editá los nombres, personajes o diálogos libremente. Al presionar **OK**, el sistema validará la compatibilidad y te mostrará el guión final para tu confirmación:
                  </p>

                  <textarea
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Ejemplo:&#10;Anastasia: ¡Frená todo Marcos! No podemos seguir con este método.&#10;Marcos: Mirá los números Anastasia, automatizamos todo y triplicamos las ventas...&#10;Anastasia: ¿Cómo lograste eso en 48 horas?&#10;Marcos: Con la nueva metodología."
                    className="w-full flex-1 min-h-[260px] p-4 rounded-2xl bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 font-sans text-xs focus:ring-1 focus:ring-violet-500 resize-none leading-relaxed"
                  />

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleProcessScript}
                      disabled={isParsing || !pastedText.trim()}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                    >
                      <Wand2 className={`w-4 h-4 ${isParsing ? 'animate-spin' : ''}`} />
                      <span>{isParsing ? 'Validando y Adaptando Formato...' : 'Procesar y Confirmar Guión (OK)'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: AI Autocomplete Prompt */}
              {activeTab === 'prompt' && (
                <div className="space-y-3 h-full flex flex-col">
                  <p className="text-xs text-zinc-400">
                    Escribí una indicación para transformar el guión (ej: cambiar nombres de personajes, aumentar el dramatismo o reescribir con otro enfoque):
                  </p>

                  <textarea
                    value={aiPromptInput}
                    onChange={(e) => setAiPromptInput(e.target.value)}
                    placeholder="Ej: Cambiá el nombre de la fundadora por Anastasia y hacé que Marcos sea más autoritario en la primera escena..."
                    className="w-full flex-1 min-h-[220px] p-4 rounded-2xl bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 font-sans text-xs focus:ring-1 focus:ring-pink-500 resize-none"
                  />

                  <button
                    type="button"
                    onClick={handleAiAutocomplete}
                    disabled={isParsing || !aiPromptInput.trim()}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-amber-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-pink-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                  >
                    <Sparkles className={`w-4 h-4 ${isParsing ? 'animate-spin' : ''}`} />
                    <span>{isParsing ? 'Generando Autocompletado...' : '🚀 Autocompletar y Confirmar con IA'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-zinc-900/40 flex items-center justify-between">
              <span className="text-[11px] text-zinc-500 font-mono">Formato TikTok 9:16 • 4 Escenas Sincronizadas</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>

            {/* 3. Mandatory Confirmation Sub-Modal */}
            {showConfirmationModal && parsedPreview && (
              <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
                <div className="max-w-xl w-full p-6 rounded-3xl bg-zinc-950 border border-violet-500/60 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
                  <div className="flex items-center gap-3 text-amber-400">
                    <HelpCircle className="w-6 h-6 shrink-0" />
                    <div>
                      <h4 className="text-base font-extrabold text-white">Confirmación de Guión</h4>
                      <p className="text-xs text-amber-300">Éste es el guión que se utilizará para el minidrama, ¿Estás de acuerdo?</p>
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="p-3.5 rounded-2xl bg-zinc-900 border border-white/10 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="font-bold text-white">{parsedPreview.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">4 Escenas Validadas</span>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-[11px] text-zinc-400 font-bold uppercase">Personajes Detectados:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {parsedPreview.characters?.map((c, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-violet-600/30 text-violet-300 font-semibold text-[11px] border border-violet-500/30">
                            👤 {c.name} ({c.role})
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <p className="text-[11px] text-zinc-400 font-bold uppercase">Diálogos de las Escenas:</p>
                      {parsedPreview.scenes?.map((s, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-zinc-800/80 text-[11px] border border-white/5 space-y-0.5">
                          <div className="flex items-center justify-between font-bold text-violet-400">
                            <span>Escena {s.scene_number} ({s.character}):</span>
                            <span className="text-[9px] text-zinc-500">{s.duration_seconds}s</span>
                          </div>
                          <p className="text-zinc-200">&ldquo;{s.dialogue}&rdquo;</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowConfirmationModal(false)}
                      className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                    >
                      ✏️ Volver a Modificar
                    </button>

                    <button
                      type="button"
                      onClick={handleConfirmAndApply}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>✓ Sí, Confirmar y Aplicar al Minidrama</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
};
