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
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { LibrarySpaceDetail, LibraryStudentDetail } from '@utils/interfaces/person.interfaces';
import { UserService } from '@services/user.service';
import { MatOptionSelectionChange } from '@angular/material/core';
import { SpaceComponent } from '../../components/space/space.component';
import { LogOutSpaceComponent } from '../../components/log-out-space/log-out-space.component';
import { ApplicantType } from '@utils/interfaces/library.interface';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs';

@Component({
  selector: 'app-space-log',
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
		MatIconModule,
		MatDialogModule,
		MatPaginatorModule,
		MatSnackBarModule
	],
	providers: [
		DatePipe
	],
  templateUrl: './space-log.component.html',
  styleUrls: ['./space-log.component.css']
})

export class SpaceLogComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public isLoading: boolean = false;
	public filtersForm!: FormGroup;
	public externalForm!: FormGroup;
	public librarySpace: LibrarySpaceDetail;
	public studentCareers: LibraryStudentDetail[] = [];
	public selectedStudentCareer: LibraryStudentDetail;
	public users: ApplicantType[] = [];
	public isExternal: boolean= false;
	public now: string= this.formattedDate(new Date);

	private currentPeriodID: number= null;
	private librarySpaceID: number= null;
	private snackBar: MatSnackBar = inject(MatSnackBar);
	private dialog: MatDialog = inject(MatDialog);

	constructor(private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private router: Router,
		private activeRoute: ActivatedRoute,
		private user: UserService,
		private datePipe: DatePipe,){
		super();
		this.initForms();
		router.events.subscribe((event) => {
			if(event instanceof NavigationEnd) {
				history.pushState(null, document.title, event.urlAfterRedirects);
			}
		})
	}

	@HostListener('window:popstate', ['$event']) onPopState(
    event: PopStateEvent): void {
    history.pushState(null, document.title, location.href);
  }

	ngOnInit(): void {
		this.getCurrentPeriod();
		this.getApplicantTypeFromRol();
		this.activeRoute.params.subscribe({
      next: (data: any) => {
				this.librarySpaceID= +data.id;
				this.filtersForm.get('librarySpaceID').patchValue(this.librarySpaceID);
				this.getLibrarySpaceDetail(this.librarySpaceID);
      }
    })
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	public initForms(): void {
		this.filtersForm= this.fb.group({
			search: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(10)]],
			librarySpaceID: [this.librarySpaceID, Validators.required],
			periodID: [this.currentPeriodID, Validators.required],
			studentID: [{value: null, disabled: true}],
			teacherID: null,
			externalPersonID: null,
			stateAttendance: [1],
			personID: [null],
			user: this.user.currentUser.userName,
			applicantTypeID: [null, Validators.required],
		});

		const document: FormControl = this.filtersForm.get('search') as FormControl;
		if (document) {
			document.valueChanges.pipe(
				debounceTime(300),
				distinctUntilChanged(),
				untilComponentDestroyed(this)
			).subscribe({
				next: (value) => {
					this.externalForm.get('documentNumberExternal').patchValue(
						this.filtersForm.get('search').value
					);
				}
			});
		}

		this.externalForm= this.fb.group({
			externalPersonID: '',
			documentNumberExternal: [null, Validators.required],
			fullNamesExternal: [null, Validators.required],
			phoneExternal: [null, Validators.required],
			emailExternal: [null, Validators.required],
			user: this.user.currentUser.userName
		});
	}

	public getCurrentPeriod(): void{
		this.isLoading= true;
		this.api.getCurrentPeriod().subscribe({
			next: (res) => {
				this.currentPeriodID = res.periodID;
				this.filtersForm.get('periodID').patchValue(this.currentPeriodID);
				this.isLoading=false;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.isLoading=false;
			}
		});
	}

	public getLibrarySpaceDetail(librarySpaceID: number): void {
		this.isLoading= true;
		this.api.getLibrarySpaceDetail(librarySpaceID).subscribe({
			next: (res: LibrarySpaceDetail[]) => {
				this.librarySpace= res[0];
				this.isLoading=false;
			},
			error: (err: HttpErrorResponse) => {
				this.isLoading=false;
			}
		});
	}

	public getLibrarySpacesAttendance(): void {
		this.studentCareers= [];
		this.filtersForm.get('studentID').patchValue(null);
		if(this.filtersForm.get('search').valid && this.filtersForm.get('applicantTypeID').valid){
			this.api.getLibrarySpacesAttendance(this.filtersForm.get('search').getRawValue(), this.librarySpaceID, this.filtersForm.get('applicantTypeID').getRawValue())
			.subscribe({
				next: (res: LibraryStudentDetail[]) => {
					//console.log('user', res);
					if(res.length === 0 && !this.isExternal){
						this.snackBar.open(
							`Datos incorrectos`,
							null,
							{
								horizontalPosition: 'center',
								verticalPosition: 'top',
								duration: 4000,
								panelClass: ['red-snackbar']
							}
						);
						this.filtersForm.reset();
            this.externalForm.reset();
						let studentID= this.filtersForm.get('studentID') as FormControl;
						studentID.disable();
						studentID.setValidators(null);
						studentID.updateValueAndValidity();
            this.selectedStudentCareer= null;
            this.isExternal= false;
						this.studentCareers= [];
					}else{
						if(res.length > 0){
							this.filtersForm.get('search')?.disable();
							this.filtersForm.get('applicantTypeID')?.disable();
							this.isExternal= false;
						}
						if(res.length === 1) this.selectedCareer(res[0]);
						this.studentCareers= res;
					}
				},
				error: (err: HttpErrorResponse) => {
				}
			});
		}else{
			this.filtersForm.get('search').markAllAsTouched();
			this.filtersForm.get('search')?.enable();
			this.filtersForm.get('applicantTypeID').markAllAsTouched();
		}
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

	public postExternalUser(status: boolean): void {
		if(this.externalForm.valid){
			this.api.postExternalUser(this.externalForm.value).subscribe({
				next: (res: any) => {
					if(res[0]){
						const externalPersonID= res[0].externalPersonID;
						this.filtersForm.get('externalPersonID').patchValue(externalPersonID);
						let item : LibraryStudentDetail= {
							names: this.externalForm.get('fullNamesExternal').value,
							documentNumber: this.externalForm.get('documentNumberExternal').value
						}
						this.selectedStudentCareer= item;
						this.postLibrarySpacesAttendance(status);
					}
				},
				error: (err: HttpErrorResponse) => {
				}
			})
		} else{
			this.externalForm.markAllAsTouched();
		}
	}

	public selectedUser(event: MatOptionSelectionChange, item: ApplicantType): void {
		let studentID= this.filtersForm.get('studentID') as FormControl;
		if(event.isUserInput) if(item.applicantTypeID === 1){
			this.isExternal = false;
			studentID.enable();
			studentID.setValidators(Validators.required);
			studentID.updateValueAndValidity();
		} else if(item.applicantTypeID === 5) {
			this.isExternal = true;
			studentID.disable();
			studentID.setValidators(null);
			studentID.updateValueAndValidity();
		} else{
			this.isExternal = false;
			studentID.disable();
			studentID.setValidators(null);
			studentID.updateValueAndValidity();
		}
	}

	public selectedCareer(item: LibraryStudentDetail, event?: MatOptionSelectionChange): void {
		if(event?.isUserInput || !event){
			this.selectedStudentCareer= item;
			this.filtersForm.patchValue(item);
			this.filtersForm.get('personID').patchValue(item.PersonId);
			this.filtersForm.get('stateAttendance').patchValue(1);
		}
	}

	public logOut(space: LibrarySpaceDetail= this.librarySpace): void {
		//this.router.navigateByUrl('/biblioteca/lista-espacios');
		const config: MatDialogConfig = new MatDialogConfig();
		config.id = 'LogOutSpaceComponent';
		config.autoFocus = false;
		config.minWidth = '40vw';
		config.maxWidth = '40vw';
		config.panelClass = 'transparent-panel';
		config.data = { space };
		config.disableClose = false;
		const dialog = this.dialog.open(LogOutSpaceComponent, config);
		dialog.afterClosed()
		.pipe(untilComponentDestroyed(this))
		.subscribe((res) => {
			this.initForms();
			this.studentCareers= [];
			this.selectedStudentCareer= null;
			this.isExternal= false;
			this.getLibrarySpaceDetail(this.librarySpaceID);
		});
	}

	public onSubmit(status: boolean): void {
		//console.log(this.filtersForm.getRawValue());
		if(this.filtersForm.valid){
			if(this.isExternal) this.postExternalUser(status);
			else if(!this.isExternal || this.isExternal && !status) this.postLibrarySpacesAttendance(status);
		}else{
			this.filtersForm.markAllAsTouched();
		}
	}

	public postLibrarySpacesAttendance(status: boolean): void {
		this.api.postLibrarySpacesAttendance(this.filtersForm.getRawValue()).subscribe({
			next: (res) => {
				//console.log('post', res);
				if(status) this.openDialog(this.selectedStudentCareer, this.librarySpace);
				else{
					this.initForms();
					this.studentCareers= [];
					this.selectedStudentCareer= null;
					this.getLibrarySpaceDetail(this.librarySpaceID);
					this.common.message('Ha salido del espacio de biblioteca', '', 'success', "#d3996a");
				}
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
				this.initForms();
				this.studentCareers= [];
				this.selectedStudentCareer= null;
				this.isExternal= false;
				this.getLibrarySpaceDetail(this.librarySpaceID);
			}
		});
	}

	public openDialog(item: LibraryStudentDetail, space: LibrarySpaceDetail): void {
		const config: MatDialogConfig = new MatDialogConfig();
		config.id = 'SpaceComponent';
		config.autoFocus = false;
		config.minWidth = '55vw';
		config.maxWidth = '65vw';
		config.panelClass = 'transparent-panel';
		config.data = { item, space };
		config.disableClose = false;
		const dialog = this.dialog.open(SpaceComponent, config);
		dialog.afterClosed()
		.pipe(untilComponentDestroyed(this))
		.subscribe((res) => {
			this.isExternal= false;
			this.initForms();
			this.studentCareers= [];
			this.selectedStudentCareer= null;
			this.getLibrarySpaceDetail(this.librarySpaceID);
		});
	}

	private formattedDate(date: Date): string {
    return <string>this.datePipe.transform(date, 'fullDate');
  }

}
