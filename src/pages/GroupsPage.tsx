import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  UserPlus,
  MapPin,
  Heart,
  Sparkles,
  Search,
  Compass,
  Users,
  Activity,
  CheckCircle2,
  Bookmark,
  ArrowRight,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GroupCard } from '../components/groups/GroupCard';
import { CreateGroupModal, JoinGroupModal } from '../components/groups/GroupModals';
import { StatusBadge } from '../components/ui/StatusBadge';

export const GroupsPage: React.FC = () => {
  const { groups, places, currentGroup, currentUser, activities, toggleInterest } = useApp();
  const navigate = useNavigate();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'roadtrip' | 'foodie'>('all');

  // Personal user stats
  const userPlaces = places.filter((p) => p.addedBy.id === currentUser.id);
  const interestedPlaces = places.filter((p) => p.interestedUserIds.includes(currentUser.id));
  const visitedPlaces = places.filter((p) => p.status === 'visited');

  // Filter groups
  const filteredGroups = groups.filter((g) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = g.name.toLowerCase().includes(q);
      const matchDesc = g.description.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    if (selectedCategory === 'roadtrip' && !g.name.toLowerCase().includes('boys') && !g.description.toLowerCase().includes('roadtrip')) {
      return false;
    }
    if (selectedCategory === 'foodie' && !g.name.toLowerCase().includes('foodie') && !g.description.toLowerCase().includes('food')) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 w-full space-y-8">
      {/* Top Welcome Header & Quick Action Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161f30] shadow-sm">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-purple-500/40 shadow-glow-brand"
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome back, {currentUser.name} 👋
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage your squad maps, check out saved wishlist spots, and stay updated on friend activities.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-glow-brand transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" /> Create Squad
          </button>
          <button
            onClick={() => setIsJoinOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all"
          >
            <UserPlus className="w-4 h-4 text-purple-500" /> Join Code
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: High-Utility Dashboard Widgets */}
        <div className="lg:col-span-4 space-y-6">
          {/* Widget 1: Personal Overview Stats Card */}
          <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161f30] space-y-4 shadow-sm">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" /> Your Activity Overview
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white block">
                  {groups.length}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Squads Joined
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 block">
                  {userPlaces.length}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Places Added
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-2xl font-extrabold text-rose-500 block">
                  {interestedPlaces.length}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Interested Spots
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-2xl font-extrabold text-emerald-500 block">
                  {visitedPlaces.length}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Visited Memories
                </span>
              </div>
            </div>
          </div>

          {/* Widget 2: "Spots You're Hyped About" Quick Wishlist */}
          <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161f30] space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" /> Spots You're Hyped About
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500">
                {interestedPlaces.length}
              </span>
            </div>

            <div className="space-y-3">
              {interestedPlaces.slice(0, 3).map((place) => {
                const spotGroup = groups.find((g) => g.id === place.groupId);
                return (
                  <div
                    key={place.id}
                    className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 flex items-center gap-3 hover:border-purple-300 transition-all group"
                  >
                    <img
                      src={place.photos[0] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=200&q=80'}
                      alt={place.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/places/${place.id}`}
                        className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-purple-600 truncate block"
                      >
                        {place.name}
                      </Link>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {spotGroup?.name || 'Squad'} • {place.category}
                      </span>
                    </div>

                    <StatusBadge status={place.status} size="sm" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Widget 3: Global Squad Activity Feed */}
          <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161f30] space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-500" /> Recent Squad Updates
              </h3>
            </div>

            <div className="space-y-3">
              {activities.slice(0, 4).map((act) => (
                <div key={act.id} className="text-xs border-b border-slate-100 dark:border-slate-800/80 pb-2.5 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{act.userName}</span>
                    <span>{act.timestamp}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 line-clamp-1">
                    {act.details}{' '}
                    <Link to={`/places/${act.targetPlaceId}`} className="font-bold text-purple-600 dark:text-purple-400 hover:underline">
                      {act.targetPlaceName}
                    </Link>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Squad Maps List & Controls */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                My Squad Maps
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select a group map to open saved pins, search spots, or view member activity.
              </p>
            </div>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-glow-brand transition-all"
            >
              <Plus className="w-4 h-4" /> + Create Squad
            </button>
          </div>

          {/* Search & Filter Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filter squad maps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#161f30] text-slate-900 dark:text-white placeholder-slate-400 text-xs border border-slate-200 dark:border-slate-800 focus:border-purple-500 outline-none"
              />
            </div>

            <div className="flex items-center p-1 rounded-2xl bg-white dark:bg-[#161f30] border border-slate-200 dark:border-slate-800 text-xs font-bold shadow-sm">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1.5 rounded-xl transition-all ${
                  selectedCategory === 'all' ? 'bg-purple-600 text-white shadow' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All ({groups.length})
              </button>
              <button
                onClick={() => setSelectedCategory('roadtrip')}
                className={`px-3.5 py-1.5 rounded-xl transition-all ${
                  selectedCategory === 'roadtrip' ? 'bg-purple-600 text-white shadow' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Roadtrips
              </button>
              <button
                onClick={() => setSelectedCategory('foodie')}
                className={`px-3.5 py-1.5 rounded-xl transition-all ${
                  selectedCategory === 'foodie' ? 'bg-purple-600 text-white shadow' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Foodies
              </button>
            </div>
          </div>

          {/* Group Cards Grid */}
          <div className="space-y-4">
            {filteredGroups.length === 0 ? (
              <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs font-semibold">
                No squad maps found matching "{searchQuery}".
              </div>
            ) : (
              filteredGroups.map((group) => {
                const groupPlaceCount = places.filter((p) => p.groupId === group.id).length;
                const isActive = currentGroup?.id === group.id;

                return (
                  <GroupCard
                    key={group.id}
                    group={group}
                    placeCount={groupPlaceCount}
                    isActive={isActive}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateGroupModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <JoinGroupModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} />
    </div>
  );
};
