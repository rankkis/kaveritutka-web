import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CheckInService } from '../../shared/services/check-in.service';
import { CreateCheckInDto } from '../../shared/models/check-in.model';
import { Playground } from '../../shared/models/playground.model';

@Component({
  selector: 'app-check-in-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './check-in-dialog.component.html',
  styleUrls: ['./check-in-dialog.component.scss']
})
export class CheckInDialogComponent {
  checkInForm: FormGroup;

  // Date options
  dateOptions = [
    { value: 'today', label: 'Tänään' },
    { value: 'tomorrow', label: 'Huomenna' }
  ];
  selectedDate = 'today';

  // Time options (15 min intervals from 8:00 to 21:00, plus "now")
  timeOptions: string[] = [];

  // Duration options
  durationOptions = [
    { value: 0.5, label: '0,5h' },
    { value: 1, label: '1h' },
    { value: 1.5, label: '1,5h' },
    { value: 2, label: '2h' }
  ];
  selectedDuration = 1;

  // Age options (0-7)
  ageOptions = [0, 1, 2, 3, 4, 5, 6];

  // Gender options with icons
  genderOptions = [
    { value: 'boy' as const, icon: '👦', label: 'Poika' },
    { value: 'girl' as const, icon: '👧', label: 'Tyttö' }
  ];

  // Interest options
  availableInterests: Array<{ value: string; label: string }> = [
    { value: 'jalkapallo', label: 'Jalkapallo' },
    { value: 'keinut', label: 'Keinut' },
    { value: 'liukumäet', label: 'Liukumäet' },
    { value: 'hiekkalaatikko', label: 'Hiekkalaatikko' },
    { value: 'kiipeily', label: 'Kiipeily' },
    { value: 'juokseminen', label: 'Juokseminen' },
    { value: 'pyöräily', label: 'Pyöräily' },
    { value: 'pallopelit', label: 'Pallopelit' }
  ];

  // Participants array
  participants: Array<{
    childAge: number;
    childGender: 'boy' | 'girl' | null;
    interests: string[];
  }> = [
    {
      childAge: 3,
      childGender: null,
      interests: []
    }
  ];

  submitted = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CheckInDialogComponent>,
    private checkInService: CheckInService,
    @Inject(MAT_DIALOG_DATA) public data: { playground: Playground }
  ) {
    this.updateTimeOptions();

    this.checkInForm = this.fb.group({
      parentName: [''],
      scheduledTime: ['now', Validators.required],
      additionalInfo: ['']
    });
  }

  private roundToNearest15Minutes(date: Date): Date {
    const rounded = new Date(date);
    const minutes = rounded.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 15) * 15;
    rounded.setMinutes(roundedMinutes);
    rounded.setSeconds(0);
    rounded.setMilliseconds(0);
    return rounded;
  }

  private updateTimeOptions(): void {
    this.timeOptions = [];

    const now = new Date();
    const roundedNow = this.roundToNearest15Minutes(now);

    // If "Today" is selected, start from current time (rounded)
    // If "Tomorrow" is selected, start from 8:00
    const isToday = this.selectedDate === 'today';
    const startHour = isToday ? roundedNow.getHours() : 8;
    const startMinute = isToday ? roundedNow.getMinutes() : 0;

    // Add "now" option
    this.timeOptions.push('now');

    // Generate time slots from start time to 21:00
    for (let hour = startHour; hour <= 21; hour++) {
      const minuteStart = (hour === startHour) ? startMinute : 0;
      for (let minute = minuteStart; minute < 60; minute += 15) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        this.timeOptions.push(timeStr);
      }
    }
  }

  selectDate(date: string): void {
    this.selectedDate = date;
    this.updateTimeOptions();
    // Reset time selection to 'now' when date changes
    this.checkInForm.patchValue({ scheduledTime: 'now' });
  }

  selectDuration(duration: number): void {
    this.selectedDuration = duration;
  }

  selectAge(participantIndex: number, age: number): void {
    this.participants[participantIndex].childAge = age;
  }

  selectGender(participantIndex: number, gender: 'boy' | 'girl'): void {
    this.participants[participantIndex].childGender = gender;
  }

  removeGenderSelection(participantIndex: number): void {
    this.participants[participantIndex].childGender = null;
  }

  toggleInterest(participantIndex: number, interest: string): void {
    const interests = this.participants[participantIndex].interests;
    const index = interests.indexOf(interest);
    if (index > -1) {
      interests.splice(index, 1);
    } else {
      interests.push(interest);
    }
  }

  isInterestSelected(participantIndex: number, interest: string): boolean {
    return this.participants[participantIndex].interests.includes(interest);
  }

  getTimeLabel(time: string): string {
    return time === 'now' ? 'Nyt' : time;
  }

  getParticipantTitle(participantIndex: number): string {
    const participant = this.participants[participantIndex];
    const age = `${participant.childAge}v`;
    let genderLabel = 'lapsi';

    if (participant.childGender === 'boy') {
      genderLabel = 'poika';
    } else if (participant.childGender === 'girl') {
      genderLabel = 'tyttö';
    }

    return `${age}-${genderLabel}`;
  }

  isParticipantValid(participantIndex: number): boolean {
    const participant = this.participants[participantIndex];
    return participant.interests.length > 0;
  }

  addParticipant(): void {
    this.participants.push({
      childAge: 3,
      childGender: null,
      interests: []
    });
  }

  removeParticipant(participantIndex: number): void {
    if (this.participants.length > 1) {
      this.participants.splice(participantIndex, 1);
    }
  }

  areAllParticipantsValid(): boolean {
    return this.participants.every(p => p.interests.length > 0);
  }

  onSubmit(): void {
    this.submitted = true;

    // Validate that all participants have at least one interest selected
    const allParticipantsValid = this.participants.every(p => p.interests.length > 0);

    if (this.checkInForm.valid && allParticipantsValid) {
      const formValue = this.checkInForm.value;
      const scheduledTime = this.calculateScheduledTime();

      const checkInDto: CreateCheckInDto = {
        playgroundId: this.data.playground.id,
        parentName: formValue.parentName?.trim() || 'Anonyymi', // Use provided name or default to anonymous
        scheduledTime: scheduledTime,
        duration: this.selectedDuration,
        participants: this.participants.map(p => ({
          childAge: p.childAge,
          childGender: p.childGender,
          interests: p.interests
        })),
        additionalInfo: formValue.additionalInfo || undefined
      };

      this.checkInService.createCheckIn(checkInDto).subscribe(checkIn => {
        this.dialogRef.close(checkIn);
      });
    }
  }

  private calculateScheduledTime(): Date {
    const selectedTime = this.checkInForm.value.scheduledTime;

    // Start with today or tomorrow
    const targetDate = new Date();
    if (this.selectedDate === 'tomorrow') {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    // If "now" is selected, use rounded time
    if (selectedTime === 'now') {
      return this.roundToNearest15Minutes(new Date());
    }

    // Parse the time and set it
    const [hours, minutes] = selectedTime.split(':').map((n: string) => parseInt(n, 10));
    targetDate.setHours(hours, minutes, 0, 0);

    return targetDate;
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
