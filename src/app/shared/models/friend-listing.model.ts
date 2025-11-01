/**
 * Friend Listing Model
 *
 * Represents a "Kaverihaku" (friend search) listing where parents
 * can post about their child looking for playmates.
 */
export interface FriendListing {
  id: string;
  userId: string;
  parentName: string;
  childName: string;
  childAge: number;
  description: string; // Main field for special needs, restrictions, situation
  location: FriendListingLocation;
  interests: string[];
  createdAt: Date;
  updatedAt: Date;
  status: FriendListingStatus;
}

/**
 * Location information for friend listing
 */
export interface FriendListingLocation {
  latitude: number;
  longitude: number;
  cityName: string;
}

/**
 * Status of friend listing
 */
export type FriendListingStatus = 'active' | 'closed';

/**
 * DTO for creating a new friend listing
 */
export interface CreateFriendListingDto {
  childName: string;
  childAge: number;
  description: string;
  location: FriendListingLocation;
  interests: string[];
}

/**
 * Friend Listing Response Model
 *
 * Represents a response to a friend listing, either a contact message
 * or a playtime proposal.
 */
export interface FriendListingResponse {
  id?: string;
  listingId: string;
  responderId: string;
  responderName: string;
  responseType: FriendListingResponseType;
  message: string;
  playtimeDetails?: PlaytimeProposalDetails;
  createdAt?: Date;
}

/**
 * Type of response to friend listing
 */
export type FriendListingResponseType = 'contact-message' | 'playtime-proposal';

/**
 * Details for playtime proposal response
 */
export interface PlaytimeProposalDetails {
  playgroundId: string;
  playgroundName: string;
  scheduledTime: Date;
  duration: number; // in hours
  activities: string[];
}

/**
 * DTO for sending a contact message
 */
export interface SendMessageDto {
  listingId: string;
  message: string;
}

/**
 * DTO for proposing a playtime
 */
export interface ProposePlaytimeDto {
  listingId: string;
  message: string;
  playtimeDetails: PlaytimeProposalDetails;
}
