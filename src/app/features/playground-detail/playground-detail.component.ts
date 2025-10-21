import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PlaygroundService } from '../../shared/services/playground.service';
import { CheckInService } from '../../shared/services/check-in.service';
import { Playground } from '../../shared/models/playground.model';
import { CheckIn } from '../../shared/models/check-in.model';
import { CheckInDialogComponent } from '../check-in-dialog/check-in-dialog.component';

@Component({
  selector: 'app-playground-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './playground-detail.component.html',
  styleUrl: './playground-detail.component.scss'
})
export class PlaygroundDetailComponent implements OnInit {
  playground: Playground | null = null;
  checkIns: CheckIn[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private playgroundService: PlaygroundService,
    private checkInService: CheckInService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const playgroundId = this.route.snapshot.paramMap.get('id');
    if (playgroundId) {
      this.loadPlayground(playgroundId);
      this.loadCheckIns(playgroundId);
    }
  }

  private loadPlayground(playgroundId: string): void {
    this.playgroundService.getPlaygrounds().subscribe(playgrounds => {
      this.playground = playgrounds.find(p => p.id === playgroundId) || null;
    });
  }

  private loadCheckIns(playgroundId: string): void {
    this.checkInService.getCheckInsByPlayground(playgroundId).subscribe(checkIns => {
      this.checkIns = checkIns;
    });
  }

  onCreateCheckIn(): void {
    if (!this.playground) return;

    // Check if mobile device (screen width <= 768px)
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      // Navigate to form page on mobile
      this.router.navigate(['/playground', this.playground.id, 'new-checkin']);
    } else {
      // Show dialog on desktop
      const dialogRef = this.dialog.open(CheckInDialogComponent, {
        width: '100%',
        maxWidth: '640px',
        maxHeight: '95vh',
        panelClass: 'check-in-dialog-panel',
        data: { playground: this.playground },
        autoFocus: false,
        restoreFocus: false
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result && this.playground) {
          // Reload check-ins after creating a new one
          this.loadCheckIns(this.playground.id);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/map']);
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
