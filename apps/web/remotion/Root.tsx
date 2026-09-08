import React from 'react';
import { Composition } from 'remotion';
import { TikTokDramaComposition } from './TikTokDramaComposition';
import { DramaCompositionProps, WhisperXWord } from './types';

// Sample WhisperX timestamps demo for testing
export const DEMO_WHISPER_WORDS: WhisperXWord[] = [
  { word: 'Cancelá', start: 0.15, end: 0.65 },
  { word: 'el', start: 0.70, end: 0.85 },
  { word: 'contrato', start: 0.90, end: 1.45 },
  { word: 'ahora', start: 1.50, end: 1.85 },
  { word: 'mismo.', start: 1.90, end: 2.30 },
  { word: 'Tu', start: 2.50, end: 2.65 },
  { word: 'campaña', start: 2.70, end: 3.10 },
  { word: 'fue', start: 3.15, end: 3.35 },
  { word: 'un', start: 3.40, end: 3.50 },
  { word: 'desastre.', start: 3.55, end: 4.10 },
  { word: 'Mirá', start: 5.20, end: 5.50 },
  { word: 'las', start: 5.55, end: 5.70 },
  { word: 'métricas', start: 5.75, end: 6.20 },
  { word: 'en', start: 6.25, end: 6.40 },
  { word: 'vivo,', start: 6.45, end: 6.80 },
  { word: 'Marcos.', start: 6.85, end: 7.30 },
  { word: 'Subió', start: 7.40, end: 7.80 },
  { word: 'un', start: 7.85, end: 8.00 },
  { word: '400%.', start: 8.05, end: 8.70 },
  { word: 'DramaFlow', start: 10.10, end: 10.75 },
  { word: 'te', start: 10.80, end: 10.95 },
  { word: 'automatiza', start: 11.00, end: 11.60 },
  { word: 'todo', start: 11.65, end: 11.90 },
  { word: 'en', start: 11.95, end: 12.10 },
  { word: 'segundos.', start: 12.15, end: 12.80 },
];

export const DEFAULT_DRAMA_PROPS: DramaCompositionProps = {
  title: 'Conflicto de Socios — Retención Viral',
  captionStyle: 'karaoke_bounce',
  enableParallax: true,
  whisperWords: DEMO_WHISPER_WORDS,
  scenes: [
    {
      scene_number: 1,
      duration_seconds: 5,
      character: 'Marcos (CEO)',
      dialogue: 'Cancelá el contrato ahora mismo. Tu campaña fue un desastre.',
      visual_prompt: 'Director ejecutivo enfurecido en rascacielos con vista nocturna',
      imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1080&h=1920&fit=crop&q=80',
      camera_motion: 'zoom_in',
      emotion: 'furious',
    },
    {
      scene_number: 2,
      duration_seconds: 5,
      character: 'Sofía (Fundadora)',
      dialogue: 'Mirá las métricas en vivo, Marcos. Subió un 400%.',
      visual_prompt: 'Fundadora confiada mostrando tablet con gráficos de crecimiento exponencial',
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1080&h=1920&fit=crop&q=80',
      camera_motion: 'pan_up',
      emotion: 'confident',
    },
    {
      scene_number: 3,
      duration_seconds: 5,
      character: 'Sofía (Fundadora)',
      dialogue: 'DramaFlow te automatiza todo en segundos.',
      visual_prompt: 'Estudio de filmación futurista con luces de neón magenta y violeta',
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1080&h=1920&fit=crop&q=80',
      camera_motion: 'zoom_out',
      emotion: 'sarcastic',
    },
  ],
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="TikTokDrama"
      component={TikTokDramaComposition as any}
      durationInFrames={450} // 15 seconds @ 30fps
      fps={30}
      width={1080}
      height={1920}
      defaultProps={DEFAULT_DRAMA_PROPS}
    />
  );
};
