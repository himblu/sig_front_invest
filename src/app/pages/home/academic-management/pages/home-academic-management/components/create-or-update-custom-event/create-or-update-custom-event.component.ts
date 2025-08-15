import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { OnDestroyMixin } from '@w11k/ngx-componentdestroyed';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonService } from '@services/common.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Observable, Subscription } from 'rxjs';
import { CustomEvent } from '@utils/interfaces/calendar.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { NgIf } from '@angular/common';
import { MatRippleModule } from '@angular/material/core';

const HEXADECIMAL_PATTERN: RegExp = /^#[0-9A-Fa-f]{3,6}$/;

@Component({
  selector: 'app-create-or-update-custom-event',
  standalone: true,
  templateUrl: './create-or-update-custom-event.component.html',
  imports: [
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatInputModule,
    NgIf,
    MatRippleModule
  ],
  styleUrls: ['./create-or-update-custom-event.component.css']
})

export class CreateOrUpdateCustomEventComponent extends OnDestroyMixin implements OnInit, OnDestroy {
  public form: FormGroup;
  public sendFormLoading: boolean = false;
  private sendFormSubscription: Subscription;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { event?: CustomEvent },
    private api: CommonService,
    private dialogRef: MatDialogRef<CreateOrUpdateCustomEventComponent>,
    private formBuilder: FormBuilder
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      eventName: [this.data?.event.eventName || '', Validators.compose([Validators.required, Validators.maxLength(100)])],
      eventDesc: [this.data?.event.eventDesc || '', Validators.compose([Validators.required, Validators.maxLength(200)])],
      background: [this.data?.event.background || '', Validators.compose([Validators.required, Validators.pattern(HEXADECIMAL_PATTERN), Validators.maxLength(200)])],
      color: [this.data?.event.color || '', Validators.compose([Validators.required,  Validators.pattern(HEXADECIMAL_PATTERN), Validators.maxLength(200)])],
    });
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.sendFormSubscription) {
      this.sendFormSubscription.unsubscribe();
    }
  }

  public sendForm(): void {
    if (this.form.valid) {
      this.form.disable({ emitEvent: false });
      this.sendFormLoading = true;
      const customEvent: CustomEvent = this.form.getRawValue() as CustomEvent;
      if (this.sendFormSubscription) {
        this.sendFormSubscription.unsubscribe();
      }
      let observableToCreateOrUpdateCustomEvent: Observable<CustomEvent>;
      if (this.data?.event) {
        observableToCreateOrUpdateCustomEvent = this.api.updateCustomEvent(this.data?.event.eventID, customEvent);
      } else {
        observableToCreateOrUpdateCustomEvent = this.api.createCustomEvent(customEvent);
      }
      this.sendFormSubscription = observableToCreateOrUpdateCustomEvent
        .subscribe({
          next: (value: CustomEvent) => {
            this.dialogRef.close(value);
          },
          error: (err: HttpErrorResponse) => {
            this.form.enable({ emitEvent: false });
            this.sendFormLoading = false;
          },
          complete: () => {
            this.sendFormLoading = false;
          }
        });
    } else {
      this.form.markAllAsTouched();
      this.form.markAsDirty();
    }
  }
}
