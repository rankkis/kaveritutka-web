import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Playground } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlaygroundService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/playgrounds`;

  getPlaygrounds(): Observable<Playground[]> {
    return this.http.get<Playground[]>(this.apiUrl);
  }

  getPlaygroundById(id: string): Observable<Playground> {
    return this.http.get<Playground>(`${this.apiUrl}/${id}`);
  }
}
