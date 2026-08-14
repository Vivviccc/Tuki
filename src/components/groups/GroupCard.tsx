import React from 'react';
import { Link } from 'react-router-dom';
import { Group } from '../../types';
import { Compass, MapPin } from 'lucide-react';

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
          ? 'border-emerald-500/60 bg-slate-900 shadow-glow-emerald ring-1 ring-emerald-500/30'
          : 'border-slate-800/90 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-900 shadow-2xl hover:-translate-y-1'
      }`}
    >
      {/* Cover Image Header */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-950">
        <img
          src={group.coverImage}
          alt={group.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          {isActive && (
            <span className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-extrabold tracking-wider uppercase shadow-glow-emerald">
              Active Squad
            </span>
          )}
          <span className="px-2.5 py-1 rounded-full bg-slate-950/80 text-slate-300 text-[11px] font-bold backdrop-blur-md border border-white/10 ml-auto">
            Code: <code className="text-emerald-400 font-mono font-bold">{group.inviteCode}</code>
          </span>
        </div>

        {/* Card Header Content overlay */}
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between z-10">
          <div>
            <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              {group.name} 🌴
            </h3>
            <p className="text-xs text-slate-300 font-medium flex items-center gap-2 mt-0.5">
              <span>{group.members.length} members</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <MapPin className="w-3 h-3" />
                {placeCount} places
              </span>
            </p>
          </div>

          {/* Open Map Button */}
          <Link
            to={`/groups/${group.id}/map`}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-extrabold shadow-glow-emerald transition-all hover:scale-105 shrink-0"
          >
            Open Map
          </Link>
        </div>
      </div>

      {/* Footer Member Avatars */}
      <div className="p-4 flex items-center justify-between border-t border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="flex -space-x-2">
            {group.members.slice(0, 4).map((member) => (
              <img
                key={member.id}
                src={member.avatar}
                alt={member.name}
                title={member.name}
                className="w-7 h-7 rounded-full border-2 border-slate-900 object-cover shadow-sm"
              />
            ))}
            {group.members.length > 4 && (
              <div className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-900 text-[10px] font-bold text-slate-300 flex items-center justify-center">
                +{group.members.length - 4}
              </div>
            )}
          </div>
          <span className="text-[11px] font-semibold text-slate-400 truncate max-w-[120px] sm:max-w-[160px]">
            {group.members.map((m) => m.name).slice(0, 2).join(', ')}
          </span>
        </div>

        <Link
          to={`/groups/${group.id}`}
          className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
        >
          <span>Overview</span>
          <span>&rarr;</span>
        </Link>
      </div>
    </div>
  );
};
