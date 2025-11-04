import { Component, OnInit, OnDestroy, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import * as L from 'leaflet';
import { BehaviorSubject, combineLatest, interval, Subscription } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { MapStateService } from '../../core/services/map-state.service';
import {
  PlaygroundService,
  PlaytimeService,
  FriendRequestService,
  Playground,
  Playtime,
  PlaygroundDetailComponent
} from '../../shared';
import { PlaytimeDialogComponent } from '../playtime/playtime-dialog/playtime-dialog.component';
import { getMarkerClass, isMobileDevice } from './map.helpers';
import { areEqual as areLocationArraysEqual } from '../../shared/utils';

// Map component for displaying playgrounds
@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, RouterModule, PlaygroundDetailComponent, MatButtonModule, MatIconModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  // 1. PROPERTIES (alphabetical)
  private readonly dialog = inject(MatDialog);
  private readonly friendRequestService = inject(FriendRequestService);
  private readonly mapStateService = inject(MapStateService);
  private readonly playgroundService = inject(PlaygroundService);
  private readonly playtimeService = inject(PlaytimeService);
  private readonly router = inject(Router);

  private map: L.Map | undefined;
  private mapInitialized = false;
  private mapUpdateSubscription: Subscription | undefined;
  private markers: Map<string, L.Marker> = new Map();
  private now$ = interval(60000).pipe(
    startWith(0),
    map(() => new Date())
  );
  private selectedPlaygroundId$ = new BehaviorSubject<string | null>(null);

  // Cached observables to prevent duplicate HTTP calls
  private playgrounds$ = this.playgroundService.getPlaygrounds().pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );
  private playtimes$ = this.playtimeService.getAllPlaytimes().pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );

  // Friend requests filtered by current map locations
  private friendRequests$ = this.mapStateService.mapState$.pipe(
    map(({locations}) => locations),
    distinctUntilChanged(areLocationArraysEqual),
    switchMap(locations =>
      this.friendRequestService.getAllRequests(locations)
    ),
    startWith(null)
  );

  // 2. VIEWMODEL BUILDER
  vm$ = combineLatest({
    friendRequests: this.friendRequests$,
    playgrounds: this.playgrounds$,
    playtimes: this.playtimes$,
    selectedId: this.selectedPlaygroundId$,
    now: this.now$
  }).pipe(
    map(({ friendRequests, playgrounds, playtimes, selectedId, now }) => {
      const selectedPlayground = playgrounds.find(p => p.id === selectedId) || null;
      const selectedPlaygroundPlaytimes = selectedPlayground
        ? playtimes.filter(pt => pt.playgroundId === selectedPlayground.id)
        : [];

      return {
        friendRequestCount: friendRequests?.filter(r => r.status === 'active').length,
        playgrounds,
        playtimes,
        selectedPlayground,
        selectedPlaygroundPlaytimes,
        now
      };
    })
  );

  // 3. PUBLIC METHODS (alphabetical)
  closeSidebar(): void {
    this.selectedPlaygroundId$.next(null);
  }

  onCreatePlaytime(playground: Playground): void {
    if (isMobileDevice()) {
      // Navigate to form page on mobile
      this.router.navigate(['/playground', playground.id, 'new-playtime']);
    } else {
      // Show dialog on desktop
      const dialogRef = this.dialog.open(PlaytimeDialogComponent, {
        width: '100%',
        maxWidth: '640px',
        maxHeight: '95vh',
        panelClass: 'playtime-dialog-panel',
        data: { playground },
        autoFocus: false,
        restoreFocus: false
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // The subscription to playtimeService will automatically update the view
        }
      });
    }
  }

  onMarkerClick(playground: Playground): void {
    if (isMobileDevice() && this.map) {
      // Save current map state before navigation
      const center = this.map.getCenter();
      const zoom = this.map.getZoom();
      this.mapStateService.saveMapState([center.lat, center.lng], zoom);

      // Navigate to detail page on mobile
      this.router.navigate(['/playground', playground.id]);
    } else {
      // Show sidebar on desktop
      this.selectedPlaygroundId$.next(playground.id);
    }
  }

  // 4. LIFECYCLE METHODS
  ngAfterViewInit(): void {
    // Use setTimeout to ensure DOM is fully rendered before subscribing
    setTimeout(() => {
      // Subscribe to vm$ to update markers when data changes
      // Map will be initialized on first emission (after view is ready)
      this.mapUpdateSubscription = this.vm$.subscribe(vm => {
        // Initialize map on first emission (after view is rendered)
        if (!this.mapInitialized) {
          this.initMap();
          // Only mark as initialized if map was successfully created
          if (this.map) {
            this.mapInitialized = true;
          }
        }

        if (this.map && this.markers.size === 0) {
          // Initial marker creation
          this.addMarkersToMap(vm.playgrounds);
        }
        // Update marker animations based on current playtimes and time
        if (this.map) {
          this.updateMarkerAnimations(vm.playgrounds, vm.playtimes, vm.now);
        }
      });
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
    if (this.mapUpdateSubscription) {
      this.mapUpdateSubscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    // Intentionally empty - map initialization happens in ngAfterViewInit
  }

  // 5. PRIVATE METHODS (alphabetical)
  private addMarkersToMap(playgrounds: Playground[]): void {
    if (!this.map) return;

    playgrounds.forEach(playground => {
      const customIcon = L.divIcon({
        className: 'custom-marker-wrapper',
        html: `<div class="playground-marker standard"></div>`,
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

  private initMap(): void {
    // Check if map container exists in DOM
    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.warn('Map container not found in DOM, skipping initialization');
      return;
    }

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

    // Update city detection whenever the map moves or zooms
    this.map.on('moveend', () => {
      if (this.map) {
        const center = this.map.getCenter();
        const zoom = this.map.getZoom();
        this.mapStateService.saveMapState([center.lat, center.lng], zoom);
      }
    });

    this.map.on('zoomend', () => {
      if (this.map) {
        const center = this.map.getCenter();
        const zoom = this.map.getZoom();
        this.mapStateService.saveMapState([center.lat, center.lng], zoom);
      }
    });
  }

  private updateMarkerAnimations(playgrounds: Playground[], allPlaytimes: Playtime[], now: Date): void {
    if (!this.map) return;

    playgrounds.forEach(playground => {
      const marker = this.markers.get(playground.id);
      if (marker) {
        const playgroundPlaytimes = allPlaytimes.filter(pt => pt.playgroundId === playground.id);
        const markerClass = getMarkerClass(playgroundPlaytimes, now);
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
