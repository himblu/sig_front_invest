import { Component, ViewChild, ElementRef, OnInit, OnDestroy, Input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { NgForOf, NgIf, NgStyle } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SubjectsList } from '@utils/interfaces/others.interfaces';
import { Student, StudentGrades } from '@utils/interfaces/campus.interfaces';
import { ComponentPeriod } from '@utils/interfaces/period.interfaces';
import { UserService } from '@services/user.service';
import Swal from 'sweetalert2';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'component-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css'],
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
		MatPaginatorModule,
		NgStyle
	],
})
export class NotesComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public charging: boolean = false;
	public notesForm!: FormGroup;
	public studentsList: StudentGrades[];
	public gradesList: ComponentPeriod[];
	@Input('subject') subject: SubjectsList;
  public pageIndex: number = 1;
	public pageSize: number = 10;
	public length: number = 0;
	public pageEvent!: PageEvent;
	public pageSizeOptions: number[] = [5, 10, 25, 50, 100];
	public title: string = '';

	constructor(private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService ){
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
			this.getGrades();
			this.getStudents();
		}
	}

	public onSubmitNotes():void{

	}

	private getGrades(){
		this.charging = true;
    this.api.getComponentGrades(this.subject.periodID).subscribe({
      next: (res) => {
				//console.log(res);
       	this.gradesList=res;
				this.charging = false;
      },
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.charging = false;
			}
    });
	}

	private getStudents(): void{
		this.admin.getAcademicReport(this.subject.periodID, this.subject.classSectionNumber, this.pageIndex, this.pageSize).subscribe({
			next: (res) => {
				//console.log('students',res);
				this.studentsList=res.data;
				this.length = res.count;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public changePage(event: PageEvent): PageEvent {
		this.pageIndex = event.pageIndex+1;
    this.pageSize = event.pageSize;
		this.getStudents();
    return event;
	}

	public putNotes(student:StudentGrades ,grade:number, type:string): void{
		if(grade >= 0.1 && grade <= 10){
			//console.log(grade);
			Swal.fire({
				icon: 'question',
				title: `${grade}`,
				text: `¿Está seguro de ingresar la calificación?`,
				showCancelButton: true,
				confirmButtonText: "Si",
				cancelButtonText: "No",
				allowOutsideClick: false,
			}).then(result => {
				if(result.value){
					let body = {
						periodID: this.subject.periodID,
						studentID: student.studentID,
						classSectionNumber: this.subject.classSectionNumber,
						personID: this.user.currentUser.PersonId,
						typeEvaluation: type,
						grade: grade
					}
					this.admin.putExtraNote(body).subscribe({
						next: (res) => {
							//console.log(res);
							this.getStudents();
							this.common.message(`Calificación ingresada con éxito`,'','success','#86bc57');
						},
						error: (err: HttpErrorResponse) => {
							//console.log('err',err);
						}
					});
				}
			});
		}
	}

}
