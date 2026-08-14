import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Group, Place, ActivityEvent, PlaceStatus, Thought } from '../types';
import { CURRENT_USER, INITIAL_GROUPS, INITIAL_PLACES, INITIAL_ACTIVITIES } from '../mock/initialData';
import { useAuth } from './AuthContext';

export type ThemeMode = 'light' | 'dark';

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
  createGroup: (name: string, description: string, coverImage?: string) => Group;
  joinGroup: (inviteCode: string) => { success: boolean; message: string; group?: Group };
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile } = useAuth();
  const currentUser = userProfile || CURRENT_USER;

  // Theme State: Light mode default
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'theme');
    return (savedTheme as ThemeMode) || 'light';
  });

  // Apply dark class to <html> element
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

  // Initialize state from LocalStorage or Fallback Mock Data
  const [groups, setGroups] = useState<Group[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'groups');
    return saved ? JSON.parse(saved) : INITIAL_GROUPS;
  });

  const [currentGroupId, setCurrentGroupIdState] = useState<string>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'currentGroupId');
    return saved ? JSON.parse(saved) : INITIAL_GROUPS[0].id;
  });

  const [places, setPlaces] = useState<Place[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'places');
    return saved ? JSON.parse(saved) : INITIAL_PLACES;
  });

  const [activities, setActivities] = useState<ActivityEvent[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'activities');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'currentGroupId', JSON.stringify(currentGroupId));
  }, [currentGroupId]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'places', JSON.stringify(places));
  }, [places]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'activities', JSON.stringify(activities));
  }, [activities]);

  const currentGroup = groups.find((g) => g.id === currentGroupId) || groups[0] || null;
  const groupPlaces = places.filter((p) => p.groupId === currentGroupId);
  const groupActivities = activities.filter((a) => a.groupId === currentGroupId);

  const setCurrentGroupId = (id: string) => {
    if (groups.some((g) => g.id === id)) {
      setCurrentGroupIdState(id);
    }
  };

  const createGroup = (name: string, description: string, coverImage?: string): Group => {
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
    return newGroup;
  };

  const joinGroup = (inviteCode: string) => {
    const cleanCode = inviteCode.trim().toUpperCase();
    const targetGroup = groups.find((g) => g.inviteCode.toUpperCase() === cleanCode);

    if (!targetGroup) {
      return { success: false, message: 'Invalid invite code. Please check and try again.' };
    }

    const isMember = targetGroup.members.some((m) => m.id === currentUser.id);
    if (isMember) {
      setCurrentGroupIdState(targetGroup.id);
      return { success: true, message: 'You are already a member of this group!', group: targetGroup };
    }

    const updatedGroup = {
      ...targetGroup,
      members: [...targetGroup.members, currentUser],
    };

    setGroups((prev) => prev.map((g) => (g.id === targetGroup.id ? updatedGroup : g)));
    setCurrentGroupIdState(targetGroup.id);

    return { success: true, message: `Successfully joined ${targetGroup.name}!`, group: updatedGroup };
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
  };

  const addPhoto = (placeId: string, photoUrl: string) => {
    const targetPlace = places.find((p) => p.id === placeId);
    if (!targetPlace) return { success: false, message: 'Place not found' };

    if (targetPlace.photos.length >= 5) {
      return { success: false, message: 'Maximum 5 photos allowed per place.' };
    }

    setPlaces((prev) =>
      prev.map((p) =>
        p.id === placeId ? { ...p, photos: [...p.photos, photoUrl] } : p
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
