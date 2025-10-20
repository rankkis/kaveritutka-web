import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { CheckIn, CreateCheckInDto } from '../models/check-in.model';

@Injectable({
  providedIn: 'root'
})
export class CheckInService {
  private checkIns: CheckIn[] = this.generateMockCheckIns();

  private checkInsSubject = new BehaviorSubject<CheckIn[]>(this.checkIns);

  constructor() { }

  private generateMockCheckIns(): CheckIn[] {
    const now = new Date();

    // Helper function to round to 15-minute intervals
    const roundTo15Min = (date: Date): Date => {
      const rounded = new Date(date);
      const minutes = rounded.getMinutes();
      const roundedMinutes = Math.floor(minutes / 15) * 15;
      rounded.setMinutes(roundedMinutes);
      rounded.setSeconds(0);
      rounded.setMilliseconds(0);
      return rounded;
    };

    return [
      // Past event (2 hours ago, rounded)
      {
        id: '1',
        playgroundId: '1',
        parentName: 'Anonyymi',
        scheduledTime: roundTo15Min(new Date(now.getTime() - 2 * 60 * 60 * 1000)),
        duration: 1,
        participants: [
          {
            childAge: 4,
            childGender: 'girl',
            interests: ['keinut', 'liukumäet']
          }
        ],
        additionalInfo: 'Oltiin käymässä aamulla',
        createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000)
      },
      // Past event (1 hour ago, rounded)
      {
        id: '2',
        playgroundId: '2',
        parentName: 'Anonyymi',
        scheduledTime: roundTo15Min(new Date(now.getTime() - 1 * 60 * 60 * 1000)),
        duration: 1.5,
        participants: [
          {
            childAge: 3,
            childGender: null,
            interests: ['hiekkalaatikko', 'kiipeily']
          }
        ],
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000)
      },
      // Ongoing event (started 45 minutes ago, duration 1.5h, on 15-min interval)
      {
        id: '3',
        playgroundId: '1',
        parentName: 'Anonyymi',
        scheduledTime: roundTo15Min(new Date(now.getTime() - 45 * 60 * 1000)),
        duration: 1.5,
        participants: [
          {
            childAge: 5,
            childGender: 'boy',
            interests: ['jalkapallo', 'juokseminen']
          }
        ],
        additionalInfo: 'Olemme paikalla nyt! Etsitään jalkapallokavereita',
        createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000)
      },
      // Future event (in 1 hour, rounded)
      {
        id: '4',
        playgroundId: '1',
        parentName: 'Anonyymi',
        scheduledTime: roundTo15Min(new Date(now.getTime() + 1 * 60 * 60 * 1000)),
        duration: 1,
        participants: [
          {
            childAge: 2,
            childGender: 'girl',
            interests: ['keinut', 'hiekkalaatikko']
          },
          {
            childAge: 4,
            childGender: 'boy',
            interests: ['liukumäet', 'kiipeily']
          }
        ],
        additionalInfo: 'Tullaan kahden lapsen kanssa',
        createdAt: new Date(now.getTime() - 30 * 60 * 1000)
      },
      // Future event (in 2 hours, rounded)
      {
        id: '5',
        playgroundId: '3',
        parentName: 'Anonyymi',
        scheduledTime: roundTo15Min(new Date(now.getTime() + 2 * 60 * 60 * 1000)),
        duration: 2,
        participants: [
          {
            childAge: 6,
            childGender: 'boy',
            interests: ['pyöräily', 'pallopelit', 'juokseminen']
          }
        ],
        createdAt: new Date(now.getTime() - 20 * 60 * 1000)
      },
      // Future event (in 3 hours, rounded)
      {
        id: '6',
        playgroundId: '2',
        parentName: 'Anonyymi',
        scheduledTime: roundTo15Min(new Date(now.getTime() + 3 * 60 * 60 * 1000)),
        duration: 1.5,
        participants: [
          {
            childAge: 3,
            childGender: null,
            interests: ['keinut', 'liukumäet']
          }
        ],
        createdAt: new Date(now.getTime() - 15 * 60 * 1000)
      },
      // Future event (tomorrow at 10:00)
      {
        id: '7',
        playgroundId: '1',
        parentName: 'Anonyymi',
        scheduledTime: (() => {
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(10, 0, 0, 0);
          return tomorrow;
        })(),
        duration: 1,
        participants: [
          {
            childAge: 4,
            childGender: 'girl',
            interests: ['jalkapallo', 'juokseminen']
          }
        ],
        additionalInfo: 'Huomenna aamulla!',
        createdAt: new Date(now.getTime() - 10 * 60 * 1000)
      }
    ];
  }

  getCheckInsByPlayground(playgroundId: string): Observable<CheckIn[]> {
    const filtered = this.checkIns
      .filter(checkIn => checkIn.playgroundId === playgroundId)
      .filter(checkIn => new Date(checkIn.scheduledTime) > new Date()) // Only future check-ins
      .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());

    return of(filtered);
  }

  getAllCheckIns(): Observable<CheckIn[]> {
    return this.checkInsSubject.asObservable();
  }

  createCheckIn(dto: CreateCheckInDto): Observable<CheckIn> {
    const newCheckIn: CheckIn = {
      id: Date.now().toString(),
      ...dto,
      createdAt: new Date()
    };

    this.checkIns.push(newCheckIn);
    this.checkInsSubject.next(this.checkIns);

    return of(newCheckIn);
  }

  deleteCheckIn(id: string): Observable<boolean> {
    const index = this.checkIns.findIndex(c => c.id === id);
    if (index > -1) {
      this.checkIns.splice(index, 1);
      this.checkInsSubject.next(this.checkIns);
      return of(true);
    }
    return of(false);
  }
}
