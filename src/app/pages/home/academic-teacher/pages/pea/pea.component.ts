import { Gap, Plan1Detail, Plan3Detail, Plan5Detail, Plan5Support, TermsAndConditions } from './../../../../../utils/interfaces/others.interfaces';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, SecurityContext, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, FormArray } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { MatNativeDateModule } from '@angular/material/core';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { NgForOf, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatStepperModule } from '@angular/material/stepper';
import { MatStepper } from '@angular/material/stepper';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ResultLearning, SubjectsList } from '@utils/interfaces/others.interfaces';
import { Router } from '@angular/router';
import { UserService } from '@services/user.service';
import { EvaluationCriteria, EvaluationTool, EvaluationType, CourseHours, ProductGenerated, Units, CourseSchedule, settingUnit, Publication, PublicationAvailability } from '@utils/interfaces/campus.interfaces';
import { Partial } from '@utils/interfaces/period.interfaces';
import { DomSanitizer } from '@angular/platform-browser';
import { SlicePipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';

@Component({
  selector: 'app-pea',
  templateUrl: './pea.component.html',
  styleUrls: ['./pea.component.scss'],
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
		SlicePipe,
		MatAutocompleteModule,
		MatSnackBarModule,
		SpinnerLoaderComponent
  ],
	providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: {displayDefaultIndicatorType: false},
    },
  ],
})
export class PeaComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public charging: boolean = false;
	public plan1Form!: FormGroup;
	public plan2Form!: FormGroup;
	public plan3Form!: FormGroup;
	public plan5Form!: FormGroup;
	public supportForm!: FormGroup;
	public gapForm!: FormGroup;
	public unitsList: Units [] = [];
	public evaluationTools: EvaluationTool[];
	public evaluationType: EvaluationType[];
	public partials: Partial[];
	public products: ProductGenerated[];
	public evaluationCriteria: EvaluationCriteria[];
	public subject: SubjectsList;
	public hours: CourseHours[];
	public courseSchedule: CourseSchedule[];
	public week: settingUnit[];
	public contents: settingUnit[];
	public teacherLearning: settingUnit[];
	public practiceLearning: settingUnit[];
	public autonomusLearning: settingUnit[];
	public resultLearning: ResultLearning[];
	public publicationAvailability: PublicationAvailability[];
	public termsAndConditions: TermsAndConditions[];
	public publications: Publication[] = [];
	public subjectPlanID: number;
	public index: number=0;
	public gapFlag: number=0;
	public isRegistered: boolean = true;
	public isLinear = true;
	public isUpdatingGap: boolean= false;
	public loadingPlan: boolean= false;

	@ViewChild('modalClose', { read: ElementRef }) public modalClose: ElementRef;
	@ViewChild('vStepper') private vStepper: MatStepper;
	@ViewChild('plan2Stepper') private plan2Stepper: MatStepper;
	@ViewChild('plan3Stepper') private plan3Stepper: MatStepper;
	private sanitizer: DomSanitizer = inject(DomSanitizer);
	private snackBar: MatSnackBar = inject(MatSnackBar);

	constructor(private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private router: Router,
		private user: UserService ){
		super();
	}

	public ngOnInit(): void {
		this.getUnits();
		this.getEvaluationTools();
		this.getEvaluationTypes();
		this.getSubject();
		this.initPlan5Form();
		this.initGapForm();
		this.initPlan1Form();
		this.initPlan3Form();
  }

  public override ngOnDestroy() {
    super.ngOnDestroy();
  }

	private getSubject(): void{
		this.charging= true;
		this.subject = this.common.sendSubject;
		if(!this.subject){
			this.charging= false;
			this.router.navigate(['/academico-docente/asignaturas']);
		}else{
			this.getPartialsByPeriod();
			this.getSubjectPlan();
			this.getHours();
			this.getResultsLearning();
			this.getPublicationAvailability();
			this.initSupportForm();
			this.getTermsConditions();
			setTimeout(() => {
				this.charging= false;
    	}, 200);
		}
	}

	public initGapForm():void{
		this.gapForm = this.fb.group({
			partialID: ['', [Validators.required]],
			planDetailSettingDesc: ['', [Validators.required]],
			settingUnitsID: ['', [Validators.required]],
			periodID: ['', [Validators.required]],
			teacherID: ['', [Validators.required]],
			unitName: ['', [Validators.required]],
			unitID: ['', [Validators.required]],
			startTime: [''],
			endTime: [''],
			titleGap: ['', [Validators.required]],
			numberPractice: ['', [Validators.required]],
			duration: ['', [Validators.required]],
			objective: ['', [Validators.required]],
			fundaments: ['', [Validators.required]],
			advancePreparation: ['', [Validators.required]],
			tools: ['', [Validators.required]],
			proceduresDevelopmentPractice: ['', [Validators.required]],
			generatedProduct: ['', [Validators.required]],
			safetyRules: ['', [Validators.required]],
			user: this.user.currentUser.userName,
    });
	}

	public initPlan1Form(): void{
		this.plan1Form = this.fb.group({
      data: this.fb.array([
				this.fb.group({
					numberSetting: 0,
					planDetailID: [4, [Validators.required]],
					schoolID: ['', [Validators.required]],
					careerID: ['', [Validators.required]],
					studyPlanID: ['', [Validators.required]],
					courseID: ['', [Validators.required]],
					periodID: ['', [Validators.required]],
					personID: this.user.currentUser.PersonId,
					resultTypeID: [0, [Validators.required]],
					nroSequence: [0, [Validators.required]],
					position: ['D'],
					planDetailSettingDesc: ['', [Validators.required]],
					user: this.user.currentUser.userName,
				}),
				this.fb.group({
					numberSetting: 0,
					planDetailID: [5, [Validators.required]],
					schoolID: ['', [Validators.required]],
					careerID: ['', [Validators.required]],
					studyPlanID: ['', [Validators.required]],
					courseID: ['', [Validators.required]],
					periodID: ['', [Validators.required]],
					personID: this.user.currentUser.PersonId,
					resultTypeID: [0, [Validators.required]],
					nroSequence: [0, [Validators.required]],
					position: ['D'],
					planDetailSettingDesc: ['', [Validators.required]],
					user: this.user.currentUser.userName,
				}),
			]),
    });
	}

	private getPlan1Row() {
    return (this.plan1Form.controls['data'] as FormArray);
	}

	private initSupportForm(): void{
		this.supportForm = this.fb.group({
			data: this.fb.array([
				this.fb.group({
					supportID: 0,
					supportDesc: ['', [Validators.required]],
					bibliographicTypeID: [1, [Validators.required]],
					subjectPlanID: ['', [Validators.required]],
					periodID: ['', [Validators.required]],
					personID: [this.user.currentUser.PersonId, [Validators.required]],
					user: this.user.currentUser.userName,
				}),
				this.fb.group({
					supportID: 0,
					supportDesc: ['', [Validators.required]],
					bibliographicTypeID: [2, [Validators.required]],
					subjectPlanID: ['', [Validators.required]],
					periodID: ['', [Validators.required]],
					personID: [this.user.currentUser.PersonId, [Validators.required]],
					user: this.user.currentUser.userName,
				})
			])
    });
	}

	private getSupportFormRow() : FormArray {
    return (this.supportForm.controls['data'] as FormArray);
	}

	private initPlan2Form(){
		this.plan2Form = this.fb.group({
      data: this.fb.array([
				this.fb.group({
					detailName: ['', [Validators.required]],
					endDateUnit: ['', [Validators.required]],
					hours: ['', [Validators.required]],
					numberSetting: ['', [Validators.required]],
					numberWeek: ['', [Validators.required]],
					settingUnitDesc: [''],
					settingUnitsID: ['', [Validators.required]],
					startDateUnit: ['', [Validators.required]],
					unitID: ['', [Validators.required]],
					user: this.user.currentUser.userName,
					periodID: this.subject.periodID,
					teacherID: ['', [Validators.required]],
				}),
			]),
			teacher: this.fb.array([]),
			practice: this.fb.array([]),
			autonomus: this.fb.array([]),
    });
	}

	public plan2Row(): FormGroup {
    return this.fb.group({
			detailName: ['', [Validators.required]],
			endDateUnit: ['', [Validators.required]],
			hours: ['', [Validators.required]],
			numberSetting: ['', [Validators.required]],
			numberWeek: ['', [Validators.required]],
			settingUnitDesc: [''],
			settingUnitsID: ['', [Validators.required]],
			startDateUnit: ['', [Validators.required]],
			unitID: ['', [Validators.required]],
			user: this.user.currentUser.userName,
			periodID: this.subject.periodID,
			teacherID: ['', [Validators.required]],
		});
	}

	public getPlan2Row(control:string) {
    return (this.plan2Form.controls[control] as FormArray);
	}

	public addPlan2Row(control:string) {
    const Array=<FormArray>this.plan2Form.controls[control];
        Array.push(this.plan2Row());
	}

	private initPlan3Form(){
		this.plan3Form = this.fb.group({
			rows: this.fb.array([
				this.fb.group({
					learningResultID: 0,
					productGenerated: ['', [Validators.required]],
					evaluationCriteria: ['', [Validators.required]],
					evaluationToolID: ['', [Validators.required]],
					evaluationID: ['', [Validators.required]],
					evaluationTypeID: ['', [Validators.required]],
					subjectPlanID: ['', [Validators.required]],
					unitID: ['', [Validators.required]],
					periodID: ['', [Validators.required]],
					personID: ['', [Validators.required]],
					user: this.user.currentUser.userName,
				})
		])
    });
	}

	plan3Row(): FormGroup {
		return this.fb.group({
			learningResultID: 0,
			productGenerated: ['', [Validators.required]],
			evaluationCriteria: ['', [Validators.required]],
			evaluationToolID: ['', [Validators.required]],
			evaluationID: ['', [Validators.required]],
			evaluationTypeID: ['', [Validators.required]],
			subjectPlanID: ['', [Validators.required]],
			unitID: ['', [Validators.required]],
			periodID: ['', [Validators.required]],
			personID: ['', [Validators.required]],
			user: this.user.currentUser.userName,
		});
	}

	public deletePlan3Row(i:number): void {
		const array= <FormArray>this.plan3Form.controls['rows'];
			if (array.length > 1) {
					array.removeAt(i);
			}
	}

	public addPlan3Row(): void {
		const array=<FormArray>this.plan3Form.controls['rows'];
		array.push(this.plan3Row());
	}

	public getPlan3Row() {
    return (this.plan3Form.controls['rows'] as FormArray);
	}

	public initPlan5Form():void{
		this.plan5Form = this.fb.group({
      basics: this.fb.array([
				this.fb.group({
					bibliographyID: 0,
					search: [null],
					author: [null, [Validators.required]],
					year: [null, [Validators.required]],
					title: [null, [Validators.required]],
					titlePublicationID: ['', [Validators.required]],
					city: [null, [Validators.required]],
					availabilityID: [null, [Validators.required]],
					editorial: [null, [Validators.required]],
					bibliographicTypeID: [1, [Validators.required]],
				})
			]),
			references: this.fb.array([
				this.fb.group({
					bibliographyID: 0,
					search: [null],
					author: [null, [Validators.required]],
					year: [null, [Validators.required]],
					title: [null, [Validators.required]],
					titlePublicationID: ['', [Validators.required]],
					city: [null, [Validators.required]],
					availabilityID: [null, [Validators.required]],
					editorial: [null, [Validators.required]],
					bibliographicTypeID: [2, [Validators.required]],
				})
			]),
    });

		this.addReferencesRow();
	}

	plan5RowBasics(): FormGroup {
		return this.fb.group({
			bibliographyID: 0,
			search: [null],
			author: [null, [Validators.required]],
			year: [null, [Validators.required]],
			title: [null, [Validators.required]],
			titlePublicationID: ['', [Validators.required]],
			city: [null, [Validators.required]],
			availabilityID: [null, [Validators.required]],
			editorial: [null, [Validators.required]],
			bibliographicTypeID: [1, [Validators.required]]
		});
	}

	plan5RowReferences(): FormGroup {
		return this.fb.group({
			bibliographyID: 0,
			search: [null],
			author: [null, [Validators.required]],
			year: [null, [Validators.required]],
			title: [null, [Validators.required]],
			titlePublicationID: ['', [Validators.required]],
			city: [null, [Validators.required]],
			availabilityID: [null, [Validators.required]],
			editorial: [null, [Validators.required]],
			bibliographicTypeID: [2, [Validators.required]]
		});
	}

	public addBasicsRow(): void {
		const basicsArray=
				<FormArray>this.plan5Form.controls['basics'];
				basicsArray.push(this.plan5RowBasics());
	}

	public getBasicsRow() {
    return (this.plan5Form.controls['basics'] as FormArray);
	}

	public addReferencesRow(): void {
		const referencesArray = <FormArray>this.plan5Form.controls['references'];
		referencesArray.push(this.plan5RowReferences());

	}

	public getReferencesRow() {
    return (this.plan5Form.controls['references'] as FormArray);
	}

	public deleteBasicsRow(i:number): void {
		const array= <FormArray>this.plan5Form.controls['basics'];
			if (array.length > 1) {
					array.removeAt(i);
			}
	}

	public deleteReferencesRow(i:number): void {
		const array= <FormArray>this.plan5Form.controls['references'];
			if (array.length > 1) {
					array.removeAt(i);
			}
	}

	public onSubmitPlan5(): void{
		let support = this.getSupportFormRow();
		for(let i=0; i<support.length; i++){
			support.controls[i].get('subjectPlanID').patchValue(this.subjectPlanID);
			support.controls[i].get('periodID').patchValue(this.subject.periodID);
		}
		//console.log(this.plan5Form.value, this.supportForm.value);
		if(this.plan5Form.valid && this.supportForm.valid){
			let basics=this.getBasicsRow();
			let references=this.getReferencesRow();
			let body=[];
			for(let i=0; i<basics.length; i++){
				let obj={
					bibliographyID: basics.controls[i].get('bibliographyID').value,
					periodID: this.subject.periodID,
					subjectPlanID: this.subjectPlanID,
					personID: this.user.currentUser.PersonId,
					publicationID: basics.controls[i].get('titlePublicationID').value,
					bibliographicTypeID: basics.controls[i].get('bibliographicTypeID').value,
					user: this.user.currentUser.userName
				}
				body.push(obj);
			}
			for(let i=0; i<references.length; i++){
				let obj={
					bibliographyID: references.controls[i].get('bibliographyID').value,
					periodID: this.subject.periodID,
					subjectPlanID: this.subjectPlanID,
					personID: this.user.currentUser.PersonId,
					publicationID: references.controls[i].get('titlePublicationID').value,
					bibliographicTypeID: references.controls[i].get('bibliographicTypeID').value,
					user: this.user.currentUser.userName
				}
				body.push(obj);
			}
			this.loadingPlan= true;
			this.admin.postPublication({'data': body}).subscribe({
				next: (res:any) => {
					this.onSubmitSupport();
					//this.plan5Form.disable();
					this.loadingPlan= false;
				},
				error: (err: HttpErrorResponse) => {
					////console.log('err',err);
					this.loadingPlan= false;
				}
			});
		}else{
			this.plan5Form.markAllAsTouched();
			this.supportForm.markAllAsTouched();
		}
	}

	private onSubmitSupport(): void{
		this.loadingPlan= true;
		this.admin.postSupport(this.supportForm.value).subscribe({
			next: (res) => {
				//this.supportForm.disable();
				this.loadingPlan= false;
				this.stepperNext();
			},
			error: (err: HttpErrorResponse) => {
				////console.log('err',err);
				this.loadingPlan= false;
			}
		});
	}

	public onSubmitTermsConditions(termsAndConditionsID: number): void{
		let body={
			subjectPlanID: this.subjectPlanID,
			termsAndConditionsID: termsAndConditionsID,
			personID: this.user.currentUser.PersonId,
			periodID: this.subject.periodID,
			flgPosition: 'D',
			isAgree: 1,
			user: this.user.currentUser.userName
		}
		this.admin.postTermsConditions(body).subscribe({
			next: (res:any) => {
				this.common.message(`PEA registrado correctamente.`,'','success','#86bc57');
				//this.router.navigate(['/academico-docente/asignaturas']);
				this.isLinear = false;
			},
			error: (err: HttpErrorResponse) => {
				////console.log('err',err);
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

	public onSubmitPlan1(): void{
		let obj=[];
		let data=<FormArray>this.plan1Form.controls['data'];
		for(let i = 0; i < data.length; i++) {
			data.controls[i].patchValue(this.subject)
			obj.push(data.controls[i].value)
		}

		if(this.plan1Form.valid){
			this.loadingPlan= true;
			//console.log(obj);
			this.admin.postPlan1({"data":obj}).subscribe({
				next: (res) => {
					//console.log(res);
					//this.plan1Form.disable();
					this.stepperNext();
					this.loadingPlan= false;
				},
				error: (err: HttpErrorResponse) => {
					//console.log('err',err);
					this.loadingPlan= false;
					this.common.message(`Error, contacte al administrador.`,'','info','#86bc57');
					this.router.navigate(['/academico-docente/asignaturas']);
				}
			});
		}
	}

	public onSubmitPlan2(index?: number): void{
		if(this.getPlan2Row('data').valid){
			if(this.gapFlag > 0){
				this.loadingPlan= true;
				this.admin.putPlan2({"data" :this.getPlan2Row('data').value}).subscribe({
					next: (res) => {
						this.index++;
						this.getSubContents();
						this.plan2Stepper.next();
						setTimeout(() => {
							this.setSubContents(this.index);
							this.loadingPlan= false;
						}, 250);
					},
					error: (err: HttpErrorResponse) => {
						//console.log('err',err);
						this.loadingPlan= false;
					}
				});
			}else{
				this.common.message(`Debe ingresar un GAP`,'','info','#86bc57');
			}
		}
	}

	public onSubmitPlan3(unitID: number): void{
		let obj=[];
		let rows=<FormArray>this.plan3Form.controls['rows'];
		for(let i = 0; i < rows.length; i++) {
			rows.controls[i].patchValue(this.subject);
			rows.controls[i].get('subjectPlanID').patchValue(this.subjectPlanID);
			rows.controls[i].get('unitID').patchValue(unitID);
			obj.push(rows.controls[i].value);
		}

		if(this.plan3Form.valid){
			this.loadingPlan= true;
			this.admin.postPlan3({"data": obj}).subscribe({
				next: (res) => {
					//console.log(res);
					this.initPlan3Form();
					this.getPlan3(unitID+1);
					this.plan3Stepper.next();
					this.loadingPlan= false;
				},
				error: (err: HttpErrorResponse) => {
					//console.log('err',err);
					this.loadingPlan= false;
				}
			});
		}
	}

	public onSubmitGap():void{
		this.gapForm.patchValue(this.subject);
		if(this.gapForm.valid){
			//console.log(this.gapForm.value)
			this.admin.postGap(this.gapForm.value).subscribe({
				next: (res:any) => {
					this.common.message(`${res.message}`,'','success','#86bc57');
					this.gapFlag++;
					this.modalClose.nativeElement.click();
					this.initGapForm();
				},
				error: (err: HttpErrorResponse) => {
					////console.log('err',err);
					this.snackBar.open(
						`${err.error.message}`,
						null,
						{
							horizontalPosition: 'center',
							verticalPosition: 'top',
							duration: 4000,
							panelClass: ['red-snackbar']
						}
					);
					//this.modalClose.nativeElement.click();
					this.initGapForm();
				}
			});
		}else{
			this.gapForm.markAllAsTouched();
		}
	}

	public getHours(): void{
		this.admin.getCourseHours(this.subject.studyPlanID, this.subject.careerID, this.subject.courseID).subscribe({
			next: (res) => {
				this.hours=res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getUnits(): void{
		this.admin.getUnits().subscribe({
			next: (res) => {
				//console.log('units', res);
				this.unitsList=res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getEvaluationTools(): void{
		this.admin.getEvaluationTools().subscribe({
			next: (res) => {
				//console.log('evaluationTools', res);
				this.evaluationTools=res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getEvaluationTypes(): void{
		this.admin.getEvaluationTypes().subscribe({
			next: (res) => {
				//console.log('evaluationType', res);
				this.evaluationType=res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getPartialsByPeriod(): void{
		this.api.getPartialsByPeriod(this.subject.periodID).subscribe({
			next: (res) => {
				//console.log(res);
				this.partials=res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getSubjectPlan(): void{
		this.admin.getSubjectPlan(this.subject.periodID, this.subject.courseID, this.subject.studyPlanID, this.subject.careerID).subscribe({
			next: (res) => {
				this.subjectPlanID=res[0].subjectPlanID;
				this.getSubContents();
				this.getCourseSchedule();
				setTimeout(() => {
					this.setSubContents(this.index);
				}, 1500);
				this.getPlan1();
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getProductGenerated(unitID:number){
		this.admin.getProductGenerated(this.subject.periodID, this.subject.courseID, this.subject.studyPlanID, this.subject.careerID, unitID).subscribe({
			next: (res) => {
				this.products=res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getEvaluationCriteria(unitID:number){
		this.admin.getEvaluationCriteria(this.subject.periodID, this.subject.courseID, this.subject.studyPlanID, this.subject.careerID, unitID).subscribe({
			next: (res) => {
				this.evaluationCriteria=res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getCourseSchedule(){
		this.admin.getCourseSchedule(this.subject.personID, this.subject.periodID, this.subjectPlanID).subscribe({
			next: (res) => {
				//console.log(res);
				this.courseSchedule=res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getSubContents(){
		this.admin.getCourseScheduleWeeks(this.subject.personID, this.subject.periodID, this.subjectPlanID).subscribe({
			next: (res) => {
				//console.log('subContents' ,res);
				this.week=res;
				this.initPlan2Form();
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});

		this.getCourseScheduleByUnit(this.index+1);
	}

	public getCourseScheduleByUnit(unit:number){
		this.admin.getCourseScheduleContents(this.subject.personID, this.subject.periodID, this.subjectPlanID).subscribe({
			next: (res) => {
				this.contents=res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});

		this.admin.getCourseScheduleTeacher(this.subject.personID, this.subject.periodID, this.subjectPlanID).subscribe({
			next: (res) => {
				//console.log('teacherLearning', res);
				this.teacherLearning=res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});

		this.admin.getCourseSchedulePractice(this.subject.personID, this.subject.periodID, this.subjectPlanID).subscribe({
			next: (res) => {
				//console.log('practiceLearning', res);
				this.practiceLearning=res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});

		this.admin.getCourseScheduleAutonomus(this.subject.personID, this.subject.periodID, this.subjectPlanID).subscribe({
			next: (res) => {
				//console.log('autonomusLearning', res);
				this.autonomusLearning=res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getGapHeader(unitID: number, index: number){
		//console.log('gapUnit', unitID);
		this.isUpdatingGap= false;
		this.gapForm.reset();
		let settingUnitID;
		for(let i=0; i<this.week.length; i++){
			if(this.week[i].unitID === unitID){
				settingUnitID = this.week[i].settingUnitsID;
			}
		}
		this.admin.getGapHeader(settingUnitID, unitID, this.subject.periodID, this.subject.personID, this.subjectPlanID).subscribe({
			next: (res) => {
				//console.log('GAP', res);
				this.gapForm.patchValue(res[0]);
				this.gapForm.get('teacherID').patchValue(this.teacherLearning[0].teacherID);
				this.getValidateGap(unitID)
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getClickedPublication(item: Publication, i: number, row: string, event: MatOptionSelectionChange): void {
		let control = this.plan5Form.controls[row] as FormArray;
		if(event.isUserInput){
			control.controls[i].get('title').patchValue(item.title);
			control.controls[i].get('titlePublicationID').patchValue(item.titlePublicationID);
			control.controls[i].get('availabilityID').reset();
		}
	}

	public getPublication(title:string, i?:number, row?:string){
		let control = this.plan5Form.controls[row] as FormArray;
		this.admin.getPublication(control.controls[i].get('search').value).subscribe({
			next: (res) => {
				//console.log(res);
				this.publications= res;
			},
			error: (err: HttpErrorResponse) => {
				////console.log('err',err);
				control.controls[i].get('title').patchValue('');
				control.controls[i].get('titlePublicationID').patchValue('');
				control.controls[i].get('availabilityID').reset();
			}
		});
	}

	public getPublicationAvailability(){
		this.admin.getPublicationAvailability().subscribe({
			next: (res) => {
				this.publicationAvailability=res;
			},
			error: (err: HttpErrorResponse) => {
				////console.log('err',err);
			}
		});
	}

	public getBibliography(event:MatSelectChange, i:number, row:string){
		let control = this.plan5Form.controls[row] as FormArray;
		let titlePublicationID = control.controls[i].get('titlePublicationID').value;
		if(titlePublicationID==''){
			control.controls[i].get('title').markAllAsTouched();
			control.controls[i].get('availabilityID').patchValue('');
		}else{
			this.admin.getBibliography(titlePublicationID, event.value).subscribe({
				next: (res) => {
					//console.log(res);
					if(res.length > 0){
						control.controls[i].get('author').patchValue(res[0].authors[0].authorName);
						control.controls[i].get('year').patchValue(res[0].publicationYear);
						control.controls[i].get('city').patchValue(res[0].cityCountryDesc);
						control.controls[i].get('editorial').patchValue(res[0].editorialDesc);
					}else{
						control.controls[i].get('author').patchValue('');
						control.controls[i].get('year').patchValue('');
						control.controls[i].get('city').patchValue('');
						control.controls[i].get('editorial').patchValue('');
					}
				},
				error: (err: HttpErrorResponse) => {
					////console.log('err',err);
				}
			});
		}
	}

	public setSubContents(index:number): void{
		this.initPlan2Form();
		//console.log('unit', index+1);
		this.index=index;
		let data=this.getPlan2Row('data');
		let teacher=this.getPlan2Row('teacher');
		let practice=this.getPlan2Row('practice');
		let autonomus=this.getPlan2Row('autonomus');
		data.controls[0].patchValue(this.week[index]);
		let d_index=0;
		let p_index=0;
		let a_index=0;
		for(let i=0; i<this.teacherLearning.length; i++){
			if(this.teacherLearning[i].unitID === index+1){
				this.addPlan2Row('teacher');
				teacher.controls[d_index].patchValue(this.teacherLearning[i]);
				d_index++;
			}
		}

		for(let i=0; i<this.practiceLearning.length; i++){
			if(this.practiceLearning[i].unitID === index+1){
				this.addPlan2Row('practice');
				practice.controls[p_index].patchValue(this.practiceLearning[i]);
				p_index++;
			}
		}

		for(let i=0; i<this.autonomusLearning.length; i++){
			if(this.autonomusLearning[i].unitID === index+1){
				this.addPlan2Row('autonomus');
				autonomus.controls[a_index].patchValue(this.autonomusLearning[i]);
				a_index++;
			}
		}
	}

	public weeksBetween() {
		let data=this.getPlan2Row('data');
		let start:Date=data.controls[0].get('startDateUnit').value;
		let end:Date=data.controls[0].get('endDateUnit').value;
		let result = Math.round((+end - +start) / (7 * 24 * 60 * 60 * 1000));
		let r = result.toString();
		data.controls[0].get('numberWeek').patchValue(r);
		//console.log(data.controls[0].get('numberWeek').value)
	}

	public stepperNext(): void{
		this.vStepper.next();
	}

	public stepperPrev(): void{
		this.vStepper.previous();
	}

	public plan2StepperNext(): void{
		this.plan2Stepper.next();
	}

	public plan2StepperPrev(): void{
		this.plan2Stepper.previous();
	}

	public plan3StepperNext(): void{
		this.plan3Stepper.next();
	}

	public plan3StepperPrev(): void{
		this.plan3Stepper.previous();
	}


	public getPdf(): void{
		this.admin.getSyllabusSubjecPdfContent(this.subject.periodID, this.subject.studyPlanID, this.subject.careerID,
		this.subject.courseID, this.user.currentUser.PersonId, 'D').subscribe({
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
		this.admin.getResultsLearning(this.subject.periodID, this.subject.schoolID, this.subject.careerID,
		this.subject.studyPlanID, this.subject.courseID, 'C').subscribe({
			next: (res) => {
				this.resultLearning= res.filter(obj => obj.periodID === this.subject.periodID);
				if(this.resultLearning.length === 0){
					this.common.message(`El PEA aún no esta habilitado, contáctese con el coordinador de carrera.`,'','info','#86bc57');
					this.router.navigate(['/academico-docente/asignaturas']);
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

	public getValidateGap(unitID: number): void{
		this.admin.getValidateGap(this.subject.periodID, this.subject.schoolID, this.subject.careerID, this.subject.studyPlanID, this.subject.courseID,
			this.user.currentUser.PersonId, unitID).subscribe({
			next: (res) => {
				//console.log(res);
				if(res != null){
					this.gapFlag++;
					/*setTimeout(() => {
						this.modalClose.nativeElement.click();
					}, 500);*/
					this.snackBar.open(
						`EL GAP ya ha sido ingresado.`,
						null,
						{
							horizontalPosition: 'center',
							verticalPosition: 'top',
							duration: 3000,
							panelClass: ['green-snackbar']
						}
					);
					this.getGapByUnit(unitID);
				}
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public validatePracticeGap(): void {
		if(!this.gapFlag) this.admin.validatePracticeGap(
		this.subject.periodID, this.subject.schoolID, this.subject.careerID, this.subject.studyPlanID, this.subject.courseID).subscribe({
			next: (res) => {
				//console.log(res);
				this.gapFlag++;
				this.onSubmitPlan2();
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.snackBar.open(
					`${err.error.message}`,
					null,
					{
						horizontalPosition: 'center',
						verticalPosition: 'top',
						duration: 3000,
						panelClass: ['red-snackbar']
					}
				);
			}
		})
		else this.onSubmitPlan2();
	}

	private getGapByUnit(unitID: number): void {
		this.admin.getGapByUnit(this.subject.periodID, this.subject.schoolID, this.subject.careerID, this.subject.studyPlanID, this.subject.courseID,
			this.user.currentUser.PersonId, unitID, this.subject.parallelCode).subscribe({
			next: (res: Gap[]) => {
				if(res[0]){
					//console.log('GapUnit '+unitID, res);
					this.gapForm.patchValue(res[0]);
					this.isUpdatingGap= true;
				}else{
					this.isUpdatingGap= false;
				}
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getPlan1(): void{
		this.initPlan1Form();
		this.admin.getPlan1Detail(this.subjectPlanID, 4, 1,	this.user.currentUser.PersonId).subscribe({
			next: (res: Plan1Detail[]) => {
				//console.log('Plan1,1', res);
				if(res.length > 0){
					this.getPlan1Row().controls[0].patchValue(res[0]);
				}else{
					this.isRegistered = false;
					this.isLinear = true;
				}
			},
			error: (err: HttpErrorResponse) => {
				////console.log('err',err);
			}
		});
		this.admin.getPlan1Detail(this.subjectPlanID, 5, 1,	this.user.currentUser.PersonId).subscribe({
			next: (res: Plan1Detail[]) => {
				//console.log('Plan1,2', res);
				if(res.length > 0){
					this.getPlan1Row().controls[1].patchValue(res[0]);
					this.isRegistered = true;
				}else{
					this.isRegistered = false;
					this.isLinear = true;
				}
			},
			error: (err: HttpErrorResponse) => {
				////console.log('err',err);
			}
		});
		setTimeout(() => {
			if(this.isRegistered === true){
				this.isLinear = false;
				//this.plan1Form.disable();
			}
		}, 400);
	}

	public getPlan3(unitID:number = 1): void{
		this.initPlan3Form();
		if(unitID < 5){
			this.admin.getPlan3Detail(this.subject.periodID, this.subjectPlanID, unitID, this.user.currentUser.PersonId, 'D').subscribe({
				next: (res: Plan3Detail[]) => {
					//console.log(`Plan3,U${unitID}`, res);
					if(res.length > 0){
						for(let i=0; i<res.length; i++){
							if(i>0) this.addPlan3Row();
							this.getPlan3Row().controls[i].patchValue(res[i]);
						}
						this.isRegistered = true;
						this.isLinear = false;
						//this.plan3Form.disable();
					}else{
						this.isRegistered = false;
						this.isLinear = true;
					}
				},
				error: (err: HttpErrorResponse) => {
					////console.log('err',err);
				}
			});
		}
	}

	public getPlan5(): void{
		this.initPlan5Form();
		this.admin.getPlan5Detail(this.subject.periodID, this.subject.studyPlanID, this.subject.careerID, this.subject.courseID,
			this.user.currentUser.PersonId, 'D').subscribe({
			next: (res: Plan5Detail[]) => {
				//console.log(`Plan5`, res);
				if(res.length > 0){
					this.isRegistered = true;
					this.isLinear = false;
					this.deleteReferencesRow(1);
					let basics: Plan5Detail[] = [];
					let references: Plan5Detail[] = [];
					for(let i=0; i<res.length; i++){
						if(res[i].bibliographicTypeID === 1){
							basics.push(res[i]);
						}else if(res[i].bibliographicTypeID === 2){
							references.push(res[i]);
						}
					}
					setTimeout(() => {
						for(let i=0; i<basics.length; i++){
							if(i > 0) this.addBasicsRow();
							this.getBasicsRow().controls[i].patchValue(basics[i]);
						}
						for(let i=0; i<references.length; i++){
							if(i > 0) this.addReferencesRow();
							this.getReferencesRow().controls[i].patchValue(references[i]);
						}
						//this.plan5Form.disable();
					}, 150);
					//console.log('basics', basics);
					//console.log('references', references);
					this.getPlan5Support();
				}else{
					this.isRegistered = false;
					this.isLinear = true;
				}
			},
			error: (err: HttpErrorResponse) => {
				////console.log('err',err);
			}
		});
	}

	public getPlan5Support(): void{
		this.admin.getPlan5Support(this.subject.periodID, this.subject.studyPlanID, this.subject.careerID, this.subject.courseID,
			this.user.currentUser.PersonId, 'D').subscribe({
			next: (res: Plan5Support[]) => {
				//console.log(`Plan5Support`, res);
				for(let i=0; i<this.getSupportFormRow().length; i++){
					this.getSupportFormRow().controls[i].patchValue(res[i]);
				}
				//this.supportForm.disable();
			},
			error: (err: HttpErrorResponse) => {
				////console.log('err',err);
			}
		});
	}

}
