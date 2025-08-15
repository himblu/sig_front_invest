import { Component, ViewChild, ElementRef, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, FormArray, FormControl, } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { NgClass, NgFor, NgForOf, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { CurrentPeriod, EvaluationInstrumentList, InstrumentResolve } from '@utils/interfaces/others.interfaces';
import { UserService } from '@services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FilterEquivalences } from './pipes/filter-equivalences.pipe';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [
		ReactiveFormsModule,
		NgForOf,
		NgFor,
		NgIf,
		MatInputModule,
		MatButtonModule,
		MatFormFieldModule,
		MatSelectModule,
		MatTooltipModule,
		MatIconModule,
		MatDialogModule,
		//NgClass,
		MatRadioModule,
		MatSnackBarModule,
		FilterEquivalences
	],
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public loading: boolean = false;
	public questionsForm!: FormGroup;
	private currentPeriod: CurrentPeriod;
	private settingEvaluationInstrumentID: number;
	public instrument: InstrumentResolve;
	private currentPersonID: number;

	private dialog: MatDialog = inject(MatDialog);
	private snackBar: MatSnackBar = inject(MatSnackBar);

	constructor(private fb: FormBuilder,
		private common: CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService,
		private activateRoute: ActivatedRoute,
		private router: Router
	){
		super();
		this.initQuestionsForm();
	}

	ngOnInit(): void {
		this.activateRoute.params.subscribe({
			next: (params: any) => {
				this.settingEvaluationInstrumentID = params.settingEvaluationInstrumentID;
				this.currentPersonID = +params.personID
				if(this.currentPersonID === this.user.currentUser.PersonId) this.getCurrentPeriod();
				else this.router.navigateByUrl('/');
			}
		});
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	private getCurrentPeriod(): void {
		this.loading = true;
    this.api.getCurrentPeriod().subscribe({
      next: (res: CurrentPeriod) => {
        this.currentPeriod = res;
				this.getInstrumentResolve(res.periodID);
				//this.loading = false;
      },
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.loading = false;
			}
    });
  }

	private getInstrumentResolve(periodID: number): void {
		this.loading = true;
    this.api.getInstrumentResolve(periodID, this.currentPersonID, this.settingEvaluationInstrumentID).subscribe({
      next: (res: InstrumentResolve) => {
				//console.log('InstrumentResolve', res);
				if(res.contents) for(let i=0; i<res.contents.length; i++){
					this.addQuestionsControl();
					for(let ind=0; ind<res.contents[i].assessments.length; ind++){
						this.addAssessmentControl(i);
						for(let index=0; index<res.contents[i].questions.length; index++){
							this.addQuestionsFormRow(res.contents[i].assessments[ind].settingAssessmentID.toString(),
							res.contents[i].questions[index].settingQuestionsID, res, i, ind);
						}
					}
				}else{
					this.snackBar.open(
						`Error al cargar la evaluación, contacte al administrador`,
						null,
						{
							horizontalPosition: 'center',
							verticalPosition: 'top',
							duration: 3000,
							panelClass: ['red-snackbar']
						}
					);
					this.router.navigateByUrl('/instrumentos/lista');
				}
				this.instrument= res;
				this.loading = false;
      },
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.loading = false;
				this.router.navigateByUrl('/instrumentos/lista');
			}
    });
  }

	public initQuestionsForm(): void {
		this.questionsForm= this.fb.group({
			news: this.fb.array([])
		});
	}

	public getNewsArray(): FormArray {
		return this.questionsForm.controls['news'] as FormArray;
	}

	public addQuestionsControl() {
		this.getNewsArray().push(this.fb.array([]));
	}

	public addAssessmentControl(i: number) {
		let group = this.getNewsArray().controls[i] as FormArray;
		group.push(this.fb.array([]));
	}

	public questionsFormRow(assessment: string, instrument: InstrumentResolve, settingQuestionsID: number, sequenceNro: number): FormGroup {
    return this.fb.group({
			periodID: [this.currentPeriod.periodID, [Validators.required]],
			settingEvaluationInstrumentID: [this.settingEvaluationInstrumentID, [Validators.required]],
			settingAssessmentID: [+assessment, [Validators.required]],
			settingQuestionsID: [settingQuestionsID, [Validators.required]],
			scaleEquivalenceID: ['', [Validators.required]],
			personID: [this.currentPersonID, [Validators.required]],
			typePerson: [instrument.typePerson],
			teacherID: [instrument.teacherID],
			studentID: [instrument.studentID],
			commentary: [''],
			sequenceNro: sequenceNro,
		});
	}

	public addQuestionsFormRow(assessment: string, settingQuestionsID: number, instrument: InstrumentResolve, i: number, index: number): void {
		let group = this.getNewsArray().controls[i] as FormArray;
		let array= group.controls[index] as FormArray;
    array.push(this.questionsFormRow(assessment, instrument, settingQuestionsID, index+1));
	}

	public getQuestionsFormRow(i: number, index: number): FormArray {
		let form = this.getNewsArray().controls[i] as FormArray;
    return (form.controls[index] as FormArray);
	}

	public onSubmit(): void {
		this.loading = true;
		if(this.questionsForm.valid){
			let body= [];
			for(let i=0; i<this.instrument.contents.length; i++){
				for(let ind=0; ind<this.instrument.contents[i].assessments.length; ind++){
					let control = this.getQuestionsFormRow(i, ind).value;
					//console.log(i+'-'+ind, control)
					for(let index=0; index<control.length; index++){
						let arr = control[index];
						body.push(arr);
					}
				}
			}
			//console.log({'news': body});
			this.api.postSettingEvaluation({'news': body}).subscribe({
				next: (res) => {
					//console.log(res);
					this.common.message(`Registro exitoso.`,'','success','#86bc57');
					this.loading = false;
					this.router.navigateByUrl('/instrumentos/lista');
				},
				error: (err: HttpErrorResponse) => {
					//console.log('err',err);
					this.loading = false;
				}
			});
		}else{
			this.questionsForm.markAllAsTouched();
			this.snackBar.open(
				`Debe contestar todas las preguntas`,
				null,
				{
					horizontalPosition: 'center',
					verticalPosition: 'top',
					duration: 3000,
					panelClass: ['red-snackbar']
				}
			);
			this.loading = false;
		}
	}

}
