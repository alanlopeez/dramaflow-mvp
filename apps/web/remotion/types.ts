export interface WhisperXWord {
  word: string;
  start: number; // in seconds
  end: number;   // in seconds
  score?: number;
}

export interface SfxCue {
  time_seconds: number;
  type: 'whoosh' | 'boom' | 'riser' | 'glitch' | 'sub_drop';
  sfxUrl?: string;
  volume?: number;
}

export interface CompositionScene {
  scene_number: number;
  duration_seconds: number;
  character: string;
  dialogue: string;
  visual_prompt?: string;
  videoUrl?: string;
  imageUrl?: string;
  characterCutoutUrl?: string;
  camera_motion?: 'zoom_in' | 'zoom_out' | 'pan_up' | 'pan_down' | 'shake' | 'static';
  emotion?: 'furious' | 'whisper' | 'sarcastic' | 'desperate' | 'confident' | 'neutral' | string;
  words?: WhisperXWord[];
}

export interface DramaCompositionProps {
  title: string;
  scenes: CompositionScene[];
  whisperWords?: WhisperXWord[];
  audioUrl?: string;
  bgmUrl?: string;
  sfxCues?: SfxCue[];
  captionStyle?: 'karaoke_bounce' | 'cyberpunk_neon' | 'beast_bold' | 'minimal_cinema';
  enableParallax?: boolean;
}
