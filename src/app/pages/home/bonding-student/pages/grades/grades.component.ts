import { Component, ViewChild, ElementRef, OnInit, OnDestroy, SecurityContext, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { UserService } from '@services/user.service';
import { ActivatedRoute } from '@angular/router';
import { filter, map, Subscription } from 'rxjs';
import { GradeLinkage, ProjectPracticeModality } from '@utils/interfaces/campus.interfaces';

@Component({
  selector: 'app-grades',
  standalone: true,
  templateUrl: './grades.component.html',
  styleUrls: ['./grades.component.css'],
	imports: [
		NgIf,
		NgForOf,
		ReactiveFormsModule,
		MatInputModule,
		MatButtonModule,
		MatFormFieldModule,
		MatSelectModule,
		MatTooltipModule,
	],
})

export class GradesComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public isLoading: boolean = false;
	public filtersForm!: FormGroup;
	public modalityPractices: ProjectPracticeModality[] = [];
	public grades: GradeLinkage[] = [];

	private activatedRoute: ActivatedRoute = inject(ActivatedRoute);

	constructor(private fb: FormBuilder,
		private common: CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService, ){
		super();
		this.initFiltersForm();
	}

	ngOnInit(): void {
		this.getDataFromResolver();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	private getDataFromResolver(): void {
    this.activatedRoute.data
    .pipe(untilComponentDestroyed(this), map((value: any) => value['resolver']))
    .subscribe({ next: (value: {
				modalityPractices: ProjectPracticeModality[]
			}) => {
        this.modalityPractices= value.modalityPractices
      },
    });
  }

	public initFiltersForm(): void {
		this.filtersForm= this.fb.group({
			modalityPracticeID: ['', Validators.required]
		})
	}

	public getGradeLinkageByPerson(): void{
		this.isLoading= true;
		this.admin.getGradeLinkageByPerson(this.user.currentUser.PersonId, this.filtersForm.get('modalityPracticeID').value).subscribe({
			next: (res: GradeLinkage[]) => {
				//console.log(res);
				this.grades= res;
				this.isLoading = false;
			},
			error: (err: HttpErrorResponse) => {
				this.isLoading = false;
			}
		});
	}

}
