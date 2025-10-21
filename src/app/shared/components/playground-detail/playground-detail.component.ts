import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Playground, Playtime } from '../../models';

@Component({
  selector: 'app-playground-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './playground-detail.component.html',
  styleUrl: './playground-detail.component.scss'
})
export class PlaygroundDetailComponent {
  @Input() playground: Playground | null = null;
  @Input() playtimes: Playtime[] = [];
  @Input() showBackButton: boolean = false;
  @Output() createPlaytime = new EventEmitter<void>();
  @Output() backClick = new EventEmitter<void>();

  onCreatePlaytime(): void {
    this.createPlaytime.emit();
  }

  onBackClick(): void {
    this.backClick.emit();
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

  isEventOngoing(playtime: Playtime): boolean {
    const now = new Date();
    const startTime = new Date(playtime.scheduledTime);
    const endTime = new Date(startTime.getTime() + playtime.duration * 60 * 60 * 1000);
    return now >= startTime && now <= endTime;
  }

  getTimeStatus(playtime: Playtime): string {
    if (this.isEventOngoing(playtime)) {
      const endTime = new Date(new Date(playtime.scheduledTime).getTime() + playtime.duration * 60 * 60 * 1000);
      const minutesLeft = Math.round((endTime.getTime() - new Date().getTime()) / (60 * 1000));
      return `Paikalla nyt (vielä ${minutesLeft} min)`;
    }
    return '';
  }
}
