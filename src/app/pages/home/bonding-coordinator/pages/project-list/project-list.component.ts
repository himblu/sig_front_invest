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
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { UserService } from '@services/user.service';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';
import { CycleDetail, ModalityByCareer, Project, ProjectState, School, SPGetCareer, StudyPlan } from '@utils/interfaces/campus.interfaces';
import { Period } from '@utils/interfaces/period.interfaces';
import { CurrentPeriod } from '@utils/interfaces/others.interfaces';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { MicroProjectsComponent } from '../../components/micro-projects/micro-projects.component';

@Component({
  selector: 'app-project-list',
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
		MatNativeDateModule,
		MatPaginatorModule,
		MatMenuModule,
		MatDatepickerModule,
		DatePipe,
		FormsModule,
		MatDialogModule,
		//MicroProjectsComponent
	],
	providers: [
		DatePipe
	],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public loading: boolean = false;
	public filtersForm!: FormGroup;
	public pageIndex: number = 1;
  public pageSize: number = 10;
  public length: number = 0;
  public pageEvent!: PageEvent;
  public pageSizeOptions: number[] = [5, 10, 25, 50, 100];
	public currentPeriod: CurrentPeriod;
	public projectPractices: Project[] = [];
	public periods: Period[];
	public schools: School[];
	public careers: SPGetCareer[];
	public studyPlan: StudyPlan[];
	public modalities: ModalityByCareer[];
	public cycleDetail: CycleDetail[];
	public states: ProjectState[] = [];

	@ViewChild('paginator', { static: true }) public paginator!: MatPaginator;

	private sanitizer: DomSanitizer = inject(DomSanitizer);

	constructor(private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService,
		private router: Router,
		private date: DatePipe,
		private activeRoute: ActivatedRoute,
		private dialog: MatDialog){
		super();
		this.initFiltersForm();
	}

	public ngOnInit(): void {
		this.getCurrentPeriod();
		this.getPeriods();
		this.getProjectPracticesStates();
  }

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	private initFiltersForm(): void{
    this.filtersForm = this.fb.group({
      search: [''],
			state: [0],
			schoolID: ['', [Validators.required]],
			careerID: ['', [Validators.required]],
      studyPlanID: ['', [Validators.required]],
			periodID: ['', [Validators.required]],
			modalityID: ['', [Validators.required]],
			cycleID: [0],
    });
  }

	public getProjectPractices(): void{
		let	filters= this.filtersForm.value;
		this.admin.getProjectPractices(this.pageIndex, this.pageSize, this.filtersForm.get('search').value,
			filters.periodID, filters.schoolID, filters.careerID, filters.studyPlanID, filters.modalityID, this.filtersForm.get('state').value).subscribe({
			next: (res) => {
				//console.log('ProjectPractices', res.data);
				this.projectPractices = res.data;
				this.length = res.count;
				this.loading = false;
			},
			error: (err: HttpErrorResponse) => {
					this.loading = false;
			}
		});
	}

	public getPaginator(event: PageEvent): PageEvent {
		//console.log(event);
    this.pageIndex = event.pageIndex+1;
    this.pageSize = event.pageSize;
		this.getProjectPractices();
    return event;
  }

	public completeProject(item: Project): void {
		this.router.navigateByUrl(`/vinculacion-coordinador/proyecto-coordinador/${item.projectPracticasID}/${item.careerID}/${item.studyPlanID}/${item.schoolID}/${item.modalityID}`);
	}

	private getCurrentPeriod(): void{
		this.api.getCurrentPeriod().subscribe({
			next: (res: CurrentPeriod) => {
				this.currentPeriod= res;
				this.filtersForm.get('periodID').patchValue(res.periodID);
				this.getSchools();
				this.loading = false;
			},
			error: (err: HttpErrorResponse) => {
				this.loading = false;
			}
		});
	}

	private getPeriods(): void{
		this.loading=true;
    this.api.getPeriods().subscribe({
      next: (res) => {
        this.periods = res.data;
				this.loading=false;
      },
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.loading=false;
			}
    });
	}

	public getSchools(): void{
		this.admin.getSchoolsByPerson(this.user.currentUser.PersonId).subscribe({
			next: (res) => {
				this.schools = res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getCareers(schoolID:number): void{
		this.admin.getCareersByPerson(this.user.currentUser.PersonId, schoolID).subscribe({
			next: (res) => {
				this.careers = res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getStudyPlan(careerID:number): void{
		this.admin.getStudyPlansByCareer(careerID).subscribe({
			next: (res) => {
				this.studyPlan = res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getModalities(careerID: number): void{
		this.filtersForm.get('modalityID').patchValue('');
		this.admin.getModalitiesByCareer(careerID).subscribe({
			next: (res) => {
				this.modalities= res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getCycles(): void{
		this.filtersForm.get('cycleID').patchValue(0);
		this.admin.getCyclesByCareerAndStudyPlan(this.filtersForm.get('studyPlanID').value, this.filtersForm.get('careerID').value).subscribe({
			next: (res: CycleDetail[]) => {
					//console.log(res);
					this.cycleDetail=res;
					this.loading = false;
			},
			error: (err: HttpErrorResponse) => {
					this.loading = false;
			}
		});
	}

	public getProjectPracticesPdfContent(item: Project): void{
		this.admin.getProjectPracticesPdfContent(item.periodID, item.projectPracticasID, item.careerID, item.studyPlanID).subscribe({
			next: (res) => {
				//console.log(res);
				const blob: Blob = new Blob([res.body], { type: 'application/pdf' });
        const url = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob)));
        if (url) {
          window.open(url, '_blank');
        }
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getProjectPracticesExcelContent(item: Project): void{
		this.admin.getProjectPracticesExcelContent(item.projectPracInformativeID).subscribe({
			next: (res) => {
				let contentType: string | null | undefined = res.headers.get('content-type');
        // Porque el tipo de variable que recibe el type es string o undefined. No recibe null.
        if (!contentType) {
          contentType = undefined;
        }
				const blob: Blob = new Blob([res.body], { type: contentType });
        const url = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob)));
        if (url) {
          window.open(url, '_blank');
        }
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getProjectPracticesStates(): void{
		this.admin.getProjectPracticesStates().subscribe({
			next: (res) => {
				//console.log('ProjectPracticesStates', res);
				this.states= res;
				this.loading = false;
			},
			error: (err: HttpErrorResponse) => {
					this.loading = false;
			}
		});
	}

	public microProjectsView(item: Project): void {
		const config: MatDialogConfig = new MatDialogConfig();
		this.dialog.closeAll();
		config.id = 'microProjects';
		config.autoFocus = false;
		config.minWidth = '500px';
		config.maxWidth = '800px';
		config.panelClass = 'transparent-panel';
		config.data = { item };
		const dialog = this.dialog.open(MicroProjectsComponent, config);
		dialog.afterClosed().pipe(untilComponentDestroyed(this)).subscribe((res) => {

		});
	}

}
