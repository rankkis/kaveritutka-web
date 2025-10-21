import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Playground } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PlaygroundService {
  // Mock data for Lahti playgrounds
  // Note: Using local SVG placeholder image for all playgrounds
  private playgrounds: Playground[] = [
    {
      id: '1',
      name: 'Kariniemen leikkipuisto',
      latitude: 60.9823,
      longitude: 25.6551,
      address: 'Kariniementie, Lahti',
      description: 'Iso leikkipuisto järven läheisyydessä, keinuineen, liukumäkineen ja kiipeilytelineineen.',
      imageUrl: '/images/playground-placeholder.svg'
    },
    {
      id: '2',
      name: 'Kiveriön leikkipaikka',
      latitude: 60.9872,
      longitude: 25.6447,
      address: 'Kiveriönkatu, Lahti',
      description: 'Suosittu alueen leikkipaikka hiekkalaatikolla ja välineillä eri ikäryhmille.',
      imageUrl: '/images/playground-placeholder.svg'
    },
    {
      id: '3',
      name: 'Laune leikkipuisto',
      latitude: 60.9950,
      longitude: 25.6583,
      address: 'Launeenkatu, Lahti',
      description: 'Hyvin hoidettu leikkipuisto modernilla välineistöllä.',
      imageUrl: '/images/playground-placeholder.svg'
    },
    {
      id: '4',
      name: 'Myllypohjan leikkipaikka',
      latitude: 60.9765,
      longitude: 25.6612,
      address: 'Myllypohja, Lahti',
      description: 'Perheystävällinen leikkipaikka monipuolisine toimintoineen.',
      imageUrl: '/images/playground-placeholder.svg'
    },
    {
      id: '5',
      name: 'Möysän leikkipuisto',
      latitude: 60.9701,
      longitude: 25.6709,
      address: 'Möysäntie, Lahti',
      description: 'Tilava leikkipuisto rauhallisella asuinalueella.',
      imageUrl: '/images/playground-placeholder.svg'
    },
    {
      id: '6',
      name: 'Jalkarannantien leikkipaikka',
      latitude: 60.9834,
      longitude: 25.6398,
      address: 'Jalkarannan tie, Lahti',
      description: 'Leikkipaikka satama-alueella kauniine järvinäkymineen.',
      imageUrl: '/images/playground-placeholder.svg'
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
