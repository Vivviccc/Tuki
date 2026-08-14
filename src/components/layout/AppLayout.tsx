import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Sparkles,
  MapPin,
  Map as MapIcon,
  Activity,
  Users,
  Plus,
  User as UserIcon,
  ChevronDown,
  Sun,
  Moon,
  Bookmark,
  Compass,
  UserPlus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CreateGroupModal, JoinGroupModal } from '../groups/GroupModals';
import { AddPlaceModal } from '../places/AddPlaceModal';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, groups, currentGroup, setCurrentGroupId, theme, toggleTheme } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId?: string }>();

  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isAddPlaceModalOpen, setIsAddPlaceModalOpen] = useState(false);

  const activeGroupId = groupId || currentGroup?.id;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-[#090d16] dark:text-slate-100 transition-colors duration-300 pb-20 md:pb-0">
      {/* Top Navbar */}
      <header className="sticky top-0 z-[1100] h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-xl px-4 lg:px-8 flex items-center justify-between shadow-sm transition-colors duration-300">
        {/* Left Brand & Group Selector */}
        <div className="flex items-center gap-4">
          <Link to="/groups" className="flex items-center gap-2 group">
            <div className="w-9.5 h-9.5 rounded-xl bg-purple-600 flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tight text-slate-900">
              Tuki
            </span>
          </Link>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* Group Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 hover:border-purple-400 text-xs font-semibold transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="max-w-[120px] sm:max-w-[180px] truncate font-extrabold text-slate-800 font-display">
                {currentGroup ? currentGroup.name : 'Select Group'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isGroupDropdownOpen && (
              <div
                className="absolute left-0 mt-2 w-64 rounded-2xl bg-[#161f30] border border-slate-800 shadow-2xl p-2 z-50 animate-fade-in"
                onMouseLeave={() => setIsGroupDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest">
                  // Squad Maps
                </div>

                <div className="space-y-1 my-1 max-h-48 overflow-y-auto">
                  {groups.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => {
                        setCurrentGroupId(g.id);
                        setIsGroupDropdownOpen(false);
                        navigate(`/groups/${g.id}`);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium transition-colors ${
                        g.id === activeGroupId
                          ? 'bg-rose-500/10 text-rose-400 font-bold border border-rose-500/30'
                          : 'text-slate-300 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <img
                          src={g.coverImage}
                          alt={g.name}
                          className="w-6 h-6 rounded-lg object-cover"
                        />
                        <span className="truncate">{g.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{g.members.length} members</span>
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      setIsGroupDropdownOpen(false);
                      setIsCreateModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-1 p-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-[11px] font-extrabold text-white transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Create
                  </button>
                  <button
                    onClick={() => {
                      setIsGroupDropdownOpen(false);
                      setIsJoinModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-1 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-extrabold text-slate-200 transition-colors"
                  >
                    <UserPlus className="w-3 h-3 text-purple-400" /> Join Code
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Navigation Tabs for Active Group */}
        {activeGroupId && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
            <NavLink
              to={`/groups/${activeGroupId}`}
              end
              className={({ isActive }) =>
                `px-4 py-1.5 rounded-xl text-xs font-extrabold tracking-wide transition-all ${
                  isActive
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`
              }
            >
              Overview
            </NavLink>
            <NavLink
              to={`/groups/${activeGroupId}/map`}
              className={({ isActive }) =>
                `px-4 py-1.5 rounded-xl text-xs font-extrabold tracking-wide transition-all ${
                  isActive
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`
              }
            >
              Group Map
            </NavLink>
            <NavLink
              to={`/groups/${activeGroupId}/activity`}
              className={({ isActive }) =>
                `px-4 py-1.5 rounded-xl text-xs font-extrabold tracking-wide transition-all ${
                  isActive
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`
              }
            >
              Activity
            </NavLink>
            <NavLink
              to={`/groups/${activeGroupId}/members`}
              className={({ isActive }) =>
                `px-4 py-1.5 rounded-xl text-xs font-extrabold tracking-wide transition-all ${
                  isActive
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`
              }
            >
              Members
            </NavLink>
          </nav>
        )}

        {/* Right User Actions & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {activeGroupId && (
            <button
              onClick={() => setIsAddPlaceModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-extrabold transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4 text-white stroke-[3]" />
              <span className="hidden sm:inline">Add Place</span>
            </button>
          )}

          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 border border-slate-200 dark:border-slate-800 transition-all hover:scale-105"
          >
            {theme === 'light' ? <Moon className="w-4 h-4 text-purple-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>



          <Link
            to="/profile"
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
            />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden sm:inline-block">
              {currentUser.name}
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">{children}</main>

      {/* Bottom Navigation Dock matching Mockups */}
      <nav className="fixed bottom-0 left-0 right-0 z-[1000] bg-white/90 dark:bg-[#090d16]/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-6 py-2 flex items-center justify-around md:hidden shadow-2xl">
        <NavLink
          to="/groups"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-[10px] font-bold ${
              isActive ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'
            }`
          }
        >
          <Users className="w-5 h-5" />
          <span>Groups</span>
        </NavLink>

        <NavLink
          to={activeGroupId ? `/groups/${activeGroupId}/activity` : '/groups'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-[10px] font-bold ${
              isActive ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'
            }`
          }
        >
          <Activity className="w-5 h-5" />
          <span>Activity</span>
        </NavLink>

        {/* Floating Center Plus Action */}
        <button
          onClick={() => setIsAddPlaceModalOpen(true)}
          className="w-12 h-12 -mt-5 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shadow-glow-brand transition-transform hover:scale-105"
        >
          <Plus className="w-6 h-6" />
        </button>

        <NavLink
          to={activeGroupId ? `/groups/${activeGroupId}/map` : '/groups'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-[10px] font-bold ${
              isActive ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'
            }`
          }
        >
          <Bookmark className="w-5 h-5" />
          <span>Saved</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-[10px] font-bold ${
              isActive ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'
            }`
          }
        >
          <UserIcon className="w-5 h-5" />
          <span>Profile</span>
        </NavLink>
      </nav>

      {/* Modals */}
      <CreateGroupModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      <JoinGroupModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} />
      <AddPlaceModal isOpen={isAddPlaceModalOpen} onClose={() => setIsAddPlaceModalOpen(false)} />
    </div>
  );
};
