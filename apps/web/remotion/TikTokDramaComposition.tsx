import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  Video,
} from 'remotion';
import { DramaCompositionProps, CompositionScene } from './types';
import { WhisperSubtitles } from './WhisperSubtitles';

// Cinematic Scene Visual with LivePortrait Talking Simulation & Micro-Motion
const SceneVisual: React.FC<{
  scene: CompositionScene;
  durationInFrames: number;
  enableParallax?: boolean;
}> = ({ scene, durationInFrames, enableParallax = true }) => {
  const frame = useCurrentFrame();
  const motion = scene.camera_motion || 'zoom_in';

  // 1. Ken Burns Dynamic Camera Motion
  let scale = 1.0;
  let translateY = 0;
  let translateX = 0;

  if (motion === 'zoom_in') {
    scale = interpolate(frame, [0, durationInFrames], [1.02, 1.16], {
      extrapolateRight: 'clamp',
    });
  } else if (motion === 'zoom_out') {
    scale = interpolate(frame, [0, durationInFrames], [1.16, 1.02], {
      extrapolateRight: 'clamp',
    });
  } else if (motion === 'pan_up') {
    scale = 1.1;
    translateY = interpolate(frame, [0, durationInFrames], [35, -35], {
      extrapolateRight: 'clamp',
    });
  } else if (motion === 'shake') {
    scale = 1.08;
    translateX = Math.sin(frame * 0.6) * 3.5;
    translateY = Math.cos(frame * 0.7) * 2.5;
  } else {
    scale = 1.06;
    translateY = Math.sin(frame * 0.05) * 12;
  }

  // 2. LivePortrait Organic Micro-Motion (Breathing & Head Movement)
  const breathing = Math.sin(frame * 0.07) * 4;
  const headSway = Math.cos(frame * 0.04) * 2.5;

  // 3. Speaking Modulation (simulates mouth & jaw movement while speaking)
  const isSpeaking = frame > 10 && frame < durationInFrames - 15;
  const mouthSyncPulse = isSpeaking ? 1.0 + Math.abs(Math.sin(frame * 0.35)) * 0.025 : 1.0;

  const bgMedia = scene.videoUrl ? (
    <Video
      src={scene.videoUrl}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: `scale(${scale * mouthSyncPulse}) translate(${translateX + headSway}px, ${translateY + breathing}px)`,
      }}
    />
  ) : (
    <Img
      src={
        scene.imageUrl ||
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1080&h=1920&fit=crop&q=80'
      }
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: `scale(${scale * mouthSyncPulse}) translate(${translateX + headSway}px, ${translateY + breathing}px)`,
      }}
    />
  );

  // Character 2.5D Cutout Layer with Independent Depth Floating
  const characterCutout = enableParallax && scene.characterCutoutUrl ? (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: `translateX(-50%) scale(${scale * 1.04}) translateY(${(translateY + breathing) * 0.6}px)`,
        height: '86%',
        width: 'auto',
        zIndex: 20,
        filter: 'drop-shadow(0 12px 30px rgba(0,0,0,0.8))',
        pointerEvents: 'none',
      }}
    >
      <Img
        src={scene.characterCutoutUrl}
        style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
      />
    </div>
  ) : null;

  // Volumetric Lighting Flare based on tension
  const flareIntensity = Math.abs(Math.sin(frame * 0.03)) * 0.3;

  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: '#090A0F' }}>
      {bgMedia}
      {characterCutout}

      {/* Cinematic Dynamic Lighting Flare */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '20%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, rgba(0,0,0,0) 70%)',
          opacity: 0.6 + flareIntensity,
          pointerEvents: 'none',
          zIndex: 25,
          mixBlendMode: 'screen',
        }}
      />

      {/* Cinematic Vignette Gradients for Mobile Contrast & Caption Readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.92) 100%)',
          zIndex: 30,
          pointerEvents: 'none',
        }}
      />

      {/* Character Acting & Emotion Header HUD */}
      <div
        style={{
          position: 'absolute',
          top: '80px',
          left: '40px',
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 22px',
          borderRadius: '9999px',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        }}
      >
        <span
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: '#10B981',
            boxShadow: '0 0 12px #10B981',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              color: '#FFFFFF',
              fontSize: '20px',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {scene.character || 'Personaje'}
          </span>
          <span
            style={{
              color: '#C084FC',
              fontSize: '14px',
              fontWeight: 600,
              textTransform: 'capitalize',
            }}
          >
            🎭 {scene.emotion || 'Intenso'} • Toma {scene.scene_number}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const TikTokDramaComposition: React.FC<DramaCompositionProps> = ({
  title,
  scenes = [],
  whisperWords = [],
  audioUrl,
  bgmUrl,
  sfxCues = [],
  captionStyle = 'karaoke_bounce',
  enableParallax = true,
}) => {
  const { fps } = useVideoConfig();

  // If scenes are empty, provide dynamic default scenes
  const safeScenes = scenes.length > 0 ? scenes : [
    {
      scene_number: 1,
      duration_seconds: 5,
      character: 'Marcos (Directivo)',
      dialogue: 'Cancelá el contrato ahora mismo. Tu campaña fue un fracaso absoluto.',
      visual_prompt: 'Confrontación tensa en oficina moderna',
      camera_motion: 'zoom_in' as const,
      imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1080&h=1920&fit=crop&q=80',
      emotion: 'furious',
    },
    {
      scene_number: 2,
      duration_seconds: 6,
      character: 'Elena (Fundadora)',
      dialogue: 'Mirá las métricas en vivo, Marcos. Subió un 400% automatizando todo.',
      visual_prompt: 'Fundadora joven con tablet holográfica',
      camera_motion: 'pan_up' as const,
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1080&h=1920&fit=crop&q=80',
      emotion: 'confident',
    },
  ];

  // Calculate cumulative scene starts
  let accumulatedFrames = 0;
  const sequenceData = safeScenes.map((scene) => {
    const sceneFrames = Math.max(20, Math.round((scene.duration_seconds || 5) * fps));
    const startFrame = accumulatedFrames;
    accumulatedFrames += sceneFrames;
    return {
      scene,
      startFrame,
      durationFrames: sceneFrames,
    };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#090A0F' }}>
      {/* 1. Visual Scenes Track with Camera Motion & LivePortrait Talking Head */}
      {sequenceData.map(({ scene, startFrame, durationFrames }, index) => (
        <Sequence
          key={`scene-${scene.scene_number || index}`}
          from={startFrame}
          durationInFrames={durationFrames}
        >
          <SceneVisual
            scene={scene}
            durationInFrames={durationFrames}
            enableParallax={enableParallax}
          />
        </Sequence>
      ))}

      {/* 2. Multi-Character Spoken Voice Tracks */}
      {/* If global master audioUrl is passed, play it */}
      {audioUrl ? (
        <Audio src={audioUrl} volume={1.0} />
      ) : (
        /* Otherwise, dynamically map voice audio per character in their scene sequence */
        sequenceData.map(({ scene, startFrame, durationFrames }, index) => {
          const isElena =
            (scene.character || '').toLowerCase().includes('elena') ||
            (scene.character || '').toLowerCase().includes('sofía') ||
            (scene.character || '').toLowerCase().includes('fundadora');
          
          const voiceAudio = isElena ? '/elena_sample.mp3' : '/marcos_sample.mp3';

          return (
            <Sequence
              key={`voice-${index}`}
              from={startFrame}
              durationInFrames={durationFrames}
            >
              <Audio src={voiceAudio} volume={1.0} />
            </Sequence>
          );
        })
      )}

      {/* 3. Cinematic Background Music with Audio Ducking (-18dB ~ 0.16 volume) */}
      {bgmUrl && (
        <Audio
          src={bgmUrl}
          volume={0.16}
          loop
        />
      )}

      {/* 4. Foley & SFX Triggers */}
      {sfxCues.map((cue, idx) => {
        const cueStartFrame = Math.round(cue.time_seconds * fps);
        if (!cue.sfxUrl) return null;
        return (
          <Sequence
            key={`sfx-${idx}-${cue.type}`}
            from={cueStartFrame}
            durationInFrames={Math.round(2 * fps)}
          >
            <Audio src={cue.sfxUrl} volume={cue.volume ?? 0.65} />
          </Sequence>
        );
      })}

      {/* 5. 100% WhisperX Dynamic Karaoke Subtitles Layer across ALL Scenes */}
      <WhisperSubtitles
        words={whisperWords}
        style={captionStyle}
      />
    </AbsoluteFill>
  );
};
