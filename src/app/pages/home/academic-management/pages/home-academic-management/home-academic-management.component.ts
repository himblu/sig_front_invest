import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DatePipe, NgClass, NgForOf, NgIf, NgStyle, NgSwitch, NgSwitchCase } from '@angular/common';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { map, Subscription } from 'rxjs';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import {
	endOfDay,
	endOfMonth,
	endOfWeek,
	startOfDay,
	startOfMonth,
	startOfWeek,
} from 'date-fns';
import { CommonService } from '@services/common.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatBadgeModule } from '@angular/material/badge';
import {
	CALENDAR_TYPE,
	CalendarDay, CalendarType,
	CustomCalendarEvent,
	CustomEvent,
	CustomEventSetting, EventType, IEvent,
	Modality
} from '@utils/interfaces/calendar.interface';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCalendar, MatDatepickerModule } from '@angular/material/datepicker';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalendarDateFormatter, CalendarEvent, CalendarModule, CalendarView } from 'angular-calendar';
import { CustomDateFormatter } from './providers/custom-date-formatter.provider';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogConfig, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import {
	CreateOrUpdateCustomEventComponent
} from './components/create-or-update-custom-event/create-or-update-custom-event.component';
import {
	CreateOrUpdateCustomEventSettingComponent
} from './components/create-or-update-custom-event-setting/create-or-update-custom-event-setting.component';
import {
	CreateOrUpdateCustomCalendarEventComponent
} from './components/create-or-update-custom-calendar-event/create-or-update-custom-calendar-event.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfirmationComponent } from '../../components/confirmation/confirmation.component';
import {
	CreateOrUpdateAcademicEventComponent
} from './components/create-or-update-academic-event/create-or-update-academic-event.component';
import { ApiService } from '@services/api.service';
import {
	CreateOrUpdateAdministrativeEventComponent
} from './components/create-or-update-administrative-event/create-or-update-administrative-event.component';
import { UpdateDatesComponent } from './components/update-dates/update-dates.component';
import { EventsReportsComponent } from './components/events-reports/events-reports.component';

let ECUADOR_LOCAL_STRING = new Date().toLocaleString('en-US', {timeZone: 'America/Guayaquil'});

interface DateRange {
	startDate: string;
	endDate: string;
}

@Component({
	selector: 'app-home-academic-management',
	standalone: true,
	imports: [
		MatTooltipModule,
		MatBadgeModule,
		MatButtonModule,
		MatIconModule,
		MatInputModule,
		MatDatepickerModule,
		MatNativeDateModule,
		FormsModule,
		CalendarModule,
		MatSelectModule,
		MatMenuModule,
		MatExpansionModule,
		MatRippleModule,
		MatListModule,
		MatCardModule,
		MatCheckboxModule,
		MatDialogModule,
		MatSnackBarModule,
		NgForOf,
		NgIf,
		DatePipe,
		NgStyle,
		NgClass,
		NgSwitch,
		NgSwitchCase,
		ReactiveFormsModule,
		UpdateDatesComponent,
		EventsReportsComponent
	],
	providers: [
		DatePipe,
		{
			provide: CalendarDateFormatter,
			useClass: CustomDateFormatter,
		}
	],
	templateUrl: './home-academic-management.component.html',
	styleUrls: ['./home-academic-management.component.css']
})

export class HomeAcademicManagementComponent extends OnDestroyMixin implements OnInit, OnDestroy {
	public readonly lineBreak: string = '\n';
	public readonly calendarType= CALENDAR_TYPE;
	public calendarTypes: CalendarType[] = [];
	public events: IEvent[] = []; // Eventos que se renderizan en el calendario
	public modalities: Modality[] = [];
	public calendarTypeFormControl: FormControl = new FormControl<number>(this.calendarType.ACADEMIC);
	public viewDate: Date = new Date(ECUADOR_LOCAL_STRING);
	public view: CalendarView = CalendarView.Month;
	public calendarView = CalendarView;
	private deleteEventSubscription: Subscription; // Se usa para todos los eventos. Para no tener N variables.
	private getEventsSubscription: Subscription; // Se usa para todos los eventos. Para no tener N variables.
	@ViewChild('toolTip') toolTip: MatTooltip;
	@ViewChild('calendar', { static: true }) calendar: MatCalendar<Date>;

	constructor(
	private api: ApiService,
	private datePipe: DatePipe,
	private activatedRoute: ActivatedRoute,
	private dialog: MatDialog,
	private snackBar: MatSnackBar
	) {
		super();
	}

	public ngOnInit(): void {
		this.activatedRoute.data
		.pipe(
		untilComponentDestroyed(this),
		map((value: any) => value['resolver']))
		.subscribe({
			next: (value) => {
				this.calendarTypes = value['calendarTypes'];
				this.calendarTypes = this.calendarTypes.map((calendarType) => {
					return {
						...calendarType,
						calendarTypeDesc: calendarType.calendarTypeDesc.replace('CALENDARIO ', '')
					}
				})
			}
		});
		this.getEventsFromDate(this.viewDate);
	}

	public getEventsFromDate(date: Date): void {
		this.calendar._goToDateInView(date, 'month');
		const dateRange = this.getDateRange(date);
		if (this.getEventsSubscription) this.getEventsSubscription.unsubscribe();
		this.getEventsSubscription = this.api.getEvents(this.selectedCalendar, dateRange.startDate, dateRange.endDate)
		.subscribe({
			next: (value: IEvent[]) => {
				//console.log(value);
				this.events = value;
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	public get selectedCalendar(): number {
		return this.calendarTypeFormControl.value as number;
	}

	private getDateRange(date: Date): DateRange {
		let startDate: string;
		let endDate: string;
		const RANGE_DATES = {
			'month': () => {
				startDate = this.formattedDate(startOfMonth(date));
				endDate = this.formattedDate(endOfMonth(date));
			},
			'week': () => {
				startDate = this.formattedDate(startOfWeek(date));
				endDate = this.formattedDate(endOfWeek(date));
			},
			'day': () => {
				startDate = this.formattedDate(startOfDay(date));
				endDate = this.formattedDate(endOfDay(date));
			}
		};
		const range = RANGE_DATES[this.view];
		range();
		return {
			startDate,
			endDate
		};
	}

	private formattedDate(date: Date): string {
		return <string>this.datePipe.transform(date, 'yyyy-MM-dd');
	}

	public setView(view: CalendarView): void {
		this.view = view;
		this.getEventsFromDate(this.viewDate);
	}


	public createOrEditEventMonthView(day: CalendarDay, sourceEvent: MouseEvent | KeyboardEvent): void {
	}

	createEventWeekOrDay($event: { date: Date; sourceEvent: MouseEvent }) {

	}

	openContextMenu($event: { event: CalendarEvent; sourceEvent: MouseEvent | KeyboardEvent }) {

	}

	public selectToday(): void {
		ECUADOR_LOCAL_STRING = new Date().toLocaleString('en-US', {timeZone: 'America/Guayaquil'});
		this.viewDate = new Date(ECUADOR_LOCAL_STRING);
		this.calendar._goToDateInView(this.viewDate, 'month');
		this.getEventsFromDate(this.viewDate);
	}

	public getFilteredEvents(event: CustomEvent): void {
	}

	public removeCustomEvent(event: CustomEvent): void {
		const config: MatDialogConfig = new MatDialogConfig();
		config.id = 'createOrUpdateCustomEventDialog';
		config.autoFocus = false;
		config.minWidth = '200px';
		config.maxWidth = '600px';
		config.panelClass = 'transparent-panel';
		config.data = {
			message: '¿Estás seguro de eliminar este calendario? Los Calendarios que hayas creado en Mis Calendarios, serán eliminados.'
		};
		const dialog = this.dialog.open(ConfirmationComponent, config);
		dialog.afterClosed()
		.pipe(untilComponentDestroyed(this))
		.subscribe((res) => {
			if (res) {
			}
		});
	}

	public override ngOnDestroy(): void {
		super.ngOnDestroy();
		this.dialog.closeAll();
		if (this.getEventsSubscription)
			this.getEventsSubscription.unsubscribe();
	}

	public createOrUpdateEvent(event?: IEvent): void {
		const config: MatDialogConfig = new MatDialogConfig();
		config.id = 'createOrUpdateEvent';
		config.autoFocus = false;
		config.minWidth = '70vw';
		config.width = '70vw';
		// config.panelClass = 'transparent-dialog';
		if (event) {
			config.data = { event };
		}
		if (this.calendarTypeFormControl.value === CALENDAR_TYPE.ACADEMIC) {
			const dialog: MatDialogRef<CreateOrUpdateAcademicEventComponent> = this.dialog.open(CreateOrUpdateAcademicEventComponent, config);
			dialog.afterClosed()
				.pipe(untilComponentDestroyed(this))
				.subscribe((res) => {
					if (res) {
						this.snackBar.open(
							`Evento ${event ? 'editado' : 'creado'} con éxito`,
							undefined,
							{
								horizontalPosition: 'center',
								verticalPosition: 'top',
								duration: 4000,
								panelClass: ['green-snackbar']
							}
						);
						this.getEventsFromDate(this.viewDate);
					}
				});
		} else {
			const dialog: MatDialogRef<CreateOrUpdateAdministrativeEventComponent> = this.dialog.open(CreateOrUpdateAdministrativeEventComponent, config);
			dialog.afterClosed()
				.pipe(untilComponentDestroyed(this))
				.subscribe((res) => {
					if (res) {
						this.snackBar.open(
							`Evento ${event ? 'editado' : 'creado'} con éxito`,
							undefined,
							{
								horizontalPosition: 'center',
								verticalPosition: 'top',
								duration: 4000,
								panelClass: ['green-snackbar']
							}
						);
						this.getEventsFromDate(this.viewDate);
					}
				});
		}
	}

	public updateDates(event: IEvent): void  {
		let calendar = this.calendarTypeFormControl.value as number;
		const config: MatDialogConfig = new MatDialogConfig();
		config.id = 'createOrUpdateEvent';
		config.autoFocus = false;
		config.minWidth = '40vw';
		config.width = '40vw';
		config.data = { event, calendar };

		const dialog: MatDialogRef<UpdateDatesComponent> = this.dialog.open(UpdateDatesComponent, config);
		dialog.afterClosed().pipe(untilComponentDestroyed(this)).subscribe((res) => {
			if (res) {
				this.snackBar.open(
					`Evento ${event.eventDesc} editado con éxito`,
					undefined,
					{
						horizontalPosition: 'center',
						verticalPosition: 'top',
						duration: 4000,
						panelClass: ['green-snackbar']
					}
				);
				this.getEventsFromDate(this.viewDate);
			}
		});
	}

	public reportsForm(): void  {
		let calendar = this.calendarTypeFormControl.value as number;
		const config: MatDialogConfig = new MatDialogConfig();
		config.id = 'eventsReports';
		config.autoFocus = false;
		config.minWidth = '40vw';
		config.width = '40vw';
		config.data = { calendar };

		const dialog: MatDialogRef<EventsReportsComponent> = this.dialog.open(EventsReportsComponent, config);
		dialog.afterClosed().pipe(untilComponentDestroyed(this)).subscribe((res) => {
			if (res) {
				this.snackBar.open(
					`Reporte generado con éxito`,
					undefined,
					{
						horizontalPosition: 'center',
						verticalPosition: 'top',
						duration: 4000,
						panelClass: ['green-snackbar']
					}
				);
				this.getEventsFromDate(this.viewDate);
			}
		});
	}

	public trackByCalendarEvent(index: number, item: CalendarEvent): string | number {
		return item.id;
	}
}
