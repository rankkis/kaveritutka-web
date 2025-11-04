import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { take } from 'rxjs/operators';
import { FriendRequestService, CreateFriendRequestDto } from '../../../shared';

export interface FriendRequestDialogData {
  latitude: number;
  longitude: number;
  city: string;
}

@Component({
  selector: 'app-friend-request-create-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './friend-request-create-dialog.component.html',
  styleUrls: ['./friend-request-create-dialog.component.scss']
})
export class FriendRequestCreateDialogComponent implements OnInit {
  form!: FormGroup;
  isSubmitting = false;

  // Available interests
  availableInterests = [
    'Jalkapallo',
    'Keinut',
    'Liukumäet',
    'Hiekkalaatikko',
    'Kiipeily',
    'Juokseminen',
    'Pyöräily',
    'Pallopelit',
    'Piirtäminen',
    'Ulkoilu',
    'Eläimet'
  ];

  selectedInterests: string[] = [];

  // Age options 0-7
  ageOptions = [0, 1, 2, 3, 4, 5, 6, 7];

  // Selected values for chip-based controls
  selectedAge: number | null = null;
  selectedGender: 'boy' | 'girl' | null = null;

  // Gender options
  genderOptions = [
    { value: 'boy' as const, icon: '👦', label: 'Poika' },
    { value: 'girl' as const, icon: '👧', label: 'Tyttö' }
  ];

  constructor(
    private fb: FormBuilder,
    private friendRequestService: FriendRequestService,
    private dialogRef: MatDialogRef<FriendRequestCreateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FriendRequestDialogData
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      childName: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
    });
  }

  // Age selection
  selectAge(age: number): void {
    this.selectedAge = age;
  }

  // Gender selection
  selectGender(gender: 'boy' | 'girl'): void {
    this.selectedGender = gender;
  }

  removeGenderSelection(): void {
    this.selectedGender = null;
  }

  // Interest selection
  toggleInterest(interest: string): void {
    const index = this.selectedInterests.indexOf(interest);
    if (index >= 0) {
      this.selectedInterests.splice(index, 1);
    } else {
      this.selectedInterests.push(interest);
    }
  }

  isInterestSelected(interest: string): boolean {
    return this.selectedInterests.includes(interest);
  }

  onSubmit(): void {
    if (this.form.invalid || this.selectedInterests.length === 0 || this.selectedAge === null) {
      return;
    }

    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    const dto: CreateFriendRequestDto = {
      parentName: 'Vanhempi', // Default parent name - backend should ideally get this from auth
      childName: this.form.value.childName,
      childAge: this.selectedAge,
      description: this.form.value.description,
      interests: this.selectedInterests,
      latitude: this.data.latitude,
      longitude: this.data.longitude,
      city: this.data.city
    };

    console.log('Creating friend request with DTO:', dto);

    this.friendRequestService.createFriendRequest(dto).pipe(
      take(1)
    ).subscribe({
      next: (request) => {
        console.log('Friend request created successfully:', request);
        this.dialogRef.close(request);
      },
      error: (error) => {
        console.error('Error creating friend request:', error);
        console.error('Error details:', error.error);

        let errorMessage = 'Kaverihakuilmoituksen luominen epäonnistui.';
        if (error.status === 401) {
          errorMessage = 'Kirjaudu sisään luodaksesi ilmoituksen.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }

        alert(errorMessage + ' Yritä uudelleen.');
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  get remainingChars(): number {
    const desc = this.form.get('description')?.value || '';
    return 500 - desc.length;
  }

  // Dynamic legend showing child name and age
  get childLegend(): string {
    const childName = this.form.get('childName')?.value || '';

    if (childName && this.selectedAge !== null) {
      return `${this.selectedAge}v-${childName.toLowerCase()}`;
    } else if (this.selectedAge !== null) {
      return `${this.selectedAge}v-lapsi`;
    } else if (childName) {
      return childName;
    }

    return 'Lapsen tiedot';
  }
}
