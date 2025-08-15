import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
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
import { ActivatedRoute, Router } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogConfig, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '@services/api.service';
import { UserService } from '@services/user.service';
import { StudentActivities } from '@utils/interfaces/campus.interfaces';
import { OverlayModule } from '@angular/cdk/overlay';
import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import { SlicePipe } from '@angular/common';
import { JsonPipe } from '@angular/common';
import { FilterEventsByDayPipe } from './pipes/filter-events-by-day.pipe';
import { ViewportScroller } from '@angular/common';

let ECUADOR_LOCAL_STRING = new Date().toLocaleString('en-US', {timeZone: 'America/Guayaquil'});

interface DateRange {
	startDate: string;
	endDate: string;
}

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.css'],
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
		OverlayModule,
		SlicePipe,
		JsonPipe,
		FilterEventsByDayPipe
	],
	providers: [
		DatePipe,
		{
			provide: CalendarDateFormatter,
			useClass: CustomDateFormatter,
		}
	],
})
export class ActivitiesComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	charging: boolean = false;
	isOpen = false;
	triggerOrigin: CdkOverlayOrigin;
	public EVENTS_TO_SHOW:number=2;
	public readonly lineBreak: string = '\n';
	public calendarTypes: CalendarType[] = [];
	public events: StudentActivities[]; // Eventos que se renderizan en el calendario
	public tasks: StudentActivities[];
	public modalities: Modality[] = [];
	public calendarTypeFormControl: FormControl = new FormControl<number>(CALENDAR_TYPE.ACADEMIC);
	public viewDate: Date = new Date(ECUADOR_LOCAL_STRING);
	public view: CalendarView = CalendarView.Month;
	public calendarView = CalendarView;
	private deleteEventSubscription: Subscription; // Se usa para todos los eventos. Para no tener N variables.
	private getEventsSubscription: Subscription; // Se usa para todos los eventos. Para no tener N variables.
	private currentPeriodID: number;
	@ViewChild('toolTip') toolTip: MatTooltip;
	@ViewChild('calendar', { static: true }) calendar: MatCalendar<Date>;
	@ViewChild('modalClose', { read: ElementRef }) public modalClose: ElementRef;
	@ViewChild('modalOpen', { read: ElementRef }) public modalOpen: ElementRef;

	constructor(
		private api: ApiService,
		private datePipe: DatePipe,
		private activatedRoute: ActivatedRoute,
		private dialog: MatDialog,
		private snackBar: MatSnackBar,
		private user: UserService,
		private router: Router,
		private viewportScroller: ViewportScroller
	){
		super();
	}

	public scrollTo(anchor: string): void { // for calling to anchors
    this.viewportScroller.scrollToAnchor(anchor);
	}

	public ngOnInit(): void {
		this.viewportScroller.scrollToPosition([0, 0]);
		this.getCurrentPeriod();
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
  }

	public override ngOnDestroy() {
    super.ngOnDestroy();
		this.dialog.closeAll();
		if (this.getEventsSubscription)
			this.getEventsSubscription.unsubscribe();
  }

	toggle(trigger: CdkOverlayOrigin) {
		this.triggerOrigin = trigger;
		this.isOpen = !this.isOpen
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
		this.getEventsFromDate();
	}

	public createOrEditEventMonthView(day: CalendarDay, sourceEvent: MouseEvent | KeyboardEvent): void {
	}

	createEventWeekOrDay($event: { date: Date; sourceEvent: MouseEvent }) {

	}

	openContextMenu($event: { event: CalendarEvent; sourceEvent: MouseEvent | KeyboardEvent }) {

	}

	public getCurrentPeriod(): void{
		this.charging=true;
		this.api.getCurrentPeriod().subscribe({
			next: (res) => {
				this.currentPeriodID = res.periodID;
				this.getEventsFromDate();
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getEventsFromDate(): void {
		if (this.getEventsSubscription) this.getEventsSubscription.unsubscribe();
		this.charging=true;
		this.getEventsSubscription = this.api.getCalendarStudentActivities(this.currentPeriodID, +sessionStorage.getItem('studentID'))
		.subscribe({
			next: (res:StudentActivities[]) => {
				this.events=res;
				//console.log(this.events);
				setTimeout(() => {
					this.charging=false;
				}, 100);
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}


	public selectToday(): void {
		ECUADOR_LOCAL_STRING = new Date().toLocaleString('en-US', {timeZone: 'America/Guayaquil'});
		this.viewDate = new Date(ECUADOR_LOCAL_STRING);
		this.calendar._goToDateInView(this.viewDate, 'month');
		this.getEventsFromDate();
	}

	public getFilteredEvents(event: CustomEvent): void {
	}

	public trackByCalendarEvent(index: number, item: CalendarEvent): string | number {
		return item.id;
	}

	public openModal(event:any){
		this.modalOpen.nativeElement.click();
		this.api.getStudentTasks(event.periodID, event.studentID, event.classSectionNumber, event.taskID).subscribe({
			next: (res) => {
				//console.log(res);
				this.tasks=res;
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	public sendEvent(event:StudentActivities): void{
		//console.log(event);
		this.modalClose.nativeElement.click();
		this.api.event=event;
		this.router.navigateByUrl('/academico-estudiante/tareas');
	}

}
