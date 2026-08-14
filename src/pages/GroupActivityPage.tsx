import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Activity, MapPin, Heart, Camera, MessageSquare, CheckCircle, Sparkles, ArrowUpRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ACTIVITY_ICON_MAP: Record<string, { icon: React.ReactNode; color: string }> = {
  add_place: {
    icon: <MapPin className="w-4 h-4" />,
    color: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  },
  interested: {
    icon: <Heart className="w-4 h-4" />,
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  },
  add_photos: {
    icon: <Camera className="w-4 h-4" />,
    color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  },
  add_thought: {
    icon: <MessageSquare className="w-4 h-4" />,
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  status_change: {
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
};

export const GroupActivityPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { groups, activities, setCurrentGroupId } = useApp();
  const [filterType, setFilterType] = useState<'all' | 'places' | 'photos' | 'thoughts' | 'status'>('all');

  const group = groups.find((g) => g.id === groupId) || groups[0];
  const groupActivities = activities.filter((a) => {
    if (a.groupId !== group?.id) return false;
    if (filterType === 'places') return a.type === 'add_place';
    if (filterType === 'photos') return a.type === 'add_photos';
    if (filterType === 'thoughts') return a.type === 'add_thought';
    if (filterType === 'status') return a.type === 'status_change';
    return true;
  });

  React.useEffect(() => {
    if (group) {
      setCurrentGroupId(group.id);
    }
  }, [group?.id]);

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6 w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-600" />
            Squad Activity
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Everything happening in {group?.name || 'this group'}.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center p-1 rounded-2xl bg-white dark:bg-[#161f30] border border-slate-200 dark:border-slate-800 text-xs font-bold shadow-sm flex-wrap gap-0.5">
          {[
            { key: 'all', label: 'All' },
            { key: 'places', label: '📍 Places' },
            { key: 'photos', label: '📸 Photos' },
            { key: 'thoughts', label: '💬 Thoughts' },
            { key: 'status', label: '✅ Status' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterType(f.key as any)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterType === f.key
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline */}
      {groupActivities.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161f30]">
          <Activity className="w-10 h-10 mx-auto text-slate-400 mb-3" />
          <p className="font-bold text-slate-800 dark:text-slate-200">No activity yet</p>
          <p className="text-xs text-slate-500 mt-1">
            Start adding places to see squad activity here!
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800" />

          <div className="space-y-1">
            {groupActivities.map((event) => {
              const iconConfig = ACTIVITY_ICON_MAP[event.type] || ACTIVITY_ICON_MAP['add_place'];

              return (
                <div key={event.id} className="relative flex items-start gap-4 py-4">
                  {/* Timeline Icon Node */}
                  <div className={`relative z-10 w-[54px] h-[54px] shrink-0 rounded-2xl border flex items-center justify-center ${iconConfig.color}`}>
                    {iconConfig.icon}
                  </div>

                  {/* Event Content Card */}
                  <div className="flex-1 p-4 rounded-2xl bg-white dark:bg-[#161f30] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3">
                      <img
                        src={event.userAvatar}
                        alt={event.userName}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-800 dark:text-slate-200">
                          <span className="font-bold text-slate-900 dark:text-white">{event.userName}</span>{' '}
                          <span className="text-slate-500">{event.details}</span>
                        </p>
                        <Link
                          to={`/places/${event.targetPlaceId}`}
                          className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5 mt-0.5"
                        >
                          {event.targetPlaceName}
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </div>

                      <span className="text-[10px] text-slate-400 font-semibold shrink-0">{event.timestamp}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
