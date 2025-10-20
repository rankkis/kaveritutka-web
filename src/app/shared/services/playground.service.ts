import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Playground } from '../models/playground.model';

@Injectable({
  providedIn: 'root'
})
export class PlaygroundService {
  // Mock data for Lahti playgrounds
  // Note: Using placehold.co for placeholder images
  private playgrounds: Playground[] = [
    {
      id: '1',
      name: 'Kariniemen leikkipuisto',
      latitude: 60.9823,
      longitude: 25.6551,
      address: 'Kariniementie, Lahti',
      description: 'Large playground near the lake with swings, slides, and climbing structures.',
      imageUrl: 'https://placehold.co/400x300/4CAF50/white?text=Kariniemen+leikkipuisto'
    },
    {
      id: '2',
      name: 'Kiveriön leikkipaikka',
      latitude: 60.9872,
      longitude: 25.6447,
      address: 'Kiveriönkatu, Lahti',
      description: 'Popular neighborhood playground with sandbox and equipment for different age groups.',
      imageUrl: 'https://placehold.co/400x300/66BB6A/white?text=Kiverio+leikkipaikka'
    },
    {
      id: '3',
      name: 'Laune leikkipuisto',
      latitude: 60.9950,
      longitude: 25.6583,
      address: 'Launeenkatu, Lahti',
      description: 'Well-maintained playground with modern equipment.',
      imageUrl: 'https://placehold.co/400x300/81C784/white?text=Laune+leikkipuisto'
    },
    {
      id: '4',
      name: 'Myllypohjan leikkipaikka',
      latitude: 60.9765,
      longitude: 25.6612,
      address: 'Myllypohja, Lahti',
      description: 'Family-friendly playground with various activities.',
      imageUrl: 'https://placehold.co/400x300/4CAF50/white?text=Myllypohjan+leikkipaikka'
    },
    {
      id: '5',
      name: 'Möysän leikkipuisto',
      latitude: 60.9701,
      longitude: 25.6709,
      address: 'Möysäntie, Lahti',
      description: 'Spacious playground in a quiet neighborhood.',
      imageUrl: 'https://placehold.co/400x300/66BB6A/white?text=Moysan+leikkipuisto'
    },
    {
      id: '6',
      name: 'Jalkarannantien leikkipaikka',
      latitude: 60.9834,
      longitude: 25.6398,
      address: 'Jalkarannan tie, Lahti',
      description: 'Playground near the harbor area with beautiful lake views.',
      imageUrl: 'https://placehold.co/400x300/81C784/white?text=Jalkarannantien+leikkipaikka'
    }
  ];

  constructor() { }

  getPlaygrounds(): Observable<Playground[]> {
    // In a real app, this would be an HTTP call
    return of(this.playgrounds);
  }

  getPlaygroundById(id: string): Observable<Playground | undefined> {
    const playground = this.playgrounds.find(p => p.id === id);
    return of(playground);
  }
}
