import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, FormArray, } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { UserService } from '@services/user.service';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { AcademicalInformation, ConsultedStudent } from '@utils/interfaces/person.interfaces';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CurrentPeriod, DestinySchedule, ScheduleModule, Schedules } from '@utils/interfaces/others.interfaces';
import { Parallel } from '@utils/interfaces/campus.interfaces';
import { FilterByDayPipe } from './pipes/filter-by-day.pipe';
import { FilterByModulePipe } from './pipes/filter-by-module.pipe';
import { FilterDestinyByModulePipe } from './pipes/filter-destiny-by-module.pipe';

const SCHEDULE_HEADER: string[] = ['HORA INICIO', 'HORA FIN', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];

@Component({
  selector: 'app-parallel-change',
  standalone: true,
  templateUrl: './parallel-change.component.html',
  styleUrls: ['./parallel-change.component.scss'],
	imports: [
		NgIf,
		NgForOf,
		ReactiveFormsModule,
		MatInputModule,
		MatButtonModule,
		MatFormFieldModule,
		MatSelectModule,
		MatIconModule,
		MatTooltipModule,
		FilterByDayPipe,
		FilterByModulePipe,
		FilterDestinyByModulePipe
	],
	providers: [
		DatePipe
	],
})
export class ParallelChangeComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public charging: boolean = false;
	public filtersForm!: FormGroup;
	public student: ConsultedStudent;
	public studentInformation: AcademicalInformation;
	public listHours:any =[];
	public scheduleHeader: string[] = SCHEDULE_HEADER;
	public currentPeriodID: number;
	public schedules: Schedules[] = [];
	public schedulesModules: ScheduleModule[] = [];
	public destinySchedules: any[] = [];
	public parallels: Parallel[] = [];
	public singleSubject: boolean = false;

	constructor(private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService,
		private datePipe: DatePipe,
		private router: Router,
		private activatedRoute: ActivatedRoute){
		super();
	}

	ngOnInit() {
		this.charging = true;
		this.initForm();
    this.activatedRoute.params.subscribe({
      next: async (params: any) => {
				if(params.personID){
					await this.getStudentInformation(params.personID);
					await this.getStudentAcademicalInformation(params.studentID);
					await this.getCurrentPeriod(params.personID);
				}else{
					this.router.navigate(['/reportes/secretaria']);
					this.charging = false;
				}
      }
    });
  }

	public initForm():void{
    this.filtersForm = this.fb.group({
      studentID: ['', [Validators.required]],
			periodID: ['', [Validators.required]],
			paralleCodeSource: ['', [Validators.required]],
			paralleCodeDestin: ['', [Validators.required]],
    });
	}

	private getStudentInformation(personID: number): void{
		this.charging = true;
		this.common.getStudentInformation(personID).subscribe({
			next: (res: ConsultedStudent) => {
				//console.log('student', res);
				this.student = res;
				this.charging = false;
			},
			error: (err: HttpErrorResponse) => {
				this.charging = false;
			}
		});
	}

	private getStudentAcademicalInformation(studentID: number){
		this.charging = true;
		this.common.getStudentAcademicalInformation(studentID).subscribe({
			next: (res) => {
				//console.log('studentInformation', res);
				this.studentInformation = res;
				this.charging = false;
			},
			error: (err: HttpErrorResponse) => {
				this.charging = false;
			}
		});
	}

	private getScheduleModules(personID: number): void{
		this.charging = true;
		this.api.getScheduleModules(this.currentPeriodID, this.studentInformation.studentID).subscribe({
			next: (res: ScheduleModule[]) => {
				console.log('schedulesModules', res);
				this.schedulesModules = res;
				this.charging = false;
			},
			error: (err: HttpErrorResponse) => {
				this.charging = false;
			}
		});
	}

	private getSchedule(): void{
		this.charging = true;
		this.api.getSchedule(this.currentPeriodID, this.studentInformation.studentID).subscribe({
			next: (res: Schedules[]) => {
				//console.log('schedules', res);
				this.schedules = res;
				this.charging = false;
			},
			error: (err: HttpErrorResponse) => {
				this.charging = false;
			}
		});
	}

	public getDestinySchedule(parallelCode: string): void{
		const LIST_HEAD_KEYS: any = { 'LUNES': 'lun', 'MARTES': 'mar', 'MIÉRCOLES': 'mie', 'JUEVES': 'jue', 'VIERNES': 'vie', 'SÁBADO': 'sab', 'DOMINGO': 'dom' }
		let hours: any = [];
		for(let i=0; i<this.schedulesModules.length; i++){
			let moduleID = this.schedulesModules[i].classModuleID;
			this.api.getDestinySchedule(this.currentPeriodID, this.studentInformation.schoolID, this.studentInformation.studyPlanID, this.studentInformation.careerID,
				this.studentInformation.modalityID, moduleID, this.studentInformation.workingDayID, this.studentInformation.cycle, parallelCode).subscribe({
				next: (res) => {
					if(this.destinySchedules.length > 0) this.destinySchedules = [];
					this.charging = false;

					let schedule = res;
					const groupedByDay = schedule.reduce((acc: any, item: any) => {
						const { weekdayDesc, ...rest } = item;
						acc[LIST_HEAD_KEYS[weekdayDesc]] = acc[LIST_HEAD_KEYS[weekdayDesc]] || [];
						acc[LIST_HEAD_KEYS[weekdayDesc]].push(rest);
						return acc;
					}, {});

					const days = Object.keys(groupedByDay);
					const transformedObject:any = {}
					days.forEach(day => { transformedObject[day] = groupedByDay[day].reduce((acc:any, item:any) => {
						const { startTime, endTime } = item;
						if (!acc[`${startTime}-${endTime}`]) {
							acc[`${startTime}-${endTime}`] = [];
						}

					hours.push({startTime,endTime});

						acc[`${startTime}-${endTime}`].push(
						item
						);

						return acc;
					}, {})
					})
					this.destinySchedules.push(transformedObject);
					//console.log('destinySchedules', this.destinySchedules);
					this.listHours = Array.from(new Set(hours.map((obj:any) => obj.startTime))).map(startTime => {
						return hours.find((obj:any) => obj.startTime === startTime);
					});
				},
				error: (err: HttpErrorResponse) => {
					this.charging = false;
				}
			});
		}
	}

	private getCurrentPeriod(personID: number): void {
    this.api.getCurrentPeriod().subscribe({
      next: (res: CurrentPeriod) => {
        this.currentPeriodID = res.periodID;
				this.getSchedule();
				this.getScheduleModules(personID);
				setTimeout(() => {
					this.getParallelAvailable();
				}, 50);
      }
    });
  }

	private getParallelAvailable(): void{
		this.charging = true;
		this.api.getParallelAvailable(this.currentPeriodID, this.studentInformation.studyPlanID, this.studentInformation.cycle, this.studentInformation.modalityID,
			this.studentInformation.careerID, this.studentInformation.parallelCode).subscribe({
			next: (res) => {
				//console.log('parallels',res);
				this.parallels = res;
				this.charging = false;
			},
			error: (err: HttpErrorResponse) => {
				this.charging = false;
			}
		});
	}

	public onSubmit(): void {
		this.filtersForm.get('studentID').patchValue(this.studentInformation.studentID);
		this.filtersForm.get('periodID').patchValue(this.currentPeriodID);
		this.filtersForm.get('paralleCodeSource').patchValue(this.studentInformation.parallelCode);

		if(this.filtersForm.valid){
			this.charging = true;
			console.log(this.filtersForm.value);
			this.api.postParallelChange(this.filtersForm.value).subscribe({
				next: (res) => {
					//console.log(res);
					this.charging = false;
					this.common.message(`Cambio de paralelo exitoso.`,'','success','#86bc57');
					this.router.navigateByUrl('/reportes/secretaria');
				},
				error: (err: HttpErrorResponse) => {
					this.charging = false;
				}
			});
		}else{
			this.filtersForm.markAllAsTouched();
		}
	}

}
