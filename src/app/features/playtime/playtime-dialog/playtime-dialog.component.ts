import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
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
    this.playtimeService.createPlaytime(playtimeDto).subscribe(playtime => {
      this.dialogRef.close(playtime);
    });
  }

  onFormCancel(): void {
    this.dialogRef.close();
  }
}
