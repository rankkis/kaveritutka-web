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
      // Ongoing event #1 (started 20 minutes ago, duration 2h) - ALWAYS ONGOING
      {
        id: '1',
        playgroundId: '1',
        parentName: 'Annika',
        scheduledTime: roundTo15Min(new Date(now.getTime() - 20 * 60 * 1000)),
        duration: 2,
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
      // Ongoing event #2 (started 30 minutes ago, duration 1.5h) - ALWAYS ONGOING
      {
        id: '2',
        playgroundId: '2',
        parentName: 'Aleksi',
        scheduledTime: roundTo15Min(new Date(now.getTime() - 30 * 60 * 1000)),
        duration: 1.5,
        participants: [
          {
            childAge: 3,
            childGender: null,
            interests: ['hiekkalaatikko', 'keinut']
          }
        ],
        additionalInfo: 'Paikalla nyt, keinutellaan!',
        createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000)
      },
      // Upcoming event (in 45 minutes) - ALWAYS UPCOMING
      {
        id: '3',
        playgroundId: '3',
        parentName: 'Keni',
        scheduledTime: roundTo15Min(new Date(now.getTime() + 45 * 60 * 1000)),
        duration: 1.5,
        participants: [
          {
            childAge: 4,
            childGender: 'girl',
            interests: ['liukumäet', 'kiipeily']
          }
        ],
        additionalInfo: 'Tullaan kohta!',
        createdAt: new Date(now.getTime() - 30 * 60 * 1000)
      },
      // Future event (in 1 hour, rounded)
      {
        id: '4',
        playgroundId: '1',
        parentName: 'Heli',
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
        parentName: 'Pasi',
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
        parentName: 'Panu',
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
        parentName: 'Heli',
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
    const now = new Date();

    const filtered = this.checkIns
      .filter(checkIn => checkIn.playgroundId === playgroundId)
      .filter(checkIn => {
        const startTime = new Date(checkIn.scheduledTime);
        const endTime = new Date(startTime.getTime() + checkIn.duration * 60 * 60 * 1000);

        // Include ongoing events (started in the past but not yet ended)
        // AND future events (starting in the future)
        return endTime > now;
      })
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
