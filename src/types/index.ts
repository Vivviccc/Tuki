export type PlaceStatus = 'saved' | 'planning' | 'visited';

export interface User {
  id: string;
  name: string;
  email: string;
  handle: string;
  avatar: string;
}

export interface Thought {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export interface Place {
  id: string;
  groupId: string;
  name: string;
  category?: string;
  address: string;
  latitude: number;
  longitude: number;
  mapProviderId?: string;
  addedBy: User;
  createdAt: string;
  status: PlaceStatus;
  visitedDate?: string;
  photos: string[]; // max 5 photos
  thoughts: Thought[];
  interestedUserIds: string[]; // user IDs who clicked ❤️ I'm Interested
}

export interface Group {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  inviteCode: string;
  members: User[];
  createdAt: string;
}

export type ActivityEventType =
  | 'add_place'
  | 'interested'
  | 'add_photos'
  | 'add_thought'
  | 'status_change';

export interface ActivityEvent {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: ActivityEventType;
  targetPlaceId: string;
  targetPlaceName: string;
  details?: string;
  timestamp: string;
}
