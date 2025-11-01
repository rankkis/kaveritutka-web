import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { take } from 'rxjs/operators';
import {
  FriendListingService,
  FriendListing,
  ProposePlaytimeDto,
  PlaygroundService,
  Playground
} from '../../../shared';
import { generateTimeSlots } from '../../../shared/utils/generate-time-slots.helper';

export interface ProposePlaytimeDialogData {
  listing: FriendListing;
}

@Component({
  selector: 'app-propose-playtime-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule
  ],
  templateUrl: './propose-playtime-dialog.component.html',
  styleUrls: ['./propose-playtime-dialog.component.scss']
})
export class ProposePlaytimeDialogComponent implements OnInit {
  form!: FormGroup;
  isSubmitting = false;
  playgrounds: Playground[] = [];
  timeSlots: string[] = [];
  durationOptions = [0.5, 1, 1.5, 2];

  minDate = new Date(); // Today or future dates only

  constructor(
    private fb: FormBuilder,
    private friendListingService: FriendListingService,
    private playgroundService: PlaygroundService,
    private dialogRef: MatDialogRef<ProposePlaytimeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProposePlaytimeDialogData
  ) {}

  ngOnInit(): void {
    this.timeSlots = generateTimeSlots();

    this.form = this.fb.group({
      playgroundId: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      duration: [1, Validators.required],
      message: ['', [Validators.required, Validators.maxLength(300)]]
    });

    // Load playgrounds
    this.playgroundService.getPlaygrounds().pipe(take(1)).subscribe(playgrounds => {
      this.playgrounds = playgrounds;
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    const formValue = this.form.value;
    const selectedPlayground = this.playgrounds.find(p => p.id === formValue.playgroundId);

    if (!selectedPlayground) {
      alert('Valitse leikkipuisto');
      this.isSubmitting = false;
      return;
    }

    // Combine date and time
    const [hours, minutes] = formValue.time.split(':');
    const scheduledTime = new Date(formValue.date);
    scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const dto: ProposePlaytimeDto = {
      listingId: this.data.listing.id,
      message: formValue.message,
      playtimeDetails: {
        playgroundId: formValue.playgroundId,
        playgroundName: selectedPlayground.name,
        scheduledTime: scheduledTime,
        duration: formValue.duration,
        activities: this.data.listing.interests // Use interests from the listing
      }
    };

    this.friendListingService.proposePlaytime(dto).pipe(
      take(1)
    ).subscribe({
      next: () => {
        alert('Leikkiaika-ehdotus lähetetty onnistuneesti! Ilmoituksen luoja saa sen sähköpostiinsa.');
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error proposing playtime:', error);
        alert('Ehdotuksen lähettäminen epäonnistui. Yritä uudelleen.');
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  get remainingChars(): number {
    const message = this.form.get('message')?.value || '';
    return 300 - message.length;
  }
}
