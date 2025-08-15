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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Period } from '@utils/interfaces/period.interfaces';
import { AssessmentContent, CurrentPeriod, EvaluationInstrument, InstrumentQuestion, ScaleEquivalence, TypeOptions } from '@utils/interfaces/others.interfaces';
import { SPGetModality } from '@utils/interfaces/campus.interfaces';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { InstrumentContent } from '../../../../../utils/interfaces/others.interfaces';
import { NgClass } from '@angular/common';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { EvaluationInstrumentComponent } from './components/evaluation-instrument/evaluation-instrument.component';
import { EquivalenceScalesComponent } from './components/equivalence-scales/equivalence-scales.component';
import { InstrumentContentsComponent } from './components/instrument-contents/instrument-contents.component';
import { AssessmentContentsComponent } from './components/assessment-contents/assessment-contents.component';
import { QuestionsComponent } from './components/questions/questions.component';

@Component({
  selector: 'app-instruments-list',
  standalone: true,
  templateUrl: './instruments-list.component.html',
  styleUrls: ['./instruments-list.component.css'],
	imports: [
		NgIf,
		NgForOf,
		ReactiveFormsModule,
		MatInputModule,
		MatButtonModule,
		MatFormFieldModule,
		MatSelectModule,
		MatTooltipModule,
		MatIconModule,
		MatSnackBarModule,
		NgClass,
		MatDialogModule,
		EvaluationInstrumentComponent,
		InstrumentContentsComponent,
		AssessmentContentsComponent
	],
})
export class InstrumentsListComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public charging: boolean = false;
	public filtersForm!: FormGroup;
	public periods: Period[] = [];
	public currentPeriod: CurrentPeriod;
	public evaluationInstruments: EvaluationInstrument[] = [];
	public scalesEquivalence: ScaleEquivalence[] = [];
	public evaluationInstrumentsByID: EvaluationInstrument[] = [];
	public instrumentContents: InstrumentContent[] = [];
	public assessmentContents: AssessmentContent[] = [];
	public instrumentQuestions: InstrumentQuestion[] = [];
	public isClickedEvaluations: number;
	public isClickedScales: number;
	public isClickedContents: number;
	public isClickedInstruments: number;

	private getInstrumentsSubscription!: Subscription;
	private getScalesEquivalenceSubscription!: Subscription;
	private getEvaluationInstrumentsSubscription!: Subscription;
	private getInstrumentContentsSubscription!: Subscription;
	private getAssessmentContentsSubscription!: Subscription;
	private getInstrumentsQuestionsSubscription!: Subscription;
	private sanitizer: DomSanitizer = inject(DomSanitizer);
	private snackBar: MatSnackBar = inject(MatSnackBar);

	constructor( private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService,
		private activatedRoute: ActivatedRoute,
		private dialog: MatDialog ){
		super();
	}

	ngOnInit(): void {
		this.initForm();
		this.getDataFromResolver();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	private getDataFromResolver(): void {
    this.activatedRoute.data.pipe(untilComponentDestroyed(this),
    map((value: any) => value['resolver'])).subscribe({
			next: (value: { periods: Period[], currentPeriod: CurrentPeriod }) => {
				this.periods= value.periods,
				this.currentPeriod= value.currentPeriod
			},
    });
		this.filtersForm.get('periodID').patchValue(this.currentPeriod.periodID);
		//this.getInstruments();
  }

	public initForm():void{
    this.filtersForm = this.fb.group({
      periodID: ['', Validators.required],
			evaluationOrFollowup: ['', Validators.required],
    });
	}

	public getInstruments(): void {
		if(this.filtersForm.valid){
			this.scalesEquivalence= [];
			this.instrumentContents= [];
			this.assessmentContents= [];
			this.instrumentQuestions= [];
			let filters= this.filtersForm.value;
			if (this.getInstrumentsSubscription) this.getInstrumentsSubscription.unsubscribe();
			this.charging= true;
			this.getInstrumentsSubscription = this.api.getEvaluationInstruments(filters.periodID, filters.evaluationOrFollowup).subscribe({
				next: (res) => {
					//console.log('EvaluationInstruments', res);
					this.evaluationInstruments = res;
					this.charging= false;
				},
				error: (err: HttpErrorResponse) => {
					this.charging= false;
				}
			});
		} else{
			this.filtersForm.markAllAsTouched();
		}
	}

	public getScalesEquivalence(item: EvaluationInstrument, i: number): void {
		this.isClickedEvaluations = i;
		if (this.getScalesEquivalenceSubscription) this.getScalesEquivalenceSubscription.unsubscribe();
		this.charging= true;
		this.getScalesEquivalenceSubscription = this.api.getScalesEquivalence(item.periodID, item.evaluationInstrumentsID).subscribe({
			next: (res) => {
				//console.log('EquivalenceScales', res);
				this.scalesEquivalence= res;
				this.charging= false;
			},
			error: (err: HttpErrorResponse) => {
				this.charging= false;
			}
		});
	}

	public getEvaluationInstruments(item: EvaluationInstrument): void {
		if (this.getEvaluationInstrumentsSubscription) this.getEvaluationInstrumentsSubscription.unsubscribe();
		this.charging= true;
		this.getEvaluationInstrumentsSubscription = this.api.getEvaluationInstrumentsByID(item.periodID, item.evaluationInstrumentsID).subscribe({
			next: (res) => {
				//console.log('EvaluationInstruments', res);
				this.evaluationInstrumentsByID= res;
				this.charging= false;
			},
			error: (err: HttpErrorResponse) => {
				this.charging= false;
			}
		});
	}

	public getInstrumentContents(item: EvaluationInstrument, i: number): void {
		this.isClickedScales = i;
		if (this.getInstrumentContentsSubscription) this.getInstrumentContentsSubscription.unsubscribe();
		this.charging= true;
		this.getInstrumentContentsSubscription = this.api.getInstrumentContents(item.periodID, item.evaluationInstrumentsID).subscribe({
			next: (res) => {
				//console.log('InstrumentContents', res);
				this.instrumentContents = res;
				this.charging= false;
			},
			error: (err: HttpErrorResponse) => {
				this.charging= false;
			}
		});
	}

	public getAssessmentContents(item: InstrumentContent, i: number): void {
		this.assessmentContents= [];
		this.instrumentQuestions= [];
		this.isClickedInstruments= null;
		this.isClickedContents = i;
		if (this.getAssessmentContentsSubscription) this.getAssessmentContentsSubscription.unsubscribe();
		this.charging= true;
		this.getAssessmentContentsSubscription = this.api.getAssessmentContents(item.contentInstrumentID).subscribe({
			next: (res) => {
				//console.log('AssessmentContents', res);
				this.assessmentContents= res;
				this.charging= false;
			},
			error: (err: HttpErrorResponse) => {
				this.charging= false;
			}
		});
	}

	public getInstrumentsQuestions(item: InstrumentContent, i?: number): void {
		//this.isClickedInstruments = i;
		if (this.getInstrumentsQuestionsSubscription) this.getInstrumentsQuestionsSubscription.unsubscribe();
		this.charging= true;
		this.getInstrumentsQuestionsSubscription = this.api.getInstrumentsQuestions(item.evaluationInstrumentsID, item.contentInstrumentID).subscribe({
			next: (res) => {
				//console.log('InstrumentsQuestions', res);
				this.instrumentQuestions= res;
				this.charging= false;
			},
			error: (err: HttpErrorResponse) => {
				this.charging= false;
			}
		});
	}

	public clearRegisters(): void {
		this.evaluationInstrumentsByID= [];
		this.instrumentContents= [];
		this.assessmentContents= [];
		this.instrumentQuestions= [];
		this.isClickedScales= null;
		this.isClickedContents= null;
		this.isClickedInstruments= null;
	}

	public updateEvaluationInstruments(item: EvaluationInstrument): void {
		const config: MatDialogConfig = new MatDialogConfig();
		this.dialog.closeAll();
		config.id = 'evaluationInstrumentComponent';
		config.autoFocus = false;
		config.minWidth = '70vw';
		config.width = '70vw';
		config.minWidth = '200px';
		config.maxWidth = '600px';
		config.panelClass = 'transparent-panel';
		config.data = { item };
		const dialog = this.dialog.open(EvaluationInstrumentComponent, config);
		dialog.afterClosed()
			.pipe(untilComponentDestroyed(this))
			.subscribe((res) => {
				if (res) {
					this.common.message(`Actualizado correctamente`, '', 'success', '#86bc57');
					this.clearRegisters();
					this.getInstruments();
				}
			});
	}

	public updateEvaluationScales(item: ScaleEquivalence): void {
		const config: MatDialogConfig = new MatDialogConfig();
		this.dialog.closeAll();
		config.id = 'equivalenceScalesComponent';
		config.autoFocus = false;
		config.minWidth = '70vw';
		config.width = '70vw';
		config.minWidth = '200px';
		config.maxWidth = '600px';
		config.panelClass = 'transparent-panel';
		config.data = { item };
		const dialog = this.dialog.open(EquivalenceScalesComponent, config);
		dialog.afterClosed()
			.pipe(untilComponentDestroyed(this))
			.subscribe((res) => {
				if (res) {
					this.common.message(`Actualizado correctamente`, '', 'success', '#86bc57');
					this.clearRegisters();
					this.getInstruments();
				}
			});
	}

	public updateInstrumentContents(item: InstrumentContent): void {
		const config: MatDialogConfig = new MatDialogConfig();
		this.dialog.closeAll();
		config.id = 'instrumentContentsComponent';
		config.autoFocus = false;
		config.minWidth = '70vw';
		config.width = '70vw';
		config.minWidth = '200px';
		config.maxWidth = '600px';
		config.panelClass = 'transparent-panel';
		config.data = { item };
		const dialog = this.dialog.open(InstrumentContentsComponent, config);
		dialog.afterClosed()
			.pipe(untilComponentDestroyed(this))
			.subscribe((res) => {
				if (res) {
					this.common.message(`Actualizado correctamente`, '', 'success', '#86bc57');
					this.clearRegisters();
					this.getInstruments();
				}
			});
	}

	public updateAssessmentContent(item: AssessmentContent): void {
		const config: MatDialogConfig = new MatDialogConfig();
		this.dialog.closeAll();
		config.id = 'assessmentContentsComponent';
		config.autoFocus = false;
		config.minWidth = '70vw';
		config.width = '70vw';
		config.minWidth = '200px';
		config.maxWidth = '600px';
		config.panelClass = 'transparent-panel';
		config.data = { item };
		const dialog = this.dialog.open(AssessmentContentsComponent, config);
		dialog.afterClosed()
			.pipe(untilComponentDestroyed(this))
			.subscribe((res) => {
				if (res) {
					this.common.message(`Actualizado correctamente`, '', 'success', '#86bc57');
					this.clearRegisters();
					this.getInstruments();
				}
			});
	}

	public updateQuestions(item: InstrumentQuestion): void {
		const config: MatDialogConfig = new MatDialogConfig();
		this.dialog.closeAll();
		config.id = 'questionsComponent';
		config.autoFocus = false;
		config.minWidth = '70vw';
		config.width = '70vw';
		config.minWidth = '200px';
		config.maxWidth = '600px';
		config.panelClass = 'transparent-panel';
		config.data = { item };
		const dialog = this.dialog.open(QuestionsComponent, config);
		dialog.afterClosed()
			.pipe(untilComponentDestroyed(this))
			.subscribe((res) => {
				if (res) {
					this.common.message(`Actualizado correctamente`, '', 'success', '#86bc57');
					this.clearRegisters();
					this.getInstruments();
				}
			});
	}

	public getPdfBaseEvaluationInstrument(item: EvaluationInstrument): void{
		let body= {
			"periodID": item.periodID,
			"typeEvaluationInstrumentID": item.typeEvaluationInstrumentID,
			"evaluationInstrumentsID": item.evaluationInstrumentsID
		}
		this.admin.getPdfBaseEvaluationInstrument(body).subscribe({
			next: (res) => {
				//console.log(res);
				if(res.body){
					let contentType: string | null | undefined = res.headers.get('content-type');
					// Porque el tipo de variable que recibe el type es string o undefined. No recibe null.
					if (!contentType) {
						contentType = undefined;
					}
					const blob: Blob = new Blob([res.body], { type: contentType });
					const url = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob)));
					if (url) {
						window.open(url, '_blank');
					}
				}
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

}
