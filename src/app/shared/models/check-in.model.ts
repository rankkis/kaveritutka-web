export interface CheckIn {
  id: string;
  playgroundId: string;
  parentName: string;
  scheduledTime: Date;
  childAge: number;
  childGender: 'boy' | 'girl' | null;
  interests: string[];
  additionalInfo?: string;
  createdAt: Date;
}

export interface CreateCheckInDto {
  playgroundId: string;
  parentName: string;
  scheduledTime: Date;
  childAge: number;
  childGender: 'boy' | 'girl' | null;
  interests: string[];
  additionalInfo?: string;
}
