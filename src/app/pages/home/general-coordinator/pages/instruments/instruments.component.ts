import { Component, ViewChild, ElementRef, OnInit, OnDestroy, SecurityContext, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, FormArray } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { HttpErrorResponse } from '@angular/common/http';
import { map, Subscription } from 'rxjs';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { UserService } from '@services/user.service';
import { NgForOf, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { InputSearchComponent } from '@components/input-shearch/input-search.component';
import { ButtonArrowComponent } from '@components/button-arrow/button-arrow.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Period } from '@utils/interfaces/period.interfaces';
import { CurrentPeriod, InstrumentEvaluationActivity, InstrumentEvaluationComponent, InstrumentEvaluationType, TypeOptions } from '@utils/interfaces/others.interfaces';
import { EvaluationInstrumentsReport, SPGetModality } from '@utils/interfaces/campus.interfaces';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatOptionSelectionChange } from '@angular/material/core';

@Component({
  selector: 'app-instruments',
  standalone: true,
  templateUrl: './instruments.component.html',
  styleUrls: ['./instruments.component.css'],
	imports: [
		NgIf,
		NgForOf,
		ReactiveFormsModule,
		MatInputModule,
		MatButtonModule,
		MatFormFieldModule,
		MatSelectModule,
		InputSearchComponent,
		ButtonArrowComponent,
		MatTooltipModule,
		MatIconModule,
		MatSnackBarModule
	],
})
export class InstrumentsComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public charging: boolean = false;
	public filtersForm!: FormGroup;
	public scalesForm!: FormGroup;
	public elementsForm!: FormGroup;
	public periods: Period[] = [];
	public currentPeriod: CurrentPeriod;
	public types: TypeOptions[] = [];
	public modalities: SPGetModality[] = [];
	public instrumentEvaluationTypes: InstrumentEvaluationType[] = [];
	public instrumentEvaluationActivities: InstrumentEvaluationActivity[] = [];
	public instrumentEvaluationComponents: InstrumentEvaluationComponent[] = [];
	public isCreating: boolean= false;
	public isActivitiesActive: number= 0;
	public isComponentsActive: number= 0;
	public evaluationInstrumentsReport: EvaluationInstrumentsReport[] = [];

	private postEvaluationInstrumentSubscription!: Subscription;
	private postRatingScaleSubscription!: Subscription;
	private postEquivalenceScalesSubscription!: Subscription;
	private postInstrumentsContentSubscription!: Subscription;
	postInstrumentsContentSettingSubscription!: Subscription;
	private sanitizer: DomSanitizer = inject(DomSanitizer);
	private snackBar: MatSnackBar = inject(MatSnackBar);

	constructor( private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService,
		private activatedRoute: ActivatedRoute, ){
		super();
	}

	ngOnInit(): void {
		this.initForm();
		this.initScalesForm();
		this.initElementsForm();
		this.getDataFromResolver();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	private getDataFromResolver(): void {
    this.activatedRoute.data.pipe(untilComponentDestroyed(this),
    map((value: any) => value['resolver'])).subscribe({
			next: (value: { periods: Period[], currentPeriod: CurrentPeriod, types: TypeOptions[], modalities: SPGetModality[],
			instrumentEvaluationTypes: InstrumentEvaluationType[], instrumentEvaluationActivities: InstrumentEvaluationActivity[],
			instrumentEvaluationComponents: InstrumentEvaluationComponent[] }) => {
				this.periods= value.periods,
				this.currentPeriod= value.currentPeriod
				this.types = value.types;
				this.modalities = value.modalities;
				this.instrumentEvaluationTypes = value.instrumentEvaluationTypes;
				this.instrumentEvaluationActivities = value.instrumentEvaluationActivities;
				this.instrumentEvaluationComponents = value.instrumentEvaluationComponents;
			},
    });
		this.filtersForm.get('periodID').patchValue(this.currentPeriod.periodID);
  }

	public initForm():void{
    this.filtersForm = this.fb.group({
			evaluationInstrumentsID: '',
			typeEvaluationInstrumentID: ['', [Validators.required]],
      periodID: ['', [Validators.required]],
			modalityID: [0],
			indications: ['', [Validators.required]],
			evaluationName: ['', [Validators.required]],
			activityID: [null],
			componentID: [null],
			user: this.user.currentUser.userName,
			evaluationOrFollowup: ['', [Validators.required]],
    });
	}

	private initScalesForm(){
		this.scalesForm = this.fb.group({
			rows: this.fb.array([
				this.fb.group({
					ratingScaleID: '',
					evaluationInstrumentsID: '',
					periodID: '',
					ratingName: ['', [Validators.required]],
					equivalence: ['', [Validators.required, Validators.max(10), Validators.min(0)]],
					equivalenceDesc: [''],
					userCreated: this.user.currentUser.userName,
				})
			])
    });
	}

	private scalesRow(): FormGroup {
		return this.fb.group({
			ratingScaleID: '',
			evaluationInstrumentsID: '',
			periodID: '',
			ratingName: ['', [Validators.required]],
			equivalence: ['', [Validators.required]],
			equivalenceDesc: [''],
			userCreated: this.user.currentUser.userName,
		});
	}

	public addScalesRow(): void {
		const array= <FormArray>this.scalesForm.controls['rows'];
		array.push(this.scalesRow());
	}

	public deleteScalesRow(i: number): void {
		const array= <FormArray>this.scalesForm.controls['rows'];
		if (array.length > 1) array.removeAt(i);
	}

	public getScalesRow(): FormArray {
    return (this.scalesForm.controls['rows'] as FormArray);
	}

	private initElementsForm(): void{
		this.elementsForm = this.fb.group({});
	}

	public getElementsForm() {
		//console.log(Object.keys(this.elementsForm.controls));
		return Object.keys(this.elementsForm.controls);
	}

	private elementsRow(): FormGroup {
		return this.fb.group({
			questionsDesc: ['', [Validators.required]],
			user: this.user.currentUser.userName,
		});
	}

	private optionsRow(id: number, desc: string): FormGroup {
		return this.fb.group({
			assessmentDesc: [desc, [Validators.required]],
			typeOptionsID: id,
			settingContentInstrumentsID: '',
			userCreated: this.user.currentUser.userName
		})
	}

	public addElementsArray(name: string, input: HTMLInputElement): void {
		if(!this.elementsForm.get(name)){
			this.isCreating= true;
			this.elementsForm.addControl(`${name}`, this.fb.group({
				options: this.fb.array([]),
				elements: this.fb.array([]),
				typeOptionsID: [1, [Validators.required]]
			}));
			this.addElementsRow(name);
			this.addOptionsRow(name, 0, 1, 'valoración');
			input.value= '';
			setTimeout(() => {
				this.isCreating= false;
			}, 100);
		}else{
			this.snackBar.open(
				`${name} ya fue agregado.`,
				null,
				{
					horizontalPosition: 'center',
					verticalPosition: 'top',
					duration: 4000,
					panelClass: ['red-snackbar']
				}
			);
			input.value= '';
		}
	}

	public getTypeOptionsID(control: string): number {
		return this.elementsForm.controls[control].get('typeOptionsID').value;
	}

	public deleteElementsArray(name: string): void {
		this.elementsForm.removeControl(name);
	}

	public addElementsRow(control: string): void {
		const array= <FormArray>this.elementsForm.controls[control].get('elements');
		array.push(this.elementsRow());
	}

	public deleteElementsRow(i: number, control: string): void {
		const array= <FormArray>this.elementsForm.controls[control].get('elements');
		if (array.length > 1) array.removeAt(i);
	}

	public getElementsRow(control: string): FormArray {
    return (this.elementsForm.controls[control].get('elements') as FormArray);
	}

	public setTypeOptionsID(control: string, index: number): void {
		let typeOptionsID= +this.elementsForm.controls[control].get('typeOptionsID').value;
		for(let i=0; i<this.getOptionsRow(control).length; i++){
			this.getOptionsRow(control).controls[i].get('assessmentDesc').patchValue('');
			this.getOptionsRow(control).controls[i].get('typeOptionsID').patchValue(typeOptionsID);
		}
	}

	public addOptionsRow(control: string, index: number, id: number=+this.elementsForm.controls[control].get('typeOptionsID').value, desc: string= ''): void {
		const array= this.getOptionsRow(control);
		array.push(this.optionsRow(id, desc));
		//this.getOptionsRow(control).controls[index].get('id').patchValue(typeOptionsID);
	}

	public deleteOptionsRow(i: number, control: string): void {
		const array= <FormArray>this.elementsForm.controls[control].get('options');
		if (array.length > 1) array.removeAt(i);
	}

	public getOptionsRow(control: string): FormArray {
    return (this.elementsForm.controls[control].get('options') as FormArray);
	}

	public postEvaluationInstrument(): void {
		this.charging= true;
		if (this.postEvaluationInstrumentSubscription) this.postEvaluationInstrumentSubscription.unsubscribe();
		if(this.filtersForm.valid && this.scalesForm.valid && this.elementsForm.valid && this.getElementsForm().length > 0){
			this.postEvaluationInstrumentSubscription = this.api.postEvaluationInstrument(this.filtersForm.value).subscribe({
				next: (res: any) => {
					console.log('post1', res);
					this.filtersForm.get('evaluationInstrumentsID').patchValue(res.evaluationInstrumentsID);
					for(let i=0; i<this.getScalesRow().length; i++){
						this.getScalesRow().controls[i].get('evaluationInstrumentsID').patchValue(res.evaluationInstrumentsID);
						this.getScalesRow().controls[i].get('periodID').patchValue(this.filtersForm.get('periodID').value);
					}
					this.postRatingScales();
				},
				error: (err: HttpErrorResponse) => {
					this.charging= false;
				}
			});
		}else if(this.getElementsForm().length === 0){
			this.charging= false;
			this.snackBar.open(
				`Debe agregar al menos 1 Criterio.`,
				null,
				{
					horizontalPosition: 'center',
					verticalPosition: 'top',
					duration: 4000,
					panelClass: ['red-snackbar']
				}
			);
		}else{
			this.charging= false;
			this.filtersForm.markAllAsTouched();
			this.scalesForm.markAllAsTouched();
			this.elementsForm.markAllAsTouched();
		}
	}

	public postRatingScales(): void {
		if (this.postRatingScaleSubscription) this.postRatingScaleSubscription.unsubscribe();
		if(this.scalesForm.valid){
			for(let i=0; i<this.getScalesRow().length; i++){
				let body = {
					'ratingName': this.getScalesRow().controls[i].get('ratingName').value,
					'user': this.user.currentUser.userName
				}
				this.postRatingScaleSubscription = this.api.postRatingScales(body).subscribe({
					next: (res: any) => {
						console.log(`post2-${i+1}`, res);
						this.getScalesRow().controls[i].get('ratingScaleID').patchValue(res.ratingScaleID);
					},
					error: (err: HttpErrorResponse) => {
						this.charging= false;
					}
				});
			}
			setTimeout(() => {
				this.postEquivalenceScales();
			}, 550);
		}else{
			this.scalesForm.markAllAsTouched();
			this.charging= false;
		}
	}

	public postEquivalenceScales(): void {
		if (this.postEquivalenceScalesSubscription) this.postEquivalenceScalesSubscription.unsubscribe();
		if(this.scalesForm.valid){
			this.postEquivalenceScalesSubscription = this.api.postEquivalenceScales({'news': this.getScalesRow().value}).subscribe({
				next: (res) => {
					console.log(`post3`, res);
					this.postInstrumentsContent();
				},
				error: (err: HttpErrorResponse) => {
					this.charging= false;
				}
			});
		}else{
			this.scalesForm.markAllAsTouched();
			this.charging= false;
		}
	}

	public postInstrumentsContent(): void {
		if (this.postInstrumentsContentSubscription) this.postInstrumentsContentSubscription.unsubscribe();
		if(this.elementsForm.valid){
			for(let i=0; i<this.getElementsForm().length; i++){
				let body = {
					'contentDesc': this.getElementsForm()[i],
					'user': this.user.currentUser.userName
				}
				this.postInstrumentsContentSubscription = this.api.postInstrumentsContent(body).subscribe({
					next: async (res: any) => {
						console.log(`post4-${i+1}`, res);
						this.postInstrumentsContentSettings(res[0].contentInstrumentID, i+1);
					},
					error: (err: HttpErrorResponse) => {
						this.charging= false;
					}
				});
			}
		}else{
			this.elementsForm.markAllAsTouched();
			this.charging= false;
		}
	}

	public postInstrumentsContentSettings(contentInstrumentID: number, sequenceNro: number): void {
		let body= [{
			"evaluationInstrumentsID": this.filtersForm.get('evaluationInstrumentsID').value,
			"contentInstrumentID": contentInstrumentID,
			"sequenceNro": sequenceNro,
			"periodID": this.filtersForm.get('periodID').value,
			"userCreated": this.user.currentUser.userName
		}];
		this.api.postInstrumentsContentSettings({'news': body}).subscribe({
			next: (res: any) => {
				console.log(`post5-${sequenceNro}`, res);
				for(let i=0; i<this.getOptionsRow(res[0].contentDesc).length; i++){
					this.getOptionsRow(res[0].contentDesc).controls[i].get('settingContentInstrumentsID').patchValue(res[0].settingContentInstrumentsID);
				}
				this.postAssessment(res[0].contentDesc);
			},
			error: (err: HttpErrorResponse) => {
				this.charging= false;
			}
		});
	}

	public postAssessment(control: string): void {
		this.api.postAssessment({'news': this.getOptionsRow(control).value}).subscribe({
			next: (res: any) => {
				console.log(`post6-${control}`, res);
				this.postInstrumentsQuestions(control, res[0].settingContentInstrumentsID);
				this.postAssessmentSettings(res[0].assessmentID, res[0].settingContentInstrumentsID, control);
			},
			error: (err: HttpErrorResponse) => {
				this.charging= false;
			}
		});
	}

	public postAssessmentSettings(assessmentID: number, settingContentInstrumentsID:number, control: string): void {
		let body= [{
			"settingContentInstrumentsID": settingContentInstrumentsID ,
			"assessmentID": assessmentID,
			"modalityID": this.filtersForm.get('modalityID').value,
			"periodID": this.filtersForm.get('periodID').value,
		}];
		this.api.postAssessmentSettings({'news': body}).subscribe({
			next: (res: any) => {
				console.log(`post7-${control}`, res);
			},
			error: (err: HttpErrorResponse) => {
				this.charging= false;
			}
		});
	}

	public postInstrumentsQuestions(control: string, settingContentInstrumentsID: number): void {
		this.api.postInstrumentsQuestions({'news': this.getElementsRow(control).value}).subscribe({
			next: (res: any) => {
				console.log(`post8-${control}`, res);
				for(let i=0; i<res.length; i++){
					setTimeout(() => {
						this.postInstrumentsQuestionsSettings(control, res[i].questionsID, settingContentInstrumentsID, i);
					}, 100);
				}
			},
			error: (err: HttpErrorResponse) => {
				this.charging= false;
			}
		});
	}

	public postInstrumentsQuestionsSettings(control: string, questionsID: number, settingContentInstrumentsID: number, index: number): void {
		this.charging= true;
		let body= [{
			"periodID": this.filtersForm.get('periodID').value,
			"questionsID": questionsID,
			"settingContentInstrumentsID": settingContentInstrumentsID,
			"orderNumber": index+1
		}];
		this.api.postInstrumentsQuestionsSettings({'news': body}).subscribe({
			next: (res: any) => {
				console.log(`post9-${control}-${index+1}`, res);
				setTimeout(() => {
					this.common.message(`Ingresado exitosamente`,'','success','#86bc57');
					this.initForm();
					this.initScalesForm();
					this.initElementsForm();
					this.charging= false;
				}, 1000);
			},
			error: (err: HttpErrorResponse) => {
				this.charging= false;
			}
		});
	}

	public showComponentsActivities(item: EvaluationInstrumentsReport, event: MatOptionSelectionChange): void {
		if(event.isUserInput){
			this.isActivitiesActive= item.flgActivity;
			this.isComponentsActive= item.flgComponent;
		}
	}

	public getEvaluationInstrumentsReport(): void{
		this.admin.getEvaluationInstrumentsReport(this.filtersForm.get('evaluationOrFollowup').value).subscribe({
			next: (res) => {
				this.evaluationInstrumentsReport= res;
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

}
