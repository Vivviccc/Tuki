import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Camera, MapPin, Sparkles } from 'lucide-react';
import { Place } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { useApp } from '../../context/AppContext';

interface PlaceCardProps {
  place: Place;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({ place }) => {
  const { currentUser, toggleInterest } = useApp();

  const isInterested = place.interestedUserIds.includes(currentUser.id);
  const primaryPhoto = place.photos[0] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';
  const latestThought = place.thoughts[place.thoughts.length - 1];

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-900 transition-all duration-300 hover:-translate-y-1 shadow-2xl">
      {/* Photo Header */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-950">
        <img
          src={primaryPhoto}
          alt={place.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/40" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          <StatusBadge status={place.status} size="sm" />

          {place.photos.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/80 text-slate-200 text-[11px] font-bold backdrop-blur-md border border-white/10 shadow-sm">
              <Camera className="w-3 h-3 text-emerald-400" />
              {place.photos.length} / 5
            </span>
          )}
        </div>

        {/* Category Pill */}
        {place.category && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-emerald-400 text-[10px] font-extrabold border border-emerald-500/30 uppercase tracking-wider">
              {place.category}
            </span>
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <Link to={`/places/${place.id}`}>
            <h3 className="text-base font-extrabold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
              {place.name}
            </h3>
          </Link>

          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400 font-medium line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            {place.address}
          </p>

          {/* Top Thought Quote Preview */}
          {latestThought && (
            <div className="mt-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs italic text-slate-300 line-clamp-2 relative">
              "{latestThought.content}"
              <span className="not-italic text-[10px] text-slate-500 block font-bold mt-1">
                — {latestThought.userName}
              </span>
            </div>
          )}
        </div>

        {/* Footer info: Interested counter & Added By */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleInterest(place.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                isInterested
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-glow-rose'
                  : 'bg-slate-950/70 text-slate-400 border border-slate-800 hover:text-rose-400 hover:border-rose-500/40'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isInterested ? 'fill-rose-500 text-rose-500 animate-pulse' : ''}`} />
              <span>{place.interestedUserIds.length}</span>
            </button>

            {place.thoughts.length > 0 && (
              <span className="flex items-center gap-1 text-xs font-bold text-slate-400 px-2 py-1 rounded-full bg-slate-950/70 border border-slate-800">
                <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                {place.thoughts.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400" title={`Added by ${place.addedBy.name}`}>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Added by</span>
            <img
              src={place.addedBy.avatar}
              alt={place.addedBy.name}
              className="w-6 h-6 rounded-full object-cover border border-emerald-500/40 shadow-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
