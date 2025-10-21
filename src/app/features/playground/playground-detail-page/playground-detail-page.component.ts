import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import {
  PlaygroundService,
  PlaytimeService,
  Playground,
  Playtime,
  PlaygroundDetailComponent
} from '../../../shared';
import { PlaytimeDialogComponent } from '../../playtime/playtime-dialog/playtime-dialog.component';

@Component({
  selector: 'app-playground-detail-page',
  standalone: true,
  imports: [CommonModule, PlaygroundDetailComponent],
  templateUrl: './playground-detail-page.component.html',
  styleUrl: './playground-detail-page.component.scss'
})
export class PlaygroundDetailPageComponent implements OnInit {
  playground: Playground | null = null;
  playtimes: Playtime[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private playgroundService: PlaygroundService,
    private playtimeService: PlaytimeService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const playgroundId = this.route.snapshot.paramMap.get('id');
    if (playgroundId) {
      this.loadPlayground(playgroundId);
      this.loadPlaytimes(playgroundId);
    }
  }

  private loadPlayground(playgroundId: string): void {
    this.playgroundService.getPlaygrounds().subscribe(playgrounds => {
      this.playground = playgrounds.find(p => p.id === playgroundId) || null;
    });
  }

  private loadPlaytimes(playgroundId: string): void {
    this.playtimeService.getPlaytimesByPlayground(playgroundId).subscribe(playtimes => {
      this.playtimes = playtimes;
    });
  }

  onCreatePlaytime(): void {
    if (!this.playground) return;

    // Check if mobile device (screen width <= 768px)
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      // Navigate to form page on mobile
      this.router.navigate(['/playground', this.playground.id, 'new-playtime']);
    } else {
      // Show dialog on desktop
      const dialogRef = this.dialog.open(PlaytimeDialogComponent, {
        width: '100%',
        maxWidth: '640px',
        maxHeight: '95vh',
        panelClass: 'playtime-dialog-panel',
        data: { playground: this.playground },
        autoFocus: false,
        restoreFocus: false
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result && this.playground) {
          // Reload playtimes after creating a new one
          this.loadPlaytimes(this.playground.id);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/map']);
  }
}
