import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
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
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-teacher-evaluation',
  templateUrl: './teacher-evaluation.component.html',
  styleUrls: ['./teacher-evaluation.component.css'],
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
		MatRadioModule
	],
})
export class TeacherEvaluationComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	cargando: boolean = false;
	public tasksForm!: FormGroup;
	public filtersForm!: FormGroup;
	tasksList: any [] = [];
  actualTasks: number = 1;
  totalPageTasks: number = 0;
  countTasks: number = 0;
	pageTasksLimit:number = 10;
	title: string = '';

	constructor(private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService ){
		super();
	}

	public ngOnInit(): void {
		this.initForm();
  }

  public override ngOnDestroy() {
    super.ngOnDestroy();
  }

	public initForm():void{
		this.filtersForm = this.fb.group({
      subject: ['', [Validators.required]]
    });

		this.tasksForm = this.fb.group({
      description: ['', [Validators.required]],
			file: ['', [Validators.required]]
    });
	}

	public onSubmitTasks():void{

	}

	public changePageTasks(page:number):void{

	}

}
