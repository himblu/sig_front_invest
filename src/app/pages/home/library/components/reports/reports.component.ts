import { Component, ViewChild, ElementRef, OnInit, OnDestroy, inject, SecurityContext, HostListener } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, FormControl, } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { DatePipe, LocationStrategy, NgFor, NgForOf, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { UserService } from '@services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ApplicantType } from '@utils/interfaces/library.interface';
import { LibrarySpace, LibrarySpaceAttendance } from '@utils/interfaces/period.interfaces';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from '@environments/environment';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
		ReactiveFormsModule,
		NgFor,
		NgIf,
		MatInputModule,
		MatButtonModule,
		MatFormFieldModule,
		MatSelectModule,
		MatTooltipModule,
		MatPaginatorModule,
		MatIconModule,
		MatSnackBarModule
	],
	providers: [
		DatePipe
	],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})

export class ReportsComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public isLoading: boolean = false;
	public filtersForm!: FormGroup;
	public pageIndex: number = 1;
  public pageSize: number = 10;
	public length: number = 0;
	public pageEvent!: PageEvent;
  public pageSizeOptions: number[] = [5, 10, 25, 50, 100];
	public librarySpaces: LibrarySpace[] = [];
	public librarySpaceAttendance: LibrarySpaceAttendance[] = [];
	public users: ApplicantType[] = [];
	public now: string= this.formattedDate(new Date);

	private currentPeriodID: number;
	private getPdfContentSubscription!: Subscription;
	private sanitizer: DomSanitizer = inject(DomSanitizer);
	private snackBar: MatSnackBar = inject(MatSnackBar);

	constructor(private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private router: Router,
		private activeRoute: ActivatedRoute,
		private user: UserService,
		private datePipe: DatePipe,){
		super();
		this.initForm();
	}

	ngOnInit(): void {
		this.getLibrarySpace();
		this.getApplicantTypeFromRol();
		this.getCurrentPeriod();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	public initForm(): void {
		this.filtersForm = this.fb.group({
			search: '',
			applicantTypeID: ['', Validators.required],
			librarySpaceID: ['', Validators.required],
			initDate: [this.now, Validators.required],
			endDate: [this.now, Validators.required],
		});
		const search= this.filtersForm.get('search') as FormControl;
		if(search) search.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      untilComponentDestroyed(this)
    ).subscribe({
      next: (value) => {
        this.getLibrarySpaceAttendance(false);
      },
    });
	}

	public changePage(event: PageEvent): PageEvent {
		this.pageIndex = event.pageIndex+1;
    this.pageSize = event.pageSize;
		this.getLibrarySpaceAttendance(false);
    return event;
	}

	public getLibrarySpace(): void {
		this.isLoading= true;
		this.api.getLibrarySpace('', 0, 100).subscribe({
			next: (res) => {
				//console.log('LibrarySpace', res);
				this.librarySpaces= res.data;
				this.isLoading= false;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.isLoading= false;
			}
		});
	}

	public getApplicantTypeFromRol():  void {
		this.api.getAllApplicantTypeFromRol(1).subscribe({
			next: (res) => {
				//console.log('users', res);
				this.users= res;
			},
			error: (err: HttpErrorResponse) => {
			}
		})
	}

	public getLibrarySpaceAttendance(state: boolean= true): void {
		if(this.filtersForm.valid){
			this.isLoading= state;
			const filters= this.filtersForm.value;
			this.api.getLibrarySpaceAttendance(filters.applicantTypeID, filters.librarySpaceID, filters.initDate, filters.endDate,
				filters.search, this.pageIndex, this.pageSize).subscribe({
				next: (res) => {
					//console.log('getLibrarySpaceAttendance', res);
					this.librarySpaceAttendance= res.data;
					this.length = res.count;
					this.isLoading= false;
				},
				error: (err: HttpErrorResponse) => {
					//console.log('err',err);
					this.isLoading= false;
				}
			});
		}else{
			this.filtersForm.markAllAsTouched();
		}
	}

	private formattedDate(date: Date): string {
    return <string>this.datePipe.transform(date, 'yyyy-MM-dd');
  }

	public getCurrentPeriod(): void{
		this.api.getCurrentPeriod().subscribe({
			next: (res) => {
				this.currentPeriodID = res.periodID;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public postLibrarySpacesAttendance(item: LibrarySpaceAttendance): void {
		let body= {
			applicantTypeID: item.applicantTypeID,
			externalPersonID: item.externalPersonID,
			librarySpaceID: item.librarySpaceID,
			periodID: this.currentPeriodID,
			studentID: item.studentID,
			teacherID: item.teacherID,
			stateAttendance: 1,
			personID: item.personID,
			dateAttendanceEntry: item.dateAttendanceEntry,
			user: this.user.currentUser.userName
		}
		this.api.putLibrarySpacesAttendance(body).subscribe({
			next: (res: any) => {
				//console.log('post', res);
				this.snackBar.open(
					`${res.message}`,
					null,
					{
						horizontalPosition: 'center',
						verticalPosition: 'top',
						duration: 4000,
						panelClass: ['green-snackbar']
					}
				);
				this.getLibrarySpaceAttendance();
			},
			error: (err: HttpErrorResponse) => {
				//console.log(err);
				this.snackBar.open(
					`${err.error.message}`,
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

	public downloadReport(): void {
		if(this.filtersForm.valid){
			const filters= this.filtersForm.value;
			const route: string = `${environment.url}/api/library-reports/report-spaces/${filters.applicantTypeID}/${filters.librarySpaceID}/${filters.initDate}/${filters.endDate}`;
			if (this.getPdfContentSubscription) this.getPdfContentSubscription.unsubscribe();
			this.getPdfContentSubscription = this.api.getPdfContent(route).subscribe((res: HttpResponse<Blob>) => {
				if (res.body) {
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
				}
			});
		}else{
			this.filtersForm.markAllAsTouched();
		}
	}

}
