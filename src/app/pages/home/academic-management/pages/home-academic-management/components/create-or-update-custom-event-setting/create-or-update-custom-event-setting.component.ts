import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CustomEvent, CustomEventSetting, Modality } from '@utils/interfaces/calendar.interface';
import { CommonService } from '@services/common.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OnDestroyMixin } from '@w11k/ngx-componentdestroyed';
import { forkJoin, map, Observable, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-create-or-update-custom-event-setting',
  standalone: true,
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatOptionModule,
    MatRippleModule,
    MatSelectModule,
    NgForOf,
    NgIf
  ],
  templateUrl: './create-or-update-custom-event-setting.component.html',
  styleUrls: ['./create-or-update-custom-event-setting.component.css']
})

export class CreateOrUpdateCustomEventSettingComponent extends OnDestroyMixin implements OnInit, OnDestroy {
  public form: FormGroup;
  public loadingInfo: boolean = true;
  public customEvents: CustomEvent[] = [];
  public modalities: Modality[] = [];
  public sendFormLoading: boolean = false;
  private sendFormSubscription: Subscription;
  private getInfoSubscription: Subscription;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { event?: CustomEventSetting },
    private api: CommonService,
    private dialogRef: MatDialogRef<CreateOrUpdateCustomEventSettingComponent>,
    private formBuilder: FormBuilder
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initForm();
    this.getInfo();
  }

  private getInfo(): void {
    this.getInfoSubscription = forkJoin({
      modalities: this.api.getModalities(),
      customEvents: this.api.getEvents()
    }).pipe(map((res: { modalities: Modality[], customEvents: CustomEvent[] }) => {
      this.modalities = res.modalities;
      this.customEvents = res.customEvents;
      return res;
    })).subscribe({
      next: (value) => {
      },
      error: (err: HttpErrorResponse) => {
        this.loadingInfo = false;
      },
      complete: () => {
        this.loadingInfo = false;
      }
    });
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      eventID: [this.data?.event?.eventID || '', Validators.required],
      modalityID: [this.data?.event?.modalityID || '', Validators.required],
      hoursClass: [this.data?.event?.hoursClass || '', Validators.compose([Validators.required, Validators.min(0), Validators.max(24)])]
    });
  }

  public trackByCustomEvent(index: number, item: CustomEvent): number {
    return item.eventID;
  }

  public trackByModality(index: number, item: Modality): number {
    return item.modalityID;
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.sendFormSubscription) {
      this.sendFormSubscription.unsubscribe();
    }
    if (this.getInfoSubscription) {
      this.getInfoSubscription.unsubscribe();
    }
  }

  public sendForm(): void {
    if (this.form.valid) {
      this.form.disable({ emitEvent: false });
      this.sendFormLoading = true;
      const customEventSetting = this.form.getRawValue() as CustomEventSetting;
      if (this.sendFormSubscription) {
        this.sendFormSubscription.unsubscribe();
      }
      let observableToCreateOrUpdateCustomEventSetting: Observable<CustomEventSetting>;
      if (this.data?.event) {
        observableToCreateOrUpdateCustomEventSetting = this.api.updateCustomEventSetting(this.data?.event.settingEventID, customEventSetting);
      } else {
        observableToCreateOrUpdateCustomEventSetting = this.api.createCustomEventSetting(customEventSetting);
      }
      this.sendFormSubscription = observableToCreateOrUpdateCustomEventSetting
        .subscribe({
          next: (value: CustomEventSetting) => {
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
