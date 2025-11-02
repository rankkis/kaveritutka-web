import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { take } from 'rxjs/operators';
import { FriendRequestService, FriendRequest, SendMessageDto } from '../../../shared';

export interface SendMessageDialogData {
  request: FriendRequest;
}

@Component({
  selector: 'app-send-message-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './send-message-dialog.component.html',
  styleUrls: ['./send-message-dialog.component.scss']
})
export class SendMessageDialogComponent implements OnInit {
  form!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private friendRequestService: FriendRequestService,
    private dialogRef: MatDialogRef<SendMessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SendMessageDialogData
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      message: ['', [Validators.required, Validators.maxLength(300)]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    const dto: SendMessageDto = {
      requestId: this.data.request.id,
      message: this.form.value.message
    };

    this.friendRequestService.sendMessage(dto).pipe(
      take(1)
    ).subscribe({
      next: () => {
        alert('Viesti lähetetty onnistuneesti! Ilmoituksen luoja saa sen sähköpostiinsa.');
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error sending message:', error);
        alert('Viestin lähettäminen epäonnistui. Yritä uudelleen.');
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
