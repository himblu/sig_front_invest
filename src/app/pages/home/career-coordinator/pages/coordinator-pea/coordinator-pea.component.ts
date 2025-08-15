import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject, SecurityContext } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, FormArray, FormControl } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { MatNativeDateModule, MatOptionSelectionChange } from '@angular/material/core';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { NgForOf, NgIf, DatePipe, formatDate } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatStepperModule } from '@angular/material/stepper';
import { MatStepper } from '@angular/material/stepper';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Period } from '@utils/interfaces/period.interfaces';
import { HttpErrorResponse } from '@angular/common/http';
import { CourseHours, CycleDetail, InstrumentSubject, ModalityByCareer, ResultType, SPGetCareer, School, StudyPlan, Subject, SubjectForSection, Units } from '@utils/interfaces/campus.interfaces';
import { MatTabsModule } from '@angular/material/tabs';
import { ButtonArrowComponent } from '@components/button-arrow/button-arrow.component';
import { UserService } from '@services/user.service';
import { HolidayCount, MODALITIES, Plan1Detail, Plan2Detail, ResultLearning, SubjectData, SyllabusSubject, TermsAndConditions, WorkWeek } from '@utils/interfaces/others.interfaces';
import Swal from 'sweetalert2';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, map, Subscription } from 'rxjs';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';

@Component({
  selector: 'app-coordinator-pea',
  templateUrl: './coordinator-pea.component.html',
  styleUrls: ['./coordinator-pea.component.scss'],
	standalone: true,
	imports: [
    NgForOf,
    NgIf,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    //RouterLink,
    MatTooltipModule,
		MatMenuModule,
		MatStepperModule,
		MatNativeDateModule,
		MatDatepickerModule,
		MatTabsModule,
		ButtonArrowComponent,
		DatePipe,
		SpinnerLoaderComponent,
		MatSnackBarModule
  ],
	providers: [
		DatePipe,
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: {displayDefaultIndicatorType: false},
    },
  ],
})
export class CoordinatorPeaComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public charging: boolean = false;
	public periods: Period[];
	public schools: School[];
	public careers: SPGetCareer[];
	public cycleDetail: CycleDetail[] = [];
	public study_plan:StudyPlan[];
	public subjects: InstrumentSubject[];
	public resultTypeList: ResultType[];
	public unitsList: Units[];
	public syllabusSubjects: SyllabusSubject[];
	public hours: CourseHours[];
	public modalities: ModalityByCareer[];
	public resultLearning: ResultLearning[];
	public termsAndConditions: TermsAndConditions[];
	public subjectData: SubjectData[];
	public subjectPlanID: number;
	public actualList: number = 1;
  public totalPageList: number = 0;
  public countList: number = 0;
	public pageListLimit:number = 10;
	public minDatePlan2: string= null;
	public maxDatePlan2: string;
	public isRegistered: boolean = true;
	public isLinear = true;
	public calendarFlag : number = 0;
	public filtersForm!: FormGroup;
	public plan1Form!: FormGroup;
	public plan2Form!: FormGroup;
	public plan4Form!: FormGroup;
	public getSubjectPlanSubscription!: Subscription;
	public loadingPlan: boolean= false;
	private snackBar: MatSnackBar = inject(MatSnackBar);

	@ViewChild('vStepper') private vStepper: MatStepper;
	@ViewChild('nestStepper') private nestStepper: MatStepper;
	private sanitizer: DomSanitizer = inject(DomSanitizer);

	constructor(private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService,
		private router: Router,
		private datePipe: DatePipe, ){
		super();
	}

	public ngOnInit(): void {
		this.getUnits();
		this.initForm();
		this.initPlan1Form();
		this.initPlan2Form();
		this.initPlan4Form();
		this.getPeriods();
		this.getResultType();
		this.getTermsConditions();
		this.plan1Form.disable();
  }

  public override ngOnDestroy() {
    super.ngOnDestroy();
  }

	public initForm():void {
		this.filtersForm = this.fb.group({
			schoolID: ['', [Validators.required]],
			careerID: ['', [Validators.required]],
      studyPlanID: ['', [Validators.required]],
			cycleID: ['', [Validators.required]],
			courseID: ['', [Validators.required]],
			periodID: ['', [Validators.required]],
			modalityID: ['', [Validators.required]],
    });
	}

	public initPlan2Form(): void{
		this.plan2Form = this.fb.group({
			weeks: this.fb.array([
				this.fb.group({
					settingUnitsID: 0,
					planDetailID: [8, [Validators.required]],
					careerID: ['', [Validators.required]],
					studyPlanID: ['', [Validators.required]],
					courseID: ['', [Validators.required]],
					unitID: ['', [Validators.required]],
					planSubDetailID: [1, [Validators.required]],
					periodID: ['', [Validators.required]],
					nroSequence: [0, [Validators.required]],
					settingUnitDesc: [''],
					hours: [0],
					startDateUnit: ['', [Validators.required]],
					endDateUnit: ['', [Validators.required]],
					numberWeek: ['', [Validators.required]],
					predecessor: [0, [Validators.required]],
					user: this.user.currentUser.userName,
					personID: this.user.currentUser.PersonId,
				})
			]),

			contents: this.fb.array([
				this.fb.group({
					settingUnitsID: 0,
					planDetailID: [8, [Validators.required]],
					careerID: ['', [Validators.required]],
					studyPlanID: ['', [Validators.required]],
					courseID: ['', [Validators.required]],
					unitID: ['', [Validators.required]],
					planSubDetailID: [2, [Validators.required]],
					periodID: ['', [Validators.required]],
					nroSequence: [0, [Validators.required]],
					settingUnitDesc: ['', [Validators.required]],
					hours: [0, [Validators.required]],
					startDateUnit: ['1990-01-01', [Validators.required]],
					endDateUnit: ['1990-01-01', [Validators.required]],
					numberWeek: ['0', [Validators.required]],
					predecessor: [0, [Validators.required]],
					user: this.user.currentUser.userName,
					personID: this.user.currentUser.PersonId,
				})
			]),

			subcontents: this.fb.array([
				this.fb.group({
					settingUnitsID: 0,
					planDetailID: [8, [Validators.required]],
					careerID: ['', [Validators.required]],
					studyPlanID: ['', [Validators.required]],
					courseID: ['', [Validators.required]],
					unitID: ['', [Validators.required]],
					planSubDetailID: [2, [Validators.required]],
					periodID: ['', [Validators.required]],
					nroSequence: [0, [Validators.required]],
					settingUnitDesc: ['', [Validators.required]],
					hours: [0, [Validators.required]],
					startDateUnit: ['1990-01-01', [Validators.required]],
					endDateUnit: ['1990-01-01', [Validators.required]],
					numberWeek: ['0', [Validators.required]],
					predecessor: [0, [Validators.required]],
					user: this.user.currentUser.userName,
					personID: this.user.currentUser.PersonId,
				})
			]),
			teacher: this.fb.array([
				this.fb.group({
					settingUnitsID: 0,
					planDetailID: [8, [Validators.required]],
					careerID: ['', [Validators.required]],
					studyPlanID: ['', [Validators.required]],
					courseID: ['', [Validators.required]],
					unitID: ['', [Validators.required]],
					planSubDetailID: [3, [Validators.required]],
					periodID: ['', [Validators.required]],
					nroSequence: [0, [Validators.required]],
					settingUnitDesc: ['', [Validators.required]],
					hours: [0, [Validators.required]],
					startDateUnit: ['1990-01-01', [Validators.required]],
					endDateUnit: ['1990-01-01', [Validators.required]],
					numberWeek: ['0', [Validators.required]],
					predecessor: [0, [Validators.required]],
					user: this.user.currentUser.userName,
					personID: this.user.currentUser.PersonId,
				})
			]),
			practice: this.fb.array([
				this.fb.group({
					settingUnitsID: 0,
					planDetailID: [8, [Validators.required]],
					careerID: ['', [Validators.required]],
					studyPlanID: ['', [Validators.required]],
					courseID: ['', [Validators.required]],
					unitID: ['', [Validators.required]],
					planSubDetailID: [4, [Validators.required]],
					periodID: ['', [Validators.required]],
					nroSequence: [0, [Validators.required]],
					settingUnitDesc: ['', [Validators.required]],
					hours: [0, [Validators.required]],
					startDateUnit: ['1990-01-01', [Validators.required]],
					endDateUnit: ['1990-01-01', [Validators.required]],
					numberWeek: ['0', [Validators.required]],
					predecessor: [0, [Validators.required]],
					user: this.user.currentUser.userName,
					personID: this.user.currentUser.PersonId,
				})
			]),
			standAlone: this.fb.array([
				this.fb.group({
					settingUnitsID: 0,
					planDetailID: [8, [Validators.required]],
					careerID: ['', [Validators.required]],
					studyPlanID: ['', [Validators.required]],
					courseID: ['', [Validators.required]],
					unitID: ['', [Validators.required]],
					planSubDetailID: [5, [Validators.required]],
					periodID: ['', [Validators.required]],
					nroSequence: [0, [Validators.required]],
					settingUnitDesc: ['', [Validators.required]],
					hours: [0, [Validators.required]],
					startDateUnit: ['1990-01-01', [Validators.required]],
					endDateUnit: ['1990-01-01', [Validators.required]],
					numberWeek: ['0', [Validators.required]],
					predecessor: [0, [Validators.required]],
					user: this.user.currentUser.userName,
					personID: this.user.currentUser.PersonId,
				})
			]),
    });
	}

	plan2Row(): FormGroup {
		return this.fb.group({
			settingUnitsID: 0,
			planDetailID: [8, [Validators.required]],
			careerID: ['', [Validators.required]],
			studyPlanID: ['', [Validators.required]],
			courseID: ['', [Validators.required]],
			unitID: ['', [Validators.required]],
			planSubDetailID: [0, [Validators.required]],
			periodID: ['', [Validators.required]],
			nroSequence: [0, [Validators.required]],
			settingUnitDesc: ['', [Validators.required]],
			hours: [0, [Validators.required]],
			startDateUnit: ['1990-01-01', [Validators.required]],
			endDateUnit: ['1990-01-01', [Validators.required]],
			numberWeek: ['0', [Validators.required]],
			predecessor: [0, [Validators.required]],
			user: this.user.currentUser.userName,
			personID: this.user.currentUser.PersonId,
		});
	}

	public addPlan2Row(i:string, planSubDetailID:number=0): void {
		const row=<FormArray>this.plan2Form.controls[i];
		this.plan2Row().get('planSubDetailID').patchValue(planSubDetailID);
		row.push(this.plan2Row());
	}

	public getPlan2Row(i:string) {
    return (this.plan2Form.controls[i] as FormArray);
	}

	public deletePlan2Row(i:number, row:string): void {
		const array= <FormArray>this.plan2Form.controls[row];
		if (array.length > 1) {
				array.removeAt(i);
		} else {

		}
	}

	public onDateChange(): void {
    this.weeksBetween();
		for(let i=0; i<this.getPlan2Row('teacher').controls.length; i++){
			this.getPlan2Row('teacher').controls[i].get('hours').patchValue(null);
		}
		for(let i=0; i<this.getPlan2Row('standAlone').controls.length; i++){
			this.getPlan2Row('standAlone').controls[i].get('hours').patchValue(null);
		}
		for(let i=0; i<this.getPlan2Row('practice').controls.length; i++){
			this.getPlan2Row('practice').controls[i].get('hours').patchValue(null);
		}
	}

	public calculateTeacherHours(): void{
		let weeks=<FormArray>this.plan2Form.controls['weeks'];
		let mod;
		/*if(this.filtersForm.get('modalityID').value==1){
			mod=MODALITIES.PRESENCIAL
		}else{
			mod=MODALITIES.SEMIPRESENCIAL
		}*/
		mod=this.subjectData[0].numberWeek;
		let max = (parseInt(this.hours[0].hoursTeachContact)/mod)*weeks.controls[0].get('numberWeek').value;
		let sum=0;
		let i;
		for(i=0; i<this.getPlan2Row('teacher').length; i++){
			sum=sum+this.getPlan2Row('teacher').controls[i].get('hours').value;
		}
		//console.log(sum, max.toFixed())
		if(sum < parseInt(max.toFixed())){
			this.getPlan2Row('teacher').controls[i-1].get('hours').setErrors({'incorrect': true});
		}else if(sum > parseInt(max.toFixed())){
			this.common.message(`La sumatoria de las horas ha superado el límite de ${max.toFixed()}`,'', 'info', '#f5637e');
			this.getPlan2Row('teacher').controls[i-1].get('hours').patchValue('');
		}
	}

	public calculateStandAloneHours(): void{
		let weeks=<FormArray>this.plan2Form.controls['weeks'];
		let mod;
		/*if(this.filtersForm.get('modalityID').value==1){
			mod=MODALITIES.PRESENCIAL
		}else{
			mod=MODALITIES.SEMIPRESENCIAL
		}*/
		mod=this.subjectData[0].numberWeek;
		let max = (parseInt(this.hours[0].hoursAutonomous)/mod)*weeks.controls[0].get('numberWeek').value;

		let sum=0;
		let i;
		for(i=0; i<this.getPlan2Row('standAlone').length; i++){

			sum=sum+this.getPlan2Row('standAlone').controls[i].get('hours').value;
		}
		//console.log(sum, max.toFixed())
		if(sum < parseInt(max.toFixed())){
			this.getPlan2Row('standAlone').controls[i-1].get('hours').setErrors({'incorrect': true});
		}else if(sum > parseInt(max.toFixed())){
			this.common.message(`La sumatoria de las horas ha superado el límite de ${max.toFixed()}`,'', 'info', '#f5637e');
			this.getPlan2Row('standAlone').controls[i-1].get('hours').patchValue('');
		}
	}

	public calculatePracticeHours(): void{
		let weeks=<FormArray>this.plan2Form.controls['weeks'];
		let mod;
		/*if(this.filtersForm.get('modalityID').value==1){
			mod=MODALITIES.PRESENCIAL
		}else{
			mod=MODALITIES.SEMIPRESENCIAL
		}*/
		mod=this.subjectData[0].numberWeek;
		let max = (parseInt(this.hours[0].hoursPracExp)/mod)*weeks.controls[0].get('numberWeek').value;

		let sum=0;
		let i;
		for(i=0; i<this.getPlan2Row('practice').length; i++){

			sum=sum+this.getPlan2Row('practice').controls[i].get('hours').value;
		}
		//console.log(sum, max.toFixed())
		if(sum < parseInt(max.toFixed())){
			this.getPlan2Row('practice').controls[i-1].get('hours').setErrors({'incorrect': true});
		}else if(sum > parseInt(max.toFixed())){
			this.common.message(`La sumatoria de las horas ha superado el límite de ${max.toFixed()}`,'', 'info', '#f5637e');
			this.getPlan2Row('practice').controls[i-1].get('hours').patchValue('');
		}
	}

	public initPlan1Form(): void{
		this.plan1Form = this.fb.group({
			data: this.fb.array([
				this.fb.group({
					numberSetting: 0,
					planDetailID: [0, [Validators.required]],
					schoolID: ['', [Validators.required]],
					careerID: ['', [Validators.required]],
					studyPlanID: ['', [Validators.required]],
					courseID: ['', [Validators.required]],
					periodID: ['', [Validators.required]],
					personID: this.user.currentUser.PersonId,
					resultTypeID: [0, [Validators.required]],
					nroSequence: [0, [Validators.required]],
					position: ['C'],
					planDetailSettingDesc: ['', [Validators.required]],
					user: this.user.currentUser.userName,
				}),
			]),
			achievements: this.fb.array([
				this.fb.group({
					numberSetting: 0,
					planDetailID: [3, [Validators.required]],
					schoolID: ['', [Validators.required]],
					careerID: ['', [Validators.required]],
					studyPlanID: ['', [Validators.required]],
					courseID: ['', [Validators.required]],
					periodID: ['', [Validators.required]],
					personID: this.user.currentUser.PersonId,
					resultTypeID: ['', [Validators.required]],
					nroSequence: ['', [Validators.required]],
					position: ['C'],
					planDetailSettingDesc: ['', [Validators.required]],
					user: this.user.currentUser.userName,
				}),
			]),
    });
		this.addDataRow();
	}

	plan1Achievements(): FormGroup {
		return this.fb.group({
			numberSetting: 0,
			planDetailID: [3, [Validators.required]],
			schoolID: ['', [Validators.required]],
			careerID: ['', [Validators.required]],
			studyPlanID: ['', [Validators.required]],
			courseID: ['', [Validators.required]],
			periodID: ['', [Validators.required]],
			personID: this.user.currentUser.PersonId,
			resultTypeID: ['', [Validators.required]],
			nroSequence: ['', [Validators.required]],
			position: ['C'],
			planDetailSettingDesc: ['', [Validators.required]],
			user: this.user.currentUser.userName,
		});
	}

	public addAchievementsRow(): void {
		const achievements=<FormArray>this.plan1Form.controls['achievements'];
		achievements.push(this.plan1Achievements());
	}

	public deleteAchievementsRow(i:number): void {
		const array= <FormArray>this.plan1Form.controls['achievements'];
			if (array.length > 1) {
					array.removeAt(i);
			}
	}

	public getAchievementsRow() {
    return (this.plan1Form.controls['achievements'] as FormArray);
	}

	plan1Data(): FormGroup {
		return this.fb.group({
			numberSetting: 0,
			planDetailID: [0, [Validators.required]],
			schoolID: ['', [Validators.required]],
			careerID: ['', [Validators.required]],
			studyPlanID: ['', [Validators.required]],
			courseID: ['', [Validators.required]],
			periodID: ['', [Validators.required]],
			personID: this.user.currentUser.PersonId,
			resultTypeID: [0, [Validators.required]],
			nroSequence: [0, [Validators.required]],
			position: ['C'],
			planDetailSettingDesc: ['', [Validators.required]],
			user: this.user.currentUser.userName,
		});
	}

	public addDataRow(): void {
		const data=<FormArray>this.plan1Form.controls['data'];
		data.push(this.plan1Data());
	}

	public getDataRow() {
    return (this.plan1Form.controls['data'] as FormArray);
	}

	private initPlan4Form(): void{
		this.plan4Form = this.fb.group({
			data: this.fb.array([
				this.fb.group({
					numberSetting: 0,
					planDetailID: [0, [Validators.required]],
					schoolID: ['', [Validators.required]],
					careerID: ['', [Validators.required]],
					studyPlanID: ['', [Validators.required]],
					courseID: ['', [Validators.required]],
					periodID: ['', [Validators.required]],
					personID: this.user.currentUser.PersonId,
					resultTypeID: [0, [Validators.required]],
					nroSequence: [0, [Validators.required]],
					position: ['C'],
					planDetailSettingDesc: ['', [Validators.required]],
					user: this.user.currentUser.userName,
				}),
			]),
			achievements: this.fb.array([
				this.fb.group({
					numberSetting: 0,
					planDetailID: [3, [Validators.required]],
					schoolID: ['', [Validators.required]],
					careerID: ['', [Validators.required]],
					studyPlanID: ['', [Validators.required]],
					courseID: ['', [Validators.required]],
					periodID: ['', [Validators.required]],
					personID: this.user.currentUser.PersonId,
					resultTypeID: ['', [Validators.required]],
					nroSequence: ['', [Validators.required]],
					position: ['C'],
					planDetailSettingDesc: ['', [Validators.required]],
					user: this.user.currentUser.userName,
				}),
			]),
    });
		this.addPlan4DataRow();
		this.addPlan4DataRow();
		this.addPlan4DataRow();
	}

	plan4Achievements(): FormGroup {
		return this.fb.group({
			numberSetting: 0,
			planDetailID: [3, [Validators.required]],
			schoolID: ['', [Validators.required]],
			careerID: ['', [Validators.required]],
			studyPlanID: ['', [Validators.required]],
			courseID: ['', [Validators.required]],
			periodID: ['', [Validators.required]],
			personID: this.user.currentUser.PersonId,
			resultTypeID: ['', [Validators.required]],
			nroSequence: ['', [Validators.required]],
			position: ['C'],
			planDetailSettingDesc: ['', [Validators.required]],
			user: this.user.currentUser.userName,
		});
	}

	public addPlan4AchievementsRow(): void {
		const achievements=<FormArray>this.plan4Form.controls['achievements'];
		achievements.push(this.plan4Achievements());
	}

	public deletePlan4AchievementsRow(i:number): void {
		const array= <FormArray>this.plan4Form.controls['achievements'];
			if (array.length > 1) {
					array.removeAt(i);
			}
	}

	public getPlan4AchievementsRow() {
    return (this.plan4Form.controls['achievements'] as FormArray);
	}

	plan4Data(): FormGroup {
		return this.fb.group({
			numberSetting: 0,
			planDetailID: [0, [Validators.required]],
			schoolID: ['', [Validators.required]],
			careerID: ['', [Validators.required]],
			studyPlanID: ['', [Validators.required]],
			courseID: ['', [Validators.required]],
			periodID: ['', [Validators.required]],
			personID: this.user.currentUser.PersonId,
			resultTypeID: [0, [Validators.required]],
			nroSequence: [0, [Validators.required]],
			position: ['C'],
			planDetailSettingDesc: ['', [Validators.required]],
			user: this.user.currentUser.userName,
		});
	}

	public addPlan4DataRow(): void {
		const data=<FormArray>this.plan4Form.controls['data'];
		data.push(this.plan4Data());
	}

	public getPlan4DataRow() {
    return (this.plan4Form.controls['data'] as FormArray);
	}

	private getPeriods(): void{
		this.charging=true;
    this.api.getPeriods().subscribe({
      next: (res) => {
        this.periods = res.data;
				this.charging=false;
      },
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.charging=false;
			}
    });
	}

	public getSchools(period: Period, event: MatOptionSelectionChange): void{
		if(event.isUserInput){
			this.minDatePlan2= this.datePipe.transform(period.periodDateStart, 'yyyy-MM-dd');
			this.maxDatePlan2= this.datePipe.transform(period.periodDateEnd, 'yyyy-MM-dd');
			this.admin.getSchoolsByPerson(this.user.currentUser.PersonId).subscribe({
				next: (res) => {
					this.schools = res;
				},
				error: (err: HttpErrorResponse) => {
					//console.log('err',err);
				}
			});
		}
	}

	public getCareers(schoolID:number): void{
		this.admin.getCareersByPerson(this.user.currentUser.PersonId, schoolID).subscribe({
			next: (res) => {
				this.careers = res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getStudyPlan(careerID: number): void{
		this.admin.getStudyPlansByCareer(careerID).subscribe({
			next: (res) => {
				this.study_plan = res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getCycles(studyPlanID: number): void{
		this.admin.getCyclesByCareerAndStudyPlan(studyPlanID, this.filtersForm.get('careerID').value).subscribe({
			next: (res: CycleDetail[]) => {
				this.cycleDetail= res;
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	public getModalities(): void{
		this.filtersForm.get('modalityID').patchValue('');
		this.admin.getModalityByCareer(this.filtersForm.get('studyPlanID').value, this.filtersForm.get('careerID').value, this.filtersForm.get('courseID').value).subscribe({
			next: (res) => {
				this.modalities=res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getSubjects(cycleID: number): void{
		let filters= this.filtersForm.value;
		this.admin.getSubjectsByPeriodCareerStudyPlanAndSection(filters.periodID, filters.careerID, filters.studyPlanID, cycleID).subscribe({
			next: (res) => {
				this.subjects = res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getResultType(): void{
		this.admin.getResultType().subscribe({
			next: (res) => {
				this.resultTypeList=res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getUnits(): void{
		this.admin.getUnits().subscribe({
			next: (res) => {
				//console.log('Units', res);
				this.unitsList=res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getHours(): void{
		this.admin.getCourseHours(this.filtersForm.get('studyPlanID').value, this.filtersForm.get('careerID').value, this.filtersForm.get('courseID').value).subscribe({
			next: (res) => {
				//console.log('hours', res);
				setTimeout(() => {
					this.hours=res;
				}, 250);
				//this.filtersForm.disable();
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public wordLimit(input:any, hint:any, limit:number):void{
		let val = input.value
		let words = val.split(/\s+/);
		let legal = "";
		let i;
		for(i = 0; i < words.length; i++) {
				if(i < limit) {
						legal += words[i] + " ";
				}
				if(i >= limit) {
						input.value = legal;
				}
				hint.textContent='Palabras: '+i
		}
	}

	public onSubmitTermsConditions(termsAndConditionsID:number): void{
		let body={
			subjectPlanID: this.subjectPlanID,
			termsAndConditionsID: termsAndConditionsID,
			personID: this.user.currentUser.PersonId,
			periodID: this.filtersForm.get('periodID').value,
			flgPosition: 'C',
			isAgree: 1,
			user: this.user.currentUser.userName
		}
		this.admin.postTermsConditions(body).subscribe({
			next: (res:any) => {
				this.common.message(`PEA registrado correctamente.`,'','success','#86bc57');
				//this.router.navigate(['']);
				this.isLinear = false;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public onSubmitPlan1(): void{
		let obj=[];
		let data=<FormArray>this.plan1Form.controls['data'];
		let achievements=<FormArray>this.plan1Form.controls['achievements'];
		for(let i = 0; i < data.length; i++) {
			data.controls[i].patchValue(this.filtersForm.value)
			data.controls[i].get('planDetailID').patchValue(i+1)
			obj.push(data.controls[i].value)
		}
		for(let i = 0; i < achievements.length; i++) {
			achievements.controls[i].patchValue(this.filtersForm.value)
			achievements.controls[i].get('nroSequence').patchValue(i+1)
			obj.push(achievements.controls[i].value)
		}

		if(this.plan1Form.valid && this.filtersForm.valid){
			this.loadingPlan= true;
			//console.log(obj);
			this.admin.postPlan1({"data":obj}).subscribe({
				next: (res) => {
					//console.log(res);
					//this.initPlan1Form();
					this.isRegistered = false;
					//this.minDatePlan2 = null;
					this.stepperNext();
					this.getResultsLearning();
					this.getSubjectPlan();
					this.getPlan2();
					this.loadingPlan= false;
				},
				error: (err: HttpErrorResponse) => {
					//console.log('err',err);
					this.loadingPlan= false;
					this.common.message(`Error, contacte al administrador.`,'','info','#86bc57');
					this.ngOnInit();
				}
			});
		}else{
			this.filtersForm.markAllAsTouched();
		}
	}

	public weeksBetween() {
		const weeks= <FormArray>this.plan2Form.controls['weeks'];
		if(weeks.controls[0].get('startDateUnit').value){
			weeks.controls[0].get('startDateUnit').clearValidators();
			weeks.controls[0].get('endDateUnit').clearValidators();
			weeks.controls[0].get('startDateUnit').updateValueAndValidity();
			weeks.controls[0].get('endDateUnit').updateValueAndValidity();
			let start: Date= weeks.controls[0].get('startDateUnit').value;
			let end: Date= weeks.controls[0].get('endDateUnit').value;
			//this.getHolidays(this.datePipe.transform(start, 'yyyy-MM-dd'), this.datePipe.transform(end, 'yyyy-MM-dd'));
			this.getWorkWeeks(this.datePipe.transform(start, 'yyyy-MM-dd'), this.datePipe.transform(end, 'yyyy-MM-dd'));
			let result = Math.round((+end - +start) / (24 * 60 * 60 * 1000));
			let r = result.toString();
			//weeks.controls[0].get('numberWeek').patchValue(r);
			this.calendarFlag = 1;
			//console.log(result);
		}else{
			weeks.controls[0].get('startDateUnit').markAllAsTouched();
		}
	}

	public getHolidays(startDate: string | Date, endDate: string | Date): void{
		this.admin.getPlan1Holidays(startDate, endDate).subscribe({
			next: (res: HolidayCount) => {
				//console.log('Holidays', res);
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getWorkWeeks(startDate: string | Date, endDate: string | Date): void{
		this.admin.getPlan1WorkWeeks(startDate, endDate).subscribe({
			next: (res: WorkWeek[]) => {
				//console.log('WorkWeeks', res);
				let weeks= <FormArray>this.plan2Form.controls['weeks'];
				weeks.controls[0].get('numberWeek').patchValue(res[0].workWeeks.toString());
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public onSubmitPlan2(unit: Units): void{
			Swal
			.fire({
					icon: 'question',
					title: "¿Estás seguro de continuar?",
					showCancelButton: true,
					confirmButtonText: "Si",
					cancelButtonText: "No",
					allowOutsideClick: false,
			})
			.then(result => {
				if(result.value){
					let obj=[];
					let weeks=<FormArray>this.plan2Form.controls['weeks'];
					let contents=<FormArray>this.plan2Form.controls['contents'];
					let subcontents=<FormArray>this.plan2Form.controls['subcontents'];
					let teacher=<FormArray>this.plan2Form.controls['teacher'];
					let practice=<FormArray>this.plan2Form.controls['practice'];
					let standAlone=<FormArray>this.plan2Form.controls['standAlone'];
					for(let i = 0; i < weeks.length; i++) {
						weeks.controls[i].patchValue(this.filtersForm.value);
						weeks.controls[i].get('unitID').patchValue(unit.unitID);
						/* if(this.calendarFlag === 0){
							weeks.controls[i].get('startDateUnit').patchValue(formatDate(weeks.controls[i].get('startDateUnit').value, 'yyyy-MM-dd', 'es', '-1000'));
							weeks.controls[i].get('endDateUnit').patchValue(formatDate(weeks.controls[i].get('endDateUnit').value, 'yyyy-MM-dd', 'es', '-1000'));
						} */
						obj.push(weeks.controls[i].value);
					}
					for(let i = 0; i < contents.length; i++) {
						contents.controls[i].patchValue(this.filtersForm.value);
						contents.controls[i].get('unitID').patchValue(unit.unitID);
						obj.push(contents.controls[i].value);
					}
					for(let i = 0; i < subcontents.length; i++) {
						subcontents.controls[i].patchValue(this.filtersForm.value);
						subcontents.controls[i].get('unitID').patchValue(unit.unitID);
						subcontents.controls[i].get('predecessor').patchValue(i+1);
						subcontents.controls[i].get('nroSequence').patchValue(i+1);
						subcontents.controls[i].get('planSubDetailID').patchValue(2);
						obj.push(subcontents.controls[i].value);
					}
					for(let i = 0; i < teacher.length; i++) {
						teacher.controls[i].patchValue(this.filtersForm.value);
						teacher.controls[i].get('unitID').patchValue(unit.unitID);
						teacher.controls[i].get('nroSequence').patchValue(i+1);
						teacher.controls[i].get('planSubDetailID').patchValue(3);
						obj.push(teacher.controls[i].value);
					}
					for(let i = 0; i < practice.length; i++) {
						practice.controls[i].patchValue(this.filtersForm.value);
						practice.controls[i].get('unitID').patchValue(unit.unitID);
						practice.controls[i].get('nroSequence').patchValue(i+1);
						practice.controls[i].get('planSubDetailID').patchValue(4);
						obj.push(practice.controls[i].value);
					}
					for(let i = 0; i < standAlone.length; i++) {
						standAlone.controls[i].patchValue(this.filtersForm.value);
						standAlone.controls[i].get('unitID').patchValue(unit.unitID);
						standAlone.controls[i].get('nroSequence').patchValue(i+1);
						standAlone.controls[i].get('planSubDetailID').patchValue(5);
						obj.push(standAlone.controls[i].value);
					}
					//console.log(this.plan2Form.value);
					if(this.plan2Form.valid && this.filtersForm.valid){
						this.loadingPlan= true;
						this.admin.postPlan2({"data":obj}).subscribe({
							next: (res) => {
								let arr=<FormArray>this.plan2Form.controls['weeks'];
								this.minDatePlan2 = arr.controls[0].get('endDateUnit').value
								//console.log(res);
								arr.controls[0].get('endDateUnit').clearValidators();
								this.getPlan2(unit.unitID+1);
								this.calendarFlag = 0;
								this.nestStepperNext();
								this.loadingPlan= false;
							},
							error: (err: HttpErrorResponse) => {
								//console.log('err',err);
								this.loadingPlan= false;
							}
						});
					}else{
						this.filtersForm.markAllAsTouched();
					}
				}
			});
	}

	public onSubmitPlan4(): void{
		let obj=[];
		let data=<FormArray>this.plan4Form.controls['data'];
		let achievements=<FormArray>this.plan4Form.controls['achievements'];
		for(let i = 0; i < data.length; i++) {
			data.controls[i].patchValue(this.filtersForm.value)
			data.controls[i].get('planDetailID').patchValue(i+9)
			obj.push(data.controls[i].value)
		}
		for(let i = 0; i < achievements.length; i++) {
			achievements.controls[i].patchValue(this.filtersForm.value)
			achievements.controls[i].get('planDetailID').patchValue(13)
			achievements.controls[i].get('nroSequence').patchValue(i+1)
			achievements.controls[i].get('resultTypeID').patchValue(0)
			obj.push(achievements.controls[i].value)
		}

		if(this.plan4Form.valid && this.filtersForm.valid){
			this.loadingPlan= true;
			//console.log(obj);
			this.admin.postPlan1({"data":obj}).subscribe({
				next: (res) => {
					//console.log(res);
					//this.initPlan4Form();
					//this.plan4Form.disable();
					this.stepperNext();
					this.loadingPlan= false;
				},
				error: (err: HttpErrorResponse) => {
					//console.log('err',err);
					this.loadingPlan= false;
				}
			});
		}else{
			this.filtersForm.markAllAsTouched();
		}
	}

	public getList(): void{
		this.admin.getSyllabusSubject(this.filtersForm.get('periodID').value, this.filtersForm.get('studyPlanID').value, this.filtersForm.get('careerID').value, this.filtersForm.get('courseID').value,
		this.actualList, this.pageListLimit).subscribe({
			next: (res) => {
				this.syllabusSubjects=res.data;
				this.countList = res.count;
        if(this.countList<=10){
					this.totalPageList=1
				}else{
					this.totalPageList = Math.ceil(this.countList / 10);
				}
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public changePageList(page:number):void{
		this.actualList = page;
	}

	public stepperNext(): void{
		this.vStepper.next();
	}

	public stepperPrev(): void{
		this.vStepper.previous();
	}

	public nestStepperNext(): void{
		this.nestStepper.next();
	}

	public nestStepperPrev(): void{
		this.nestStepper.previous();
	}

	public getPdf(): void{
		this.admin.getSyllabusSubjecPdfContent(this.filtersForm.get('periodID').value, this.filtersForm.get('studyPlanID').value, this.filtersForm.get('careerID').value,
		this.filtersForm.get('courseID').value, this.user.currentUser.PersonId ,'C').subscribe({
			next: (res) => {
				//console.log(res);
				const blob: Blob = new Blob([res.body], { type: 'application/pdf' });
        const url = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob)));
        if (url) {
          window.open(url, '_blank');
        }
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getResultsLearning(): void{
		this.admin.getResultsLearning(this.filtersForm.get('periodID').value, this.filtersForm.get('schoolID').value, this.filtersForm.get('careerID').value,
		this.filtersForm.get('studyPlanID').value, this.filtersForm.get('courseID').value, 'C').subscribe({
			next: (res) => {
				this.resultLearning = res.filter(obj => obj.periodID === Number(this.filtersForm.get('periodID')?.value));
				// console.log('resultLearning', this.resultLearning);
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getSubjectPlan(): void{
		if (this.getSubjectPlanSubscription) this.getSubjectPlanSubscription.unsubscribe();
		this.getSubjectPlanSubscription = this.admin.getSubjectPlan(this.filtersForm.get('periodID').value, this.filtersForm.get('courseID').value, this.filtersForm.get('studyPlanID').value,
			this.filtersForm.get('careerID').value).subscribe({
			next: (res) => {
				//console.log('subjectPlan', res[0].subjectPlanID);
				this.subjectPlanID=res[0].subjectPlanID;
				this.getPlan1(this.subjectPlanID);
				if(!this.subjectPlanID){
					this.isRegistered = false;
					this.isLinear = true;
					this.initPlan1Form();
				}
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getTermsConditions(): void{
		this.admin.getTermsConditions().subscribe({
			next: (res) => {
				this.termsAndConditions=res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getPlan1SubjectData(): void{
		this.admin.getPlan1SubjectData(this.filtersForm.get('periodID').value, this.filtersForm.get('schoolID').value,
			this.filtersForm.get('careerID').value, this.filtersForm.get('studyPlanID').value, this.filtersForm.get('modalityID').value).subscribe({
			next: (res) => {
				//console.log('subjectData', res);
				if(res.length > 0){
					this.subjectData=res;
					this.minDatePlan2=this.subjectData[0].startDate;
				}
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	/*public getValidateSubjectPlan(): void{
		this.admin.getValidateSubjectPlan(this.filtersForm.get('periodID').value, this.filtersForm.get('courseID').value, this.filtersForm.get('studyPlanID').value,
		this.filtersForm.get('careerID').value).subscribe({
			next: (res) => {
				console.log('Validate', res);
				if(res){
					this.isRegistered = true;
				}else{
					this.isRegistered = false;
				}
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}*/

	public getPlan1(subjectPlanID: number): void{
		//if(this.isRegistered === true){
			this.initPlan1Form();
			this.admin.getPlan1Detail(subjectPlanID, 1, 3,	this.user.currentUser.PersonId).subscribe({
				next: (res: Plan1Detail[]) => {
					//console.log('Plan1,1', res);
					if(res[0]){
						this.getDataRow().controls[0].patchValue(res[0]);
					}else{
						this.initPlan1Form();
					}
				},
				error: (err: HttpErrorResponse) => {
					//console.log('err',err);
					this.initPlan1Form();
				}
			});

			this.admin.getPlan1Detail(this.subjectPlanID, 2, 3,	this.user.currentUser.PersonId).subscribe({
				next: (res: Plan1Detail[]) => {
					//console.log('Plan1,2', res);
					this.getDataRow().controls[1].patchValue(res[0]);
				},
				error: (err: HttpErrorResponse) => {
					//console.log('err',err);
				}
			});

			this.admin.getPlan1Detail(this.subjectPlanID, 3, 3,	this.user.currentUser.PersonId).subscribe({
				next: (res: Plan1Detail[]) => {
					//console.log('Plan1,3', res);
					for(let i=0; i<res.length; i++){
						if(i < res.length-1){
							this.addAchievementsRow();
						}
						this.getAchievementsRow().controls[i].patchValue(res[i]);
					}
				},
				error: (err: HttpErrorResponse) => {
					//console.log('err',err);
				}
			});
			this.isLinear = false;
		//}
	}

	public getPlan2(unitID: number = 1, aux?: number): void{
		this.initPlan2Form();
		for(let i=0; i<5; i++){
			this.admin.getPlan2Detail(this.filtersForm.get('periodID').value, this.subjectPlanID, unitID, i+1).subscribe({
				next: (res: Plan2Detail[]) => {
					//console.log(`Plan2,U${unitID},${i+1}`, res);
					if(unitID < 5 && res.length === 0){
						this.isLinear = true;
					}else{
						if(aux === 0) this.minDatePlan2 = this.subjectData[0].startDate;
						this.plan2Form.setValidators(null);
						if(i+1 === 1){
							let weeks=<FormArray>this.plan2Form.controls['weeks'];
							weeks.controls[0].patchValue(res[0]);
						}else if(i+1 === 2){
							let contents=<FormArray>this.plan2Form.controls['contents'];
							let subcontents=<FormArray>this.plan2Form.controls['subcontents'];
							for(let index=0; index<res.length; index++){
								if(index === 0){
									contents.controls[index].patchValue(res[index]);
								}else{
									if(res.length > index+1) this.addPlan2Row('subcontents', 2);
									subcontents.controls[index-1].patchValue(res[index]);
								}
							}
						}else if(i+1 === 3){
							let teacher=<FormArray>this.plan2Form.controls['teacher'];
							for(let index=0; index<res.length; index++){
								if(res.length > index+1) this.addPlan2Row('teacher', 3);
								teacher.controls[index].patchValue(res[index]);
							}
						}else if(i+1 === 4){
							let practice=<FormArray>this.plan2Form.controls['practice'];
							for(let index=0; index<res.length; index++){
								if(res.length > index+1) this.addPlan2Row('practice', 4);
								practice.controls[index].patchValue(res[index]);
							}
						}else if(i+1 === 5){
							let standAlone=<FormArray>this.plan2Form.controls['standAlone'];
							for(let index=0; index<res.length; index++){
								if(res.length > index+1) this.addPlan2Row('standAlone', 5);
								standAlone.controls[index].patchValue(res[index]);
							}
						}
						this.isLinear = false;
						/*setTimeout(() => {
							this.plan2Form.disable();
						}, 250);*/
					}
				},
				error: (err: HttpErrorResponse) => {
					//console.log('err',err);
				}
			});
		}
	}

	public getPlan4(): void{
		this.initPlan4Form();
		//this.plan4Form.setValidators(null);
		for(let i=0; i<5; i++){
			this.admin.getPlan1Detail(this.subjectPlanID, i+9, 3,	this.user.currentUser.PersonId).subscribe({
				next: (res: Plan1Detail[]) => {
					//console.log(`Plan4,${i+1}`, res);
					if(res.length === 0){
						this.isLinear = true;
					}else{
						if(i < this.getPlan4DataRow().controls.length){
							this.getPlan4DataRow().controls[i].patchValue(res[0]);
						}else{
							for(let index=0; index<res.length; index++){
								if(res.length > index+1) this.addPlan4AchievementsRow();
								this.getPlan4AchievementsRow().controls[index].patchValue(res[index]);
							}
						}
						this.isLinear = false;
						/*setTimeout(() => {
							this.plan4Form.disable();
						}, 750);*/
					}
				},
				error: (err: HttpErrorResponse) => {
					//console.log('err',err);
				}
			});
		}
	}
	public getReportPending(rute: string, fileName: string): void{
		let body= {
				periodID: this.filtersForm.get('periodID').value,
				personID: this.user.currentUser.PersonId
		}
		this.admin.getReportInstruments(rute, body).subscribe({
			next: (res) => {
				if (res.body) {
					const contentType = res.headers.get('content-type') || undefined;

					const blob = new Blob([res.body], { type: contentType });
					const url = this.sanitizer.sanitize(
						SecurityContext.RESOURCE_URL,
						this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob))
					);
					if (url) {
						if(contentType === 'application/pdf'){
							window.open(url, '_blank');
						}else{
							const link = document.createElement('a');
							link.href = url;
							link.download = fileName;
							document.body.appendChild(link);
							link.click();

							// Limpiar memoria
							URL.revokeObjectURL(link.href);
							document.body.removeChild(link);
						}
					}
				}
			},
			error: (err: HttpErrorResponse) => {
				// console.error('Error al obtener el reporte:', err);
				this.snackBar.open(
					`No hay datos disponibles para generar el reporte.`,
					null,
					{
						horizontalPosition: 'center',
						verticalPosition: 'top',
						duration: 4000,
						panelClass: ['red-snackbar']
					}
				);
			}
		});
	}

}
