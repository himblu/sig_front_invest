import { Component, ViewChild, ElementRef, OnInit, OnDestroy, SecurityContext, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule, MatOptionSelectionChange } from '@angular/material/core';
import { UserService } from '@services/user.service';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute, Router } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatStepper } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CurrentPeriod } from '@utils/interfaces/others.interfaces';
import { Project, ProjectActivity, ProjectActivityOfObjetive, ProjectObjetive, ProjectValidation } from '@utils/interfaces/campus.interfaces';
import { ProjectActivityByObjetive } from '../../../../../utils/interfaces/campus.interfaces';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-teacher-project',
  standalone: true,
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
		MatNativeDateModule,
		MatMenuModule,
		MatStepperModule,
		MatDatepickerModule,
		FormsModule,
		//DatePipe,
		MatSnackBarModule,
		NgClass
	],
	providers: [
		DatePipe
	],
  templateUrl: './teacher-project.component.html',
  styleUrls: ['./teacher-project.component.scss']
})
export class TeacherProjectComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	loading: boolean = false;
	public isLinear = true;
	private projectPracticasID: number;
	private projectPracInformativeID: number;
	public objetivesFormGroup!: FormGroup;
	public activitiesFormGroup!: FormGroup;
	public currentPeriod: CurrentPeriod;
	public projectObjetives: ProjectObjetive[] = [];
	public projectActivitiesByObjetive: ProjectObjetive[] = [];
	public isUpdating: boolean= false;
	public periodIDOfProject: number = 0;
	public projectValidation: ProjectValidation[] = [];
	@ViewChild('vStepper') private vStepper: MatStepper;

	constructor(private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService,
		private router: Router,
		private activeRoute: ActivatedRoute,
		private datePipe: DatePipe,
		private snackBar: MatSnackBar){
		super();
		this.initObjetivesFormGroup();
		this.initActivitiesFormGroup();
	}

	ngOnInit(): void {
		this.getCurrentPeriod();
		this.activeRoute.params.subscribe({
      next: (data: any) => {
				if(data.projectPracticasID){
					this.loading= true;
					//console.log(data.projectPracticasID);
					this.projectPracticasID= data.projectPracticasID;
					this.periodIDOfProject = data.periodID;
					this.projectPracInformativeID= data.projectPracInformativeID;
					setTimeout(() => {
						if(data.periodID && data.projectPracInformativeID){
							this.getProjectPracticesByPeriodValidation(data.periodID, data.projectPracInformativeID);
							this.getProjectPracticesByPeriod(data.periodID, data.projectPracInformativeID);
						}
					}, 250);
				}else{
					this.loading= false;
					this.router.navigateByUrl('/vinculacion-docente/lista-proyectos');
				}
      }
    });
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	private getCurrentPeriod(): void{
		this.loading= true;
		this.api.getCurrentPeriod().subscribe({
			next: (res: CurrentPeriod) => {
					this.currentPeriod= res;
					this.loading = false;
			},
			error: (err: HttpErrorResponse) => {
					this.loading = false;
			}
		});
	}

	public getProjectObjetives(projectPracInformativeID: number): void {
		this.loading= true;
		this.admin.getProjectObjetives(this.periodIDOfProject, projectPracInformativeID).subscribe({
			next: (res) => {
				//console.log('ProjectObjetives', res);
				this.projectObjetives= res;
				for(let i=0; i<this.projectObjetives.length; i++){
					this.addObjetivesRow();
				}
				this.loading = false;
			},
			error: (err: HttpErrorResponse) => {
				this.loading = false;
			}
		});
	}

	private initObjetivesFormGroup(): void {
		this.objetivesFormGroup= this.fb.group({
			objetives: this.fb.array([])
		});
	}

	private objetivesRow(): FormGroup {
		return this.fb.group({
			activities: this.fb.array([])
		})
	}

	public getObjetivesRow(): FormArray {
		return (this.objetivesFormGroup.controls['objetives'] as FormArray);
	}

	public addObjetivesRow(): void {
		this.getObjetivesRow().push(this.objetivesRow());
	}

	public deleteObjetivesRow(i: number): void {
		if (this.getObjetivesRow().length > 1) this.getObjetivesRow().removeAt(i);
	}

	private activitiesRow(item: ProjectObjetive): FormGroup {
		return this.fb.group({
			projectObjEspActivityID: 0,
			projectObjectiveEspID: item.projectObjectiveEspID,
			activityName: ['', Validators.required],
			initDateActivity: ['', Validators.required],
			endDateActivity: ['', Validators.required],
			indicator: ['', Validators.required],
			verificationMean: ['', Validators.required],
			compliance: [0, Validators.required],
			observation: ['', Validators.required],
			userCreated: this.user.currentUser.userName
		})
	}

	public getActivitiesRow(i: number): FormArray {
		let row= this.getObjetivesRow().controls[i] as FormGroup;
		return (row.controls['activities'] as FormArray);
	}

	public addActivitiesRow(i: number, item: ProjectObjetive): void {
		this.getActivitiesRow(i).push(this.activitiesRow(item));
	}

	public deleteActivitiesRow(i: number, index: number): void {
		if (this.getActivitiesRow(i).length > 1) this.getActivitiesRow(i).removeAt(index);
	}

	public postActivities(): void {
		let arr: ProjectActivityOfObjetive[] = [];
		for(let i=0; i<this.getObjetivesRow().length; i++){
			for(let index=0; index<this.getActivitiesRow(i).length; index++){
				let obj = this.getActivitiesRow(i).controls[index].value;
				arr.push(obj);
			}
		}

		if(this.objetivesFormGroup.valid && arr.length >= this.projectObjetives.length){
			//this.loading= true;
			this.admin.postProjectActivities(arr).subscribe({
				next: (res) => {
					//console.log('post', res);
					this.getProjectObjetivesActivities();
					this.vStepper.next();
					this.loading = false;
				},
				error: (err: HttpErrorResponse) => {
					this.loading = false;
				}
			});
		}else if(arr.length < this.projectObjetives.length || arr.length === 0){
			this.snackBar.open(
				`Actividades requeridas`,
				null,
				{
					horizontalPosition: 'center',
					verticalPosition: 'top',
					duration: 4000,
					panelClass: ['red-snackbar']
				}
			);
		}else{
			this.objetivesFormGroup.markAllAsTouched();
		}
	}

	public getProjectObjetivesActivities(): void {
		this.loading= true;
		this.admin.getProjectObjetivesActivities(this.periodIDOfProject, this.projectPracInformativeID).subscribe({
			next: (res) => {
				//console.log('ProjectObjetivesActivities', res);
				this.projectActivitiesByObjetive= res;
				this.initActivitiesFormGroup();
				this.activitiesFormGroup.controls['projectPracticeHours'].setValidators(
					[Validators.required, Validators.max(+this.projectValidation[0].projectPracticeHours)]
				);
				this.activitiesFormGroup.controls['budgeted'].setValidators(
					[Validators.required, Validators.max(+this.projectValidation[0].budgeted)]
				);
				this.activitiesFormGroup.updateValueAndValidity();
				for(let i=0; i<res.length; i++){
					this.addConsultedObjetivesRow();
					for(let index=0; index<res[i].activities.length; index++){
						this.addActivitiesRow(i, res[i]);
						this.addConsultedActivitiesRow(i, res[i], res[i].activities[index]);
						this.getActivitiesRow(i).controls[index].patchValue(res[i].activities[index]);
						this.getConsultedActivitiesRow(i).controls[index].patchValue(res[i].activities[index]);
					}
				}
				this.loading = false;
			},
			error: (err: HttpErrorResponse) => {
				this.loading = false;
			}
		});
	}

	private initActivitiesFormGroup(): void {
		this.activitiesFormGroup= this.fb.group({
			budgeted: '',
			projectPracticeHours: '',
			objetives: this.fb.array([])
		});
		const searchInput: FormControl = this.activitiesFormGroup.get('objetives') as FormControl;
		if (searchInput) {
			searchInput.valueChanges.pipe(
				debounceTime(300),
				distinctUntilChanged(),
				untilComponentDestroyed(this)
			).subscribe({
				next: (value ) => {
					let hours= 0;
					let budget = 0;
					for(let i=0; i<this.getConsultedObjetivesRow().length; i++){
						for(let index=0; index<this.getConsultedActivitiesRow(i).length; index++){
							let obj= this.getConsultedActivitiesRow(i).controls[index].value;
							hours= (+hours) + (+obj.hours);
							budget= (+budget) + (+obj.itca) + (+obj.other);
						}
					}
					this.activitiesFormGroup.get('projectPracticeHours').patchValue(hours);
					this.activitiesFormGroup.get('projectPracticeHours').markAllAsTouched();
					this.activitiesFormGroup.get('budgeted').patchValue(budget);
					this.activitiesFormGroup.get('budgeted').markAllAsTouched();
				}
			});
		}
	}

	private consultedObjetivesRow(): FormGroup {
		return this.fb.group({
			activities: this.fb.array([])
		})
	}

	public getConsultedObjetivesRow(): FormArray {
		return (this.activitiesFormGroup.controls['objetives'] as FormArray);
	}

	public addConsultedObjetivesRow(): void {
		this.getConsultedObjetivesRow().push(this.consultedObjetivesRow());
	}

	public deleteConsultedObjetivesRow(i: number): void {
		if (this.getConsultedObjetivesRow().length > 1) this.getConsultedObjetivesRow().removeAt(i);
	}

	private consultedActivitiesRow(objetive: ProjectActivityByObjetive | ProjectObjetive, item: ProjectActivity | ProjectActivityOfObjetive): FormGroup {
		return this.fb.group({
			projectObjEspActivityID: item.projectObjEspActivityID,
			projectObjectiveEspID: objetive.projectObjectiveEspID,
			hours: ['', [Validators.required, Validators.min(0)]],
			itca: [0, [Validators.required, Validators.min(0)]],
			other: [0, [Validators.required, Validators.min(0)]],
			userCreated: this.user.currentUser.userName
		})
	}

	public getConsultedActivitiesRow(i: number): FormArray {
		let row= this.getConsultedObjetivesRow().controls[i] as FormGroup;
		return (row.controls['activities'] as FormArray);
	}

	public addConsultedActivitiesRow(i: number, objetive: ProjectActivityByObjetive | ProjectObjetive, item: ProjectActivity | ProjectActivityOfObjetive): void {
		this.getConsultedActivitiesRow(i).push(this.consultedActivitiesRow(objetive, item));
	}

	public deleteConsultedActivitiesRow(i: number, index: number): void {
		if (this.getConsultedActivitiesRow(i).length > 1) this.getConsultedActivitiesRow(i).removeAt(index);
	}

	public putActivities(): void {
		if(this.activitiesFormGroup.valid){
			this.loading= true;
			let arr= [];
			for(let i=0; i<this.getConsultedObjetivesRow().length; i++){
				for(let index=0; index<this.getConsultedActivitiesRow(i).length; index++){
					let obj= this.getConsultedActivitiesRow(i).controls[index].value;
					arr.push(obj);
				}
			}
			//console.log(arr);
			this.admin.putProjectActivities(arr).subscribe({
				next: (res) => {
					//console.log('put', res);
					this.common.message(`Ingreso exitoso`,'','success','#86bc57');
					this.loading = false;
					this.router.navigateByUrl('/vinculacion-docente/lista-proyectos');
				},
				error: (err: HttpErrorResponse) => {
					this.loading = false;
				}
			});
		}else{
			this.activitiesFormGroup.markAllAsTouched();
		}
	}

	public getProjectPracticesByPeriod(periodID: number, projectPracInformativeID: number): void {
		this.admin.getProjectPracticesByPeriod(periodID, projectPracInformativeID).subscribe({
			next: (res: ProjectObjetive[]) => {
				//console.log('ProjectPracticesByPeriod', res);
				if(res.length > 0){
					this.isUpdating= true;
					//this.isLinear= false;
					this.projectObjetives= res;
					this.projectActivitiesByObjetive= res;
					for(let i=0; i<this.projectObjetives.length; i++){
						this.addObjetivesRow();
						this.addConsultedObjetivesRow();
						for(let index=0; index<this.projectObjetives[i].activities.length; index++){
							this.addActivitiesRow(i, this.projectObjetives[i]);
							this.addConsultedActivitiesRow(i, this.projectObjetives[i], this.projectObjetives[i].activities[index]);
							this.getActivitiesRow(i).controls[index].patchValue(this.projectObjetives[i].activities[index]);
							this.getConsultedActivitiesRow(i).controls[index].patchValue(this.projectObjetives[i].activities[index]);
						}
					}
					this.loading= false;
				}else{
					this.getProjectObjetives(projectPracInformativeID);
				}
			},
			error: (err: HttpErrorResponse) => {
				this.loading= false;
			}
		});
	}

	public getProjectPracticesByPeriodValidation(periodID: number, projectPracInformativeID: number): void {
		this.admin.getProjectPracticesByPeriodValidation(periodID, projectPracInformativeID).subscribe({
			next: (res: ProjectValidation[]) => {
				//console.log('validation', res);
				this.projectValidation= res;
				this.activitiesFormGroup.controls['projectPracticeHours'].setValidators(
					[Validators.required, Validators.max(+this.projectValidation[0].projectPracticeHours)]
				);
				this.activitiesFormGroup.controls['budgeted'].setValidators(
					[Validators.required, Validators.max(+this.projectValidation[0].budgeted)]
				);
				this.activitiesFormGroup.updateValueAndValidity();
			},
			error: (err: HttpErrorResponse) => {
				this.loading= false;
			}
		});
	}

}
