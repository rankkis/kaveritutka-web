import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CheckInService } from '../../shared/services/check-in.service';
import { PlaygroundService } from '../../shared/services/playground.service';
import { CreateCheckInDto } from '../../shared/models/check-in.model';
import { Playground } from '../../shared/models/playground.model';
import { PLAYTIME_PERIOD } from '../../shared/constants/playtime.constants';

@Component({
  selector: 'app-check-in-form-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './check-in-form-page.component.html',
  styleUrl: './check-in-form-page.component.scss'
})
export class CheckInFormPageComponent implements OnInit {
  checkInForm: FormGroup;
  playground: Playground | null = null;

  // Date options (filtered based on current time)
  dateOptions: Array<{ value: string; label: string }> = [];
  selectedDate = 'today';

  // Time options (generated from PLAYTIME_PERIOD constants, plus "now")
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
  ageOptions = [0, 1, 2, 3, 4, 5, 6, 7];

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
    private route: ActivatedRoute,
    private router: Router,
    private checkInService: CheckInService,
    private playgroundService: PlaygroundService
  ) {
    this.updateDateOptions();
    this.updateTimeOptions();

    this.checkInForm = this.fb.group({
      parentName: [''],
      scheduledTime: ['now', Validators.required],
      additionalInfo: ['']
    });
  }

  ngOnInit(): void {
    const playgroundId = this.route.snapshot.paramMap.get('id');
    if (playgroundId) {
      this.playgroundService.getPlaygrounds().subscribe(playgrounds => {
        this.playground = playgrounds.find(p => p.id === playgroundId) || null;
      });
    }
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

  private updateDateOptions(): void {
    this.dateOptions = [];
    const now = new Date();
    const roundedNow = this.roundToNearest15Minutes(now);

    const hasTimeSlotsToday = roundedNow.getHours() <= PLAYTIME_PERIOD.END_HOUR;

    if (hasTimeSlotsToday) {
      this.dateOptions.push({ value: 'today', label: 'Tänään' });
    } else {
      this.selectedDate = 'tomorrow';
    }

    this.dateOptions.push({ value: 'tomorrow', label: 'Huomenna' });
  }

  private updateTimeOptions(): void {
    this.timeOptions = [];

    const now = new Date();
    const roundedNow = this.roundToNearest15Minutes(now);

    const isToday = this.selectedDate === 'today';
    const startHour = isToday ? roundedNow.getHours() : PLAYTIME_PERIOD.START_HOUR;
    const startMinute = isToday ? roundedNow.getMinutes() : 0;

    this.timeOptions.push('now');

    for (let hour = startHour; hour <= PLAYTIME_PERIOD.END_HOUR; hour++) {
      const minuteStart = (hour === startHour) ? startMinute : 0;
      for (let minute = minuteStart; minute < 60; minute += PLAYTIME_PERIOD.INTERVAL_MINUTES) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        this.timeOptions.push(timeStr);
      }
    }
  }

  selectDate(date: string): void {
    this.selectedDate = date;
    this.updateTimeOptions();
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

    const allParticipantsValid = this.participants.every(p => p.interests.length > 0);

    if (this.checkInForm.valid && allParticipantsValid && this.playground) {
      const formValue = this.checkInForm.value;
      const scheduledTime = this.calculateScheduledTime();

      const checkInDto: CreateCheckInDto = {
        playgroundId: this.playground.id,
        parentName: formValue.parentName?.trim() || 'Anonyymi',
        scheduledTime: scheduledTime,
        duration: this.selectedDuration,
        participants: this.participants.map(p => ({
          childAge: p.childAge,
          childGender: p.childGender,
          interests: p.interests
        })),
        additionalInfo: formValue.additionalInfo || undefined
      };

      this.checkInService.createCheckIn(checkInDto).subscribe(() => {
        // Navigate back to playground detail page
        this.router.navigate(['/playground', this.playground!.id]);
      });
    }
  }

  private calculateScheduledTime(): Date {
    const selectedTime = this.checkInForm.value.scheduledTime;

    const targetDate = new Date();
    if (this.selectedDate === 'tomorrow') {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    if (selectedTime === 'now') {
      return this.roundToNearest15Minutes(new Date());
    }

    const [hours, minutes] = selectedTime.split(':').map((n: string) => parseInt(n, 10));
    targetDate.setHours(hours, minutes, 0, 0);

    return targetDate;
  }

  goBack(): void {
    if (this.playground) {
      this.router.navigate(['/playground', this.playground.id]);
    } else {
      this.router.navigate(['/map']);
    }
  }
}
