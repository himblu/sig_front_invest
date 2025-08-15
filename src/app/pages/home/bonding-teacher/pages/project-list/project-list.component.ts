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
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';
import { Project, ProjectState } from '@utils/interfaces/campus.interfaces';
import { Period } from '@utils/interfaces/period.interfaces';
import { debounceTime, distinctUntilChanged } from 'rxjs';

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
		DatePipe
	],
	providers: [
		DatePipe
	],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	loading: boolean = false;
	public filtersForm!: FormGroup;
	public pageIndex: number = 1;
  public pageSize: number = 10;
  public length: number = 0;
  public pageEvent!: PageEvent;
  public pageSizeOptions: number[] = [5, 10, 25, 50, 100];
	public projectPractices: Project[] = [];
	public states: ProjectState[] = [];
	public periods: Period[] = [];

	@ViewChild('paginator', { static: true }) public paginator!: MatPaginator;

	private sanitizer: DomSanitizer = inject(DomSanitizer);

	constructor(private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService,
		private router: Router,
		private date: DatePipe){
		super();
		this.initFiltersForm();
	}

	public ngOnInit(): void {
		this.getProjectPractices();
		this.getProjectPracticesStates();
		this.getPeriods();
  }

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	private initFiltersForm(): void{
    this.filtersForm = this.fb.group({
      search: [''],
			state: 0,
			periodID: [0]
    });
		const searchInput: FormControl = this.filtersForm.get('search') as FormControl;
		if (searchInput) {
			searchInput.valueChanges.pipe(
				debounceTime(300),
				distinctUntilChanged(),
				untilComponentDestroyed(this)
			).subscribe({
				next: (value ) => {
					this.getProjectPractices();
				}
			});
		}
  }

	public getPeriods():void{
		this.api.getPeriods().subscribe({
      next: (res) => {
				this.periods = res.data;
      }
    });
	}

	public getProjectPractices(): void{
		const filters= this.filtersForm.value;
		this.admin.getTeacherProjectPractices(this.pageIndex, this.pageSize, filters.search, this.user.currentUser.PersonId, filters.state, filters.periodID).subscribe({
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
		this.router.navigateByUrl(`/vinculacion-docente/proyecto-docente/${item.projectPracticasID}/${item.periodID}/${item.projectPracInformativeID}`);
	}

	public getProjectPracticesInformativePdfContent(item: Project): void{
		this.admin.getProjectPracticesInformativePdfContent(item.projectPracInformativeID).subscribe({
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

}
