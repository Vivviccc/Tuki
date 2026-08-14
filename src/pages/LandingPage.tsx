import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  MapPin,
  Heart,
  Camera,
  Lock,
  ArrowRight,
  Users,
  CheckCircle2,
  Sun,
  Moon,
  Star,
  Compass,
  UserPlus,
  Eye,
  Bookmark,
  ChevronRight,
  Share2,
  Bell,
  Navigation,
  Coffee,
  Waves,
  Mountain,
  Wine,
  Palmtree,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme, groups, places, toggleInterest } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'cafe' | 'surf' | 'hiking' | 'bar'>('all');
  const [selectedPinId, setSelectedPinId] = useState<string>('p-sunset-cafe');
  const [activeHeroGroupId, setActiveHeroGroupId] = useState<string>('g-boys');

  const totalPlaces = places.length;
  const totalVisited = places.filter((p) => p.status === 'visited').length;

  const currentHeroGroup = groups.find((g) => g.id === activeHeroGroupId) || groups[0];
  const activePlaces = places.filter((p) => p.groupId === activeHeroGroupId);
  const selectedPlace = places.find((p) => p.id === selectedPinId) || activePlaces[0] || places[0];

  const filteredPlaces = activePlaces.filter((p) => {
    const cat = (p.category || '').toLowerCase();
    if (activeFilter === 'all') return true;
    if (activeFilter === 'cafe') return cat.includes('café') || cat.includes('bakery') || cat.includes('cafe');
    if (activeFilter === 'surf') return cat.includes('beach') || cat.includes('surf') || cat.includes('ocean');
    if (activeFilter === 'hiking') return cat.includes('hiking') || cat.includes('nature') || cat.includes('park');
    if (activeFilter === 'bar') return cat.includes('bar') || cat.includes('cocktail') || cat.includes('drink');
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 overflow-x-hidden font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-[1100] h-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl px-4 lg:px-12 flex items-center justify-between shadow-sm">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="font-display font-extrabold text-2xl tracking-tight text-slate-900">
            Tuki
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-mono tracking-wider font-bold text-slate-600">
          <a href="#features" className="hover:text-purple-600 transition-colors">
            WHY TUKI
          </a>
          <a href="#how-it-works" className="hover:text-purple-600 transition-colors">
            HOW IT WORKS
          </a>
          <a href="#explore" className="hover:text-purple-600 transition-colors">
            SQUAD MAPS
          </a>
        </nav>

        {/* Header CTA Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden sm:inline-block px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:text-purple-600 transition-colors"
          >
            Sign In
          </Link>

          <Link
            to="/groups"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-md transition-all hover:scale-105"
          >
            <span>Launch App</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-10 pb-24 px-4 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Hero Content */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-600 text-xs font-mono font-bold tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
              Social Map
            </div>

            <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.08]">
              Your camera roll has<br />
              <span className="bg-gradient-to-r from-purple-600 via-rose-500 to-indigo-600 bg-clip-text text-transparent">
                places.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
              Save places you find, share them with your friends, and build a private map of everywhere you want to go — whenever you actually get around to it.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <Link
                to="/groups"
                className="flex items-center gap-2 px-7 py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 hover:from-rose-400 hover:to-purple-500 text-white font-extrabold text-xs tracking-wider uppercase shadow-glow-rose transition-all hover:scale-105"
              >
                <span>START YOUR SQUAD MAP</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Link>


            </div>

            {/* Social Proof Stats Bar */}
            <div className="pt-6 flex items-center justify-center lg:justify-start gap-6 text-xs font-mono font-bold text-slate-400 border-t border-slate-800/80 max-w-lg">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-rose-400" />
                <span>{groups.length}+ Active Squads</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span>{totalPlaces}+ Saved Pins</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{totalVisited} Visited Memories</span>
              </div>
            </div>
          </div>

          {/* Right Hero: EXACT 3D VECTOR MAP SHOWCASE WITH FLOATING PINS & PREVIEW CARD */}
          <div className="lg:col-span-6 relative perspective-container">
            <div className="relative mx-auto w-full h-[540px] preserve-3d hero-3d-stage">

              {/* LAYER 0: Ambient Backplate Glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-purple-600/30 to-indigo-600/30 blur-2xl -translate-z-10" />

              {/* LAYER 1: Aesthetic Vector Map Canvas */}
              <div className="absolute inset-0 rounded-3xl border-2 border-purple-500/30 bg-[#f8fafc] dark:bg-[#0c1220] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] overflow-hidden">
                <svg className="w-full h-full opacity-40 dark:opacity-30" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-purple-300 dark:text-purple-900" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                  <path d="M-50 120 Q 150 80, 250 250 T 550 400" fill="none" stroke="currentColor" strokeWidth="4" className="text-purple-400/40 dark:text-purple-600/40" />
                  <path d="M-20 300 Q 180 200, 320 480" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="8 6" className="text-indigo-400/40 dark:text-indigo-500/40" />
                  <circle cx="320" cy="180" r="90" fill="none" stroke="currentColor" strokeWidth="1" className="text-purple-300/30 dark:text-purple-800/40" />
                  <circle cx="320" cy="180" r="140" fill="none" stroke="currentColor" strokeWidth="1" className="text-purple-300/20 dark:text-purple-800/20" />
                </svg>

                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-[25%] left-0 right-0 h-1.5 bg-slate-300/40 dark:bg-slate-800/60 transform -rotate-12" />
                  <div className="absolute top-0 bottom-0 left-[45%] w-1.5 bg-slate-300/40 dark:bg-slate-800/60 transform rotate-45" />
                  <div className="absolute top-[60%] left-0 right-0 h-1 bg-purple-400/30 dark:bg-purple-600/30 transform rotate-6" />
                </div>
              </div>

              {/* LAYER 2: PINS */}
              {/* Pin 1: Bakery / Cafe */}
              <div className="absolute top-[28%] left-[45%] z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer group/pin">
                <div className="relative flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/40 transition-transform group-hover/pin:scale-125">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <div className="w-3 h-3 bg-rose-500 transform rotate-45 -mt-1.5" />
                  <span className="mt-1 px-2.5 py-0.5 rounded-full bg-white dark:bg-[#161f30] text-slate-900 dark:text-white text-[10px] font-extrabold shadow-md border border-slate-200 dark:border-slate-800">
                    Cozy Corner Bakery ☕
                  </span>
                </div>
              </div>

              {/* Pin 2: Ocean Cove Surf */}
              <div className="absolute top-[18%] left-[75%] z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer group/pin">
                <div className="relative flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/40 transition-transform group-hover/pin:scale-125">
                    <Waves className="w-4 h-4" />
                  </div>
                  <div className="w-2.5 h-2.5 bg-purple-600 transform rotate-45 -mt-1" />
                  <span className="mt-1 px-2 py-0.5 rounded-full bg-white dark:bg-[#161f30] text-slate-900 dark:text-white text-[10px] font-extrabold shadow-md border border-slate-200 dark:border-slate-800">
                    Pacific Surf Cove 🌊
                  </span>
                </div>
              </div>

              {/* Pin 3: Visited Mountain */}
              <div className="absolute top-[65%] left-[25%] z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer group/pin">
                <div className="relative flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 transition-transform group-hover/pin:scale-125">
                    <Mountain className="w-4 h-4" />
                  </div>
                  <div className="w-2.5 h-2.5 bg-emerald-500 transform rotate-45 -mt-1" />
                  <span className="mt-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-extrabold shadow-md">
                    🟢 Visited Pine Mountain
                  </span>
                </div>
              </div>

              {/* Pin 4: Speakeasy Lounge */}
              <div className="absolute top-[48%] left-[70%] z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer group/pin">
                <div className="relative flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 transition-transform group-hover/pin:scale-125">
                    <Wine className="w-4 h-4" />
                  </div>
                  <div className="w-2.5 h-2.5 bg-indigo-600 transform rotate-45 -mt-1" />
                  <span className="mt-1 px-2 py-0.5 rounded-full bg-white dark:bg-[#161f30] text-slate-900 dark:text-white text-[10px] font-extrabold shadow-md border border-slate-200 dark:border-slate-800">
                    Speakeasy Lounge 🍸
                  </span>
                </div>
              </div>

              {/* Pin 5: Compass Pin */}
              <div className="absolute top-[20%] left-[20%] z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer group/pin">
                <div className="relative flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/40 transition-transform group-hover/pin:scale-125">
                    <Compass className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* LAYER 3: Floating Squad Card Top Left */}
              <div className="absolute top-4 left-4 z-30 p-3.5 rounded-2xl bg-white/95 dark:bg-[#161f30]/95 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-md animate-float-badge pointer-events-auto">
                <div className="flex items-center gap-2.5">
                  <div className="flex -space-x-2">
                    <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80" className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 object-cover" alt="You" />
                    <img src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80" className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 object-cover" alt="Mark" />
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80" className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 object-cover" alt="Ana" />
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white block">The Boys 🌴 Squad</span>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">5 members • 24 saved places</span>
                  </div>
                </div>
              </div>

              {/* LAYER 4: Floating Notification Pill Top Right */}
              <div className="absolute top-6 -right-4 z-40 px-3.5 py-2 rounded-2xl bg-slate-900 text-white border border-purple-500/40 shadow-2xl backdrop-blur-md animate-float-3d flex items-center gap-2 pointer-events-auto">
                <div className="p-1.5 rounded-full bg-rose-500/20 text-rose-400">
                  <Bell className="w-3.5 h-3.5 animate-bounce" />
                </div>
                <div className="text-[11px]">
                  <span className="font-bold text-white">You</span> added <span className="text-purple-400 font-bold">Pacific Horizon Cove</span>
                </div>
              </div>

              {/* LAYER 5: Floating Place Preview Card Bottom Right */}
              <div className="absolute -bottom-6 right-2 z-40 p-4 rounded-3xl bg-white/95 dark:bg-[#161f30]/95 border-2 border-purple-500/40 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] backdrop-blur-xl max-w-[260px] animate-float-3d-slow pointer-events-auto">
                <div className="relative h-32 rounded-2xl overflow-hidden mb-3">
                  <img
                    src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80"
                    alt="Cozy Corner Bakery"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[9px] font-extrabold shadow">
                    🟢 VISITED
                  </span>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-bold backdrop-blur-md">
                    📸 3 / 5 photos
                  </span>
                </div>

                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">Cozy Corner Bakery</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                  Harbour District • ⭐ 4.7 (231)
                </p>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400">
                    <Heart className="w-3.5 h-3.5 fill-purple-600" />
                    <span>You & 3 others</span>
                  </div>

                  <button
                    onClick={() => toggleInterest('p-sunset-cafe')}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition-all hover:scale-105"
                  >
                    💖 Interested
                  </button>
                </div>
              </div>

              {/* LAYER 6: Floating 3D Navigation Icon Sphere Bottom Left */}
              <div className="absolute -bottom-4 -left-4 z-50 p-3.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg animate-bounce pointer-events-auto">
                <Navigation className="w-6 h-6 transform rotate-45" />
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Feature Section: "Because 'someday' deserves a pin." */}
      <section id="features" className="py-20 px-4 lg:px-12 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
              Because “someday” deserves a pin.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Discover, save, get inspired, and build a living visual archive of your squad's favorite hangout spots.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl border border-slate-200/80 bg-slate-50 space-y-3 hover:border-purple-300 hover:bg-white hover:shadow-md transition-all duration-200 group">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 font-display">Save Places Instantly</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Search any spot, coffee shop, or surf beach and pin it immediately to your group's private map.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-slate-200/80 bg-slate-50 space-y-3 hover:border-purple-300 hover:bg-white hover:shadow-md transition-all duration-200 group">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 font-display">See Who's Interested</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Click "💖 I'm Interested" on any saved place so your squad knows where everyone wants to go next.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-slate-200/80 bg-slate-50 space-y-3 hover:border-purple-300 hover:bg-white hover:shadow-md transition-all duration-200 group">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 font-display">Share Photos & Thoughts</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Attach up to 5 photos and post thoughts when you visit to turn pins into permanent memories.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-slate-200/80 bg-slate-50 space-y-3 hover:border-purple-300 hover:bg-white hover:shadow-md transition-all duration-200 group">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 font-display">Private & Invite-Only</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Share a simple 6-character code to let your closest friends join your squad's private map.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Steps Flow */}
      <section id="how-it-works" className="py-20 px-4 lg:px-12 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            How Tuki Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            From group creation to visited memories in 4 simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm space-y-3 relative hover:border-purple-400 transition-all group">
            <span className="w-8 h-8 rounded-full bg-purple-600 text-white font-mono font-extrabold text-sm flex items-center justify-center shadow-md">
              1
            </span>
            <h4 className="font-bold text-sm text-slate-900 font-display">Create Squad</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Start a group and get a unique 6-character invite code (e.g. BOYS26).
            </p>
            <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-0.5 bg-slate-200 z-10" />
          </div>

          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm space-y-3 relative hover:border-purple-400 transition-all group">
            <span className="w-8 h-8 rounded-full bg-purple-600 text-white font-mono font-extrabold text-sm flex items-center justify-center shadow-md">
              2
            </span>
            <h4 className="font-bold text-sm text-slate-900 font-display">Pin Wishlist</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Search restaurants, beaches, or hiking basecamps and add them to the map.
            </p>
            <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-0.5 bg-slate-200 z-10" />
          </div>

          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm space-y-3 relative hover:border-purple-400 transition-all group">
            <span className="w-8 h-8 rounded-full bg-purple-600 text-white font-mono font-extrabold text-sm flex items-center justify-center shadow-md">
              3
            </span>
            <h4 className="font-bold text-sm text-slate-900 font-display">Express Interest</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Click ❤️ I'm Interested and post thoughts on places you want to visit next.
            </p>
            <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-0.5 bg-slate-200 z-10" />
          </div>

          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm space-y-3 relative hover:border-purple-400 transition-all group">
            <span className="w-8 h-8 rounded-full bg-purple-600 text-white font-mono font-extrabold text-sm flex items-center justify-center shadow-md">
              4
            </span>
            <h4 className="font-bold text-sm text-slate-900 font-display">Build Memories</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mark spots as 🟢 Visited and upload photos to build your visual travel history.
            </p>
          </div>
        </div>
      </section>

      {/* Footer CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 lg:px-12 my-16">
        <div className="rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white p-10 sm:p-14 text-center shadow-xl space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
            Ready to plan your next squad adventure?
          </h2>
          <p className="text-xs sm:text-sm text-purple-100 max-w-lg mx-auto leading-relaxed font-medium">
            Create your first group map in seconds. No credit card or complex setup required.
          </p>
          <div className="pt-2 flex justify-center">
            <Link
              to="/groups"
              className="px-8 py-4 rounded-2xl bg-white text-purple-700 hover:bg-slate-50 font-extrabold text-xs tracking-wider uppercase shadow-lg transition-all hover:scale-105"
            >
              START YOUR SQUAD MAP &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
