import React from 'react';

interface StatusBadgeProps {
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'READY' | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case 'COMPLETED':
      case 'READY':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'PROCESSING':
        return 'bg-violet-500/10 text-violet-400 border-violet-500/30 animate-pulse';
      case 'QUEUED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'FAILED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'COMPLETED': return 'COMPLETADO';
      case 'READY': return 'LISTO';
      case 'PROCESSING': return 'PROCESANDO';
      case 'QUEUED': return 'EN COLA';
      case 'FAILED': return 'ERROR';
      default: return status;
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyles()}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'PROCESSING' ? 'bg-violet-400 animate-ping' : status === 'COMPLETED' || status === 'READY' ? 'bg-emerald-400' : 'bg-current'}`} />
      {getLabel()}
    </span>
  );
};
