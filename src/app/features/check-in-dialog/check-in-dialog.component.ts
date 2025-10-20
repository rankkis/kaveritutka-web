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

  // Age options (0-7)
  ageOptions = [0, 1, 2, 3, 4, 5, 6];
  selectedAge = 3;

  // Gender options with icons
  genderOptions = [
    { value: 'boy' as const, icon: '👦', label: 'Poika' },
    { value: 'girl' as const, icon: '👧', label: 'Tyttö' }
  ];
  selectedGender: 'boy' | 'girl' | null = null;

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
  selectedInterests: string[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CheckInDialogComponent>,
    private checkInService: CheckInService,
    @Inject(MAT_DIALOG_DATA) public data: { playground: Playground }
  ) {
    this.generateTimeOptions();

    this.checkInForm = this.fb.group({
      scheduledTime: ['now', Validators.required],
      additionalInfo: ['']
    });
  }

  private generateTimeOptions(): void {
    this.timeOptions.push('now');

    for (let hour = 8; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        this.timeOptions.push(timeStr);
      }
    }
  }

  selectDate(date: string): void {
    this.selectedDate = date;
  }

  selectAge(age: number): void {
    this.selectedAge = age;
  }

  selectGender(gender: 'boy' | 'girl'): void {
    this.selectedGender = gender;
  }

  removeGenderSelection(): void {
    this.selectedGender = null;
  }

  toggleInterest(interest: string): void {
    const index = this.selectedInterests.indexOf(interest);
    if (index > -1) {
      this.selectedInterests.splice(index, 1);
    } else {
      this.selectedInterests.push(interest);
    }
  }

  isInterestSelected(interest: string): boolean {
    return this.selectedInterests.includes(interest);
  }

  getTimeLabel(time: string): string {
    return time === 'now' ? 'Nyt' : time;
  }

  onSubmit(): void {
    if (this.checkInForm.valid && this.selectedInterests.length > 0) {
      const formValue = this.checkInForm.value;
      const scheduledTime = this.calculateScheduledTime();

      const checkInDto: CreateCheckInDto = {
        playgroundId: this.data.playground.id,
        parentName: 'Anonyymi', // Anonymous user
        scheduledTime: scheduledTime,
        childAge: this.selectedAge,
        childGender: this.selectedGender,
        interests: this.selectedInterests,
        additionalInfo: formValue.additionalInfo || undefined
      };

      this.checkInService.createCheckIn(checkInDto).subscribe(checkIn => {
        this.dialogRef.close(checkIn);
      });
    }
  }

  private calculateScheduledTime(): Date {
    const now = new Date();
    const selectedTime = this.checkInForm.value.scheduledTime;

    // Start with today or tomorrow
    const targetDate = new Date();
    if (this.selectedDate === 'tomorrow') {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    // If "now" is selected
    if (selectedTime === 'now') {
      return now;
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
