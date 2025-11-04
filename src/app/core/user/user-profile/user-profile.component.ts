import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BehaviorSubject, catchError, combineLatest, map, of, tap } from 'rxjs';
import { UserService } from '../../services/user.service';
import { UpdateUserDto } from '../../../shared/models/user.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  private isSubmitting$ = new BehaviorSubject<boolean>(false);
  private errorMessage$ = new BehaviorSubject<string | null>(null);

  profileForm: FormGroup;
  private returnUrl: string | null = null;

  vm$ = combineLatest({
    user: this.userService.getCurrentUser(),
    isSubmitting: this.isSubmitting$,
    errorMessage: this.errorMessage$
  }).pipe(
    map(({ user, isSubmitting, errorMessage }) => ({
      currentDisplayName: user?.displayName || null,
      isLoading: false,
      errorMessage,
      isSubmitting
    }))
  );

  constructor() {
    this.profileForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(1)]]
    });

    // Get return URL from query params
    this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || null;

    // Pre-fill form with current display name if exists
    this.userService.getCurrentUser().subscribe(user => {
      if (user?.displayName) {
        this.profileForm.patchValue({ displayName: user.displayName });
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSubmitting$.next(true);
    this.errorMessage$.next(null);

    const updateData: UpdateUserDto = {
      displayName: this.profileForm.value.displayName
    };

    this.userService.updateProfile(updateData).pipe(
      tap(() => {
        this.isSubmitting$.next(false);
        // Navigate to return URL or default to map
        const navigationTarget = this.returnUrl || '/map';
        this.router.navigateByUrl(navigationTarget);
      }),
      catchError(error => {
        console.error('Error updating profile:', error);
        this.errorMessage$.next(error.message || 'Profiilin päivitys epäonnistui');
        this.isSubmitting$.next(false);
        return of(null);
      })
    ).subscribe();
  }

  getDisplayNameError(): string {
    const control = this.profileForm.get('displayName');
    if (control?.hasError('required')) {
      return 'Nimi on pakollinen';
    }
    if (control?.hasError('minlength')) {
      return 'Nimi on liian lyhyt';
    }
    return '';
  }
}
