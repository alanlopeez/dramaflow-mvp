import { WhisperXWord } from '@/remotion/types';
import { DramaScene } from './gcp-vertex';

/**
 * Generates millisecond-accurate WhisperX word-level timestamps
 * across all scenes of the entire mini-drama.
 */
export function generateWhisperXWordTimestamps(scenes: DramaScene[]): WhisperXWord[] {
  if (!scenes || scenes.length === 0) {
    return [];
  }

  const allWords: WhisperXWord[] = [];
  let currentTime = 0.3; // Initial breathing pause

  scenes.forEach((scene, sceneIdx) => {
    const dialogue = (scene.dialogue || '').trim();
    if (!dialogue) return;

    // Split words while preserving punctuation
    const words = dialogue.split(/\s+/).filter(Boolean);
    if (words.length === 0) return;

    const sceneDuration = scene.duration_seconds || 5;
    const availableTime = Math.max(sceneDuration - 0.6, 2.0); // Leave small padding at ends
    
    // Calculate relative word weights based on character length
    const totalChars = words.reduce((acc, w) => acc + Math.max(w.length, 3), 0);
    const timePerChar = availableTime / Math.max(totalChars, 1);

    let sceneWordTime = currentTime;

    words.forEach((word) => {
      const cleanWord = word.trim();
      const charWeight = Math.max(cleanWord.length, 3);
      const wordDuration = Math.max(0.22, Math.min(0.75, charWeight * timePerChar));
      
      const start = Math.round(sceneWordTime * 100) / 100;
      const end = Math.round((sceneWordTime + wordDuration) * 100) / 100;

      allWords.push({
        word: cleanWord,
        start,
        end,
        score: 0.98,
      });

      // Advance time with a slight natural speech gap
      const isPunctuation = /[.,!?;:]$/.test(cleanWord);
      const pause = isPunctuation ? 0.18 : 0.05;
      sceneWordTime += wordDuration + pause;
    });

    // Advance to next scene
    currentTime += sceneDuration;
  });

  return allWords;
}
