/**
 * Friend Listing Model (matches backend response exactly)
 *
 * Represents a "Kaverihaku" (friend search) listing where parents
 * can post about their child looking for playmates.
 */
export interface FriendListing {
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
  status: FriendListingStatus;
  responseCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Status of friend listing
 */
export type FriendListingStatus = 'active' | 'closed';

/**
 * DTO for creating a new friend listing (backend request format)
 */
export interface CreateFriendListingDto {
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
 * Friend Listing Response Model (backend format)
 */
export interface FriendListingResponse {
  id?: string;
  friendRequestId?: string;
  responderUserId?: string;
  responseType: FriendListingResponseType;
  message: string;
  playtimeDetails?: PlaytimeProposalDetails;
  createdAt?: Date;
}

/**
 * Type of response to friend listing (backend uses underscore)
 */
export type FriendListingResponseType = 'contact' | 'playtime_proposal';

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
  listingId: string;
  message: string;
}

/**
 * DTO for proposing a playtime (for service layer)
 */
export interface ProposePlaytimeDto {
  listingId: string;
  message: string;
  playtimeDetails: PlaytimeProposalDetails;
}
