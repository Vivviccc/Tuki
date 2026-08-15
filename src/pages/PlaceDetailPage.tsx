import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Heart,
  MessageSquare,
  Camera,
  Plus,
  ArrowLeft,
  Calendar,
  Share2,
  MoreHorizontal,
  Star,
  ChevronLeft,
  ChevronRight,
  Activity,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PlaceStatus } from '../types';

export const PlaceDetailPage: React.FC = () => {
  const { placeId } = useParams<{ placeId: string }>();
  const {
    places,
    currentUser,
    groups,
    toggleInterest,
    addThought,
    addPhoto,
    updatePlaceStatus,
    deletePlace,
    activities,
  } = useApp();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'about' | 'photos' | 'thoughts' | 'activity'>('about');

  const place = places.find((p) => p.id === placeId);
  const group = groups.find((g) => g.id === place?.groupId);
  const placeActivities = activities.filter((a) => a.targetPlaceId === placeId);

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [newThought, setNewThought] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [photoError, setPhotoError] = useState('');

  if (!place) {
    return (
      <div className="p-12 text-center text-slate-500">
        Place not found. <Link to="/groups" className="text-purple-600 underline">Back to groups</Link>
      </div>
    );
  }

  const isInterested = place.interestedUserIds.includes(currentUser.id);
  const interestedMembers = group?.members.filter((m) => place.interestedUserIds.includes(m.id)) || [];
  const canDelete = place.addedBy.id === currentUser.id;

  const handleDeletePlace = async () => {
    if (window.confirm(`Are you sure you want to delete "${place.name}"?`)) {
      await deletePlace(place.id);
      navigate(-1);
    }
  };

  const handleThoughtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThought.trim()) return;
    addThought(place.id, newThought.trim());
    setNewThought('');
  };

  const handlePhotoUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) return;
    setPhotoError('');

    const res = addPhoto(place.id, newPhotoUrl.trim());
    if (res.success) {
      setNewPhotoUrl('');
      setActivePhotoIndex(place.photos.length);
    } else {
      setPhotoError(res.message || 'Failed to upload photo');
    }
  };

  const photos = place.photos.length > 0 ? place.photos : ['https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80'];
  const firstThought = place.thoughts[0]?.content || "Perfect place to chill and watch the sunset. Coffee is 🔥";

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6 w-full space-y-6">
      {/* Top Action Bar (matching mockup header) */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-purple-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <StatusBadge
            status={place.status}
            size="md"
            interactive={true}
            onStatusChange={(newStatus: PlaceStatus) => updatePlaceStatus(place.id, newStatus)}
          />
          {canDelete && (
            <button
              onClick={handleDeletePlace}
              title="Delete Pin"
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold transition-colors flex items-center gap-1.5 text-xs"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Pin</span>
            </button>
          )}
          <button className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-purple-600 transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-purple-600 transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Photo Carousel Card (matching mockup top hero) */}
      <div className="relative h-72 md:h-96 w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-xl">
        <img
          src={photos[activePhotoIndex]}
          alt={place.name}
          className="w-full h-full object-cover transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Photo Counter Pill (matching mockup 1/5) */}
        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/60 text-white text-xs font-bold backdrop-blur-md">
          {activePhotoIndex + 1} / {photos.length}
        </div>

        {photos.length > 1 && (
          <>
            <button
              onClick={() => setActivePhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-md transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActivePhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-md transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Place Details Content (matching mockup place info) */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {place.name}
          </h1>

          <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>{place.address}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-500" /> 4.7 (231)
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Added by</span>
            <img
              src={place.addedBy.avatar}
              alt={place.addedBy.name}
              className="w-5 h-5 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
            <span className="font-bold text-slate-800 dark:text-slate-200">{place.addedBy.name}</span>
            <span>•</span>
            <span>Aug 12, 2026</span>
          </div>
        </div>

        {/* Interested Bar & Big Prominent Button (matching mockup 💖 I'm interested) */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#161f30] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {interestedMembers.slice(0, 3).map((member) => (
                  <img
                    key={member.id}
                    src={member.avatar}
                    alt={member.name}
                    className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 object-cover"
                  />
                ))}
                {interestedMembers.length > 3 && (
                  <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-bold text-[10px] flex items-center justify-center border-2 border-white dark:border-slate-900">
                    +{interestedMembers.length - 3}
                  </div>
                )}
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {interestedMembers.length} friends interested
              </span>
            </div>
          </div>

          <button
            onClick={() => toggleInterest(place.id)}
            className={`w-full py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
              isInterested
                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-glow-brand scale-[1.01]'
                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-glow-brand'
            }`}
          >
            <Heart className={`w-4 h-4 ${isInterested ? 'fill-white' : ''}`} />
            <span>{isInterested ? "💖 You're interested" : "💖 I'm interested"}</span>
          </button>
        </div>

        {/* Navigation Tabs matching mockup (About | Photos | Thoughts | Activity) */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('about')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'about'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            About
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'photos'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Photos ({place.photos.length})
          </button>
          <button
            onClick={() => setActiveTab('thoughts')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'thoughts'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Thoughts ({place.thoughts.length})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'activity'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Activity
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
                Why we want to go
              </h3>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 bg-white dark:bg-[#161f30] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                "{firstThought}"
              </p>
            </div>

            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">
                Interested Friends ({interestedMembers.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {interestedMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-3 rounded-2xl bg-white dark:bg-[#161f30] border border-slate-200 dark:border-slate-800 flex items-center gap-2.5"
                  >
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {member.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt=""
                  className="w-full h-40 object-cover rounded-2xl border border-slate-200 dark:border-slate-800"
                />
              ))}
            </div>

            {place.photos.length < 5 && (
              <form onSubmit={handlePhotoUpload} className="flex gap-2 pt-2">
                <input
                  type="url"
                  placeholder="Add photo URL (max 5 photos per place)..."
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-[#161f30] text-xs border border-slate-200 dark:border-slate-800 outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs shadow"
                >
                  Upload Photo
                </button>
              </form>
            )}
          </div>
        )}

        {activeTab === 'thoughts' && (
          <div className="space-y-4">
            <form onSubmit={handleThoughtSubmit} className="flex gap-3">
              <input
                type="text"
                required
                placeholder="Add a thought..."
                value={newThought}
                onChange={(e) => setNewThought(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-[#161f30] text-xs border border-slate-200 dark:border-slate-800 outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs shadow"
              >
                Post Thought
              </button>
            </form>

            <div className="space-y-3">
              {place.thoughts.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#161f30] border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs"
                >
                  <img
                    src={t.userAvatar}
                    alt={t.userName}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{t.userName}</span>
                    <p className="text-slate-700 dark:text-slate-300 mt-0.5">{t.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-3">
            {placeActivities.map((act) => (
              <div
                key={act.id}
                className="p-3 rounded-2xl bg-white dark:bg-[#161f30] border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <img src={act.userAvatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                  <span className="font-bold text-slate-900 dark:text-white">{act.userName}</span>
                  <span className="text-slate-500">{act.details}</span>
                </div>
                <span className="text-[10px] text-slate-400">{act.timestamp}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
