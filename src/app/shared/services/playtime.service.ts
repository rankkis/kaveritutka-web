import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map } from 'rxjs';
import { Playtime, CreatePlaytimeDto } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlaytimeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/playtimes`;

  private playtimesSubject = new BehaviorSubject<Playtime[]>([]);

  constructor() {
    // Load initial playtimes
    this.refreshPlaytimes();
  }

  private refreshPlaytimes(): void {
    this.http.get<Playtime[]>(this.apiUrl).pipe(
      map(playtimes => this.convertPlaytimeDates(playtimes))
    ).subscribe({
      next: (playtimes) => this.playtimesSubject.next(playtimes),
      error: (error) => console.error('Error loading playtimes:', error)
    });
  }

  private convertPlaytimeDates(playtimes: Playtime[]): Playtime[] {
    return playtimes.map(playtime => ({
      ...playtime,
      scheduledTime: new Date(playtime.scheduledTime),
      createdAt: new Date(playtime.createdAt)
    }));
  }

  getPlaytimesByPlayground(playgroundId: string): Observable<Playtime[]> {
    return this.http.get<Playtime[]>(`${this.apiUrl}/playground/${playgroundId}`).pipe(
      map(playtimes => this.convertPlaytimeDates(playtimes))
    );
  }

  getAllPlaytimes(): Observable<Playtime[]> {
    return this.playtimesSubject.asObservable();
  }

  createPlaytime(dto: CreatePlaytimeDto): Observable<Playtime> {
    // Convert Date to ISO string for API
    const payload = {
      ...dto,
      scheduledTime: dto.scheduledTime instanceof Date
        ? dto.scheduledTime.toISOString()
        : dto.scheduledTime
    };

    return this.http.post<Playtime>(this.apiUrl, payload).pipe(
      map(playtime => ({
        ...playtime,
        scheduledTime: new Date(playtime.scheduledTime),
        createdAt: new Date(playtime.createdAt)
      })),
      tap(() => this.refreshPlaytimes())
    );
  }

  deletePlaytime(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.refreshPlaytimes())
    );
  }
}
