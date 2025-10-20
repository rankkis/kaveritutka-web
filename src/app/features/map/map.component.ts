import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import * as L from 'leaflet';
import { PlaygroundService } from '../../shared/services/playground.service';
import { CheckInService } from '../../shared/services/check-in.service';
import { Playground } from '../../shared/models/playground.model';
import { CheckIn } from '../../shared/models/check-in.model';
import { CheckInDialogComponent } from '../check-in-dialog/check-in-dialog.component';

// Map component for displaying playgrounds
@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {
  private map: L.Map | undefined;
  private markers: Map<string, L.Marker> = new Map();

  playgrounds: Playground[] = [];
  selectedPlayground: Playground | null = null;
  checkIns: CheckIn[] = [];

  constructor(
    private playgroundService: PlaygroundService,
    private checkInService: CheckInService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initMap();
    this.loadPlaygrounds();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    // Initialize map centered on Kiveriönkatu 8, Lahti
    // Zoom level 15 shows approximately 1km range
    this.map = L.map('map', {
      center: [60.9872, 25.6447],
      zoom: 15
    });

    // Add CartoDB Voyager tiles (clean, colorful style)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors © CARTO',
      subdomains: 'abcd'
    }).addTo(this.map);

    // Custom icon for playgrounds
    const playgroundIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Set default icon
    L.Marker.prototype.options.icon = playgroundIcon;
  }

  private loadPlaygrounds(): void {
    this.playgroundService.getPlaygrounds().subscribe(playgrounds => {
      this.playgrounds = playgrounds;
      this.addMarkersToMap();
    });
  }

  private addMarkersToMap(): void {
    if (!this.map) return;

    this.playgrounds.forEach(playground => {
      const marker = L.marker([playground.latitude, playground.longitude])
        .addTo(this.map!)
        .bindPopup(this.createPopupContent(playground))
        .on('click', () => this.onMarkerClick(playground));

      this.markers.set(playground.id, marker);
    });
  }

  private createPopupContent(playground: Playground): string {
    return `
      <div class="popup-content">
        ${playground.imageUrl ? `<img src="${playground.imageUrl}" alt="${playground.name}" style="width: 100%; height: auto; border-radius: 4px; margin-bottom: 8px;" />` : ''}
        <h3>${playground.name}</h3>
        ${playground.address ? `<p>${playground.address}</p>` : ''}
        ${playground.description ? `<p><small>${playground.description}</small></p>` : ''}
      </div>
    `;
  }

  onMarkerClick(playground: Playground): void {
    this.selectedPlayground = playground;
    this.loadCheckInsForPlayground(playground.id);
  }

  private loadCheckInsForPlayground(playgroundId: string): void {
    this.checkInService.getCheckInsByPlayground(playgroundId).subscribe(checkIns => {
      this.checkIns = checkIns;
    });
  }

  onCreateCheckIn(): void {
    if (!this.selectedPlayground) return;

    const dialogRef = this.dialog.open(CheckInDialogComponent, {
      width: '100%',
      maxWidth: '640px',
      maxHeight: '95vh',
      panelClass: 'check-in-dialog-panel',
      data: { playground: this.selectedPlayground },
      autoFocus: false,
      restoreFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.selectedPlayground) {
        // Reload check-ins after creating a new one
        this.loadCheckInsForPlayground(this.selectedPlayground.id);
      }
    });
  }

  closeSidebar(): void {
    this.selectedPlayground = null;
    this.checkIns = [];
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('fi-FI', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fi-FI', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  getGenderInFinnish(gender: string | null): string {
    switch (gender) {
      case 'boy':
        return 'poika';
      case 'girl':
        return 'tyttö';
      default:
        return 'lapsi';
    }
  }

  getParticipantLabel(participant: { childAge: number; childGender: 'boy' | 'girl' | null }): string {
    const gender = this.getGenderInFinnish(participant.childGender);
    return `${participant.childAge}v-${gender}`;
  }

  isEventOngoing(checkIn: CheckIn): boolean {
    const now = new Date();
    const startTime = new Date(checkIn.scheduledTime);
    const endTime = new Date(startTime.getTime() + checkIn.duration * 60 * 60 * 1000);
    return now >= startTime && now <= endTime;
  }

  getTimeStatus(checkIn: CheckIn): string {
    if (this.isEventOngoing(checkIn)) {
      const endTime = new Date(new Date(checkIn.scheduledTime).getTime() + checkIn.duration * 60 * 60 * 1000);
      const minutesLeft = Math.round((endTime.getTime() - new Date().getTime()) / (60 * 1000));
      return `Paikalla nyt (vielä ${minutesLeft} min)`;
    }
    return '';
  }
}
