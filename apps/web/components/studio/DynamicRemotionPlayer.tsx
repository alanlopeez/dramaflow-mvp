'use client';

import dynamic from 'next/dynamic';
import React from 'react';

export const DynamicRemotionPlayer = dynamic(
  () => import('./RemotionPlayerPreview').then((mod) => mod.RemotionPlayerPreview),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-sm aspect-[9/16] rounded-[36px] bg-slate-950 border-[6px] border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-400 p-6 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
        <span className="text-xs font-medium text-slate-300">Cargando Motor Remotion 9:16...</span>
        <span className="text-[10px] text-slate-500 font-mono">WhisperX Word-Level Alignment</span>
      </div>
    ),
  }
);
