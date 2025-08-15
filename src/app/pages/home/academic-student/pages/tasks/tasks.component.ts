import { Component, ViewChild, ElementRef, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { NgForOf, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { InputSearchComponent } from '@components/input-shearch/input-search.component';
import { ButtonArrowComponent } from '@components/button-arrow/button-arrow.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { StudentActivities } from '@utils/interfaces/campus.interfaces';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from '@environments/environment';

const MAX_FILE_SIZE = 5000000;

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css'],
	standalone: true,
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
		MatTabsModule,
		MatCheckboxModule,
		DatePipe,
		MatSnackBarModule,
	],
	providers: [
		DatePipe,
	],
})
export class TasksComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	charging: boolean = false;
	public tasksForm!: FormGroup;
	event:StudentActivities;
	file:File;
	url=environment.url;
	currentDate = new Date();

	private snackBar: MatSnackBar = inject(MatSnackBar);

	constructor(private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private router: Router,
		private datePipe: DatePipe, ){
		super();
	}

	public ngOnInit(): void {
		this.getEvent();
  }

  public override ngOnDestroy() {
    super.ngOnDestroy();
  }

	private getEvent(): void{
		this.charging=true;
		this.event = this.api.event;
		if(!this.event){
			///this.charging=false;
			this.ngOnDestroy();
			this.router.navigateByUrl('/academico-estudiante/actividades')
		}else{
			//console.log(this.event)
			setTimeout(() => {
				this.charging=false;
			}, 250);
			this.initForm();
			if(this.event.descriptionTask){
				this.tasksForm.get('descriptionTask').patchValue(this.event.descriptionTask)
			}
		}
	}

	public initForm():void{
		this.tasksForm = this.fb.group({
      descriptionTask: ['']
    });
	}

	public onSubmitTasks():void{
		if(this.file){
			const formData: FormData = new FormData();
			formData.append('file', this.file);
			formData.append('periodID', this.event.periodID.toString());
			formData.append('classSectionNumber', this.event.classSectionNumber.toString());
			formData.append('taskID', this.event.taskID.toString());
			formData.append('studentID', this.event.studentID.toString());
			formData.append('deliveryDate', this.datePipe.transform(this.currentDate, 'yyyy-MM-dd HH:mm'));
			formData.append('descriptionTask', this.tasksForm.get('descriptionTask').value);
			this.charging=true;

			if(this.event.submitted==null || this.event.submitted==0){
				this.admin.postStudentTask(formData).subscribe({
					next: (res:any) => {
						this.charging=false;
						this.common.message(`${res[0].message}`,'','success','#86bc57');
						this.router.navigateByUrl('/academico-estudiante/actividades')
					},
					error: (err: HttpErrorResponse) => {
						this.charging=false;
						this.file=null;
						console.log('err',err);
					}
				});
			}else{
				this.admin.putStudentTask(formData).subscribe({
					next: (res:any) => {
						this.charging=false;
						this.common.message(`${res[0].message}`,'','success','#86bc57');
						this.router.navigateByUrl('/academico-estudiante/actividades')
					},
					error: (err: HttpErrorResponse) => {
						this.charging=false;
						this.file=null;
						console.log('err',err);
					}
				});
			}
		}else{
			this.snackBar.open(
				`Archivo requerido`,
				null,
				{
					horizontalPosition: 'center',
					verticalPosition: 'top',
					duration: 4000,
					panelClass: ['red-snackbar']
				}
			);
		}
	}

	public onChangeInput(files: FileList, input: HTMLInputElement): void{
		if (files) {
			if(files[0].size > MAX_FILE_SIZE){
				input.value='';
				this.snackBar.open(
          `Máximo 5MB permitido`,
          null,
          {
            horizontalPosition: 'center',
            verticalPosition: 'top',
            duration: 4000,
            panelClass: ['red-snackbar']
          }
        );
			 }else{
				const file: File = files.item(0);
				const fileReader = new FileReader();
				if (file) {
					this.file=file;
				}
			 }
		}
	}

	public toDate(date:string): Date{
		return new Date(date);
	}

}
