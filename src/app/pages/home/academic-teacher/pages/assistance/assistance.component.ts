import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { CommonService } from '@services/common.service';
import { NgForOf, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TakeAssistanceComponent } from './components/take-assistance/take-assistance.component';
import { TasksComponent } from './components/tasks/tasks.component';
import { GradesComponent } from './components/grades/grades.component';
import { NotesComponent } from './components/notes/notes.component';
import { Router } from '@angular/router';
import { SubjectsList } from '@utils/interfaces/others.interfaces';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-assistance',
  templateUrl: './assistance.component.html',
  styleUrls: ['./assistance.component.css'],
	standalone: true,
	imports: [
		NgIf,
		ReactiveFormsModule,
		MatInputModule,
		MatButtonModule,
		MatFormFieldModule,
		MatSelectModule,
		MatTooltipModule,
		MatIconModule,
		MatTabsModule,
		MatCheckboxModule,
		TakeAssistanceComponent,
		//PartialsComponent,
		TasksComponent,
		GradesComponent,
		NotesComponent
	],
	providers: [
    DatePipe
  ],
})
export class AssistanceComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public charging: boolean = false;
	public subject!: SubjectsList;

	constructor(private fb: FormBuilder,
		private common:CommonService,
		private router: Router,){
		super();
	}

	public ngOnInit(): void {
		this.getSubject();
  }

	private getSubject(): void{
		this.charging = true;
		this.subject = this.common.sendSubject;
		//console.log(this.subject);
		if(!this.subject){
			this.charging=false;
			this.router.navigate(['/academico-docente/asignaturas']);
		}else setTimeout(() => {
			this.charging=false;
		}, 200);
	}

  public override ngOnDestroy() {
		this.common.sendSubject= null;
    super.ngOnDestroy();
  }

}
