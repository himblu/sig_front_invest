import { Component, OnInit, ViewChild, ElementRef, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { NgForOf, NgIf, DatePipe } from '@angular/common';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { Campus, Period } from '@utils/interfaces/period.interfaces';
import { CareerList, SPGetCareer, SPGetModality, School, StudyPlan } from '@utils/interfaces/campus.interfaces';
import { HttpErrorResponse } from '@angular/common/http';
import { CLASS_MODULE, CurrentPeriod } from '@utils/interfaces/others.interfaces';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PeriodDatesComponent } from '../../components/period-dates/period-dates.component';

@Component({
  selector: 'app-academic-period',
  templateUrl: './academic-period.component.html',
  styleUrls: ['./academic-period.component.scss'],
	standalone: true,
	imports: [
		ReactiveFormsModule,
		NgForOf,
		NgIf,
		MatSelectModule,
		MatFormFieldModule,
		MatButtonModule,
		MatInputModule,
		MatTooltipModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatIconModule,
		MatPaginatorModule,
		MatTableModule,
		MatDialogModule,
		MatSnackBarModule,
	],
	providers: [
    DatePipe
  ],
})
export class AcademicPeriodComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public branches: Campus[];
	public periods: Period[];
	public modalities: SPGetModality[];
	public schools: School[];
	public careers: SPGetCareer[];
	public study_plan: StudyPlan[];
	public settings: CareerList[];
	public currentPeriod: CurrentPeriod;
	public color='#004899';
	public academicForm: FormGroup;
	public moduleForm: FormGroup;
	public charging: boolean = false;
	public selectedType: number;
	public title: string;
	public subtitle: string;
	public pageIndex: number = 1;
  public pageSize: number = 10;
  public length: number = 0;
	public pageEvent!: PageEvent;
  public pageSizeOptions: number[] = [5, 10, 25, 50, 100];
	public maxPeriodDate: string;
	public minPeriodDate:string;
	public filtersForm!: FormGroup;
  public filters: string = '';

	@ViewChild('paginator', { static: true }) public paginator!: MatPaginator;
	@ViewChild('modalClose', { read: ElementRef }) public modalClose: ElementRef;
	private dialog: MatDialog = inject(MatDialog);
	private snackBar: MatSnackBar = inject(MatSnackBar);

	constructor( private fb: FormBuilder,
		private common: CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private datePipe: DatePipe, ){
		super();
		}

	ngOnInit(): void {
		this.initForm();
		this.getBranches();
		this.getModalities();
		this.getCurrentPeriod();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	public initForm():void{
		this.academicForm = this.fb.group({
			branchID:								 ['', [Validators.required]],
			periodID:                ['', [Validators.required]],
			modalityID:              ['', [Validators.required]],
			schoolID:             	 ['', [Validators.required]],
			careerID:              	 ['', [Validators.required]],
			studyPlanID:           	 ['', [Validators.required]],
			classModuleID: 					 [''],
			typeSettingPeriod: 			 ['', [Validators.required]],
			startDate: 							 [''],
			endDate: 								 [''],
			numberWeek:              [''],
			user:									 	 [sessionStorage.getItem('name')],
		});

		this.moduleForm = this.fb.group({
			modules:	this.fb.array([
				this.fb.group({
					classModuleID: [''],
					startDate: ['', [Validators.required]],
					endDate: ['', [Validators.required]],
					numberWeek: ['', [Validators.required]],
					minDate: ['']
				})
			]),

		});

		this.filtersForm = this.fb.group({
      search: ['']
    });

	}

	private initModulesRow(): FormGroup {
		return this.fb.group({
			classModuleID: [''],
			startDate: ['', [Validators.required]],
			endDate: ['', [Validators.required]],
			minDate: [this.getModulesRow().controls[0].get('endDate').value],
			numberWeek: ['', [Validators.required]],
		});
	}

	public addModulesRow(): void {
		const modulesArray= <FormArray>this.moduleForm.controls['modules'];
		modulesArray.push(this.initModulesRow());
	}

	removeModulesRow(): void {
		const usersArray= <FormArray>this.moduleForm.controls['modules'];
		if (usersArray.length > 1) {
				usersArray.removeAt(1);
		}
	}

	public getModulesRow() {
    return (this.moduleForm.controls['modules'] as FormArray);
	}

	public selectType(item:MatSelectChange):void{
		this.selectedType=item.value;
		if(this.selectedType == 0){
			//console.log('Periodo Académico');
			this.title='PERIODO NORMAL';
			this.subtitle='Periodo Académico';
			this.removeModulesRow();
		}else if(this.selectedType == 1){
			//console.log(this.getModulesRow().controls)
			this.title='MÓDULOS';
			this.subtitle='Módulo';
			this.addModulesRow();
		}
	}

	public weeksBetween(index: number) {
		this.getModulesRow().controls[index].markAllAsTouched();
		let start: Date= (this.moduleForm.value.modules[index].startDate).replace('-', ' ');
		start = new Date(start);
		let end: Date= (this.moduleForm.value.modules[index].endDate).replace('-', ' ');
		end = new Date(end);
		let result = Math.round((+end - +start) / (7 * 24 * 60 * 60 * 1000));
		let modulesArray=<FormArray>this.moduleForm.controls['modules'];
		let modules = modulesArray.controls[index];
		modules.get('numberWeek').patchValue(result);
	}

	private getBranches(): void{
		this.charging = true;
		this.admin.getAllCampuses().subscribe({
			next: (res) => {
				this.branches = res;
				this.charging = false;
			},
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
				this.charging = false;
			}
		});
	}

	public getPeriods(campusID:number): void{
		this.admin.getPeriodsByCampus(campusID).subscribe({
			next: (res) => {
				this.periods = res;
			},
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
		});
	}

	public getCurrentPeriod(): void{
		this.charging=true;
		this.api.getCurrentPeriod().subscribe({
			next: (res) => {
				this.currentPeriod = res;
				this.getSettingModulePeriod();
				this.charging=false;
			},
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
				this.charging=false;
			}
		});
	}

	public getSettingModulePeriod(): void{
		this.admin.getSettingModulePeriod(this.pageIndex, this.filtersForm.get('search').value, this.pageSize, this.currentPeriod.periodID).subscribe({
			next: (res) => {
				//console.log(res);
				this.settings = res.data;
        this.length = res.count;
			},
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
		});
	}

	private getModalities(): void{
		this.charging = true;
		this.admin.getModalityAll().subscribe({
			next: (res) => {
				//console.log(res);
				this.modalities = res;
				this.charging = false;
			},
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
				this.charging = false;
			}
		});
	}

	public getSchools(modalityID:number): void{
		this.admin.getSchoolsByModality(this.academicForm.get('periodID').value, modalityID).subscribe({
			next: (res) => {
				this.schools = res;
			},
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
		});
	}

	public getCareers(schoolID:number): void{
		this.admin.getCareersBySchool(this.academicForm.get('periodID').value, schoolID).subscribe({
			next: (res) => {
				this.careers = res;
			},
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
		});
	}

	public getStudyPlan(careerID:number): void{
		this.admin.getStudyPlansByCareer(careerID).subscribe({
			next: (res) => {
				this.study_plan = res;
			},
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
		});
	}

	private formattedDate(date: Date): string {
		return <string>this.datePipe.transform(date, 'yyyy-MM-dd');
	}

	public onSubmit(): void{
		let dynamics=[];
		if(this.moduleForm.valid && this.academicForm.valid){
			let modulesArray=<FormArray>this.moduleForm.controls['modules'];
			for(let i = 0; i < this.getModulesRow().length; i++){
				let modules = modulesArray.controls[i];
				this.academicForm.get('classModuleID').patchValue(modules.get('classModuleID').value);
				this.academicForm.get('startDate').patchValue(this.formattedDate(modules.get('startDate').value));
				this.academicForm.get('endDate').patchValue(this.formattedDate(modules.get('endDate').value));
				this.academicForm.get('numberWeek').patchValue(modules.get('numberWeek').value);
				if(this.selectedType == 1){
					this.academicForm.get('classModuleID').patchValue(i+1);
				}else if(this.selectedType == 0){
					this.academicForm.get('classModuleID').patchValue(CLASS_MODULE.modulo_0);
				}
				dynamics.push(this.academicForm.value)
			}
			//console.log({"dynamics" : dynamics});
			this.charging=true;
			this.admin.postSettingModulePeriod({"dynamics" : dynamics}).subscribe({
				next: (res:any) => {
					let resp=res[0];
					this.common.message(`${resp[0].message}`,'','success','#86bc57');
					this.charging=false;
					this.removeModulesRow();
					this.getSettingModulePeriod();
					this.initForm();
					this.selectedType=null;
					this.modalClose.nativeElement.click();
				},
				error: (err: HttpErrorResponse) => {
					console.log('err',err);
					this.charging=false;
				}
			});
		}else {
			this.academicForm.markAllAsTouched();
			this.moduleForm.markAllAsTouched();
		}
	}

	public changePageSettings(event: PageEvent): PageEvent {
		this.pageIndex = event.pageIndex+1;
    this.pageSize = event.pageSize;
		this.getSettingModulePeriod();
    return event;
	}

	public clickPeriod(period: Period): void{
		this.maxPeriodDate = this.datePipe.transform(period.periodDateEnd, 'yyyy-MM-dd');
		this.minPeriodDate = this.datePipe.transform(period.periodDateStart, 'yyyy-MM-dd');
	}

	public openDialog(item?: CareerList): void {
		const period= this.currentPeriod;
		const config: MatDialogConfig = new MatDialogConfig();
		config.id = 'TemplateComponent';
		config.autoFocus = false;
		config.minWidth = '55vw';
		config.maxWidth = '55vw';
		config.panelClass = 'transparent-panel';
		config.data = { item };
		config.disableClose = false;
		const dialog = this.dialog.open(PeriodDatesComponent, config);
		dialog.afterClosed()
		.pipe(untilComponentDestroyed(this))
		.subscribe((res) => {
			if (res) {
				this.getSettingModulePeriod();
			}
		});
	}

}
