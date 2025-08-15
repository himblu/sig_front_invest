import { DatePipe, NgFor, NgIf, formatDate } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdministrativeService } from '@services/administrative.service';
import { ApiService } from '@services/api.service';
import { UserService } from '@services/user.service';
import { ChartDataset, ChartJS, Contractor, CoursePercentage, CourseReport, CourseSale, CourseSaleRange, CourseStatus, DesertionByPhase, InterestedPercentage } from '@utils/interfaces/others.interfaces';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { PipesModule } from 'app/pipes/pipes.module';
import * as Chart from 'chart.js';
import * as moment from 'moment';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
		NgFor,
		NgIf,
		MatProgressBarModule,
		ReactiveFormsModule,
		FormsModule,
		MatInputModule,
		MatDatepickerModule,
		MatFormFieldModule,
		MatNativeDateModule,
		MatTooltipModule,
		MatSelectModule,
		PipesModule
	],
	providers: [
    DatePipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent extends OnDestroyMixin implements OnInit, OnDestroy, AfterViewInit {

	public isLoading: boolean= false;
	public filtersForm!: FormGroup;
	public currentYear = moment().year();
	public hoursChart!: Chart;
	public coursesChart!: Chart;
	public desertersChart!: Chart;
	public desertionsByPhaseChart!: Chart;
	public coursePercentages: CoursePercentage[] = [];
	public courseSales: CourseSale[] = [];
	public interestedPercentages: InterestedPercentage[] = [];
	public courseStatuses: CourseStatus[] = [];
	public courseSaleRanges: CourseSaleRange[] = [];
	public courseReports: CourseReport[] = [];
	public courseHours: CourseReport[] = [];
	public courseDeserters: CourseReport[] = [];
	public desertionsByPhase: DesertionByPhase[] = [];
	public contractors: Contractor[] = [];

	constructor(private user: UserService,
		private cdRef: ChangeDetectorRef,
		private api: ApiService,
		private fb: FormBuilder,
		private datePipe: DatePipe,
		private admin: AdministrativeService
	 ){
		super();
		this.initForm();
	}

	ngOnInit(): void {
		this.getContractors();
		//this.getCoursePercentage();
		this.getCourseStateUnacem();
		//this.getCourseSale();
		this.getInterestedPercentage();
		//this.getCourseStatus();
		//this.getCourseSaleRange();
		this.getCourseHoursUnacem();
		this.getCourseDesertersUnacem();
		this.getCourseDesertionByPhaseUnacem();
	}

	override ngOnDestroy(): void {
		this.hoursChart.destroy();
		this.coursesChart.destroy();
		super.ngOnDestroy();
	}

	ngAfterViewInit(): void {
    this.cdRef.detectChanges();
	}

	public initForm(): void {
		const today= new Date;
		const firstDay = new Date(today.getFullYear(), 0, 1);
		this.filtersForm= this.fb.group({
			initDate: [formatDate(firstDay, 'yyyy-MM-dd', 'en', '+2000'), Validators.required],
			endDate: [formatDate(today, 'yyyy-MM-dd', 'en', '+2000'), Validators.required],
			search: '',
			contractorID: 0,
			periodSection: 0
		});

		const endDate: FormControl = this.filtersForm.get('endDate') as FormControl;
		if (endDate) endDate.valueChanges.pipe(
			debounceTime(300),
			distinctUntilChanged(),
			untilComponentDestroyed(this)
		).subscribe({
			next: () => {
				//this.getCourseSale();
			}
		});

		const searchInput: FormControl = this.filtersForm.get('search') as FormControl;
		if (searchInput) searchInput.valueChanges.pipe(
			debounceTime(300),
			distinctUntilChanged(),
			untilComponentDestroyed(this)
		).subscribe({
			next: (value) => {
				this.getInterestedPercentage();
			}
		});
	}

	private formattedDate(date: Date): string {
    return <string>this.datePipe.transform(date, 'yyyy-MM-dd');
  }

	private generateRandomNum(): number {
		return Math.floor(Math.random() * (235 - 52 + 1) + 52);
	}

	private generateRandomRGB(): string {
		return `rgb(${this.generateRandomNum()}, ${this.generateRandomNum()}, ${this.generateRandomNum()})`;
	}

	public setHoursChart(): void {
		if(this.hoursChart) this.hoursChart.data.datasets.pop();
		let labels: string[]= [
			"H. Virtual",
			"H. Presencial"
		];
		let datasets: ChartDataset[] = [];
		for(let i=0; i<this.courseHours.length; i++){
			let data: number[]= [];
			data.push(+this.courseHours[i].hVirtual);
			data.push(+this.courseHours[i].hPresencial);
			let body: ChartDataset= {
				label: this.courseHours[i].courseName,
				backgroundColor: this.generateRandomRGB(),
				data: data
			};
			datasets.push(body);
		}

		this.hoursChart = new Chart('hoursChart', {
			type: 'bar',
			data: {
				labels: labels,
				datasets: datasets,
			},
			options: {
				responsive: true,
				legend: {
					display: true,
					labels: {
						fontSize: 9,
					}
				 },
				title: {
					display: false,
					text: ''
				},
			}
		});
	}

	public setCoursesChart(): void {
		if(this.coursesChart) this.coursesChart.data.datasets.pop();
		let labels: string[]= [
			"% Aprobados",
			"% Caducados",
			"% Pendientes"
		];
		let datasets: ChartDataset[] = [];
		for(let i=0; i<this.courseReports.length; i++){
			let data: number[]= [];
			data.push(+this.courseReports[i].approved);
			data.push(+this.courseReports[i].expired);
			data.push(+this.courseReports[i].inProgress);
			let body: ChartDataset= {
				label: this.courseReports[i].courseName,
				backgroundColor: this.generateRandomRGB(),
				data: data
			};
			datasets.push(body);
		}
		this.coursesChart = new Chart('coursesChart', {
			type: 'bar',
			data: {
				labels: labels,
				datasets: datasets,
			},
			options: {
				responsive: true,
				legend: {
					display: true,
					labels: {
						fontSize: 9,
					}
				 },
				title: {
					display: false,
					text: ''
				},
			}
		});
	}

	public setDesertersChart(): void {
		if(this.desertersChart) this.desertersChart.data.datasets.pop();
		let labels: string[]= [
			"Desertores",
		];
		let datasets: ChartDataset[] = [];
		for(let i=0; i<this.courseDeserters.length; i++){
			let data: number[]= [];
			data.push(+this.courseDeserters[i].expired);
			let body: ChartDataset= {
				label: this.courseDeserters[i].courseName,
				backgroundColor: this.generateRandomRGB(),
				data: data
			};
			datasets.push(body);
		}
		this.desertersChart = new Chart('desertersChart', {
			type: 'bar',
			data: {
				labels: labels,
				datasets: datasets,
			},
			options: {
				responsive: true,
				legend: {
					display: true,
					labels: {
						fontSize: 9,
					}
				 },
				title: {
					display: false,
					text: ''
				},
			}
		});
	}

	public setDesertionsByPhaseChart(): void {
		if(this.desertionsByPhaseChart) this.desertionsByPhaseChart.data.datasets.pop();
		let labels: string[]= [
			"% Deserción Virtual",
			"% Deserción Presencial"
		];
		let datasets: ChartDataset[] = [];
		for(let i=0; i<this.desertionsByPhase.length; i++){
			let data: number[]= [];
			data.push(+this.desertionsByPhase[i].pctWithoutTheoryExam);
			data.push(+this.desertionsByPhase[i].pctWithoutInPersonExam);
			let body: ChartDataset= {
				label: this.desertionsByPhase[i].courseName,
				backgroundColor: this.generateRandomRGB(),
				data: data
			};
			datasets.push(body);
		}
		this.desertionsByPhaseChart = new Chart('desertionsByPhaseChart', {
			type: 'bar',
			data: {
				labels: labels,
				datasets: datasets,
			},
			options: {
				responsive: true,
				legend: {
					display: true,
					labels: {
						fontSize: 9,
					}
				 },
				title: {
					display: false,
					text: ''
				},
			}
		});
	}

	public getCourseSale(): void {
		if(this.filtersForm.valid){
			const filters= this.filtersForm.value;
			this.api.getCourseSale(this.formattedDate(filters.initDate), this.formattedDate(filters.endDate)).subscribe({
				next: (res) => {
					this.courseSales= res;
				},
				error: (err: HttpErrorResponse) => {
					//console.log(err);
				}
			})
		}else this.filtersForm.markAllAsTouched();
	}

	public getCourseSaleRange(): void {
		if(this.filtersForm.valid){
			const filters= this.filtersForm.value;
			this.api.getCourseSaleRange(this.formattedDate(filters.initDate), this.formattedDate(filters.endDate)).subscribe({
				next: (res) => {
					this.courseSaleRanges= res;
				},
				error: (err: HttpErrorResponse) => {
					//console.log(err);
				}
			})
		}else this.filtersForm.markAllAsTouched();
	}

	public getCoursePercentage(): void {
		this.api.getCoursePercentage().subscribe({
			next: (res) => {
				this.coursePercentages= res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log(err);
			}
		})
	}

	public getCourseStateUnacem(): void {
		const filters= this.filtersForm.value;
		this.api.getCourseStateUnacem(filters.contractorID, filters.periodSection).subscribe({
			next: (res) => {
				this.courseReports= res;
				this.setCoursesChart();
			},
			error: (err: HttpErrorResponse) => {
				//console.log(err);
			}
		})
	}

	public getCourseHoursUnacem(): void {
		const filters= this.filtersForm.value;
		this.api.getCourseHoursUnacem(filters.contractorID, filters.periodSection).subscribe({
			next: (res) => {
				this.courseHours= res;
				this.setHoursChart();
			},
			error: (err: HttpErrorResponse) => {
				//console.log(err);
			}
		})
	}

	public getCourseDesertersUnacem(): void {
		const filters= this.filtersForm.value;
		this.api.getCourseDesertersUnacem(filters.contractorID, filters.periodSection).subscribe({
			next: (res) => {
				this.courseDeserters= res;
				this.setDesertersChart();
			},
			error: (err: HttpErrorResponse) => {
				//console.log(err);
			}
		})
	}

	public getCourseDesertionByPhaseUnacem(): void {
		const filters= this.filtersForm.value;
		this.api.getCourseDesertionByPhaseUnacem(filters.contractorID, filters.periodSection).subscribe({
			next: (res) => {
				this.desertionsByPhase= res;
				this.setDesertionsByPhaseChart();
			},
			error: (err: HttpErrorResponse) => {
				//console.log(err);
			}
		})
	}

	public getInterestedPercentage(): void {
		this.api.getInterestedPercentage(this.filtersForm.get('search').value).subscribe({
			next: (res) => {
				this.interestedPercentages= res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log(err);
			}
		})
	}

	public getCourseStatus(): void {
		this.api.getCourseStatus().subscribe({
			next: (res) => {
				this.courseStatuses= res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log(err);
			}
		})
	}

	public getContractors(): void{
		this.isLoading= true;
		this.admin.getContractor({}).subscribe({
			next: (res) => {
				//console.log('contractors', res)
				this.contractors= res;
				this.isLoading= false;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.isLoading= false;
			}
		});
	}

}
