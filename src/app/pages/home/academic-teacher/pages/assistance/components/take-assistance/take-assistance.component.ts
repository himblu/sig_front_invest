import { Component, ViewChild, ElementRef, OnInit, OnDestroy, Input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, FormArray } from '@angular/forms';
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
import { UserService } from '@services/user.service';
import { DatePipe } from '@angular/common';
import { SubjectsList } from '@utils/interfaces/others.interfaces';
import { AttendanceTeacher, Student } from '@utils/interfaces/campus.interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'component-take-assistance',
  templateUrl: './take-assistance.component.html',
  styleUrls: ['./take-assistance.component.css'],
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
		MatCheckboxModule
	],
	providers: [
    DatePipe
  ],
})
export class TakeAssistanceComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	charging: boolean = false;
	public studentForm!: FormGroup;
  actualStudents: number = 1;
  totalPageStudents: number = 0;
  countStudents: number = 0;
	pageStudentsLimit:number = 20;
  search: string = '';
	@Input('subject') subject: SubjectsList;
	public attendanceList:AttendanceTeacher;
	public studentsList: Student[];
	actualDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');

	constructor(private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService,
		private datePipe: DatePipe,
		private router: Router, ){
		super();
	}

	public ngOnInit(): void {
		this.getSubject();
  }

	private getSubject(): void{
		this.charging=true;
		//this.subject = this.common.sendSubject;
		if(!this.subject){
			this.ngOnDestroy();
			this.charging=false;
			this.router.navigate(['/academico-docente/asignaturas']);
		}else{
			this.getAttendance();
			this.getStudents();
			setTimeout(() => {
				this.charging=false;
    	}, 200);
		}
	}
  public override ngOnDestroy() {
    super.ngOnDestroy();
  }

	public initForm(): void{
		this.studentForm = this.fb.group({
      data: this.fb.array([])
    });
	}

	private studentFormRow(): FormGroup{
		return this.fb.group({
			attendanceStatusID: [''],
			periodID: this.subject.periodID,
			personID: this.user.currentUser.PersonId,
			classSectionNumber: this.subject.classSectionNumber,
			studentID: [''],
			commentary: '',
			student: [''],
			user: this.user.currentUser.userName
		});
	}

	private addStudentRow(): void {
		const array=<FormArray>this.studentForm.controls['data'];
		array.push(this.studentFormRow());
	}

	public getStudentRow():FormArray {
    return (this.studentForm.controls['data'] as FormArray);
	}

	public changePageStudents(page:number):void{
		this.actualStudents = page;
		this.getStudents();
	}

	public getAttendance(): void{
		this.admin.getAttendanceTeacherCourse(this.subject.periodID, this.user.currentUser.PersonId, this.actualDate, this.subject.classSectionNumber).subscribe({
			next: (res) => {
				//console.log('Attendance', res);
				if(res){
					this.attendanceList=res;
				}
			},
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
		});
	}

	public getStudents(): void{
		this.initForm();
		this.admin.getAttendanceStudents(this.subject.periodID, this.subject.classSectionNumber, this.actualStudents, this.pageStudentsLimit).subscribe({
			next: (res) => {
				this.studentsList=res.data;
				this.countStudents= res.count;
        if(this.countStudents<=this.pageStudentsLimit){
					this.totalPageStudents=1
				}else{
					this.totalPageStudents = Math.ceil(this.countStudents / this.pageStudentsLimit);
				}
				if(this.studentForm.controls['data'].value.length == 0){
					const data=this.getStudentRow();
					for(let i=0; i<this.studentsList.length; i++){
					this.addStudentRow();
					data.controls[i].get('studentID').patchValue(this.studentsList[i].studentID);
					data.controls[i].get('student').patchValue(this.studentsList[i].student);
					data.controls[i].get('attendanceStatusID').patchValue(this.studentsList[i].attendanceStatusID);
					}
				}
				//console.log('Students', this.studentForm.value);
			},
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
		});
	}

	public postAttendance(): void{
		//console.log(this.studentForm.value);
		this.admin.postAttendance(this.studentForm.value).subscribe({
			next: (res:any) => {
				this.common.message(`Asistencia Registrada`, '', 'success', '#86bc57');
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

}
