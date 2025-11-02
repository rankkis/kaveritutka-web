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
import { FriendListingService, CreateFriendListingDto } from '../../../shared';

export interface FriendListingDialogData {
  latitude: number;
  longitude: number;
  city: string;
}

@Component({
  selector: 'app-friend-listing-create-dialog',
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
  templateUrl: './friend-listing-create-dialog.component.html',
  styleUrls: ['./friend-listing-create-dialog.component.scss']
})
export class FriendListingCreateDialogComponent implements OnInit {
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

  constructor(
    private fb: FormBuilder,
    private friendListingService: FriendListingService,
    private dialogRef: MatDialogRef<FriendListingCreateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FriendListingDialogData
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      childName: ['', [Validators.required, Validators.maxLength(255)]],
      childAge: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
    });
  }

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
    if (this.form.invalid || this.selectedInterests.length === 0) {
      return;
    }

    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    const dto: CreateFriendListingDto = {
      parentName: 'Vanhempi', // Default parent name - backend should ideally get this from auth
      childName: this.form.value.childName,
      childAge: this.form.value.childAge,
      description: this.form.value.description,
      interests: this.selectedInterests,
      latitude: this.data.latitude,
      longitude: this.data.longitude,
      city: this.data.city
    };

    console.log('Creating friend listing with DTO:', dto);

    this.friendListingService.createFriendListing(dto).pipe(
      take(1)
    ).subscribe({
      next: (listing) => {
        console.log('Friend listing created successfully:', listing);
        this.dialogRef.close(listing);
      },
      error: (error) => {
        console.error('Error creating friend listing:', error);
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
}
