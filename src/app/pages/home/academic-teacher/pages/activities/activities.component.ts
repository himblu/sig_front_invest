import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DatePipe, NgClass, NgForOf, NgIf, NgStyle, NgSwitch, NgSwitchCase, NgFor } from '@angular/common';
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
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '@services/api.service';
import { AdministrativeService } from '@services/administrative.service';
import { UserService } from '@services/user.service';
import { AttendanceTeacher, Student } from '@utils/interfaces/campus.interfaces';
import { FilterEventsByDayPipe } from './pipes/filter-events-by-day.pipe';
import { OverlayModule } from '@angular/cdk/overlay';
import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import { DatesHoliday } from '@utils/interfaces/person.interfaces';

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
		NgFor,
		NgIf,
		DatePipe,
		NgStyle,
		NgClass,
		NgSwitch,
		NgSwitchCase,
		ReactiveFormsModule,
		FilterEventsByDayPipe,
		OverlayModule
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

	isOpen = false;
	charging: boolean = false;
	triggerOrigin: CdkOverlayOrigin;
	public EVENTS_TO_SHOW: number= 2;
	public readonly lineBreak: string = '\n';
	public studentForm!: FormGroup;
	public calendarTypes: CalendarType[] = [];
	public events: AttendanceTeacher[]; // Eventos que se renderizan en el calendario
	public modalities: Modality[] = [];
	public calendarTypeFormControl: FormControl = new FormControl<number>(CALENDAR_TYPE.ACADEMIC);
	public viewDate: Date = new Date(ECUADOR_LOCAL_STRING);
	public view: CalendarView = CalendarView.Month;
	public calendarView = CalendarView;
	private deleteEventSubscription: Subscription; // Se usa para todos los eventos. Para no tener N variables.
	private getEventsSubscription: Subscription; // Se usa para todos los eventos. Para no tener N variables.
	public clickDate: string;
	private currentPeriodID: number;
	public attendanceList: AttendanceTeacher;
	public studentsList: Student[];
	public studentsFlag=1;
	public currentCourse: AttendanceTeacher;
	public holidayDates: DatesHoliday;

	@ViewChild('toolTip') toolTip: MatTooltip;
	@ViewChild('calendar', { static: true }) calendar: MatCalendar<Date>;
	@ViewChild('modalClose', { read: ElementRef }) public modalClose: ElementRef;
	@ViewChild('modalOpen', { read: ElementRef }) public modalOpen: ElementRef;

	constructor(
		private datePipe: DatePipe,
		private activatedRoute: ActivatedRoute,
		private dialog: MatDialog,
		private snackBar: MatSnackBar,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService,
		private fb: FormBuilder
	){
		super();
	}

	public ngOnInit(): void {
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

	public initForm(): void{
		this.studentForm = this.fb.group({
      data: this.fb.array([])
    });
	}

	private studentFormRow(): FormGroup{
		return this.fb.group({
			attendanceStatusID: [''],
			periodID: this.currentPeriodID,
			personID: this.user.currentUser.PersonId,
			classSectionNumber: [''],
			studentID: [''],
			commentary: '',
			student: [''],
			user: this.user.currentUser.userName
		});
	}

	private addStudentRow(): void {
		const array=<FormArray>this.studentForm.controls['data'];
		array.push(this.studentFormRow());
	}

	public getStudentRow():FormArray {
    return (this.studentForm.controls['data'] as FormArray);
	}

	public getEventsFromDate(): void {
		if (this.getEventsSubscription) this.getEventsSubscription.unsubscribe();

		this.getEventsSubscription = this.api.getCalendarActivities(this.currentPeriodID, this.user.currentUser.PersonId)
		.subscribe({
			next: (res) => {
				//console.log('events', res);
				this.events= res;

			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	public toggle(trigger: CdkOverlayOrigin):void {
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

	public clickCalendar(day?:Date):void {
		if(day){
			this.clickDate=this.formattedDate(day);
		}else{
			this.isOpen = !this.isOpen
			this.clickDate=this.datePipe.transform(this.clickDate, 'yyyy-MM-dd');
		}
		//console.log(this.clickDate);
		//this.getAttendance(this.clickDate);
		this.modalOpen.nativeElement.click();
	}

	public getCurrentPeriod(): void{
		this.api.getCurrentPeriod().subscribe({
			next: (res) => {
				this.currentPeriodID = res.periodID;
				this.getEventsFromDate();
				this.getDatesHolidayByPeriod();
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getDatesHolidayByPeriod(): void{
		this.api.getDatesHolidayByPeriod(this.currentPeriodID).subscribe({
			next: (res) => {
				//console.log('holidayDates', res);
				this.holidayDates= res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getAttendance(item: AttendanceTeacher, date: string): void{
		this.charging=true;
		this.studentsFlag= 1;
		this.admin.getAttendanceTeacher(this.currentPeriodID, this.user.currentUser.PersonId, date).subscribe({
			next: (res) => {
				this.attendanceList= res.find(x => x.classSectionNumber === item.classSectionNumber);
				//console.log('attendanceList', this.attendanceList);
				this.charging=false;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.charging=false;
			}
		});
	}

	public getStudents(item: AttendanceTeacher, day: string): void{
		this.clickDate = this.datePipe.transform(day, 'yyyy-MM-dd');
		if(this.currentCourse !== item){
			this.initForm();
			this.charging=true;
			//if(this.studentsFlag == 1 && !this.studentsList){
				this.admin.getAttendanceStudents(this.currentPeriodID, item.classSectionNumber).subscribe({
					next: (res) => {
						this.studentsList= res.data;
						//console.log('studentsList', this.studentsList);
						this.studentsFlag= 0;
						if(this.studentForm.controls['data'].value.length == 0){
							const data=this.getStudentRow();
							for(let i=0; i<this.studentsList.length; i++){
							this.addStudentRow();
							data.controls[i].get('studentID').patchValue(this.studentsList[i].studentID);
							data.controls[i].get('student').patchValue(this.studentsList[i].student);
							data.controls[i].get('attendanceStatusID').patchValue(this.studentsList[i].attendanceStatusID);
							}
						}
						//console.log(this.studentForm.value);
						this.currentCourse= item;
						this.getAttendance(item, this.clickDate);
						this.modalOpen.nativeElement.click();
						this.charging=false;
					},
					error: (err: HttpErrorResponse) => {
						//console.log('err',err);
						this.studentsFlag= 0;
						this.charging=false;
					}
				});
			//}
		}else{
			this.getAttendance(item, this.clickDate);
			this.modalOpen.nativeElement.click();
			this.charging=false;
		}

	}

	public postAttendance(item:AttendanceTeacher): void{
		const data=this.getStudentRow();
		for(let i=0; i<this.studentsList.length; i++){
			data.controls[i].get('classSectionNumber').patchValue(item.classSectionNumber);
		}
		//console.log(this.studentForm.value);
		this.admin.postAttendance(this.studentForm.value).subscribe({
			next: (res:any) => {
				this.common.message(`Asistencia Registrada`, '', 'success', '#86bc57');
				this.modalClose.nativeElement.click();
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.modalClose.nativeElement.click();
			}
		});
	}

}
