import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { OnDestroyMixin } from '@w11k/ngx-componentdestroyed';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, map, Observable, Subscription } from 'rxjs';
import { CustomCalendarEvent, CustomEventSetting } from '@utils/interfaces/calendar.interface';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonService } from '@services/common.service';
import { Period } from '@utils/interfaces/period.interfaces';
import { AdministrativeService } from '@services/administrative.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatOptionSelectionChange, MatRippleModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { HttpErrorResponse } from '@angular/common/http';
import {
  DateRange, DefaultMatCalendarRangeStrategy,
  MAT_DATE_RANGE_SELECTION_STRATEGY,
  MatCalendar,
  MatDatepickerModule
} from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';

let ECUADOR_LOCAL_STRING = new Date().toLocaleString('en-US',{ timeZone: 'America/Guayaquil'});

@Component({
  selector: 'app-create-or-update-custom-calendar-event',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatRippleModule,
    ReactiveFormsModule,
    MatSelectModule,
    NgForOf,
    NgIf,
    DatePipe,
    MatDatepickerModule,
    MatCardModule
  ],
  providers: [
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: DefaultMatCalendarRangeStrategy,
    }
  ],
  templateUrl: './create-or-update-custom-calendar-event.component.html',
  styleUrls: ['./create-or-update-custom-calendar-event.component.css']
})

export class CreateOrUpdateCustomCalendarEventComponent extends OnDestroyMixin implements OnInit, OnDestroy {
  public form: FormGroup;
  public disableAllDays: boolean = true;
  public startAt: Date = new Date(ECUADOR_LOCAL_STRING);
  public minDate: Date = this.startAt;
  public maxDate: Date = this.minDate;
  public selectedDateRange: DateRange<Date>;
  public loadingInfo: boolean = true;
  public periods: Period[] = [];
  public customSettingEvents: CustomEventSetting[] = [];
  @ViewChild('calendar', { static: true }) public calendar: MatCalendar<Date>;
  public sendFormLoading: boolean = false;
  private getInfoSubscription: Subscription;
  private sendFormSubscription: Subscription;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { event?: CustomCalendarEvent },
    private api: CommonService,
    private apiAdmin: AdministrativeService,
    private dialogRef: MatDialogRef<CreateOrUpdateCustomCalendarEventComponent>,
    private formBuilder: FormBuilder
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initForm();
    this.getInfo();
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      settingEventID: [this.data?.event?.settingEventID || '', Validators.required],
      periodID: [this.data?.event?.periodID || '', Validators.required],
      calendarStartDate: [this.data?.event?.calendarStartDate || '', Validators.required],
      calendarEndDate: [this.data?.event?.calendarEndDate || '', Validators.required],
    });
    // this.form.disable({ emitEvent: false });
  }

  public trackByPeriodId(index: number, item: Period): number {
    return item.periodID;
  }

  public trackByEventSettingId(index: number, item: CustomEventSetting): number {
    return item.settingEventID;
  }

  private getInfo(): void {
    if (this.getInfoSubscription) {
      this.getInfoSubscription.unsubscribe();
    }
    this.getInfoSubscription = forkJoin({
      periods: this.apiAdmin.getPeriods(),
      customSettingEvents: this.api.getEventSettings()
    }).pipe(map((res: { periods: Period[], customSettingEvents: CustomEventSetting[] }) => {
      //console.log(res);
      this.customSettingEvents = res.customSettingEvents;
      this.periods = res.periods;
      return res;
    })).subscribe({
      next: (value) => {
        this.loadingInfo = false;
      },
      error: (err: HttpErrorResponse) => {
        this.loadingInfo = false;
      },
      complete: () => {
      }
    });
  }


  public sendForm(): void {
    if (this.form.valid) {
      this.form.disable({emitEvent: false});
      this.sendFormLoading = true;
      const customEventCalendar = this.form.getRawValue() as CustomCalendarEvent;
      if (this.sendFormSubscription) {
        this.sendFormSubscription.unsubscribe();
      }
      let observableToCreateOrUpdateCustomCalendarEvent: Observable<CustomCalendarEvent>;
      if (this.data?.event) {
        observableToCreateOrUpdateCustomCalendarEvent = this.api.updateCustomEventCalendar(this.data?.event.settingEventID, customEventCalendar);
      } else {
        observableToCreateOrUpdateCustomCalendarEvent = this.api.createCustomEventCalendar(customEventCalendar);
      }
      this.sendFormSubscription = observableToCreateOrUpdateCustomCalendarEvent
        .subscribe({
          next: (value: CustomCalendarEvent) => {
            this.dialogRef.close(value);
          },
          error: (err: HttpErrorResponse) => {
            this.form.enable({emitEvent: false});
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

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.sendFormSubscription) {
      this.sendFormSubscription.unsubscribe();
    }
    if (this.getInfoSubscription) {
      this.getInfoSubscription.unsubscribe();
    }
  }

  public dateFilter = (date: Date): boolean => {
    return !this.disableAllDays;
  };

  public onChangePeriod(event: MatOptionSelectionChange, period: Period): void {
    if (event.isUserInput) {
      // Por si el usuario cambia de periodo, pero tiene un rango de fechas seleccionado.
      // Se coloca en null tanto el selectedDateRange como su equivalente en el formulario.
      this.selectedDateRange = new DateRange<Date>(null, null);
      this.setStartDateAndEndDateToForm(null, null);
      // Luego se establece un la fecha máxima y mínima, junto con la fecha de inicio.
      // ECUADOR_LOCAL_STRING = new Date().toLocaleString('en-US',{ timeZone: 'America/Guayaquil'});
      // this.startAt = new Date(ECUADOR_LOCAL_STRING);
      this.startAt = this.minDate = period.periodDateStart as Date;
      this.maxDate = period.periodDateEnd as Date;
      // Para terminar, se cambia al mes de la fecha de inicio del periodo y se deshabilita el calendario.
      this.disableAllDays = false;
      setTimeout(() => {
        this.calendar._goToDateInView(this.minDate, 'month');
      }, 0);
    }
  }

  public get calendarStartDateFormControl(): FormControl {
    return this.form.get('calendarStartDate') as FormControl;
  }

  public get calendarEndDateFormControl(): FormControl {
    return this.form.get('calendarEndDate') as FormControl;
  }

  public onChangeCalendar(date: Date): void {
    if (this.selectedDateRange && this.selectedDateRange.start && date >= this.selectedDateRange.start && !this.selectedDateRange.end) {
      this.selectedDateRange = new DateRange(this.selectedDateRange.start, date);
      this.setStartDateAndEndDateToForm(this.selectedDateRange.start, date);
    } else {
      this.selectedDateRange = new DateRange(date, null);
      this.setStartDateAndEndDateToForm(date, null);
    }
  }


  private setStartDateAndEndDateToForm(startDate: Date, endDate: Date): void {
    this.calendarStartDateFormControl.patchValue(startDate);
    this.calendarStartDateFormControl.updateValueAndValidity();

    this.calendarEndDateFormControl.patchValue(endDate);
    this.calendarStartDateFormControl.updateValueAndValidity();
  }
}
