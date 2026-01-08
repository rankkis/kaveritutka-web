import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { take } from 'rxjs/operators';
import { FriendRequestService, FriendRequest } from '../../../shared';

export interface FriendRequestEditDialogData {
  request: FriendRequest;
}

@Component({
  selector: 'app-friend-request-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './friend-request-edit-dialog.component.html',
  styleUrls: ['./friend-request-edit-dialog.component.scss']
})
export class FriendRequestEditDialogComponent implements OnInit {
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

  private readonly friendRequestService = inject(FriendRequestService);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<FriendRequestEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FriendRequestEditDialogData
  ) {}

  ngOnInit(): void {
    const request = this.data.request;

    // Initialize form with existing values
    this.form = this.fb.group({
      childName: [request.childName, [Validators.required, Validators.maxLength(255)]],
      description: [request.description, [Validators.required, Validators.maxLength(500)]],
    });

    // Initialize selections from existing data
    this.selectedAge = request.childAge;
    this.selectedInterests = [...request.interests];
  }

  // Age selection
  selectAge(age: number): void {
    this.selectedAge = age;
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

    const updateData = {
      childName: this.form.value.childName,
      childAge: this.selectedAge,
      description: this.form.value.description,
      interests: this.selectedInterests
    };

    this.friendRequestService.updateFriendRequest(this.data.request.id, updateData).pipe(
      take(1)
    ).subscribe({
      next: (updatedRequest) => {
        this.dialogRef.close(updatedRequest);
      },
      error: (error) => {
        console.error('Error updating friend request:', error);

        let errorMessage = 'Ilmoituksen päivitys epäonnistui.';
        if (error.status === 401) {
          errorMessage = 'Kirjaudu sisään muokataksesi ilmoitusta.';
        } else if (error.status === 403) {
          errorMessage = 'Sinulla ei ole oikeutta muokata tätä ilmoitusta.';
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
      return `${childName} (${this.selectedAge}v.)`;
    } else if (this.selectedAge !== null) {
      return `Lapsi (${this.selectedAge}v.)`;
    } else if (childName) {
      return childName;
    }

    return 'Lapsen tiedot';
  }
}
