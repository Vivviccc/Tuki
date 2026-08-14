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
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme, groups, places, toggleInterest } = useApp();

  const totalPlaces = places.length;
  const totalVisited = places.filter((p) => p.status === 'visited').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#090d16] dark:text-slate-100 transition-colors duration-300 overflow-x-hidden">
      {/* Top Navbar */}
      <header className="sticky top-0 z-[1100] h-20 border-b border-slate-800/80 bg-[#0b0f19]/90 backdrop-blur-xl px-4 lg:px-12 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-glow-rose transition-transform group-hover:scale-105">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="font-display font-extrabold text-2xl tracking-tight text-white">
            Tuki
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-mono tracking-wider font-bold text-slate-400">
          <a href="#features" className="hover:text-rose-400 transition-colors">
            // WHY TUKI
          </a>
          <a href="#how-it-works" className="hover:text-rose-400 transition-colors">
            // HOW IT WORKS
          </a>
          <a href="#explore" className="hover:text-rose-400 transition-colors">
            // SQUAD MAPS
          </a>
        </nav>

        {/* Header CTA Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden sm:inline-block px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-300 hover:text-rose-400 transition-colors"
          >
            Sign In
          </Link>

          <Link
            to="/groups"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white text-xs font-extrabold shadow-glow-rose transition-all hover:scale-105"
          >
            <span>Launch App</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-28 px-4 lg:px-12 max-w-7xl mx-auto topo-grid-bg">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-rose-500/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-40 right-5 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Hero Content */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Social Cartography
            </div>

            <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.08]">
              Your camera roll has<br />
              <span className="bg-gradient-to-r from-rose-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                places.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
              Save places you find, share them with your friends, and build a private map of everywhere you want to go — whenever you actually get around to it.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <Link
                to="/groups"
                className="flex items-center gap-2 px-7 py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 hover:from-rose-400 hover:to-purple-500 text-white font-extrabold text-xs tracking-wider uppercase shadow-glow-rose transition-all hover:scale-105"
              >
                <span>Create Squad Map Free</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Link>

              <button
                onClick={() => navigate('/groups')}
                className="px-6 py-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 hover:border-rose-500/50 font-extrabold text-xs tracking-wider uppercase transition-all"
              >
                Explore Demo Groups
              </button>
            </div>

            {/* Social Proof Stats Bar */}
            <div className="pt-6 flex items-center justify-center lg:justify-start gap-6 text-xs font-mono font-bold text-slate-400 border-t border-slate-800/80 max-w-lg">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-rose-400" />
                <span>{groups.length}+ Active Squads</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>{totalPlaces}+ Saved Pins</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>{totalVisited} Visited Memories</span>
              </div>
            </div>
          </div>

          {/* Right Hero: STATIC AESTHETIC 3D VECTOR MAP SHOWCASE WITH MULTIPLE FLOATING PINS */}
          <div className="lg:col-span-6 relative perspective-container">
            <div className="relative mx-auto w-full h-[540px] preserve-3d hero-3d-stage">

              {/* LAYER 0: Ambient Backplate Glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-purple-600/30 to-indigo-600/30 blur-2xl -translate-z-10" />

              {/* LAYER 1: Static Aesthetic Vector Map Graphic Canvas */}
              <div className="absolute inset-0 rounded-3xl border-2 border-purple-500/30 bg-[#f8fafc] dark:bg-[#0c1220] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] overflow-hidden">
                {/* Aesthetic Vector Map Grid & Topography Pattern */}
                <svg className="w-full h-full opacity-40 dark:opacity-30" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-purple-300 dark:text-purple-900" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                  {/* Stylized Coastal Water Route SVG */}
                  <path d="M-50 120 Q 150 80, 250 250 T 550 400" fill="none" stroke="currentColor" strokeWidth="4" className="text-purple-400/40 dark:text-purple-600/40" />
                  <path d="M-20 300 Q 180 200, 320 480" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="8 6" className="text-indigo-400/40 dark:text-indigo-500/40" />
                  {/* Topography Rings */}
                  <circle cx="320" cy="180" r="90" fill="none" stroke="currentColor" strokeWidth="1" className="text-purple-300/30 dark:text-purple-800/40" />
                  <circle cx="320" cy="180" r="140" fill="none" stroke="currentColor" strokeWidth="1" className="text-purple-300/20 dark:text-purple-800/20" />
                </svg>

                {/* Aesthetic Road Networks */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-[25%] left-0 right-0 h-1.5 bg-slate-300/40 dark:bg-slate-800/60 transform -rotate-12" />
                  <div className="absolute top-0 bottom-0 left-[45%] w-1.5 bg-slate-300/40 dark:bg-slate-800/60 transform rotate-45" />
                  <div className="absolute top-[60%] left-0 right-0 h-1 bg-purple-400/30 dark:bg-purple-600/30 transform rotate-6" />
                </div>
              </div>

              {/* LAYER 2: MULTIPLE AESTHETIC 3D FLOATING PINS */}
              {/* Pin 1: The Sunset Café (Rose/Pink ☕) */}
              <div className="absolute top-[28%] left-[45%] z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer group/pin">
                <div className="relative flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/40 transition-transform group-hover/pin:scale-125">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <div className="w-3 h-3 bg-rose-500 transform rotate-45 -mt-1.5" />
                  <span className="mt-1 px-2.5 py-0.5 rounded-full bg-white dark:bg-[#161f30] text-slate-900 dark:text-white text-[10px] font-extrabold shadow-md border border-slate-200 dark:border-slate-800">
                    Sunset Café ☕
                  </span>
                </div>
              </div>

              {/* Pin 2: La Union Surf Cove (Purple 🏄) */}
              <div className="absolute top-[18%] left-[75%] z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer group/pin">
                <div className="relative flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/40 transition-transform group-hover/pin:scale-125">
                    <Waves className="w-4 h-4" />
                  </div>
                  <div className="w-2.5 h-2.5 bg-purple-600 transform rotate-45 -mt-1" />
                  <span className="mt-1 px-2 py-0.5 rounded-full bg-white dark:bg-[#161f30] text-slate-900 dark:text-white text-[10px] font-extrabold shadow-md border border-slate-200 dark:border-slate-800">
                    La Union Surf 🌊
                  </span>
                </div>
              </div>

              {/* Pin 3: Mount Pulag Basecamp (Emerald 🟢 - Visited) */}
              <div className="absolute top-[65%] left-[25%] z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer group/pin">
                <div className="relative flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 transition-transform group-hover/pin:scale-125">
                    <Mountain className="w-4 h-4" />
                  </div>
                  <div className="w-2.5 h-2.5 bg-emerald-500 transform rotate-45 -mt-1" />
                  <span className="mt-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-extrabold shadow-md">
                    🟢 Visited Mt. Pulag
                  </span>
                </div>
              </div>

              {/* Pin 4: Speakeasy Cocktail Bar (Indigo 🍸) */}
              <div className="absolute top-[48%] left-[70%] z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer group/pin">
                <div className="relative flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 transition-transform group-hover/pin:scale-125">
                    <Wine className="w-4 h-4" />
                  </div>
                  <div className="w-2.5 h-2.5 bg-indigo-600 transform rotate-45 -mt-1" />
                  <span className="mt-1 px-2 py-0.5 rounded-full bg-white dark:bg-[#161f30] text-slate-900 dark:text-white text-[10px] font-extrabold shadow-md border border-slate-200 dark:border-slate-800">
                    Speakeasy Bar 🍸
                  </span>
                </div>
              </div>

              {/* Pin 5: Pico de Loro Beach (Teal 🏝️) */}
              <div className="absolute top-[75%] left-[60%] z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer group/pin">
                <div className="relative flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-500/40 transition-transform group-hover/pin:scale-125">
                    <Palmtree className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Pin 6: Tagaytay Ridge (Amber 🌄) */}
              <div className="absolute top-[20%] left-[20%] z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer group/pin">
                <div className="relative flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/40 transition-transform group-hover/pin:scale-125">
                    <Compass className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* LAYER 3 (Depth +60px - Floating Squad Map Card): Top Left */}
              <div className="absolute top-4 left-4 z-30 p-3.5 rounded-2xl bg-white/95 dark:bg-[#161f30]/95 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-md animate-float-badge pointer-events-auto">
                <div className="flex items-center gap-2.5">
                  <div className="flex -space-x-2">
                    <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80" className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 object-cover" alt="You" title="You" />
                    <img src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80" className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 object-cover" alt="Mark" title="Mark" />
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80" className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 object-cover" alt="Ana" title="Ana" />
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white block">The Boys 🌴 Squad</span>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">5 members • 24 saved places</span>
                  </div>
                </div>
              </div>

              {/* LAYER 4 (Depth +90px - Floating Notification Pill): Top Right */}
              <div className="absolute top-6 -right-4 z-40 px-3.5 py-2 rounded-2xl bg-slate-900 text-white border border-purple-500/40 shadow-2xl backdrop-blur-md animate-float-3d flex items-center gap-2 pointer-events-auto">
                <div className="p-1.5 rounded-full bg-rose-500/20 text-rose-400">
                  <Bell className="w-3.5 h-3.5 animate-bounce" />
                </div>
                <div className="text-[11px]">
                  <span className="font-bold text-white">You</span> added <span className="text-purple-400 font-bold">La Union Beach Cove</span>
                </div>
              </div>

              {/* LAYER 5 (Depth +120px - Floating Hero Place Card): Bottom Right */}
              <div className="absolute -bottom-6 right-2 z-40 p-4 rounded-3xl bg-white/95 dark:bg-[#161f30]/95 border-2 border-purple-500/40 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] backdrop-blur-xl max-w-[260px] animate-float-3d-slow pointer-events-auto">
                <div className="relative h-32 rounded-2xl overflow-hidden mb-3">
                  <img
                    src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80"
                    alt="Sunset Cafe"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[9px] font-extrabold shadow">
                    🟢 VISITED
                  </span>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-bold backdrop-blur-md">
                    📸 3 / 5 photos
                  </span>
                </div>

                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">The Sunset Café</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                  Quezon City • ⭐ 4.7 (231)
                </p>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400">
                    <Heart className="w-3.5 h-3.5 fill-purple-600" />
                    <span>You & 3 others</span>
                  </div>

                  <button
                    onClick={() => toggleInterest('p-sunset-cafe')}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-glow-brand transition-all hover:scale-105"
                  >
                    💖 Interested
                  </button>
                </div>
              </div>

              {/* LAYER 6 (Depth +150px - Floating 3D Navigation Icon Sphere): Bottom Left */}
              <div className="absolute -bottom-4 -left-4 z-50 p-3.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-glow-brand animate-bounce pointer-events-auto">
                <Navigation className="w-6 h-6 transform rotate-45" />
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Feature Section: "Because 'someday' deserves a pin." */}
      <section id="features" className="py-20 px-4 lg:px-12 bg-white dark:bg-[#111827] border-y border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Because “someday” deserves a pin.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Discover, save, get inspired, and build a living visual archive of your squad's favorite hangout spots.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#161f30] space-y-3 hover:border-purple-400 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Save Places Instantly</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Search any spot, coffee shop, or surf beach and pin it immediately to your group's private map.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#161f30] space-y-3 hover:border-purple-400 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">See Who's Interested</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Click "💖 I'm Interested" on any saved place so your squad knows where everyone wants to go next.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#161f30] space-y-3 hover:border-purple-400 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Share Photos & Thoughts</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Attach up to 5 photos and post thoughts when you visit to turn pins into permanent memories.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#161f30] space-y-3 hover:border-purple-400 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">100% Private Maps</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Only members with your unique 6-character invite code can view or contribute to your group map.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Steps */}
      <section id="how-it-works" className="py-20 px-4 lg:px-12 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How Tuki Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            From group creation to visited memories in 4 easy steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161f30] space-y-3 relative">
            <span className="w-8 h-8 rounded-full bg-purple-600 text-white font-extrabold text-sm flex items-center justify-center">
              1
            </span>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Create Squad</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Start a group and get a unique 6-character invite code (e.g. BOYS2026).
            </p>
          </div>

          <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161f30] space-y-3 relative">
            <span className="w-8 h-8 rounded-full bg-purple-600 text-white font-extrabold text-sm flex items-center justify-center">
              2
            </span>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Pin Wishlist</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Search restaurants, beaches, or hiking basecamps and add them to the map.
            </p>
          </div>

          <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161f30] space-y-3 relative">
            <span className="w-8 h-8 rounded-full bg-purple-600 text-white font-extrabold text-sm flex items-center justify-center">
              3
            </span>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Express Interest</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click ❤️ I'm Interested and post thoughts on places you want to visit next.
            </p>
          </div>

          <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161f30] space-y-3 relative">
            <span className="w-8 h-8 rounded-full bg-purple-600 text-white font-extrabold text-sm flex items-center justify-center">
              4
            </span>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Build Memories</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Mark spots as 🟢 Visited and upload photos to build your visual travel history.
            </p>
          </div>
        </div>
      </section>

      {/* Footer CTA Banner */}
      <section className="py-16 px-4 lg:px-12 bg-purple-600 text-white text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to plan your next squad adventure?
          </h2>
          <p className="text-xs sm:text-sm text-purple-100 max-w-lg mx-auto">
            Create your first group map in seconds. No credit card or complex setup required.
          </p>
          <div className="pt-2 flex justify-center">
            <Link
              to="/groups"
              className="px-8 py-4 rounded-2xl bg-white text-purple-600 hover:bg-slate-100 font-extrabold text-sm shadow-2xl transition-all hover:scale-105"
            >
              Open Tuki App Now &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
