import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MapStateService } from '../../../core/services/map-state.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  headerTitle = 'Kaveritutka';
  private mapStateSubscription: Subscription | undefined;

  constructor(private mapStateService: MapStateService) {}

  ngOnInit(): void {
    // Subscribe to map state changes to update header with locations
    this.mapStateSubscription = this.mapStateService.mapState$.subscribe(state => {
      if (state.locations.length > 0) {
        const locationsText = state.locations.join('/');
        this.headerTitle = `Kaveritutka - ${locationsText}`;
      } else {
        this.headerTitle = 'Kaveritutka';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.mapStateSubscription) {
      this.mapStateSubscription.unsubscribe();
    }
  }
}
