export interface Participant {
  childAge: number;
  childGender: 'boy' | 'girl' | null;
  interests: string[];
}

export interface Playtime {
  id: string;
  playgroundId: string;
  parentName: string;
  scheduledTime: Date;
  duration: number; // Duration in hours (0.5, 1, 1.5, 2)
  participants: Participant[];
  additionalInfo?: string;
  createdAt: Date;
}

export interface CreatePlaytimeDto {
  playgroundId: string;
  parentName: string;
  scheduledTime: Date;
  duration: number; // Duration in hours (0.5, 1, 1.5, 2)
  participants: Participant[];
  additionalInfo?: string;
}
