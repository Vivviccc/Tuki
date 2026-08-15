import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Group, Place, ActivityEvent, PlaceStatus, Thought } from '../types';
import { CURRENT_USER } from '../mock/initialData';
import { useAuth } from './AuthContext';
import { dbService } from '../services/dbService';
import { isSupabaseConfigured } from '../lib/supabase';

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
  deletePlace: (placeId: string) => Promise<boolean>;
  archiveGroup: (groupId: string, isArchived: boolean) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile } = useAuth();
  const currentUser = userProfile || CURRENT_USER;

  // Theme State: Light mode default
  const [theme, setTheme] = useState<ThemeMode>('light');

  // Ensure theme is applied
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // State initialized purely empty - NO mock initial groups or local storage cache
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroupId, setCurrentGroupIdState] = useState<string>('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);

  // Fetch real user groups strictly from Supabase DB
  useEffect(() => {
    let isMounted = true;
    const syncDatabaseData = async () => {
      if (isSupabaseConfigured() && currentUser?.id) {
        const dbGroups = await dbService.fetchUserGroups(currentUser.id);
        if (isMounted) {
          setGroups(dbGroups);
          if (dbGroups.length > 0 && (!currentGroupId || !dbGroups.some((g) => g.id === currentGroupId))) {
            setCurrentGroupIdState(dbGroups[0].id);
          } else if (dbGroups.length === 0) {
            setCurrentGroupIdState('');
          }
        }
      } else {
        if (isMounted) setGroups([]);
      }
    };
    syncDatabaseData();
    return () => {
      isMounted = false;
    };
  }, [currentUser?.id]);

  // Sync places and activities for current active group from Supabase
  useEffect(() => {
    let isMounted = true;
    const fetchGroupData = async () => {
      if (isSupabaseConfigured() && currentGroupId) {
        const [dbPlaces, dbActivities] = await Promise.all([
          dbService.fetchGroupPlaces(currentGroupId),
          dbService.fetchGroupActivities(currentGroupId),
        ]);
        if (isMounted) {
          setPlaces((prev) => {
            const otherPlaces = prev.filter((p) => p.groupId !== currentGroupId);
            return [...otherPlaces, ...dbPlaces];
          });
          setActivities((prev) => {
            const otherActivities = prev.filter((a) => a.groupId !== currentGroupId);
            return [...otherActivities, ...dbActivities];
          });
        }
      } else if (!currentGroupId) {
        if (isMounted) {
          setPlaces([]);
          setActivities([]);
        }
      }
    };
    fetchGroupData();
    return () => {
      isMounted = false;
    };
  }, [currentGroupId]);

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

    // Insert to Supabase DB
    await dbService.createGroupInDb(newGroup, currentUser.id);

    return newGroup;
  };

  const joinGroup = async (inviteCode: string): Promise<{ success: boolean; message: string; group?: Group }> => {
    const cleanCode = inviteCode.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'Please enter a valid invite code.' };
    }

    let targetGroup: Group | null = null;

    // Search strictly in Supabase DB
    if (isSupabaseConfigured()) {
      targetGroup = await dbService.findGroupByInviteCode(cleanCode);
    }

    // Fallback to local state if currently loaded
    if (!targetGroup) {
      targetGroup = groups.find((g) => g.inviteCode.toUpperCase() === cleanCode) || null;
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

    // Sync membership to Supabase DB and refetch
    if (isSupabaseConfigured() && currentUser.id) {
      await dbService.joinGroupInDb(updatedGroup.id, currentUser.id, currentUser);
      const dbGroups = await dbService.fetchUserGroups(currentUser.id);
      if (dbGroups.length > 0) {
        setGroups(dbGroups);
        const refetched = dbGroups.find((g) => g.id === updatedGroup.id);
        if (refetched) {
          return {
            success: true,
            message: isAlreadyMember
              ? `Switched to group ${refetched.name}!`
              : `Successfully joined ${refetched.name}! 🎉`,
            group: refetched,
          };
        }
      }
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
    dbService.createActivityInDb(newActivity);
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
      dbService.createActivityInDb(newActivity);
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
    dbService.createActivityInDb(newActivity);
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
    dbService.createActivityInDb(newActivity);

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
    dbService.createActivityInDb(newActivity);
  };

  const deletePlace = async (placeId: string): Promise<boolean> => {
    const targetPlace = places.find((p) => p.id === placeId);
    if (!targetPlace) return false;

    const sanitizedCurrentId = currentUser?.id ? currentUser.id.replace(/[^a-zA-Z0-9_-]/g, '_') : '';
    const isCreator =
      targetPlace.addedBy?.id === currentUser?.id ||
      targetPlace.addedBy?.id === sanitizedCurrentId ||
      (Boolean(targetPlace.addedBy?.email) && targetPlace.addedBy?.email === currentUser?.email);

    if (!isCreator) {
      alert('Only the person who pinned this spot can delete it.');
      return false;
    }

    setPlaces((prev) => prev.filter((p) => p.id !== placeId));
    const success = await dbService.deletePlaceFromDb(placeId);
    return success;
  };

  const archiveGroup = async (groupId: string, isArchived: boolean): Promise<boolean> => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, isArchived } : g))
    );

    const success = await dbService.archiveGroupInDb(groupId, isArchived);
    return success;
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
        deletePlace,
        archiveGroup,
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
