import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface MapState {
  center: [number, number];
  zoom: number;
  locations: string[];
}

interface LocationDefinition {
  name: string;
  center: [number, number];
  radius: number; // in kilometers
}

@Injectable({
  providedIn: 'root'
})
export class MapStateService {
  // Minimum zoom level to detect a location (prevents detection when too zoomed out)
  private readonly MIN_ZOOM_FOR_LOCATION_DETECTION = 12;

  // Define Finnish locations (cities, municipalities, villages) with their approximate centers and detection radius
  private readonly locations: LocationDefinition[] = [
    // Major cities
    { name: 'Lahti', center: [60.9827, 25.6612], radius: 15 },
    { name: 'Helsinki', center: [60.1695, 24.9354], radius: 20 },
    { name: 'Espoo', center: [60.2055, 24.6559], radius: 15 },
    { name: 'Vantaa', center: [60.2934, 25.0378], radius: 15 },
    { name: 'Tampere', center: [61.4978, 23.7610], radius: 15 },
    { name: 'Turku', center: [60.4518, 22.2666], radius: 12 },
    { name: 'Oulu', center: [65.0121, 25.4651], radius: 12 },
    { name: 'Jyväskylä', center: [62.2426, 25.7473], radius: 10 },
    { name: 'Kuopio', center: [62.8924, 27.6782], radius: 10 },
    { name: 'Joensuu', center: [62.6010, 29.7636], radius: 10 },
    { name: 'Pori', center: [61.4851, 21.7974], radius: 10 },
    { name: 'Lappeenranta', center: [61.0587, 28.1887], radius: 10 },
    { name: 'Vaasa', center: [63.0959, 21.6164], radius: 10 },
    { name: 'Kotka', center: [60.4664, 26.9458], radius: 8 },
    { name: 'Hämeenlinna', center: [60.9959, 24.4640], radius: 8 },
    { name: 'Porvoo', center: [60.3925, 25.6651], radius: 8 },
    { name: 'Hyvinkää', center: [60.6291, 24.8581], radius: 8 },

    // Smaller municipalities and villages around Lahti
    { name: 'Hollola', center: [60.9979, 25.4359], radius: 10 },
    { name: 'Nastola', center: [60.9460, 25.9285], radius: 8 },
    { name: 'Asikkala', center: [61.2156, 25.5279], radius: 8 },
    { name: 'Orimattila', center: [60.8045, 25.7295], radius: 8 },
    { name: 'Kärkölä', center: [60.8722, 25.2773], radius: 6 },
    { name: 'Lammi', center: [61.0833, 25.0167], radius: 6 },
    { name: 'Padasjoki', center: [61.3494, 25.2781], radius: 6 },
    { name: 'Sysmä', center: [61.5008, 25.6860], radius: 6 },
    { name: 'Hartola', center: [61.5812, 26.0142], radius: 6 },

    // Other smaller localities
    { name: 'Riihimäki', center: [60.7394, 24.7722], radius: 7 },
    { name: 'Järvenpää', center: [60.4736, 25.0899], radius: 7 },
    { name: 'Kerava', center: [60.4042, 25.1050], radius: 6 },
    { name: 'Tuusula', center: [60.4033, 25.0267], radius: 8 },
    { name: 'Nurmijärvi', center: [60.4639, 24.8074], radius: 8 },
    { name: 'Mäntsälä', center: [60.6342, 25.3167], radius: 7 },
    { name: 'Sipoo', center: [60.3750, 25.2667], radius: 8 },
    { name: 'Kirkkonummi', center: [60.1217, 24.4383], radius: 8 },
    { name: 'Kauniainen', center: [60.2111, 24.7261], radius: 3 },
    { name: 'Lohja', center: [60.2486, 24.0653], radius: 8 }
  ];

  private mapStateSubject = new BehaviorSubject<MapState>({
    center: [60.9872, 25.6447], // Default center (Kiveriönkatu 8, Lahti)
    zoom: 15, // Default zoom
    locations: ['Lahti'] // Default location
  });

  public mapState$: Observable<MapState> = this.mapStateSubject.asObservable();

  constructor() { }

  saveMapState(center: [number, number], zoom: number): void {
    const locations = this.detectLocations(center, zoom);
    const newState = { center, zoom, locations };
    this.mapStateSubject.next(newState);
  }

  getMapState(): MapState {
    return this.mapStateSubject.value;
  }

  getCurrentLocations(): string[] {
    return this.mapStateSubject.value.locations;
  }

  clearMapState(): void {
    const defaultState = {
      center: [60.9872, 25.6447] as [number, number],
      zoom: 15,
      locations: ['Lahti']
    };
    this.mapStateSubject.next(defaultState);
  }

  /**
   * Detects which locations the user is viewing based on map center and zoom level
   * @param center Map center coordinates [lat, lng]
   * @param zoom Current zoom level
   * @returns Array of location names (empty if zoomed too far out or no locations nearby)
   */
  private detectLocations(center: [number, number], zoom: number): string[] {
    // If zoomed too far out, can't determine specific locations
    if (zoom < this.MIN_ZOOM_FOR_LOCATION_DETECTION) {
      return [];
    }

    const [lat, lng] = center;

    // Find locations within radius and calculate distances
    const locationsWithDistance = this.locations
      .map(location => ({
        ...location,
        distance: this.calculateDistance(lat, lng, location.center[0], location.center[1])
      }))
      .filter(location => location.distance <= location.radius)
      .sort((a, b) => a.distance - b.distance);

    // If no locations within radius, return empty array
    if (locationsWithDistance.length === 0) {
      return [];
    }

    // If only one location matches, return it
    if (locationsWithDistance.length === 1) {
      return [locationsWithDistance[0].name];
    }

    // Multiple locations match (e.g., Helsinki/Espoo/Vantaa border area, or Lahti/Hollola)
    // Return locations that are relatively close to each other (within 40% distance of closest)
    const closest = locationsWithDistance[0];
    const nearbyLocations = locationsWithDistance.filter(location =>
      location.distance <= closest.distance * 1.4
    );

    // Return up to 3 nearby locations
    return nearbyLocations.slice(0, 3).map(location => location.name);
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @returns Distance in kilometers
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(lat1)) *
      Math.cos(this.degreesToRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
