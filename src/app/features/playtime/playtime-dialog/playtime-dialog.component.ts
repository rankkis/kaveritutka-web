import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { take } from 'rxjs/operators';
import {
  PlaytimeService,
  CreatePlaytimeDto,
  Playground
} from '../../../shared';
import { PlaytimeFormComponent } from '../playtime-form/playtime-form.component';

@Component({
  selector: 'app-playtime-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    PlaytimeFormComponent
  ],
  templateUrl: './playtime-dialog.component.html',
  styleUrls: ['./playtime-dialog.component.scss']
})
export class PlaytimeDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<PlaytimeDialogComponent>,
    private playtimeService: PlaytimeService,
    @Inject(MAT_DIALOG_DATA) public data: { playground: Playground }
  ) {}

  onFormSubmit(playtimeDto: CreatePlaytimeDto): void {
    this.playtimeService.createPlaytime(playtimeDto).pipe(
      take(1)
    ).subscribe({
      next: (playtime) => {
        this.dialogRef.close(playtime);
      },
      error: (error) => {
        console.error('Error creating playtime:', error);
        // Don't close the dialog on error, so user can retry
        alert('Leikkiajan luominen epäonnistui. Yritä uudelleen.');
      }
    });
  }

  onFormCancel(): void {
    this.dialogRef.close();
  }
}
