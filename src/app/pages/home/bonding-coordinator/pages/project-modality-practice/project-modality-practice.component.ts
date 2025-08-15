import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit, SecurityContext } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { environment } from '@environments/environment';
import { ApiService } from '@services/api.service';
import { Paginated } from '@utils/interfaces/others.interfaces';
import { Period } from '@utils/interfaces/period.interfaces';
import { ProjectPracticasByModalityPractice } from '@utils/interfaces/person.interfaces';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { debounceTime, distinctUntilChanged, map, Subscription } from 'rxjs';
import { ROL } from '@utils/interfaces/login.interfaces';
import { ModalityByCareer, School, SPGetCareer, StudyPlan } from '@utils/interfaces/campus.interfaces';
import { AdministrativeService } from '@services/administrative.service';
import { UserService } from '@services/user.service';
import { DomSanitizer } from '@angular/platform-browser';

const DISPLAYED_COLUMNS: string[] = [
  "studentName",
  "documentNumber",
  "nameProject",
  "careerName",
  "modalityName",
  "cycleDesc",
  "parallelCode",
  "tutorName",
  "grade",
  "gradeState",
  "actions",
];

@Component({
  selector: 'app-project-modality-practice',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTooltipModule,
    MatTableModule,
    MatIconModule,
    MatMenuModule,
    MatPaginatorModule,
    MatRippleModule,
    NgClass,
    MatButtonModule,
    NgIf,
    MatSortModule,
    MatInputModule,
    NgForOf,
    MatDatepickerModule,
    MatNativeDateModule,
    //DatePipe,
    MatDialogModule,
    SpinnerLoaderComponent,
    MatSnackBarModule
  ],
  templateUrl: './project-modality-practice.component.html',
  styleUrls: ['./project-modality-practice.component.css']
})
export class ProjectModalityPracticeComponent extends OnDestroyMixin
  implements OnInit, OnDestroy {

  public periods: Array<Period> = [];
	public schools: School[];
	public careers: SPGetCareer[];
	public studyPlan: StudyPlan[];
	public modalities: ModalityByCareer[];
  public currentPeriodId: number = 0;
  public modalityPracticeID: number = 0;
  public filtersForm!: FormGroup;
  public loadingProjectPracticas: boolean = false;
  public projectPracticasByModalityPractice: Array<ProjectPracticasByModalityPractice> = [];
  public pageIndex: number = 0;
  public pageSize: number = 10;
  public length: number = 0;
  public filters: string = "";
  public pageSizeOptions: number[] = [5, 10, 25, 50, 100];
  public displayedColumns: string[] = DISPLAYED_COLUMNS;
  public pageEvent!: PageEvent;
  public dataSource!: MatTableDataSource<ProjectPracticasByModalityPractice>;
	public currentRol= sessionStorage.getItem('rol');
	public readonly rol = ROL;
  public isDisabledReportDirector:boolean =true;
  public isDisabledReport:boolean =true;
  private sanitizer: DomSanitizer = inject(DomSanitizer);
  private snackBar: MatSnackBar = inject(MatSnackBar);

	private getProjectPracticasSubscription!: Subscription;
  private formBuilder: FormBuilder = inject(FormBuilder);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private api: ApiService = inject(ApiService);
	private admin: AdministrativeService = inject(AdministrativeService);
	private user: UserService = inject(UserService);

  public ngOnInit(): void {
    this.initForm();
    this.getDataFromResolver();
    //this.getProjectPracticas();
		this.getSchools();
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.getProjectPracticasSubscription) {
      this.getProjectPracticasSubscription.unsubscribe();
    }
  }

  private getDataFromResolver(): void {
    this.activatedRoute.data
		.pipe(
			untilComponentDestroyed(this),
			map((value: any) => value["resolver"])
		)
		.subscribe({
			next: (value: {
				periods: Period[];
				currentPeriod: any;
				modalityPracticeID: number;
			}) => {
				this.periods = value.periods;
				this.currentPeriodId = value.currentPeriod?.periodID;
				this.modalityPracticeID = value.modalityPracticeID
			},
		});
  }

  private initForm(): void {
    this.filtersForm = this.formBuilder.group({
      period: ['', Validators.required],
			schoolID: 0,
			careerID: 0,
			studyPlanID: 0,
			modalityID: 0,
			stateID: 0,
      search: "",
    });
    const searchInput: FormControl = this.filtersForm.get(
      "search"
    ) as FormControl;
    if (searchInput) {
      searchInput.valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          untilComponentDestroyed(this)
        )
        .subscribe({
          next: (value) => {
            this.getProjectPracticas();
          },
        });
    }
  }

  public getProjectPracticas(event?: Sort): void {
    if (this.getProjectPracticasSubscription) this.getProjectPracticasSubscription.unsubscribe();
    if(this.filtersForm.valid){
			this.loadingProjectPracticas = true;
			let filter = this.filtersForm.value;
      this.isDisabledReportDirector=false;
      this.isDisabledReport=false;
			this.getProjectPracticasSubscription = this.api
			.getProjectPracticasByModalityPractice(
				filter.period,
				filter.careerID,
				filter.studyPlanID,
				filter.modalityID,
				filter.stateID,
				this.modalityPracticeID,
				filter.search,
				this.pageIndex,
				this.pageSize
			)
			.subscribe({
				next: (value: Paginated<ProjectPracticasByModalityPractice>) => {
					this.projectPracticasByModalityPractice = value.data as Array<ProjectPracticasByModalityPractice>;
					this.length = value.count;
					this.dataSource = new MatTableDataSource<ProjectPracticasByModalityPractice>(
						this.projectPracticasByModalityPractice
					);
					this.loadingProjectPracticas = false;
				},
				error: (err: HttpErrorResponse) => {
					console.log(err);
					this.loadingProjectPracticas = false;
				},
			});
		}else{
			this.filtersForm.markAllAsTouched();
		}
  }

  public trackByPeriodId(index: number, item: Period): number {
    return item.periodID;
  }

  public getProjectPracticasFromPaginator(event: PageEvent): PageEvent {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getProjectPracticas();
    return event;
  }

  truncateText(text: string, length: number) {
    const truncateText = text.length > length
      ? text.slice(0, length) + "..."
      : text;
    return truncateText
  }

  checkIfAllArrayContainsNullProperties(array: Array<{
    fileTypeName: string | null,
    urlFile: string | null
  }>) {
    return array.every(item => item.fileTypeName === null && item.urlFile === null)
  }

	public openFile(relativeRoute: string): void {
		if(relativeRoute.includes('http') || relativeRoute.includes('www')){
			window.open(relativeRoute, '_blank');
		}else{
			window.open(environment.pullZone + relativeRoute, '_blank');
		}
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
    this.isDisabledReport=true;
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
    this.isDisabledReport=true;
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

  public getGeneralReportSumary(rute: string): void{
      const fileName ='reporte proyectos de practicas';
      let filters= this.filtersForm.value;
      let body= {
        "periodID": filters.period,
        "schoolID": filters.schoolID  ?? 0,
        "careerID": filters.careerID ?? 0,
        "studyPlanID": filters.studyPlanID ?? 0
      }
      this.admin.getReportInstruments(rute, body).subscribe({
        next: (res) => {
        if (res.body) {
          const contentType = res.headers.get('content-type') || undefined;
          
          const blob = new Blob([res.body], { type: contentType });
          const url = this.sanitizer.sanitize(
            SecurityContext.RESOURCE_URL, 
            this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob))
          ); 
          if (url) {
            if(contentType === 'application/pdf'){
              window.open(url, '_blank');
            }else{
              const link = document.createElement('a');
              link.href = url;
              link.download = fileName;
              document.body.appendChild(link);
              link.click();
  
              // Limpiar memoria
              URL.revokeObjectURL(link.href);
              document.body.removeChild(link);
            }
          }
        }
      },
      error: (err: HttpErrorResponse) => {
        // console.error('Error al obtener el reporte:', err);
        this.snackBar.open(
          `No hay datos disponibles para generar el reporte.`,
          null,
          {
            horizontalPosition: 'center',
            verticalPosition: 'top',
            duration: 4000,
            panelClass: ['red-snackbar']
          }
        );
        }
      });
    }
}
