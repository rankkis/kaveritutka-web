import { Injectable } from '@angular/core';

export interface MapState {
  center: [number, number];
  zoom: number;
}

@Injectable({
  providedIn: 'root'
})
export class MapStateService {
  private mapState: MapState = {
    center: [60.9872, 25.6447], // Default center (Kiveriönkatu 8, Lahti)
    zoom: 15 // Default zoom
  };

  constructor() { }

  saveMapState(center: [number, number], zoom: number): void {
    this.mapState = { center, zoom };
  }

  getMapState(): MapState {
    return this.mapState;
  }

  clearMapState(): void {
    this.mapState = {
      center: [60.9872, 25.6447],
      zoom: 15
    };
  }
}
