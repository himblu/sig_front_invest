import { Component, ViewChild, ElementRef, OnInit, OnDestroy, inject, Input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, FormArray, } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { NgForOf, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CurrentPeriod, SubjectsList } from '@utils/interfaces/others.interfaces';
import { Partial, SubComponent, Task } from '@utils/interfaces/period.interfaces';
import { UserService } from '@services/user.service';
import { Student, TaskGrade } from '@utils/interfaces/campus.interfaces';
import { DatePipe } from '@angular/common';
import { environment } from '@environments/environment';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'component-grades',
  templateUrl: './grades.component.html',
  styleUrls: ['./grades.component.css'],
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
		MatTabsModule,
		MatCheckboxModule,
		MatSnackBarModule,
		MatPaginatorModule
	],
	providers: [
    DatePipe
  ],
})
export class GradesComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	charging: boolean = false;
	public filtersForm!: FormGroup;
	public gradesForm!: FormGroup;
	@Input('subject') subject: SubjectsList;
	public gradesList: TaskGrade[];
	public partialList: Partial[];
	public activitiesList: SubComponent[];
	public taskList: Task[];
  public pageIndex: number = 1;
	public pageSize: number = 25;
	public length: number = 0;
	public pageEvent!: PageEvent;
	public pageSizeOptions: number[] = [5, 10, 25, 50, 100];
	public title: string = '';
	public actualDate = new Date();
	public url= environment.url;

	private user: UserService = inject(UserService);

	constructor(private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private datePipe: DatePipe,
		private snackBar: MatSnackBar, ){
		super();
	}

	public ngOnInit(): void {
		this.getSubject();
  }

  public override ngOnDestroy() {
    super.ngOnDestroy();
  }

	private getSubject(): void{
		//this.subject = this.common.sendSubject;
		if(!this.subject){
			this.ngOnDestroy();
		}else{
			this.getPartials();
			this.initForm();
			this.initGradesForm();
			//console.log(this.subject);
		}
	}

	public initForm():void{
    this.filtersForm = this.fb.group({
      componentID: ['', [Validators.required]],
			subComponentID: ['', [Validators.required]],
			taskID: ['', [Validators.required]]
    });
	}

	public initGradesForm():void {
		this.gradesForm = this.fb.group({
			grades: this.fb.array([]),
		});
	}

	public gradesFormRow(): FormGroup {
		return this.fb.group({
			flgFile: [null, [Validators.required]],
			periodID: [null, [Validators.required]],
			studentID: [null, [Validators.required]],
			classSectionNumber: [null, [Validators.required]],
			taskID: [null, [Validators.required]],
			grade: [null, [Validators.required, Validators.min(0), Validators.max(10)]],
			commentary: null,
			student: '',
			user: this.user.currentUser.userName
		});
	}

	public getGradesFormRow(): FormArray {
    return (this.gradesForm.controls['grades'] as FormArray);
	}

	private addGradesFormRow(): void {
		const array = this.getGradesFormRow();
		array.push(this.gradesFormRow());
	}

	public onSubmitGrades(): void {
		this.charging= true;
		if(this.filtersForm.valid && this.gradesForm.valid){
			//console.log(this.getGradesFormRow().getRawValue());
			this.api.putSettingTasksGrade({'data': this.getGradesFormRow().getRawValue()}).subscribe({
				next: (res:any) => {
					//console.log(res);
					this.common.message(`${res[0].message}`,'','success','#86bc57');
					this.getStudents();
					this.charging= false;
				},
				error: (err: HttpErrorResponse) => {
					//console.log('err',err);
					this.snackBar.open(
						`${err.error.message[0]}`,
						'',
						{
							horizontalPosition: 'center',
							verticalPosition: 'top',
							duration: 4000,
							panelClass: ['red-snackbar']
						}
					);
					this.charging= false;
				}
			});
		}else{
			this.filtersForm.markAllAsTouched();
			this.gradesForm.markAllAsTouched();
			this.charging= false;
		}
	}

	public getPartials(){
		this.charging = true;
    this.api.getPartials(this.subject.periodID).subscribe({
      next: (res) => {
        this.partialList = res.data;
				this.charging = false;
      },
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
				this.charging = false;
			}
    });
	}

	public getActivities(){
		this.filtersForm.get('subComponentID').patchValue('');
		this.api.getSubComponent(this.subject.periodID, this.filtersForm.get('componentID').value).subscribe({
			next: (res) => {
			this.activitiesList = res;
			},
				error: (err: HttpErrorResponse) => {
					console.log('err',err);
				}
		});
	}

	public getTasks(){
		this.filtersForm.get('taskID').patchValue('');
		this.api.getSettingsTasksByActivitie(this.subject.periodID, this.subject.personID, this.filtersForm.get('componentID').value, this.filtersForm.get('subComponentID').value,
		this.subject.careerID, this.subject.studyPlanID, this.subject.courseID, this.subject.parallelCode).subscribe({
			next: (res) => {
				//console.log('tasks', res);
				this.taskList=res;
			},
				error: (err: HttpErrorResponse) => {
					console.log('err',err);
				}
		});
	}

	public getStudents(): void{
		//this.charging=true;
		this.admin.getSettingstasks(this.subject.periodID, this.subject.classSectionNumber, this.filtersForm.get('componentID').value, this.filtersForm.get('subComponentID').value,
		this.user.currentUser.PersonId, this.filtersForm.get('taskID').value, this.pageIndex, this.pageSize).subscribe({
			next: async (res) => {
				this.initGradesForm();
				this.gradesList= res.data;
				this.length = res.count;
				this.charging= false;
				for(let i=0; i<res.data.length; i++){
					this.addGradesFormRow();
					this.getGradesFormRow().controls[i].patchValue(res.data[i]);
					if(res.data[i].flgFile === null) this.getGradesFormRow().controls[i].get('flgFile').patchValue(0);
					if(res.data[i].flgPayment === 1){
						this.getGradesFormRow().controls[i].get('grade').patchValue(null);
						this.getGradesFormRow().controls[i].get('grade').setValidators(null);
						this.getGradesFormRow().controls[i].get('grade').disable();
						this.getGradesFormRow().controls[i].get('commentary').disable();
						this.getGradesFormRow().updateValueAndValidity();
					}
				}//console.log('students', this.gradesForm.value);
			},
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
				this.charging=false;
			}
		});
	}

	public changePage(event: PageEvent): PageEvent {
		this.pageIndex = event.pageIndex+1;
    this.pageSize = event.pageSize;
		this.getStudents();
    return event;
	}

}
