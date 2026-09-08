'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DramaWizard, WizardFormData } from '@/components/studio/DramaWizard';
import { ScriptReviewScreen } from '@/components/studio/ScriptReviewScreen';
import { ControlledMinidramaPlayer } from '@/components/studio/ControlledMinidramaPlayer';
import { DramaRenderProgressModal } from '@/components/studio/DramaRenderProgressModal';
import { DramaScriptPayload } from '@/lib/gcp-vertex';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function StudioPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = (params?.projectId as string) || 'nuevo';

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isGeneratingScript, setIsGeneratingScript] = useState<boolean>(false);
  const [isRenderModalOpen, setIsRenderModalOpen] = useState<boolean>(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('ejecutivo_latino');
  const [lastFormData, setLastFormData] = useState<WizardFormData | null>(null);

  // Script State (Default clean template with two contrasting characters)
  const [scriptPayload, setScriptPayload] = useState<DramaScriptPayload>({
    title: 'El Giro Decisivo en Automatización',
    hook: '¡Frená todo, Elena! ¿Cómo lograste cuadruplicar las ventas en 48 horas?',
    logline: 'Una confrontación decisiva donde Elena demuestra el poder de automatizar la captación de clientes.',
    characters: [
      { name: 'Marcos', voice_type: 'executive_male', role: 'Directivo Escéptico' },
      { name: 'Elena', voice_type: 'founder_female', role: 'Fundadora Estratega' },
    ],
    scenes: [
      {
        scene_number: 1,
        duration_seconds: 5,
        character: 'Marcos',
        dialogue: 'Cancelá el contrato ahora mismo. Tu campaña fue un fracaso absoluto.',
        visual_prompt: 'Confrontación tensa en sala de directorio moderna de vidrio, directivo ejecutivo masculino en traje oscuro, iluminación dramática, formato vertical 9:16 en 8k.',
        imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1080&h=1920&fit=crop&q=80',
        videoUrl: '/videos/nexorouter_wan_drama.mp4',
        camera_motion: 'zoom_in',
      },
      {
        scene_number: 2,
        duration_seconds: 6,
        character: 'Elena',
        dialogue: 'Mirá bien las métricas en vivo, Marcos. Automatizamos todo el flujo y subió un 400%.',
        visual_prompt: 'Fundadora mujer en blazer moderno sosteniendo tablet holográfica con salto de 400% en ventas, formato vertical 9:16.',
        imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1080&h=1920&fit=crop&q=80',
        videoUrl: '/videos/nexorouter_wan_scene_2.mp4',
        camera_motion: 'pan_up',
      },
      {
        scene_number: 3,
        duration_seconds: 6,
        character: 'Marcos',
        dialogue: 'Pará un segundo... ¿la retención subió un 400% en doce horas?! ¿Cómo hiciste eso?',
        visual_prompt: 'Directivo masculino en shock mirando el panel de analíticas con incredulidad absoluta, iluminación volumétrica, formato 9:16.',
        imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1080&h=1920&fit=crop&q=80',
        videoUrl: '/videos/nexorouter_wan_scene_3.mp4',
        camera_motion: 'shake',
      },
      {
        scene_number: 4,
        duration_seconds: 7,
        character: 'Elena',
        dialogue: 'Porque mientras dudabas, implementamos IA generativa. Probalo antes de que lo use tu competencia.',
        visual_prompt: 'Toma heroica de fundadora mujer con el panel del producto en un estudio moderno con destellos neón violeta, formato 9:16.',
        imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1080&h=1920&fit=crop&q=80',
        videoUrl: '/videos/nexorouter_wan_scene_4.mp4',
        camera_motion: 'zoom_out',
      },
    ],
  });

  // Handle Step 1 Submit: Generate complete script with AI
  const handleWizardSubmit = async (formData: WizardFormData) => {
    setIsGeneratingScript(true);
    setLastFormData(formData);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          enableLiveData: true,
        }),
      });

      const data = await res.json();
      if (data.status === 'SUCCESS' && data.data) {
        setScriptPayload(data.data);
      }
      setCurrentStep(2);
    } catch (e) {
      console.error('Failed to generate script:', e);
      setCurrentStep(2);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // Handle Regenerate Script
  const handleRegenerateScript = async () => {
    if (!lastFormData) {
      // If no form submitted yet, regenerate with current payload
      setIsGeneratingScript(true);
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            niche: 'Negocios y Emprendimiento',
            valueProp: scriptPayload.logline,
            archetype: 'Fundador Subestimado vs Cliente Escéptico',
          }),
        });
        const data = await res.json();
        if (data.status === 'SUCCESS' && data.data) {
          setScriptPayload(data.data);
        }
      } catch (err) {
        console.error('Regenerate error:', err);
      } finally {
        setIsGeneratingScript(false);
      }
      return;
    }

    await handleWizardSubmit(lastFormData);
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Studio Header Breadcrumb & Step Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              <span>DramaFlow Studio</span>
              <span className="text-xs px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 font-mono">
                {projectId}
              </span>
            </h1>
            <p className="text-xs text-zinc-400">
              Creación de Minidramas Paso a Paso • Resultados Controlados
            </p>
          </div>
        </div>

        {/* 3 Clear Ordered Steps */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { step: 1, label: '1. Concepto y Gancho' },
            { step: 2, label: '2. Confirmar Guión y Voces' },
            { step: 3, label: '3. Minidrama (Video + Diálogo)' },
          ].map((s) => (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                currentStep === s.step
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30 ring-1 ring-violet-400'
                  : currentStep > s.step
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-zinc-900 border border-white/10 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: Concept & Setup (Pantalla 2) */}
      {currentStep === 1 && (
        <DramaWizard
          onSubmit={handleWizardSubmit}
          isLoading={isGeneratingScript}
        />
      )}

      {/* STEP 2: Full Script & Voice Review & Confirmation (Pantalla 3) */}
      {currentStep === 2 && (
        <ScriptReviewScreen
          script={scriptPayload}
          selectedVoice={selectedVoice}
          onSelectVoice={setSelectedVoice}
          onUpdateScript={setScriptPayload}
          onConfirmScript={() => setIsRenderModalOpen(true)}
          onBackToConcept={() => setCurrentStep(1)}
          onRegenerate={handleRegenerateScript}
          isRegenerating={isGeneratingScript}
        />
      )}

      {/* STEP 3: Controlled Minidrama Generation: Only Video + Dialogue (Pantalla 4) */}
      {currentStep === 3 && (
        <ControlledMinidramaPlayer
          script={scriptPayload}
          selectedVoice={selectedVoice}
          onSelectVoice={setSelectedVoice}
          onBackToScript={() => setCurrentStep(2)}
          onResetToStep1={() => setCurrentStep(1)}
          projectId={projectId}
        />
      )}

      {/* MODAL: Automated SaaS Rendering Flow (Componente Clave) */}
      <DramaRenderProgressModal
        isOpen={isRenderModalOpen}
        script={scriptPayload}
        voiceId={selectedVoice}
        onComplete={(updatedScript) => {
          setScriptPayload(updatedScript);
          setIsRenderModalOpen(false);
          setCurrentStep(3);
        }}
        onCancel={() => setIsRenderModalOpen(false)}
      />
    </div>
  );
}
