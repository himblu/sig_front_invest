import { Component, Inject, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import {
	DateRange, DefaultMatCalendarRangeStrategy,
	MAT_DATE_RANGE_SELECTION_STRATEGY,
	MatCalendar,
	MatDatepickerModule
} from "@angular/material/datepicker";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatOptionModule, MatOptionSelectionChange, MatRippleModule } from "@angular/material/core";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSelectChange, MatSelectModule } from "@angular/material/select";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Campus, Module, Period } from '@utils/interfaces/period.interfaces';
import { SPGetModality } from '@utils/interfaces/campus.interfaces';
import { forkJoin, map, Observable, of, Subscription } from 'rxjs';
import { ApiService } from '@services/api.service';
import { AdministrativeService } from '@services/administrative.service';
import { AcademicEvent, CALENDAR_TYPE, CustomCalendarEvent, EventForm } from '@utils/interfaces/calendar.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '@services/user.service';

let ECUADOR_LOCAL_STRING: string = new Date().toLocaleString('en-US',{ timeZone: 'America/Guayaquil'});

@Component({
  selector: 'app-create-or-update-administrative-event',
  standalone: true,
	imports: [
		MatButtonModule,
		MatCardModule,
		MatDatepickerModule,
		MatDialogModule,
		MatFormFieldModule,
		MatIconModule,
		MatOptionModule,
		MatProgressSpinnerModule,
		MatRippleModule,
		MatSelectModule,
		ReactiveFormsModule,
		NgForOf,
		NgIf,
		MatInputModule,
		MatSnackBarModule
	],
	providers: [
		{
			provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
			useClass: DefaultMatCalendarRangeStrategy,
		}
	],
  templateUrl: './create-or-update-administrative-event.component.html',
  styleUrls: ['./create-or-update-administrative-event.component.css']
})

export class CreateOrUpdateAdministrativeEventComponent implements OnInit, OnDestroy {

	public form: FormGroup;
	public eventForm!: FormGroup;
	public disableAllDays: boolean = true;
	public startAt: Date = new Date(ECUADOR_LOCAL_STRING);
	public minDate: Date = this.startAt;
	public maxDate: Date = this.minDate;
	public selectedDateRange: DateRange<Date>;
	public campuses: Campus[] = [];
	public periods: Period[] = [];
	public modalities: SPGetModality[] = [];
	public modules: Module[] = [];
	public eventTypes: any[] = [];
	public sendingForm: boolean = false;
	public loadingForm: boolean = true;
	public isCreating: boolean= false;
	@ViewChild('calendar', { static: true }) public calendar: MatCalendar<Date>;

	private sendFormSubscription: Subscription;
	private postFormSubscription: Subscription;
	private getListsSubscription: Subscription;
	private getPeriodsSubscription: Subscription;
	private api: ApiService = inject(ApiService);
	private adminApi: AdministrativeService = inject(AdministrativeService);
	private user: UserService = inject(UserService);
	private dialogRef: MatDialogRef<CreateOrUpdateAdministrativeEventComponent> = inject(MatDialogRef<CreateOrUpdateAdministrativeEventComponent>);
	private formBuilder: FormBuilder = inject(FormBuilder);

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: { event?: AcademicEvent },
		private snackBar: MatSnackBar
	) {
		this.initForm();
		this.initEventForm();
	}

	public ngOnInit(): void {
		this.getInitialLists();
	}

	public ngOnDestroy(): void {
	}

	private initForm(): void {
		const event: AcademicEvent = this.data?.event;
		this.form = this.formBuilder.group({
			eventType: [null, [Validators.required]], // Ningún control depende de esto
			campus: [null, [Validators.required]], // Campus trae las modalidades
			period: [null, [Validators.required]], // Los periodos no modifican nada
			observation: [null],
			startDate: [event?.start || null, Validators.required],
			endDate: [event?.end || null, Validators.required],
		});
	}

	public initEventForm(): void {
		this.eventForm = this.formBuilder.group({
			eventName: ['', Validators.required],
			eventDesc: ['', Validators.required],
			background: ['', Validators.required],
			color: ['', Validators.required],
			calendarTypeID: CALENDAR_TYPE.ADMINISTRATIVE,
			user: this.user.currentUser.userName
		})
	}

    private getInitialLists(): void {
		if (this.getListsSubscription) this.getListsSubscription.unsubscribe();
		const observables: Observable<any>[] = [this.adminApi.getAllCampuses(), this.adminApi.getEventTypes(CALENDAR_TYPE.ADMINISTRATIVE)];
		if (this.data?.event) {
			const event: AcademicEvent = this.data.event;
			const eventObservables: Observable<any>[] = [
				this.adminApi.getPeriodsByCampus(event.campusID)
			];
			observables.concat(eventObservables);
		}
		forkJoin(observables)
			.pipe(map(([campuses, eventTypes, periods]) => {
				return {
					campuses,
					eventTypes,
					periods
				}
			}))
			.subscribe({
				next: (res) => {
					this.campuses = res.campuses;
					this.eventTypes = res.eventTypes;
					this.periods = res.periods;
				}
		});
  }

	public onChangePeriod(event: MatOptionSelectionChange, period: Period): void {
		//console.log(event);
		if (event.isUserInput) {
			// Por si el usuario cambia de periodo, pero tiene un rango de fechas seleccionado.
			// Se coloca en null tanto el selectedDateRange como su equivalente en el formulario.
			this.selectedDateRange = new DateRange<Date>(null, null);
			this.setStartDateAndEndDateToForm(null, null);
			// Luego se establece un la fecha máxima y mínima, junto con la fecha de inicio.
			// ECUADOR_LOCAL_STRING = new Date().toLocaleString('en-US',{ timeZone: 'America/Guayaquil'});
			// this.startAt = new Date(ECUADOR_LOCAL_STRING);
			//console.log(period);
			this.startAt = this.minDate = period.periodDateStart as Date;
			this.maxDate = period.periodDateEnd as Date;
			// Para terminar, se cambia al mes de la fecha de inicio del periodo y se deshabilita el calendario.
			this.disableAllDays = false;
			setTimeout(() => {
				//console.log(this.minDate);
				this.calendar._goToDateInView(this.minDate, 'month');
			}, 0);
		}
	}

	public get startDateFormControl(): FormControl {
		return this.form.get('startDate') as FormControl;
	}

	public get endDateFormControl(): FormControl {
		return this.form.get('endDate') as FormControl;
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
		this.startDateFormControl.patchValue(startDate);
		this.startDateFormControl.updateValueAndValidity();

		this.endDateFormControl.patchValue(endDate);
		this.startDateFormControl.updateValueAndValidity();
	}

	public dateFilter = (date: Date): boolean => {
		return !this.disableAllDays;
	}

	public getPeriodsByCampus(event: MatSelectChange): void {
		this.form.patchValue({
			campus: event.value,
			period: null
		});
		if (this.getPeriodsSubscription) this.getPeriodsSubscription.unsubscribe();
		this.periods = [];
		this.getPeriodsSubscription = this.adminApi.getPeriodsByCampus(event.value)
			.subscribe({
				next: (value: Period[]) => {
					this.periods = value;
				},
				error: (err: HttpErrorResponse) => {
				}
			});
	}

	public sendForm(): void {
		if (this.form.valid) {
			this.form.disable({ emitEvent: false });
			this.sendingForm = true;
			const administrativeEvent: EventForm = this.form.getRawValue() as EventForm;
			if (this.sendFormSubscription) {
				this.sendFormSubscription.unsubscribe();
			}
			let observableToCreateOrUpdateAdministrativeEvent: Observable<any>;
			if (this.data?.event) {
				observableToCreateOrUpdateAdministrativeEvent = this.api.updateAdministrativeEvent(this.data?.event.id as number, administrativeEvent);
			} else {
				observableToCreateOrUpdateAdministrativeEvent = this.api.postAdministrativeEvent(administrativeEvent);
			}
			this.sendFormSubscription = observableToCreateOrUpdateAdministrativeEvent
				.subscribe({
					next: (value: any) => {
						this.dialogRef.close(value);
					},
					error: (err: HttpErrorResponse) => {
						this.form.enable({ emitEvent: false });
						this.sendingForm = false;
					}
				});
		} else {
			this.form.markAllAsTouched();
			this.form.markAsDirty();
		}
	}

	public onSubmit(): void {
		if(this.eventForm.valid){
			if(this.postFormSubscription) this.postFormSubscription.unsubscribe;
			this.postFormSubscription = this.api.postEvent(this.eventForm.value).subscribe({
					next: (value) => {
						//console.log(value);
						this.isCreating= false;
						this.getInitialLists();
						this.snackBar.open(
							`Evento creado con éxito`,
							undefined,
							{
								horizontalPosition: 'center',
								verticalPosition: 'top',
								duration: 4000,
								panelClass: ['green-snackbar']
							}
						);
					},
					error: (err: HttpErrorResponse) => {
					}
				});
		}else{
			this.eventForm.markAllAsTouched();
		}
	}
}
