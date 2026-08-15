import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Group, Place, ActivityEvent, PlaceStatus, Thought } from '../types';
import { CURRENT_USER, INITIAL_GROUPS, INITIAL_PLACES, INITIAL_ACTIVITIES } from '../mock/initialData';
import { useAuth } from './AuthContext';
import { dbService } from '../services/dbService';
import { isSupabaseConfigured } from '../lib/supabase';

export type ThemeMode = 'light' | 'dark';

const GLOBAL_REGISTRY_KEY = 'tuki_global_invite_registry';

interface AppContextType {
  currentUser: User;
  groups: Group[];
  currentGroup: Group | null;
  places: Place[];
  groupPlaces: Place[];
  activities: ActivityEvent[];
  groupActivities: ActivityEvent[];
  theme: ThemeMode;
  toggleTheme: () => void;
  setCurrentGroupId: (groupId: string) => void;
  createGroup: (name: string, description: string, coverImage?: string) => Promise<Group>;
  joinGroup: (inviteCode: string) => Promise<{ success: boolean; message: string; group?: Group }>;
  addPlace: (placeData: {
    name: string;
    category?: string;
    address: string;
    latitude: number;
    longitude: number;
    photos?: string[];
    initialThought?: string;
  }) => Place;
  toggleInterest: (placeId: string) => void;
  addThought: (placeId: string, content: string) => void;
  addPhoto: (placeId: string, photoUrl: string) => { success: boolean; message?: string };
  updatePlaceStatus: (placeId: string, status: PlaceStatus) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'tuki_';

// Helper to update shared global invite code registry in LocalStorage for cross-account demo testing
const registerGroupInGlobalStorage = (group: Group) => {
  try {
    const raw = localStorage.getItem(GLOBAL_REGISTRY_KEY);
    const registry: Record<string, Group> = raw ? JSON.parse(raw) : {};
    registry[group.inviteCode.toUpperCase()] = group;
    localStorage.setItem(GLOBAL_REGISTRY_KEY, JSON.stringify(registry));
  } catch (e) {
    console.error('Failed to update global invite registry:', e);
  }
};

const findGroupInGlobalStorage = (code: string): Group | null => {
  try {
    const raw = localStorage.getItem(GLOBAL_REGISTRY_KEY);
    if (!raw) return null;
    const registry: Record<string, Group> = JSON.parse(raw);
    return registry[code.trim().toUpperCase()] || null;
  } catch (e) {
    return null;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile } = useAuth();
  const currentUser = userProfile || CURRENT_USER;

  // Theme State: Light mode default
  const [theme, setTheme] = useState<ThemeMode>('light');

  // Ensure light mode is applied
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Scoped storage prefix for logged in user
  const userStoragePrefix = userProfile ? `tuki_user_${currentUser.id}_` : LOCAL_STORAGE_PREFIX;

  // Initialize state from LocalStorage
  const [groups, setGroups] = useState<Group[]>(() => {
    const saved = localStorage.getItem(userStoragePrefix + 'groups');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    if (userProfile) {
      return [];
    }
    return INITIAL_GROUPS;
  });

  const [currentGroupId, setCurrentGroupIdState] = useState<string>(() => {
    const saved = localStorage.getItem(userStoragePrefix + 'currentGroupId');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return groups[0]?.id || '';
  });

  const [places, setPlaces] = useState<Place[]>(() => {
    const saved = localStorage.getItem(userStoragePrefix + 'places');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    if (userProfile) {
      return [];
    }
    return INITIAL_PLACES;
  });

  const [activities, setActivities] = useState<ActivityEvent[]>(() => {
    const saved = localStorage.getItem(userStoragePrefix + 'activities');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    if (userProfile) {
      return [];
    }
    return INITIAL_ACTIVITIES;
  });

  // Hydrate groups from Supabase on mount / auth change
  useEffect(() => {
    let isMounted = true;
    const syncDatabaseData = async () => {
      if (isSupabaseConfigured() && userProfile?.id) {
        const dbGroups = await dbService.fetchUserGroups(userProfile.id);
        if (isMounted && dbGroups.length > 0) {
          setGroups((prev) => {
            // merge preserving local newly created if any
            const existingIds = new Set(dbGroups.map((g) => g.id));
            const localOnly = prev.filter((g) => !existingIds.has(g.id));
            return [...dbGroups, ...localOnly];
          });
          if (!currentGroupId || !dbGroups.some((g) => g.id === currentGroupId)) {
            setCurrentGroupIdState(dbGroups[0].id);
          }
        }
      }
    };
    syncDatabaseData();
    return () => {
      isMounted = false;
    };
  }, [userProfile?.id]);

  // Sync places for current group from Supabase
  useEffect(() => {
    let isMounted = true;
    const fetchPlacesForGroup = async () => {
      if (isSupabaseConfigured() && currentGroupId) {
        const dbPlaces = await dbService.fetchGroupPlaces(currentGroupId);
        if (isMounted && dbPlaces.length > 0) {
          setPlaces((prev) => {
            const otherPlaces = prev.filter((p) => p.groupId !== currentGroupId);
            return [...otherPlaces, ...dbPlaces];
          });
        }
      }
    };
    fetchPlacesForGroup();
    return () => {
      isMounted = false;
    };
  }, [currentGroupId]);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem(userStoragePrefix + 'groups', JSON.stringify(groups));
  }, [groups, userStoragePrefix]);

  useEffect(() => {
    localStorage.setItem(userStoragePrefix + 'currentGroupId', JSON.stringify(currentGroupId));
  }, [currentGroupId, userStoragePrefix]);

  useEffect(() => {
    localStorage.setItem(userStoragePrefix + 'places', JSON.stringify(places));
  }, [places, userStoragePrefix]);

  useEffect(() => {
    localStorage.setItem(userStoragePrefix + 'activities', JSON.stringify(activities));
  }, [activities, userStoragePrefix]);

  const currentGroup = groups.find((g) => g.id === currentGroupId) || groups[0] || null;
  const groupPlaces = places.filter((p) => p.groupId === currentGroupId);
  const groupActivities = activities.filter((a) => a.groupId === currentGroupId);

  const setCurrentGroupId = (id: string) => {
    if (groups.some((g) => g.id === id)) {
      setCurrentGroupIdState(id);
    }
  };

  const createGroup = async (name: string, description: string, coverImage?: string): Promise<Group> => {
    const newGroup: Group = {
      id: `g-${Date.now()}`,
      name,
      description,
      coverImage:
        coverImage ||
        'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      members: [currentUser],
      createdAt: new Date().toISOString(),
    };

    setGroups((prev) => [newGroup, ...prev]);
    setCurrentGroupIdState(newGroup.id);

    // Register in global storage registry for local demo testing across windows
    registerGroupInGlobalStorage(newGroup);

    // Sync to Supabase in background
    await dbService.createGroupInDb(newGroup, currentUser.id);

    return newGroup;
  };

  const joinGroup = async (inviteCode: string): Promise<{ success: boolean; message: string; group?: Group }> => {
    const cleanCode = inviteCode.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'Please enter a valid invite code.' };
    }

    let targetGroup: Group | null = null;

    // 1. Try finding in Supabase DB first if configured
    if (isSupabaseConfigured()) {
      targetGroup = await dbService.findGroupByInviteCode(cleanCode);
    }

    // 2. Fallback to current local state groups
    if (!targetGroup) {
      targetGroup = groups.find((g) => g.inviteCode.toUpperCase() === cleanCode) || null;
    }

    // 3. Fallback to global local storage registry (for cross-user demo testing)
    if (!targetGroup) {
      targetGroup = findGroupInGlobalStorage(cleanCode);
    }

    // 4. Fallback to template mock groups
    if (!targetGroup) {
      targetGroup = INITIAL_GROUPS.find((g) => g.inviteCode.toUpperCase() === cleanCode) || null;
    }

    if (!targetGroup) {
      return { success: false, message: 'Invalid invite code. Please check and try again.' };
    }

    const isAlreadyMember = targetGroup.members.some((m) => m.id === currentUser.id);
    const updatedGroup: Group = {
      ...targetGroup,
      members: isAlreadyMember ? targetGroup.members : [...targetGroup.members, currentUser],
    };

    // Update state
    setGroups((prev) => {
      const exists = prev.some((g) => g.id === updatedGroup.id);
      if (exists) {
        return prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g));
      }
      return [updatedGroup, ...prev];
    });

    setCurrentGroupIdState(updatedGroup.id);

    // Sync membership to Supabase DB if configured
    if (isSupabaseConfigured() && currentUser.id) {
      await dbService.joinGroupInDb(updatedGroup.id, currentUser.id);
    }

    return {
      success: true,
      message: isAlreadyMember
        ? `Switched to group ${updatedGroup.name}!`
        : `Successfully joined ${updatedGroup.name}! 🎉`,
      group: updatedGroup,
    };
  };

  const addPlace = (placeData: {
    name: string;
    category?: string;
    address: string;
    latitude: number;
    longitude: number;
    photos?: string[];
    initialThought?: string;
  }): Place => {
    if (!currentGroup) throw new Error('No active group');

    const newPlaceId = `p-${Date.now()}`;
    const initialThoughts: Thought[] = placeData.initialThought
      ? [
          {
            id: `t-${Date.now()}`,
            userId: currentUser.id,
            userName: currentUser.name,
            userAvatar: currentUser.avatar,
            content: placeData.initialThought,
            createdAt: new Date().toISOString(),
          },
        ]
      : [];

    const newPlace: Place = {
      id: newPlaceId,
      groupId: currentGroup.id,
      name: placeData.name,
      category: placeData.category || 'General Spot',
      address: placeData.address,
      latitude: placeData.latitude,
      longitude: placeData.longitude,
      addedBy: currentUser,
      createdAt: new Date().toISOString(),
      status: 'saved',
      photos: placeData.photos || [],
      thoughts: initialThoughts,
      interestedUserIds: [currentUser.id],
    };

    setPlaces((prev) => [newPlace, ...prev]);

    const newActivity: ActivityEvent = {
      id: `act-${Date.now()}`,
      groupId: currentGroup.id,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      type: 'add_place',
      targetPlaceId: newPlace.id,
      targetPlaceName: newPlace.name,
      details: 'added a new place',
      timestamp: 'Just now',
    };

    setActivities((prev) => [newActivity, ...prev]);

    // DB Background sync
    dbService.createPlaceInDb(newPlace);
    if (placeData.initialThought && initialThoughts[0]) {
      dbService.addThoughtInDb(newPlace.id, initialThoughts[0]);
    }

    return newPlace;
  };

  const toggleInterest = (placeId: string) => {
    const targetPlace = places.find((p) => p.id === placeId);
    if (!targetPlace) return;

    const isInterested = targetPlace.interestedUserIds.includes(currentUser.id);
    const updatedUserIds = isInterested
      ? targetPlace.interestedUserIds.filter((id) => id !== currentUser.id)
      : [...targetPlace.interestedUserIds, currentUser.id];

    setPlaces((prev) =>
      prev.map((p) => (p.id === placeId ? { ...p, interestedUserIds: updatedUserIds } : p))
    );

    if (!isInterested) {
      const newActivity: ActivityEvent = {
        id: `act-${Date.now()}`,
        groupId: targetPlace.groupId,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        type: 'interested',
        targetPlaceId: targetPlace.id,
        targetPlaceName: targetPlace.name,
        details: "is interested in a place",
        timestamp: 'Just now',
      };
      setActivities((prev) => [newActivity, ...prev]);
    }

    dbService.toggleInterestInDb(placeId, currentUser.id, isInterested);
  };

  const addThought = (placeId: string, content: string) => {
    if (!content.trim()) return;

    const targetPlace = places.find((p) => p.id === placeId);
    if (!targetPlace) return;

    const newThought: Thought = {
      id: `t-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    setPlaces((prev) =>
      prev.map((p) =>
        p.id === placeId ? { ...p, thoughts: [...p.thoughts, newThought] } : p
      )
    );

    const newActivity: ActivityEvent = {
      id: `act-${Date.now()}`,
      groupId: targetPlace.groupId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      type: 'add_thought',
      targetPlaceId: targetPlace.id,
      targetPlaceName: targetPlace.name,
      details: `left a thought: "${content.trim()}"`,
      timestamp: 'Just now',
    };

    setActivities((prev) => [newActivity, ...prev]);

    dbService.addThoughtInDb(placeId, newThought);
  };

  const addPhoto = (placeId: string, photoUrl: string) => {
    const targetPlace = places.find((p) => p.id === placeId);
    if (!targetPlace) return { success: false, message: 'Place not found' };

    if (targetPlace.photos.length >= 5) {
      return { success: false, message: 'Maximum 5 photos allowed per place.' };
    }

    const updatedPhotos = [...targetPlace.photos, photoUrl];

    setPlaces((prev) =>
      prev.map((p) =>
        p.id === placeId ? { ...p, photos: updatedPhotos } : p
      )
    );

    const newActivity: ActivityEvent = {
      id: `act-${Date.now()}`,
      groupId: targetPlace.groupId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      type: 'add_photos',
      targetPlaceId: targetPlace.id,
      targetPlaceName: targetPlace.name,
      details: 'added a photo',
      timestamp: 'Just now',
    };

    setActivities((prev) => [newActivity, ...prev]);

    dbService.updatePlacePhotosInDb(placeId, updatedPhotos);

    return { success: true };
  };

  const updatePlaceStatus = (placeId: string, status: PlaceStatus) => {
    const targetPlace = places.find((p) => p.id === placeId);
    if (!targetPlace) return;

    const visitedDate = status === 'visited' ? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined;

    setPlaces((prev) =>
      prev.map((p) =>
        p.id === placeId ? { ...p, status, visitedDate } : p
      )
    );

    const statusLabels: Record<PlaceStatus, string> = {
      saved: '🟡 Saved',
      planning: '🔵 Planning',
      visited: '🟢 Visited',
    };

    const newActivity: ActivityEvent = {
      id: `act-${Date.now()}`,
      groupId: targetPlace.groupId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      type: 'status_change',
      targetPlaceId: targetPlace.id,
      targetPlaceName: targetPlace.name,
      details: `marked a place as ${statusLabels[status]}`,
      timestamp: 'Just now',
    };

    setActivities((prev) => [newActivity, ...prev]);

    dbService.updatePlaceStatusInDb(placeId, status, visitedDate);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        groups,
        currentGroup,
        places,
        groupPlaces,
        activities,
        groupActivities,
        theme,
        toggleTheme,
        setCurrentGroupId,
        createGroup,
        joinGroup,
        addPlace,
        toggleInterest,
        addThought,
        addPhoto,
        updatePlaceStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
