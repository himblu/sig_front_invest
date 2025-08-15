import { Component, inject, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, map, Observable, of, Subscription } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import {
	AcademicEvent,
	AdministrativeEvent, EventForm, CALENDAR_TYPE,
	CustomCalendarEvent,
	EventType, IEvent
} from '@utils/interfaces/calendar.interface';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { AdministrativeService } from '@services/administrative.service';
import { Campus, Module, Period } from '@utils/interfaces/period.interfaces';
import { SPGetModality, WorkingDay } from '@utils/interfaces/campus.interfaces';
import {
	DateRange,
	DefaultMatCalendarRangeStrategy,
	MAT_DATE_RANGE_SELECTION_STRATEGY,
	MatCalendar, MatDatepickerModule
} from '@angular/material/datepicker';
import {
	MatNativeDateModule,
	MatOptionModule,
	MatOptionSelectionChange,
	MatRippleModule
} from '@angular/material/core';
import { DatePipe, formatDate, NgForOf, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { HttpErrorResponse } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '@services/user.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

type filter = 'campus' | 'period' | 'modality' | 'module';

interface FilterDependent {
	name: filter;
	dependents: filter[];
}

const FILTER_DEPENDENTS: FilterDependent[] = [
	{ name: 'campus', dependents: ['modality', 'module'] },
	{ name: 'modality', dependents: ['module'] }
];


let ECUADOR_LOCAL_STRING: string = new Date().toLocaleString('en-US',{ timeZone: 'America/Guayaquil'});

@Component({
  selector: 'app-create-or-update-academic-event',
  standalone: true,
	imports: [
		DatePipe,
		MatButtonModule,
		MatCardModule,
		MatNativeDateModule,
		MatDatepickerModule,
		MatDialogModule,
		MatFormFieldModule,
		MatIconModule,
		MatOptionModule,
		MatRippleModule,
		MatSelectModule,
		NgForOf,
		NgIf,
		ReactiveFormsModule,
		MatProgressSpinnerModule,
		MatInputModule,
		MatSnackBarModule
	],
	providers: [
		DatePipe,
		{
			provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
			useClass: DefaultMatCalendarRangeStrategy,
		}
	],
  templateUrl: './create-or-update-academic-event.component.html',
  styleUrls: ['./create-or-update-academic-event.component.css']
})

export class CreateOrUpdateAcademicEventComponent implements OnInit, OnDestroy {
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
	public eventTypes: EventType[] = [];
	public sendingForm: boolean = false;
	public loadingForm: boolean = true;
	public selectedModality: SPGetModality;
	public currentPeriodID: number;
	public isCreating: boolean= false;
	@ViewChild('mCalendar', { static: false }) calendar: MatCalendar<Date>;

	private sendFormSubscription: Subscription;
	private postFormSubscription: Subscription;
	private getListsSubscription: Subscription;
	private getPeriodsSubscription: Subscription;
	private getModalitiesSubscription: Subscription;
	private getModulesSubscription: Subscription;
	private api: ApiService = inject(ApiService);
	private adminApi: AdministrativeService = inject(AdministrativeService);
	private user: UserService = inject(UserService);
	private dialogRef: MatDialogRef<CreateOrUpdateAcademicEventComponent> = inject(MatDialogRef<CreateOrUpdateAcademicEventComponent>);
	private formBuilder: FormBuilder = inject(FormBuilder);
	private datePipe: DatePipe = inject(DatePipe);

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: { event?: IEvent },
		private snackBar: MatSnackBar
	) {
		this.initForm();
		this.initEventForm();
	}

	public ngOnInit(): void {
		this.getInitialLists();
		this.getCurrentPeriod();
	}

	public ngOnDestroy(): void {
	}

	private getInitialLists(): void {
		if (this.getListsSubscription) this.getListsSubscription.unsubscribe();
		const observables: Observable<any>[] = [this.adminApi.getAllCampuses(), this.adminApi.getEventTypes(CALENDAR_TYPE.ACADEMIC)];
		if (this.data?.event) {
			const event: IEvent = this.data.event;
			const eventObservables: Observable<any>[] = [
				this.adminApi.getPeriodsByCampus(event.branchID),
				this.adminApi.getModalitiesByCampus(event.branchID),
			];
			if (event?.classModuleID) {
				eventObservables.push(this.adminApi.getModulesByModality(event.classModuleID))
			} else {
				eventObservables.push(of([]));
			}
			observables.concat(eventObservables);
		}
		forkJoin(observables)
			.pipe(map(([campuses, eventTypes, periods, modalities, modules]) => {
				return {
					campuses,
					eventTypes,
					periods,
					modalities,
					modules
				}
			}))
			.subscribe({
				next: (res) => {
					//console.log(res);
					this.campuses = res.campuses;
					this.eventTypes = res.eventTypes;
					this.periods = res.periods;
					if (res.modalities) {
						// FIXME: Esto no debería hacerlo el front. Se hace porque no queda de otra.
						this.modalities = (res.modalities as SPGetModality[]).map((item: SPGetModality) => {
							return {
								...item,
								workingORmodule: item.modalityName === 'PRESENCIAL' ? 'J' : 'M'
							}
						});
					}
					this.modules = res.modules;
				}
			});
	}

	private initForm(): void {
		const event: IEvent = this.data?.event;
		this.form = this.formBuilder.group({
			eventType: [null, [Validators.required]], // Ningún control depende de esto
			campus: [null, [Validators.required]], // Campus trae las modalidades
			period: [null, [Validators.required]], // Los periodos no modifican nada
			modality: [null, [Validators.required]], // Las modalidades traen los módulos
			module: [null],
			observation: [''],
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
			calendarTypeID: CALENDAR_TYPE.ACADEMIC,
			user: this.user.currentUser.userName
		})
	}

	public getCurrentPeriod(): void{
		this.api.getCurrentPeriod().subscribe({
			next: (res) => {
				this.currentPeriodID = res.periodID;
				//this.form.get('period').patchValue(this.currentPeriodID);
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public dateFilter = (date: Date): boolean => {
		return !this.disableAllDays;
	}

	public onChangePeriod(event: MatOptionSelectionChange, period: Period): void {
		if (event.isUserInput) {
			// Por si el usuario cambia de periodo, pero tiene un rango de fechas seleccionado.
			// Se coloca en null tanto el selectedDateRange como su equivalente en el formulario.
			this.selectedDateRange = new DateRange<Date>(null, null);
			this.setStartDateAndEndDateToForm(null, null);
			// Luego se establece un la fecha máxima y mínima, junto con la fecha de inicio.
			ECUADOR_LOCAL_STRING = new Date().toLocaleString('en-US', {timeZone: 'America/Guayaquil'});
			let viewDate = new Date(period.periodDateStart);
			//console.log(period);
			this.startAt = this.minDate = period.periodDateStart as Date;
			this.maxDate = period.periodDateEnd as Date;
			//console.log(period, this.minDate, this.maxDate);
			// Para terminar, se cambia al mes de la fecha de inicio del periodo y se deshabilita el calendario.
			this.disableAllDays = false;
			setTimeout(() => {
				this.calendar._goToDateInView(viewDate, 'year');
			}, 0);
		}
	}

	public get eventStartDateFormControl(): FormControl {
		return this.form.get('startDate') as FormControl;
	}

	public get eventEndDateFormControl(): FormControl {
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
		this.eventStartDateFormControl.patchValue(startDate);
		this.eventStartDateFormControl.updateValueAndValidity();

		this.eventEndDateFormControl.patchValue(endDate);
		this.eventStartDateFormControl.updateValueAndValidity();
	}

	public resetDependents(control: filter): void {
		const filterDependent: FilterDependent = FILTER_DEPENDENTS.find((item) => item.name === control);
		if (filterDependent) {
			filterDependent.dependents.map((dependent: string) => {
				this.form.get(dependent).patchValue('');
			});
		}
	}

	public getPeriodsByCampus(event: MatSelectChange, control: filter): void {
		this.form.get('campus').patchValue(event.value);
		if (this.getPeriodsSubscription) this.getPeriodsSubscription.unsubscribe();
		this.resetDependents(control);
		this.periods = this.modalities = this.modules = [];
		this.getPeriodsSubscription = this.adminApi.getPeriodsByCampus(event.value)
			.subscribe({
				next: (value: Period[]) => {
					this.periods = value;
				},
				error: (err: HttpErrorResponse) => {
				}
			});
	}

	public getModalitiesByCampus(event: MatSelectChange, control: filter): void {
		this.form.get(control).patchValue(event.value);
		this.selectedModality = null;
		if (this.getModalitiesSubscription) this.getModalitiesSubscription.unsubscribe();
		this.modalities = this.modules = [];
		this.resetDependents(control);
		this.getModalitiesSubscription = this.adminApi.getModalitiesByCampus(event.value)
			.subscribe({
				next: (value: SPGetModality[]) => {
					// FIXME: Esto no debería hacerlo el front. Se hace porque no queda de otra.
					this.modalities = value.map((item: SPGetModality) => {
						return {
							...item,
							workingORmodule: item.modalityName === 'PRESENCIAL' ? 'J' : 'M'
						}
					});
				},
				error: (err: HttpErrorResponse) => {
				}
			});
	}

	public getModulesOrWorkingDaysByModality(event: MatSelectChange): void {
		const selectedModality: SPGetModality = this.modalities.find((modality) => modality.modalityID === +event.value);
		if (selectedModality) {
			// La variable global se setea para mostrar u ocultar las listas de módulos y jornadas.
			this.selectedModality = selectedModality;
			if (this.getModulesSubscription) {
				this.getModulesSubscription.unsubscribe();
			}
			this.modules = [];
			this.resetDependents('modality');
			// Si la modalidad es en línea, traer los módulos.
			if (selectedModality.workingORmodule === 'M') {
				// Marcar el control de módulo como requerido
				const moduleFormControl: FormControl = this.form.get('module') as FormControl;
				moduleFormControl.addValidators(Validators.required);
				this.getModulesSubscription = this.adminApi.getModulesByModality(event.value)
					.subscribe({
						next: (value: Module[]) => {
							this.modules = value;
						}
				});
			} else {
				// Quitar las validaciones del módulo
				this.modules = [];
				const moduleFormControl: FormControl = this.form.get('module') as FormControl;
				moduleFormControl.clearValidators();
				moduleFormControl.updateValueAndValidity();
			}
		}
	}

	public sendForm(): void {
		if (this.form.valid) {
			this.form.disable({ emitEvent: false });
			this.sendingForm = true;
			const academicEvent: EventForm = this.form.getRawValue() as EventForm;
			if (this.sendFormSubscription) {
				this.sendFormSubscription.unsubscribe();
			}
			let observableToCreateOrUpdateAcademicEvent: Observable<any>;
			if (this.data?.event) {
				observableToCreateOrUpdateAcademicEvent = this.api.updateAcademicEvent(this.data?.event.id as number, academicEvent);
			} else {
				observableToCreateOrUpdateAcademicEvent = this.api.postAcademicEvent(academicEvent);
			}
			this.sendFormSubscription = observableToCreateOrUpdateAcademicEvent
				.subscribe({
					next: (value: any) => {
						//console.log(value);
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
