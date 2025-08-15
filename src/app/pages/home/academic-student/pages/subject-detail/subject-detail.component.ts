import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { NgForOf, NgIf } from '@angular/common';
import { DatePipe } from '@angular/common';
import { CurrentPeriod } from '@utils/interfaces/others.interfaces';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '@services/user.service';
import { StudentActivity, StudentSubjects, StudentTask } from '@utils/interfaces/person.interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'app-subject-detail',
  templateUrl: './subject-detail.component.html',
  styleUrls: ['./subject-detail.component.css'],
	standalone: true,
	imports: [
		NgIf,
		NgForOf,
		ReactiveFormsModule,
	],
	providers: [
    DatePipe
  ],
})
export class SubjectDetailComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	charging: boolean = false;
	subject: StudentSubjects;
	tasks: StudentTask[];

	constructor(private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private datePipe: DatePipe,
		private user: UserService,
		private router: Router ){
		super();
	}

	public ngOnInit(): void {
		this.getSubject();
  }

  public override ngOnDestroy() {
    super.ngOnDestroy();
  }

	private getSubject(): void{
		this.charging=true;
		this.subject = this.common.sendTask;
		if(!this.subject){
			this.charging=false;
			this.router.navigate(['/academico-estudiante/listado-asignaturas']);
		}else{
			this.getStudentTasks();
			setTimeout(() => {
				this.charging=false;
    	}, 200);
		}
	}

	private getStudentTasks(): void {
		this.charging = true;
    this.api.getStudentTasksActivities(this.subject.periodID, this.subject.courseID, this.subject.studyPlanID, this.subject.parallelCode).subscribe({
      next: (res) => {
        //console.log(res);
				this.tasks=res;
				this.charging = false;
      },
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
				this.charging = false;
			}
    });
  }

	public getStudentActivity(activity:StudentActivity, item:StudentTask): void{
		this.api.getStudentTasks(item.periodID, this.subject.studentID, item.classSectionNumber, activity.taskID).subscribe({
      next: (res) => {
        //console.log(res);
				this.api.event=res[0];
				this.router.navigateByUrl('/academico-estudiante/tareas');
      },
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
    });
	}

}
