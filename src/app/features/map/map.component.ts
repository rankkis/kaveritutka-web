import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import * as L from 'leaflet';
import { PlaygroundService } from '../../shared/services/playground.service';
import { CheckInService } from '../../shared/services/check-in.service';
import { MapStateService } from '../../shared/services/map-state.service';
import { Playground } from '../../shared/models/playground.model';
import { CheckIn } from '../../shared/models/check-in.model';
import { CheckInDialogComponent } from '../check-in-dialog/check-in-dialog.component';
import { Subscription, interval } from 'rxjs';

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
  private markerUpdateSubscription: Subscription | undefined;

  playgrounds: Playground[] = [];
  selectedPlayground: Playground | null = null;
  checkIns: CheckIn[] = [];

  constructor(
    private playgroundService: PlaygroundService,
    private checkInService: CheckInService,
    private dialog: MatDialog,
    private router: Router,
    private mapStateService: MapStateService
  ) {}

  ngOnInit(): void {
    this.initMap();
    this.loadPlaygrounds();

    // Update markers every minute to reflect changing event statuses
    this.markerUpdateSubscription = interval(60000).subscribe(() => {
      this.updateMarkerAnimations();
    });
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
    if (this.markerUpdateSubscription) {
      this.markerUpdateSubscription.unsubscribe();
    }
  }

  private initMap(): void {
    // Initialize map centered on Kiveriönkatu 8, Lahti
    // Zoom level 15 shows approximately 1km range
    // Restore saved state if available
    const savedState = this.mapStateService.getMapState();

    this.map = L.map('map', {
      center: savedState.center,
      zoom: savedState.zoom
    });

    // Add CartoDB Voyager tiles (clean, colorful style)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors © CARTO',
      subdomains: 'abcd'
    }).addTo(this.map);
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
      const markerClass = this.getMarkerClass(playground.id);
      const customIcon = L.divIcon({
        className: 'custom-marker-wrapper',
        html: `<div class="playground-marker ${markerClass}"></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      const marker = L.marker([playground.latitude, playground.longitude], { icon: customIcon })
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
    // Check if mobile device (screen width <= 768px)
    const isMobile = window.innerWidth <= 768;

    if (isMobile && this.map) {
      // Save current map state before navigation
      const center = this.map.getCenter();
      const zoom = this.map.getZoom();
      this.mapStateService.saveMapState([center.lat, center.lng], zoom);

      // Navigate to detail page on mobile
      this.router.navigate(['/playground', playground.id]);
    } else {
      // Show sidebar on desktop
      this.selectedPlayground = playground;
      this.loadCheckInsForPlayground(playground.id);
    }
  }

  private loadCheckInsForPlayground(playgroundId: string): void {
    this.checkInService.getCheckInsByPlayground(playgroundId).subscribe(checkIns => {
      this.checkIns = checkIns;
    });
  }

  onCreateCheckIn(): void {
    if (!this.selectedPlayground) return;

    // Check if mobile device (screen width <= 768px)
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      // Navigate to form page on mobile
      this.router.navigate(['/playground', this.selectedPlayground.id, 'new-checkin']);
    } else {
      // Show dialog on desktop
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

  private getMarkerClass(playgroundId: string): string {
    // Get all check-ins for this playground (synchronously from cached data)
    const allCheckIns: CheckIn[] = [];
    this.checkInService.getAllCheckIns().subscribe(items => {
      allCheckIns.push(...items);
    }).unsubscribe();

    const checkIns = allCheckIns.filter(c => c.playgroundId === playgroundId);

    if (checkIns.length === 0) {
      return 'standard';
    }

    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    // Check for ongoing events
    for (const checkIn of checkIns) {
      const startTime = new Date(checkIn.scheduledTime);
      const endTime = new Date(startTime.getTime() + checkIn.duration * 60 * 60 * 1000);

      if (now >= startTime && now <= endTime) {
        return 'ongoing';
      }
    }

    // Check for upcoming events (within 2 hours)
    for (const checkIn of checkIns) {
      const startTime = new Date(checkIn.scheduledTime);

      if (startTime > now && startTime <= twoHoursFromNow) {
        return 'upcoming';
      }
    }

    return 'standard';
  }

  private updateMarkerAnimations(): void {
    if (!this.map) return;

    this.playgrounds.forEach(playground => {
      const marker = this.markers.get(playground.id);
      if (marker) {
        const markerClass = this.getMarkerClass(playground.id);
        const customIcon = L.divIcon({
          className: 'custom-marker-wrapper',
          html: `<div class="playground-marker ${markerClass}"></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        });
        marker.setIcon(customIcon);
      }
    });
  }
}
