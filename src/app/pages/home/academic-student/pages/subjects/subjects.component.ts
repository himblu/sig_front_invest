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
import { StudentSubjects } from '@utils/interfaces/person.interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'app-subjects',
  templateUrl: './subjects.component.html',
  styleUrls: ['./subjects.component.scss'],
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
export class SubjectsComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	charging: boolean = false;
	currentPeriod:CurrentPeriod;
	subjectsList: StudentSubjects[];

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
		this.getCurrentPeriod();
  }

  public override ngOnDestroy() {
    super.ngOnDestroy();
  }

	private getCurrentPeriod(): void {
		this.charging = true;
    this.api.getCurrentPeriod().subscribe({
      next: (res: CurrentPeriod) => {
        this.currentPeriod = res;
				this.getStudentTasks();
				this.charging = false;
      },
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
				this.charging = false;
			}
    });
  }

	private getStudentTasks(): void {
		this.charging = true;
    this.api.getStudentTasksByPerson(this.currentPeriod.periodID, +sessionStorage.getItem('studentID')).subscribe({
      next: (res) => {
        //console.log(res);
				this.subjectsList=res;
				this.charging = false;
      },
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
				this.charging = false;
			}
    });
  }

	public sendSubject(item:StudentSubjects):void{
		this.common.sendTask = item;
		this.router.navigate(['/academico-estudiante/detalle-asignatura']);
	}

}
