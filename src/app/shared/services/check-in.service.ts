import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { CheckIn, CreateCheckInDto } from '../models/check-in.model';

@Injectable({
  providedIn: 'root'
})
export class CheckInService {
  private checkIns: CheckIn[] = [
    {
      id: '1',
      playgroundId: '1',
      parentName: 'Anna',
      scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 tuntia tästä
      childAge: 4,
      childGender: 'girl',
      interests: ['keinut', 'liukumäet'],
      additionalInfo: 'Olemme yleensä noin tunnin',
      createdAt: new Date()
    },
    {
      id: '2',
      playgroundId: '1',
      parentName: 'Mikko',
      scheduledTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 tuntia tästä
      childAge: 5,
      childGender: 'boy',
      interests: ['jalkapallo', 'juokseminen'],
      additionalInfo: 'Etsitään jalkapallokavereita!',
      createdAt: new Date()
    },
    {
      id: '3',
      playgroundId: '2',
      parentName: 'Laura',
      scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // huomenna
      childAge: 3,
      childGender: null,
      interests: ['hiekkalaatikko', 'kiipeily'],
      createdAt: new Date()
    }
  ];

  private checkInsSubject = new BehaviorSubject<CheckIn[]>(this.checkIns);

  constructor() { }

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
