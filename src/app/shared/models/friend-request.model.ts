/**
 * Friend Request Model (matches backend response exactly)
 *
 * Represents a "Kaverihaku" (friend search) request where parents
 * can post about their child looking for playmates.
 */
export interface FriendRequest {
  id: string;
  user_id: string;
  parentName: string;
  childName: string;
  childAge: number;
  description: string;
  latitude: number;
  longitude: number;
  city: string;
  interests: string[];
  status: FriendRequestStatus;
  responseCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Status of friend request
 */
export type FriendRequestStatus = 'active' | 'closed';

/**
 * DTO for creating a new friend request (backend request format)
 */
export interface CreateFriendRequestDto {
  parentName: string;
  childName: string;
  childAge: number;
  description: string;
  latitude: number;
  longitude: number;
  city: string;
  interests: string[];
}

/**
 * Friend Request Response Model (backend format)
 */
export interface FriendRequestResponse {
  id?: string;
  friendRequestId?: string;
  responderUserId?: string;
  responseType: FriendRequestResponseType;
  message: string;
  playtimeDetails?: PlaytimeProposalDetails;
  createdAt?: Date;
}

/**
 * Type of response to friend request (backend uses underscore)
 */
export type FriendRequestResponseType = 'contact' | 'playtime_proposal';

/**
 * Details for playtime proposal response (backend format)
 */
export interface PlaytimeProposalDetails {
  date: string; // ISO date string (YYYY-MM-DD)
  time: string; // HH:mm format
  location: string; // Playground/location name
  duration: number; // in hours
  notes?: string; // Optional notes
}

/**
 * DTO for sending a contact message
 */
export interface SendMessageDto {
  requestId: string;
  message: string;
}

/**
 * DTO for proposing a playtime (for service layer)
 */
export interface ProposePlaytimeDto {
  requestId: string;
  message: string;
  playtimeDetails: PlaytimeProposalDetails;
}
