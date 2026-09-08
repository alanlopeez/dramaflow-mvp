import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { WhisperXWord } from './types';

interface WhisperSubtitlesProps {
  words: WhisperXWord[];
  style?: 'karaoke_bounce' | 'cyberpunk_neon' | 'beast_bold' | 'minimal_cinema';
}

interface WordCluster {
  words: WhisperXWord[];
  start: number;
  end: number;
}

export const WhisperSubtitles: React.FC<WhisperSubtitlesProps> = ({
  words = [],
  style = 'karaoke_bounce',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  if (!words || words.length === 0) {
    return null;
  }

  // 1. Group words into dynamic phrases of 2-4 words for TikTok readability
  const clusters: WordCluster[] = [];
  const wordsPerCluster = 3;

  for (let i = 0; i < words.length; i += wordsPerCluster) {
    const chunk = words.slice(i, i + wordsPerCluster);
    if (chunk.length > 0) {
      clusters.push({
        words: chunk,
        start: chunk[0].start,
        end: chunk[chunk.length - 1].end + 0.35, // small tail for visual retention
      });
    }
  }

  // Find the currently active cluster
  const currentCluster = clusters.find(
    (c) => currentTime >= c.start && currentTime <= c.end
  );

  if (!currentCluster) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '22%',
        left: '5%',
        right: '5%',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '12px 14px',
        zIndex: 50,
        pointerEvents: 'none',
      }}
    >
      {currentCluster.words.map((item, idx) => {
        const wordStartFrame = Math.round(item.start * fps);
        const isWordActive = currentTime >= item.start && currentTime <= item.end;
        const hasPassed = currentTime > item.end;

        // Spring bounce animation on word trigger
        const bounceProgress = spring({
          frame: frame - wordStartFrame,
          fps,
          config: {
            damping: 10,
            stiffness: 240,
            mass: 0.5,
          },
        });

        // Scale: springs up to 1.25, then settles to 1.05 when active
        const scale = isWordActive
          ? interpolate(bounceProgress, [0, 1], [0.85, 1.22])
          : hasPassed
          ? 1.0
          : 0.95;

        // Dynamic styling presets
        let textColor = '#FFFFFF';
        let strokeColor = '#000000';
        let textShadow = '0 4px 12px rgba(0,0,0,0.85), 0 0 20px rgba(0,0,0,0.6)';
        let bgBadge: string | undefined = undefined;

        if (style === 'karaoke_bounce') {
          textColor = isWordActive ? '#FFE600' : '#FFFFFF';
          textShadow = isWordActive
            ? '0 0 25px rgba(255, 230, 0, 0.8), 0 4px 16px rgba(0,0,0,1)'
            : '0 4px 14px rgba(0,0,0,0.9)';
        } else if (style === 'cyberpunk_neon') {
          textColor = isWordActive ? '#00F0FF' : '#E0E7FF';
          textShadow = isWordActive
            ? '0 0 20px #00F0FF, 0 0 40px #FF0055, 0 4px 12px #000'
            : '0 0 10px rgba(0,240,255,0.4)';
        } else if (style === 'beast_bold') {
          textColor = isWordActive ? '#10B981' : '#FFFFFF';
          bgBadge = isWordActive ? 'rgba(0, 0, 0, 0.75)' : undefined;
        } else if (style === 'minimal_cinema') {
          textColor = isWordActive ? '#F8FAFC' : '#94A3B8';
          textShadow = '0 2px 8px rgba(0,0,0,0.8)';
        }

        return (
          <span
            key={`${item.word}-${idx}`}
            style={{
              display: 'inline-block',
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
              color: textColor,
              fontFamily:
                style === 'cyberpunk_neon'
                  ? '"Courier New", monospace, sans-serif'
                  : 'Impact, "Arial Black", -apple-system, BlinkMacSystemFont, sans-serif',
              fontWeight: 900,
              fontSize: '54px',
              lineHeight: 1.1,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              WebkitTextStroke: `4px ${strokeColor}`,
              paintOrder: 'stroke fill',
              textShadow,
              backgroundColor: bgBadge,
              padding: bgBadge ? '4px 12px' : '0 4px',
              borderRadius: '12px',
              transition: 'color 0.1s ease',
            }}
          >
            {item.word}
          </span>
        );
      })}
    </div>
  );
};
