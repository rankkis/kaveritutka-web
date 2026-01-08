import { Component, OnInit, OnDestroy, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import * as L from 'leaflet';
import { BehaviorSubject, combineLatest, interval, Subscription, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
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

  private friendRequestsLoading$ = new BehaviorSubject<boolean>(false);
  private map: L.Map | undefined;
  private mapInitialized = false;
  private mapUpdateSubscription: Subscription | undefined;
  private mapViewport$ = new BehaviorSubject<{ lat: number; lng: number; zoom: number } | null>(null);
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

  // Friend requests filtered by current map viewport with location-based filtering
  private friendRequests$ = this.mapViewport$.pipe(
    debounceTime(500), // Debounce to avoid too many API calls
    distinctUntilChanged((prev, curr) => {
      if (!prev && !curr) return true;
      if (!prev || !curr) return false;
      return prev.lat === curr.lat && prev.lng === curr.lng && prev.zoom === curr.zoom;
    }),
    switchMap(viewport => {
      if (!viewport) return of(null);
      this.friendRequestsLoading$.next(true);
      const radius = this.calculateSearchRadius(viewport.zoom);
      return this.friendRequestService.getFriendRequestsByLocation(
        viewport.lat,
        viewport.lng,
        radius
      ).pipe(
        tap(() => this.friendRequestsLoading$.next(false)),
        catchError(error => {
          console.error('Error loading friend requests:', error);
          this.friendRequestsLoading$.next(false);
          return of([]);
        })
      );
    }),
    startWith(null),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  // 2. VIEWMODEL BUILDER
  vm$ = combineLatest({
    friendRequests: this.friendRequests$,
    friendRequestsLoading: this.friendRequestsLoading$,
    playgrounds: this.playgrounds$,
    playtimes: this.playtimes$,
    selectedId: this.selectedPlaygroundId$,
    now: this.now$
  }).pipe(
    map(({ friendRequests, friendRequestsLoading, playgrounds, playtimes, selectedId, now }) => {
      const selectedPlayground = playgrounds.find(p => p.id === selectedId) || null;
      const selectedPlaygroundPlaytimes = selectedPlayground
        ? playtimes.filter(pt => pt.playgroundId === selectedPlayground.id)
        : [];

      return {
        friendRequestCount: friendRequests?.filter(r => r.status === 'active').length,
        friendRequestsLoading,
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
  /**
   * Calculate search radius in kilometers based on zoom level
   * Higher zoom (more zoomed in) = smaller radius
   * Lower zoom (more zoomed out) = larger radius
   */
  private calculateSearchRadius(zoom: number): number {
    // Zoom levels and corresponding radius in kilometers
    // Zoom 15 (1km view) = 5km radius
    // Zoom 14 = 10km radius
    // Zoom 13 = 20km radius
    // Zoom 12 = 30km radius
    // Zoom 11 and below = 50km radius
    if (zoom >= 15) return 5;
    if (zoom >= 14) return 10;
    if (zoom >= 13) return 20;
    if (zoom >= 12) return 30;
    return 50;
  }

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

    // Update map state and viewport for friend request filtering whenever the map moves or zooms
    const updateMapViewport = () => {
      if (this.map) {
        const center = this.map.getCenter();
        const zoom = this.map.getZoom();
        this.mapStateService.saveMapState([center.lat, center.lng], zoom);
        this.mapViewport$.next({ lat: center.lat, lng: center.lng, zoom });
      }
    };

    this.map.on('moveend', updateMapViewport);
    this.map.on('zoomend', updateMapViewport);

    // Emit initial viewport
    updateMapViewport();

    // Force Leaflet to recalculate container size after initialization
    // This fixes the issue where tiles don't render until user interaction
    // when the map is inside an *ngIf that may affect initial dimensions
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 0);
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
