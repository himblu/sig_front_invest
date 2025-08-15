import { Component, ViewChild, ElementRef, OnInit, OnDestroy, inject, SecurityContext, Input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { NgFor, NgForOf, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpErrorResponse } from '@angular/common/http';
import { filter, map, Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '@services/user.service';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute } from '@angular/router';
import { Period } from '@utils/interfaces/period.interfaces';
import { CurrentPeriod } from '@utils/interfaces/others.interfaces';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { LinkageProject, MicroProject } from '@utils/interfaces/campus.interfaces';

@Component({
  selector: 'app-tutoring-list',
  standalone: true,
  imports: [
		ReactiveFormsModule,
		NgForOf,
		NgFor,
		NgIf,
		MatInputModule,
		MatButtonModule,
		MatFormFieldModule,
		MatSelectModule,
		MatTooltipModule,
		MatIconModule,
		MatMenuModule,
		MatPaginatorModule
	],
  templateUrl: './tutoring-list.component.html',
  styleUrls: ['./tutoring-list.component.css']
})

export class TutoringListComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public charging: boolean = false;
	public filtersForm!: FormGroup;
	public pageIndex: number = 1;
  public pageSize: number = 10;
  public length: number = 0;
  public pageEvent!: PageEvent;
  public pageSizeOptions: number[] = [5, 10, 25, 50, 100];
	public periods: Period[] = [];
	public currentPeriod: CurrentPeriod
	public microProjects: MicroProject[] = [];
	public linkageProjects: LinkageProject[] = [];

	@ViewChild('paginator', { static: true }) public paginator!: MatPaginator;
	private activatedRoute: ActivatedRoute = inject(ActivatedRoute);

	constructor(private fb: FormBuilder,
		private common: CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService ){
		super();
		this.initForms();
	}

	ngOnInit(): void {
		this.getDataFromResolver();
		this.getProjectsByTutor();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	private getDataFromResolver(): void {
    this.activatedRoute.data
    .pipe(untilComponentDestroyed(this), map((value: any) => value['resolver']))
    .subscribe({ next: (value: {
				periods: Period[],
				currentPeriod: CurrentPeriod
			}) => {
        this.periods = value.periods;
        this.currentPeriod = value.currentPeriod;
      },
    });
		this.filtersForm.get('periodID').patchValue(this.currentPeriod.periodID);
  }

	public initForms(): void {
		this.filtersForm= this.fb.group({
			filter: '',
			personID: this.user.currentUser.PersonId,
			periodID: ['', Validators.required],
			projectInformativeID: ['', Validators.required],
			page: 1,
			size: 10
		})
	}

	public getProjectsByTutor(): void{
		this.charging= true;
		let	filters= this.filtersForm.value;
		this.admin.getProjectsByTutor(filters.periodID, filters.personID).subscribe({
			next: (res) => {
				//console.log('getProjectsByTutor', res);
				this.microProjects= res;
				this.charging = false;
			},
			error: (err: HttpErrorResponse) => {
					this.charging = false;
			}
		});
	}

	public getLinkageProjectsByTutor(): void{
		this.filtersForm.get('page').patchValue(this.pageIndex);
		this.filtersForm.get('size').patchValue(this.pageSize);
		if(this.filtersForm.valid){
			this.charging= true;
			this.admin.getLinkageProjectsByTutor(this.filtersForm.value).subscribe({
				next: (res) => {
					//console.log('getLinkageProjectsByTutor', res);
					this.linkageProjects= res.data;
					this.length= res.count;
					this.charging = false;
				},
				error: (err: HttpErrorResponse) => {
						this.charging = false;
				}
			});
		}else{
			this.filtersForm.markAllAsTouched();
		}
	}

	public getPaginator(event: PageEvent): PageEvent {
    this.pageIndex = event.pageIndex+1;
    this.pageSize = event.pageSize;
		this.getLinkageProjectsByTutor();
    return event;
  }

}
