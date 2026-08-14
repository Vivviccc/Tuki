import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Map as MapIcon,
  Users,
  MapPin,
  Share2,
  Copy,
  Check,
  Plus,
  ArrowRight,
  Activity,
  Heart,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PlaceCard } from '../components/places/PlaceCard';
import { GroupMap } from '../components/map/GroupMap';
import { AddPlaceModal } from '../components/places/AddPlaceModal';

export const GroupHomePage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { groups, places, activities, setCurrentGroupId } = useApp();
  const navigate = useNavigate();

  const group = groups.find((g) => g.id === groupId) || groups[0];
  const groupPlaces = places.filter((p) => p.groupId === group?.id);
  const groupActivities = activities.filter((a) => a.groupId === group?.id);

  const [copiedCode, setCopiedCode] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalLat, setModalLat] = useState<number | undefined>(undefined);
  const [modalLng, setModalLng] = useState<number | undefined>(undefined);
  const [modalName, setModalName] = useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (group) {
      setCurrentGroupId(group.id);
    }
  }, [group?.id]);

  if (!group) {
    return (
      <div className="p-8 text-center text-slate-400">
        Group not found. <Link to="/groups" className="text-purple-400 underline">View all groups</Link>
      </div>
    );
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(group.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleOpenAddModal = (lat?: number, lng?: number, name?: string) => {
    setModalLat(lat);
    setModalLng(lng);
    setModalName(name);
    setIsAddModalOpen(true);
  };

  const savedCount = groupPlaces.filter((p) => p.status === 'saved').length;
  const planningCount = groupPlaces.filter((p) => p.status === 'planning').length;
  const visitedCount = groupPlaces.filter((p) => p.status === 'visited').length;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 w-full space-y-8">
      {/* Group Cover Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161f30] shadow-xl">
        <div className="h-64 md:h-80 w-full relative">
          <img
            src={group.coverImage}
            alt={group.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        </div>

        <div className="p-6 md:p-8 -mt-24 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              {group.name}
            </h1>
            <p className="mt-2 text-sm text-slate-200 max-w-xl">{group.description}</p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/80 backdrop-blur-md">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                {group.members.length} members
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/80 backdrop-blur-md">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                {groupPlaces.length} saved places
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/80 backdrop-blur-md text-emerald-400">
                🟢 {visitedCount} visited memories
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:bg-slate-800 text-xs font-bold text-slate-200 transition-all shadow-xl"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-purple-400" />}
              <span>{copiedCode ? 'Code Copied!' : `Invite Code: ${group.inviteCode}`}</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-extrabold shadow-glow-brand transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" /> Add Place
            </button>
          </div>
        </div>
      </div>

      {/* Group Stats Quick Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#161f30] border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-sm">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500">🟡</div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{savedCount}</div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Saved Places</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#161f30] border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-sm">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">🔵</div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{planningCount}</div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">In Planning</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#161f30] border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-sm">
          <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-500">🟢</div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{visitedCount}</div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Visited Memories</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#161f30] border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-sm">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">👥</div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{group.members.length}</div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Squad Members</div>
          </div>
        </div>
      </div>

      {/* EMBEDDED INTERACTIVE GROUP MAP SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-purple-600" />
              {group.name} Interactive Map
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Only places saved by members of {group.name} appear on this map. Tap pins to see details & interested friends.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-glow-brand transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Pin
          </button>
        </div>

        <div className="w-full h-[520px]">
          <GroupMap places={groupPlaces} onOpenAddModal={handleOpenAddModal} />
        </div>
      </div>

      {/* Main Grid: Places List & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Group Saved Places */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-500" />
              Saved Places ({groupPlaces.length})
            </h2>
          </div>

          {groupPlaces.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161f30]">
              <MapPin className="w-10 h-10 mx-auto text-slate-400 mb-3" />
              <p className="font-bold text-slate-800 dark:text-slate-200">No places added yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Search for a coffee shop, beach, or rooftop bar to pin it to your squad map!
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-glow-brand"
              >
                + Add First Place
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {groupPlaces.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Recent Activity Sidebar */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Recent Activity
            </h2>
            <Link
              to={`/groups/${group.id}/activity`}
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
            >
              View All &rarr;
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161f30] p-5 space-y-4 shadow-sm">
            {groupActivities.slice(0, 5).map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-xs border-b border-slate-100 dark:border-slate-800/80 pb-3 last:border-0 last:pb-0">
                <img
                  src={act.userAvatar}
                  alt={act.userName}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <div className="flex-1">
                  <p className="text-slate-800 dark:text-slate-200">
                    <span className="font-bold">{act.userName}</span>{' '}
                    <span className="text-slate-500 dark:text-slate-400">{act.details}</span>{' '}
                    <Link to={`/places/${act.targetPlaceId}`} className="font-bold text-purple-600 dark:text-purple-400 hover:underline">
                      {act.targetPlaceName}
                    </Link>
                  </p>
                  <span className="text-[10px] text-slate-400 font-semibold">{act.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AddPlaceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialLat={modalLat}
        initialLng={modalLng}
        initialName={modalName}
      />
    </div>
  );
};
