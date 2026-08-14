import React from 'react';
import { User as UserIcon, Users, MapPin, Heart, Shield, LogOut, Star, Compass, Camera, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { GroupCard } from '../components/groups/GroupCard';
import { Link, useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { currentUser, groups, places } = useApp();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const userPlaces = places.filter((p) => p.addedBy.id === currentUser.id);
  const interestedPlaces = places.filter((p) => p.interestedUserIds.includes(currentUser.id));
  const visitedPlaces = places.filter((p) => p.status === 'visited' && p.addedBy.id === currentUser.id);

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8 w-full space-y-8">
      {/* Profile Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161f30] shadow-xl">
        {/* Gradient Background Banner */}
        <div className="h-32 bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.15),transparent)]" />
        </div>

        <div className="px-8 pb-8 -mt-14 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-28 h-28 rounded-full object-cover border-4 border-white dark:border-slate-900 shadow-xl"
              />
              <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{currentUser.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 text-xs font-bold border border-purple-200 dark:border-purple-800 w-fit mx-auto md:mx-0">
                  {currentUser.handle}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{currentUser.email}</p>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-800 hover:border-purple-400 transition-all">
                <Settings className="w-4 h-4" />
                Edit Profile
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-200 dark:border-rose-800/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{groups.length}</div>
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5 flex items-center justify-center gap-1">
                <Users className="w-3 h-3 text-purple-500" /> Squads
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{userPlaces.length}</div>
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5 flex items-center justify-center gap-1">
                <MapPin className="w-3 h-3 text-rose-500" /> Pins
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{interestedPlaces.length}</div>
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5 flex items-center justify-center gap-1">
                <Heart className="w-3 h-3 text-pink-500" /> Interested
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{visitedPlaces.length}</div>
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5 flex items-center justify-center gap-1">
                <Star className="w-3 h-3 text-emerald-500" /> Visited
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Groups */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-purple-600" />
            Your Squads
          </h2>
          <Link
            to="/groups"
            className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
          >
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              placeCount={places.filter((p) => p.groupId === group.id).length}
            />
          ))}
        </div>
      </div>

      {/* Recent Places Added by User */}
      {userPlaces.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-rose-500" />
            Your Pins
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {userPlaces.map((place) => (
              <Link
                key={place.id}
                to={`/places/${place.id}`}
                className="p-4 rounded-2xl bg-white dark:bg-[#161f30] border border-slate-200 dark:border-slate-800 hover:border-purple-400 transition-all shadow-sm flex items-center gap-3 group"
              >
                {place.photos[0] ? (
                  <img
                    src={place.photos[0]}
                    alt={place.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-purple-600 transition-colors">
                    {place.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{place.address}</p>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  place.status === 'visited' ? 'bg-emerald-500' :
                  place.status === 'planning' ? 'bg-purple-500' : 'bg-rose-500'
                }`} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
