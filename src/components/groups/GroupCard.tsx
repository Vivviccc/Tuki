import React from 'react';
import { Link } from 'react-router-dom';
import { Group } from '../../types';

interface GroupCardProps {
  group: Group;
  placeCount: number;
  isActive?: boolean;
}

export const GroupCard: React.FC<GroupCardProps> = ({ group, placeCount, isActive }) => {
  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border transition-all duration-300 ${
        isActive
          ? 'border-purple-500/60 bg-white dark:bg-[#161f30] shadow-glow-brand ring-1 ring-purple-500/30'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-purple-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Cover Image Header */}
      <div className="relative h-44 w-full overflow-hidden">
        <img
          src={group.coverImage}
          alt={group.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {isActive && (
            <span className="px-2.5 py-1 rounded-full bg-purple-600 text-white text-[10px] font-extrabold tracking-wider shadow">
              ACTIVE SQUAD
            </span>
          )}
        </div>

        {/* Card Header Content overlay */}
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-1.5">
              {group.name} 🌴
            </h3>
            <p className="text-xs text-slate-300 font-medium">
              {group.members.length} members • {placeCount} places
            </p>
          </div>

          {/* Open Map Button matching mockup */}
          <Link
            to={`/groups/${group.id}/map`}
            className="px-4 py-2 rounded-xl bg-white/90 hover:bg-white text-slate-900 text-xs font-bold shadow-lg transition-all hover:scale-105 shrink-0"
          >
            Open Map
          </Link>
        </div>
      </div>

      {/* Footer Member Avatars */}
      <div className="p-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#161f30]/50">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {group.members.slice(0, 4).map((member) => (
              <img
                key={member.id}
                src={member.avatar}
                alt={member.name}
                title={member.name}
                className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 object-cover"
              />
            ))}
            {group.members.length > 4 && (
              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-900 text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center">
                +{group.members.length - 4}
              </div>
            )}
          </div>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {group.members.map((m) => m.name).slice(0, 2).join(', ')}...
          </span>
        </div>

        <Link
          to={`/groups/${group.id}`}
          className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
        >
          View Overview &rarr;
        </Link>
      </div>
    </div>
  );
};
