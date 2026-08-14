import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Users, Copy, Check, MoreHorizontal, UserPlus, Crown, MapPin, Heart, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const GroupMembersPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { groups, places, setCurrentGroupId } = useApp();

  const group = groups.find((g) => g.id === groupId) || groups[0];
  const groupPlaces = places.filter((p) => p.groupId === group?.id);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (group) {
      setCurrentGroupId(group.id);
    }
  }, [group?.id]);

  if (!group) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(group.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6 w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            Squad Members
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {group.members.length} members in {group.name}.
          </p>
        </div>

        <button
          onClick={handleCopyCode}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#161f30] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-sm hover:border-purple-400 transition-all"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <UserPlus className="w-4 h-4 text-purple-600" />}
          <span>{copied ? 'Code Copied!' : `Invite: ${group.inviteCode}`}</span>
        </button>
      </div>

      {/* Invite Code Banner */}
      <div className="p-4 rounded-2xl bg-purple-600/10 dark:bg-purple-950/40 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
            Share this invite code so friends can join your squad map:
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg font-extrabold tracking-widest text-purple-600 dark:text-purple-400">
            {group.inviteCode}
          </span>
          <button
            onClick={handleCopyCode}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Member Roster List */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161f30] divide-y divide-slate-100 dark:divide-slate-800/80 shadow-sm overflow-hidden">
        {group.members.map((member, idx) => {
          const memberPlaces = groupPlaces.filter((p) => p.addedBy.id === member.id);
          const memberInterested = groupPlaces.filter((p) => p.interestedUserIds.includes(member.id));

          return (
            <div key={member.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
                  />
                  {idx === 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md">
                      <Crown className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    {member.name}
                    {idx === 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-extrabold">
                        OWNER
                      </span>
                    )}
                  </h3>
                  <span className="text-[11px] text-slate-400">{member.handle}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Quick Member Stats */}
                <div className="hidden sm:flex items-center gap-3 text-[10px] font-bold text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-500" />
                    {memberPlaces.length} pins
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-purple-500" />
                    {memberInterested.length} hyped
                  </span>
                </div>

                <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
