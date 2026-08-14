import React from 'react';
import { PlaceStatus } from '../../types';

interface StatusBadgeProps {
  status: PlaceStatus;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onStatusChange?: (newStatus: PlaceStatus) => void;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  interactive = false,
  onStatusChange,
}) => {
  const config = {
    saved: {
      label: 'Saved',
      emoji: '🟡',
      bgClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      dotClass: 'bg-amber-400',
    },
    planning: {
      label: 'Planning',
      emoji: '🔵',
      bgClass: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      dotClass: 'bg-sky-400',
    },
    visited: {
      label: 'Visited',
      emoji: '🟢',
      bgClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      dotClass: 'bg-emerald-400',
    },
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold rounded-md border gap-1.5',
    md: 'px-3 py-1 text-xs font-bold rounded-full border gap-2',
    lg: 'px-4 py-1.5 text-sm font-bold rounded-full border gap-2',
  };

  const current = config[status];

  if (interactive && onStatusChange) {
    return (
      <div className="relative inline-block">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as PlaceStatus)}
          className={`appearance-none cursor-pointer flex items-center ${sizeClasses[size]} ${current.bgClass} backdrop-blur-md font-medium pr-7 transition-all hover:scale-105 outline-none focus:ring-2 focus:ring-sky-500`}
        >
          <option value="saved" className="bg-slate-900 text-amber-400">🟡 Saved</option>
          <option value="planning" className="bg-slate-900 text-sky-400">🔵 Planning</option>
          <option value="visited" className="bg-slate-900 text-emerald-400">🟢 Visited</option>
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
          ▼
        </span>
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center ${sizeClasses[size]} ${current.bgClass} backdrop-blur-md`}>
      <span className="text-xs">{current.emoji}</span>
      <span>{current.label}</span>
    </span>
  );
};
