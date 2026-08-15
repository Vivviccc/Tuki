import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Group, Place, ActivityEvent, User, Thought, PlaceStatus } from '../types';

const sanitizeUserId = (id?: string): string => {
  if (!id) return 'u-anon';
  return id.replace(/[^a-zA-Z0-9_-]/g, '_');
};

export const dbService = {
  /**
   * Upsert a user's profile to public.profiles table
   */
  async ensureUserProfile(user: User): Promise<void> {
    if (!isSupabaseConfigured() || !user?.id) return;
    const userId = sanitizeUserId(user.id);
    try {
      const { error } = await supabase.from('profiles').upsert(
        {
          id: userId,
          name: user.name || 'Explorer',
          email: user.email || '',
          handle: user.handle || `@user_${userId.slice(0, 5)}`,
          avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
        },
        { onConflict: 'id' }
      );
      if (error) console.warn('ensureUserProfile warning:', error);
    } catch (err) {
      console.error('dbService.ensureUserProfile failed:', err);
    }
  },

  /**
   * Resiliently fetch members for a group
   */
  async getGroupMembers(groupId: string): Promise<User[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      // 1. Get member user_ids for the group
      const { data: memberRows, error: memberErr } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId);

      if (memberErr || !memberRows || memberRows.length === 0) {
        if (memberErr) console.error('Error fetching group_members in getGroupMembers:', memberErr);
        return [];
      }

      const userIds = memberRows.map((m: any) => m.user_id).filter(Boolean);
      if (userIds.length === 0) return [];

      // 2. Fetch profiles for all member user_ids
      const { data: profileRows, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (profErr) console.error('Error fetching profiles in getGroupMembers:', profErr);

      const profileMap = new Map<string, any>();
      (profileRows || []).forEach((p: any) => {
        if (p?.id) profileMap.set(p.id, p);
      });

      // 3. Map member rows to User objects
      return userIds.map((uid: string) => {
        const prof = profileMap.get(uid);
        if (prof) {
          return {
            id: prof.id,
            name: prof.name || 'Explorer',
            email: prof.email || '',
            handle: prof.handle || `@user_${prof.id.slice(0, 5)}`,
            avatar: prof.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${prof.id}`,
          };
        }
        return {
          id: uid,
          name: 'Squad Member',
          email: '',
          handle: `@member_${uid.slice(0, 5)}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`,
        };
      });
    } catch (err) {
      console.error('dbService.getGroupMembers failed:', err);
      return [];
    }
  },

  /**
   * Find a group by its 6-character invite code (case-insensitive)
   */
  async findGroupByInviteCode(inviteCode: string): Promise<Group | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      const cleanCode = inviteCode.trim().toUpperCase();
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .ilike('invite_code', cleanCode)
        .maybeSingle();

      if (error || !data) {
        if (error) console.error('Error querying invite code from Supabase:', error);
        return null;
      }

      const members = await this.getGroupMembers(data.id);

      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        coverImage: data.cover_image || 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
        inviteCode: data.invite_code,
        members,
        createdAt: data.created_at || new Date().toISOString(),
      };
    } catch (err) {
      console.error('dbService.findGroupByInviteCode failed:', err);
      return null;
    }
  },

  /**
   * Fetch all groups that the user is a member of
   */
  async fetchUserGroups(rawUserId: string): Promise<Group[]> {
    if (!isSupabaseConfigured() || !rawUserId) return [];
    const userId = sanitizeUserId(rawUserId);

    try {
      const { data: memberRows, error } = await supabase
        .from('group_members')
        .select('group_id, groups(*)')
        .eq('user_id', userId);

      if (error || !memberRows) {
        console.error('Error fetching user groups:', error);
        return [];
      }

      const groups: Group[] = [];
      for (const row of memberRows) {
        if (row.groups) {
          const g: any = Array.isArray(row.groups) ? row.groups[0] : row.groups;
          if (!g || !g.id) continue;

          const members = await this.getGroupMembers(g.id);

          groups.push({
            id: g.id,
            name: g.name,
            description: g.description || '',
            coverImage: g.cover_image || 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
            inviteCode: g.invite_code,
            members,
            createdAt: g.created_at || new Date().toISOString(),
          });
        }
      }

      return groups;
    } catch (err) {
      console.error('dbService.fetchUserGroups failed:', err);
      return [];
    }
  },

  /**
   * Insert a new group into Supabase and add creator as member
   */
  async createGroupInDb(group: Group, rawUserId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      console.warn('isSupabaseConfigured returned false');
      return false;
    }

    try {
      const userId = sanitizeUserId(rawUserId);

      // 1. Ensure profile exists for creator in Supabase
      const creator = group.members[0] || {
        id: userId,
        name: 'Explorer',
        email: '',
        handle: '@explorer',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      };

      await this.ensureUserProfile(creator);

      // 2. Insert group into groups table
      const { data, error: groupErr } = await supabase.from('groups').insert({
        id: group.id,
        name: group.name,
        description: group.description,
        cover_image: group.coverImage,
        invite_code: group.inviteCode,
        created_by: userId,
      }).select();

      if (groupErr) {
        console.error('CRITICAL: Error inserting group to Supabase:', groupErr);
        alert(`Supabase Error creating group: ${groupErr.message}`);
        return false;
      }

      console.log('Group successfully inserted into Supabase:', data);

      // 3. Add creator as member in group_members table
      const { error: memberErr } = await supabase.from('group_members').insert({
        group_id: group.id,
        user_id: userId,
        role: 'owner',
      });
      if (memberErr) console.error('Error inserting group member:', memberErr);

      return true;
    } catch (err: any) {
      console.error('dbService.createGroupInDb failed with exception:', err);
      alert(`Supabase Exception: ${err?.message || err}`);
      return false;
    }
  },

  /**
   * Add a user to a group using group_id
   */
  async joinGroupInDb(groupId: string, rawUserId: string, userProfile?: User): Promise<boolean> {
    if (!isSupabaseConfigured() || !rawUserId) return false;
    const userId = sanitizeUserId(rawUserId);

    try {
      if (userProfile) {
        await this.ensureUserProfile(userProfile);
      }

      const { error } = await supabase.from('group_members').upsert(
        {
          group_id: groupId,
          user_id: userId,
          role: 'member',
        },
        { onConflict: 'group_id,user_id' }
      );

      if (error) {
        console.error('Error joining group in DB:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('dbService.joinGroupInDb failed:', err);
      return false;
    }
  },

  /**
   * Fetch places for a group along with their thoughts and interested users
   */
  async fetchGroupPlaces(groupId: string): Promise<Place[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data: placeRows, error } = await supabase
        .from('places')
        .select('*')
        .eq('group_id', groupId);

      if (error || !placeRows) return [];

      const places: Place[] = [];
      for (const p of placeRows) {
        // Fetch thoughts for this place
        const { data: thoughtRows } = await supabase
          .from('thoughts')
          .select('*')
          .eq('place_id', p.id);

        const thoughts: Thought[] = (thoughtRows || []).map((t: any) => ({
          id: t.id,
          userId: t.user_id || 'u-anon',
          userName: t.user_name || 'Member',
          userAvatar: t.user_avatar || '',
          content: t.content,
          createdAt: t.created_at,
        }));

        // Fetch interested users
        const { data: interestRows } = await supabase
          .from('place_interests')
          .select('user_id')
          .eq('place_id', p.id);

        const interestedUserIds = (interestRows || []).map((i: any) => i.user_id);

        places.push({
          id: p.id,
          groupId: p.group_id,
          name: p.name,
          category: p.category || 'General Spot',
          address: p.address || '',
          latitude: p.latitude,
          longitude: p.longitude,
          addedBy: {
            id: p.added_by_id || 'u-anon',
            name: p.added_by_name || 'Explorer',
            email: '',
            handle: '@explorer',
            avatar: p.added_by_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`,
          },
          createdAt: p.created_at || new Date().toISOString(),
          status: (p.status as PlaceStatus) || 'saved',
          visitedDate: p.visited_date,
          photos: p.photos || [],
          thoughts,
          interestedUserIds,
        });
      }

      return places;
    } catch (err) {
      console.error('dbService.fetchGroupPlaces failed:', err);
      return [];
    }
  },

  /**
   * Fetch activities for a group
   */
  async fetchGroupActivities(groupId: string): Promise<ActivityEvent[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('group_id', groupId)
        .order('timestamp', { ascending: false });

      if (error || !data) return [];

      return data.map((a: any) => ({
        id: a.id,
        groupId: a.group_id,
        userId: a.user_id || 'u-anon',
        userName: a.user_name || 'Member',
        userAvatar: a.user_avatar || '',
        type: a.type,
        targetPlaceId: a.target_place_id || '',
        targetPlaceName: a.target_place_name || '',
        details: a.details || '',
        timestamp: a.timestamp
          ? new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'Just now',
      }));
    } catch (err) {
      console.error('dbService.fetchGroupActivities failed:', err);
      return [];
    }
  },

  /**
   * Insert new activity into DB
   */
  async createActivityInDb(activity: ActivityEvent): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
      await supabase.from('activities').insert({
        id: activity.id,
        group_id: activity.groupId,
        user_id: sanitizeUserId(activity.userId),
        user_name: activity.userName,
        user_avatar: activity.userAvatar,
        type: activity.type,
        target_place_id: activity.targetPlaceId,
        target_place_name: activity.targetPlaceName,
        details: activity.details,
      });
    } catch (err) {
      console.error('dbService.createActivityInDb failed:', err);
    }
  },

  /**
   * Insert new place into DB
   */
  async createPlaceInDb(place: Place): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;

    try {
      const { error } = await supabase.from('places').insert({
        id: place.id,
        group_id: place.groupId,
        name: place.name,
        category: place.category,
        address: place.address,
        latitude: place.latitude,
        longitude: place.longitude,
        added_by_id: sanitizeUserId(place.addedBy.id),
        added_by_name: place.addedBy.name,
        added_by_avatar: place.addedBy.avatar,
        status: place.status,
        photos: place.photos,
      });

      if (error) {
        console.error('Error inserting place:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('dbService.createPlaceInDb failed:', err);
      return false;
    }
  },

  /**
   * Toggle interest for a place
   */
  async toggleInterestInDb(placeId: string, rawUserId: string, isInterested: boolean): Promise<void> {
    if (!isSupabaseConfigured() || !rawUserId) return;
    const userId = sanitizeUserId(rawUserId);

    try {
      if (isInterested) {
        await supabase
          .from('place_interests')
          .delete()
          .match({ place_id: placeId, user_id: userId });
      } else {
        await supabase
          .from('place_interests')
          .upsert({ place_id: placeId, user_id: userId });
      }
    } catch (err) {
      console.error('dbService.toggleInterestInDb failed:', err);
    }
  },

  /**
   * Add a thought to a place
   */
  async addThoughtInDb(placeId: string, thought: Thought): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
      await supabase.from('thoughts').insert({
        id: thought.id,
        place_id: placeId,
        user_id: sanitizeUserId(thought.userId),
        user_name: thought.userName,
        user_avatar: thought.userAvatar,
        content: thought.content,
      });
    } catch (err) {
      console.error('dbService.addThoughtInDb failed:', err);
    }
  },

  /**
   * Update place status (saved, planning, visited)
   */
  async updatePlaceStatusInDb(placeId: string, status: PlaceStatus, visitedDate?: string): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
      await supabase
        .from('places')
        .update({ status, visited_date: visitedDate })
        .eq('id', placeId);
    } catch (err) {
      console.error('dbService.updatePlaceStatusInDb failed:', err);
    }
  },

  /**
   * Add photo array to place
   */
  async updatePlacePhotosInDb(placeId: string, photos: string[]): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
      await supabase
        .from('places')
        .update({ photos })
        .eq('id', placeId);
    } catch (err) {
      console.error('dbService.updatePlacePhotosInDb failed:', err);
    }
  },
};
