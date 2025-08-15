import { Component, ElementRef, inject, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
	AbstractControl,
	FormArray,
	FormBuilder,
	FormGroup,
	FormsModule,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { forkJoin, map, Observable, Subscription } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import {
	Applicant,
	ApplicantType,
	DepositType,
	PublicationCondition,
	PublicationRequest,
	PublicationRequestForm,
	PublicationView,
	REQUESTED_PUBLICATION_STATUS,
	RequestedPublicationForm
} from '@utils/interfaces/library.interface';
import { ConfirmationComponent } from '../../../academic-management/components/confirmation/confirmation.component';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule, MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { ApiService } from '@services/api.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { addDays } from 'date-fns';
import { User } from '@utils/models/user.models';
import { UserService } from '@services/user.service';
import { ROL } from '@utils/interfaces/login.interfaces';

let ECUADOR_LOCAL_STRING: string = new Date().toLocaleString('en-US',{ timeZone: 'America/Guayaquil'});

@Component({
	selector: 'app-request-publication',
	standalone: true,
	imports: [
		ReactiveFormsModule,
		MatFormFieldModule,
		MatDialogModule,
		MatIconModule,
		MatRippleModule,
		FormsModule,
		MatButtonModule,
		MatCardModule,
		MatNativeDateModule,
		MatDatepickerModule,
		MatInputModule,
		MatOptionModule,
		MatSelectModule,
		NgForOf,
		NgIf,
		MatSnackBarModule,
		SpinnerLoaderComponent,
		DatePipe
	],
	providers: [
	],
	templateUrl: './request-publication.component.html',
	styleUrls: ['./request-publication.component.css']
})

export class RequestPublicationComponent implements OnInit, OnDestroy {
	public user: User;
	public rolesToApproveRequestPublication: string[] = [ROL.ADMIN, ROL.LIBRARIAN];
	public isLoadingInfo: boolean = true;
	public startAt: Date = new Date(ECUADOR_LOCAL_STRING);
	public minDate: Date = new Date(this.startAt.setHours(0, 0));
	public maxDate: Date = addDays(this.minDate, 90);
	public applicantTypes: Array<ApplicantType> = [];
	public applicantType: ApplicantType;
	public depositTypes: Array<DepositType> = [];
	public publicationsCondition: Array<PublicationCondition> = [];
	public applicant: Applicant;
	public form: FormGroup<PublicationRequestForm>;
	public publications: Array<PublicationView> = [];
	private sendFormSubscription: Subscription;
	private getInfoSubscription: Subscription;
	private getApplicantInfoSubscription: Subscription;
	public rolIDSession:string;
	public rolNameSession:string;
	public personIdB:number;
	public studentIDB:number;
	public studentIDSession:number;

	@ViewChild('errorParagraph', { static: true }) public errorParagraph: ElementRef<HTMLParagraphElement>;
	private formBuilder: FormBuilder = inject(FormBuilder);
	private dialog: MatDialog = inject(MatDialog);
	private api: ApiService = inject(ApiService);
	private snackBar: MatSnackBar = inject(MatSnackBar);
	private dialogRef: MatDialogRef<RequestPublicationComponent> = inject(MatDialogRef<RequestPublicationComponent>);
	private datePipe: DatePipe = inject(DatePipe);
	private userService: UserService = inject(UserService);
	constructor(
		@Inject(MAT_DIALOG_DATA) public data: { publications: PublicationView[] }
	) {
		this.rolIDSession = sessionStorage.getItem('rolID');
		this.rolNameSession = sessionStorage.getItem('rol');
		this.studentIDSession = +sessionStorage.getItem('studentID');
		this.user = this.userService.currentUser;
		this.publications = this.data.publications;
		this.getFormInfo();
	}

	public ngOnInit(): void {
	}

	public ngOnDestroy(): void {
		if (this.sendFormSubscription) this.sendFormSubscription.unsubscribe();
		if (this.getInfoSubscription) this.getInfoSubscription.unsubscribe();
		if (this.getApplicantInfoSubscription) this.getApplicantInfoSubscription.unsubscribe();
	}

	private formattedDate(date: Date, hour: string): string {
		return <string>this.datePipe.transform(date, 'yyyy-MM-dd') + ' ' + hour + ':00';
	}

	private getFormInfo(): void {
		if (this.getInfoSubscription) this.getInfoSubscription.unsubscribe();
		const observables: Observable<any>[] = [];
		observables.push(this.api.getDepositTypes());
		// observables.push(this.api.getApplicantTypes());
		observables.push(this.api.getApplicantTypeFromRolByRol(parseInt(this.rolIDSession)));
		observables.push(this.api.getPublicationConditions());
		observables.push(this.api.getApplicantTypeFromRol(parseInt(this.rolIDSession)));
		this.getInfoSubscription = forkJoin(observables)
			.pipe(
				map(([depositTypes, applicantTypes, publicationConditions, applicantType]): {
					depositTypes: DepositType[],
					applicantTypes: ApplicantType[],
					publicationConditions: PublicationCondition[],
					applicantType: ApplicantType
				} => {
					return {
						depositTypes,
						applicantTypes,
						publicationConditions,
						applicantType
					};
				})
			)
			.subscribe({
				next: (value: {
					depositTypes: DepositType[],
					applicantTypes: ApplicantType[],
					publicationConditions: PublicationCondition[],
					applicantType: ApplicantType
				}) => {
					this.depositTypes = value.depositTypes;
					this.applicantTypes = value.applicantTypes;
					this.publicationsCondition = value.publicationConditions;
					this.applicantType = value.applicantType;
					this.initForm();
				},
				error: (err: HttpErrorResponse) => {
					this.snackBar.open(
						'Hubo un error al cargar la información. Por favor, intenta de nuevo.',
						'',
						{
							horizontalPosition: 'center',
							verticalPosition: 'top',
							duration: 5000,
							panelClass: ['red-snackbar']
						}
					);
					this.dialogRef.close(false);
				}
			});
	}

	private initForm(): void {
		this.form = this.formBuilder.group<PublicationRequestForm>({
			applicantType: this.formBuilder.control(
				!this.rolesToApproveRequestPublication.includes(this.rolNameSession) ? this.applicantType.applicantTypeID : null,
				[Validators.required]
			),
			applicantId: this.formBuilder.control(
				this.applicant !== undefined ? this.applicant.personID : null,
				[Validators.required]
			),
			depositType: this.formBuilder.control(null, [Validators.required]),
			observation: this.formBuilder.control(''),
			searchApplicantIdentification: this.formBuilder.control(''),
			requestedPublications: this.formBuilder.array([]),
			// FIXME: Este no debería estar aquí. El estado debe ir en el detalle, no en la solicitud.
			requestStatusID: this.formBuilder.control(this.rolIDSession === '16' ? REQUESTED_PUBLICATION_STATUS.APPROVED : REQUESTED_PUBLICATION_STATUS.PENDING)
		});
		if (this.rolIDSession !== '16') {
			this.form.get('applicantType')?.clearValidators();
			this.form.get('applicantId')?.clearValidators();
		}
		const requestedPublicationsFormArray: FormArray = this.requestedPublicationsFormArray;
		this.publications.forEach((value: PublicationView) => {
			requestedPublicationsFormArray.push(this.createRequestedPublication(value));
		});
		this.isLoadingInfo = false;
		// console.log('form',this.form)
	}

	private createRequestedPublication(publication: PublicationView): FormGroup<RequestedPublicationForm> {
		return this.formBuilder.group<RequestedPublicationForm>({
			publication: this.formBuilder.control(publication),
			publicationId: this.formBuilder.control(publication.publicationID),
			dueDate: this.formBuilder.control(null, [Validators.required]),
			dueDateString: this.formBuilder.control(''),
			condition: this.formBuilder.control(null, this.rolIDSession === '16' ? [Validators.required] : []),
			dueHour: this.formBuilder.control(null, [Validators.required]),
			requestStatus: this.formBuilder.control(
				this.rolIDSession === '16' ? REQUESTED_PUBLICATION_STATUS.APPROVED : REQUESTED_PUBLICATION_STATUS.PENDING,
				[Validators.required]
			)
		});
	}

	public get requestedPublicationsFormArray(): FormArray {
		return this.form.controls.requestedPublications;
	}

	public removePublication(indexPublication: number): void {
		if (this.requestedPublicationsFormArray.length) {
			const config: MatDialogConfig = new MatDialogConfig();
			config.id = 'removePublicationConfirmationDialog';
			config.autoFocus = false;
			config.minWidth = '600px';
			config.maxWidth = '600px';
			config.panelClass = 'transparent-panel';
			config.data = {
				message: '¿Estás seguro de eliminar esta publicación de la solicitud?'
			}
			const dialog = this.dialog.open(ConfirmationComponent, config);
			dialog.afterClosed()
				.subscribe((res) => {
					if (res) {
						this.requestedPublicationsFormArray.removeAt(indexPublication);
					}
				});
		}
	}

	public sendForm(): void {
		if (this.form.invalid && this.rolIDSession === '16') {
			this.form.markAsDirty();
			this.form.markAllAsTouched();
			return;
		}
		if (this.sendFormSubscription) {
			this.sendFormSubscription.unsubscribe();
		}
		this.requestedPublicationsFormArray.controls.forEach((requestedPublication: AbstractControl) => {
			const dueDate = requestedPublication.value.dueDate;
    		const dueHour = requestedPublication.value.dueHour;
			if (!dueDate || !dueHour) {
				return;
			}
			(requestedPublication as FormGroup<RequestedPublicationForm>).patchValue({
				dueDateString: this.formattedDate(dueDate, dueHour)
			});
		});
		const formValue: PublicationRequest = this.form.value as unknown as PublicationRequest;
		if(this.rolIDSession==='16') {
			formValue.personID=this.personIdB;
			this.studentIDSession=this?.studentIDB || 0;
		}else{
			formValue.personID= +sessionStorage.getItem('personID');
			this.studentIDSession= this.rolIDSession==='5' ? this.studentIDSession :0;
		}
		formValue.studentID= +this.studentIDSession;

		this.sendFormSubscription = this.api.postRequestedPublication(formValue).subscribe({
			next: (value) => {
				if (value) {
					this.dialogRef.close(value);
				}
			},
			error: (err: HttpErrorResponse) => {
				/*this.errorParagraph.nativeElement.style.display = 'block';
				this.errorParagraph.nativeElement.innerText = (err.message as unknown as Array<string>).find(() => true);
				setTimeout(() => {
					this.errorParagraph.nativeElement.style.display = 'none';
				}, 7000);*/
				this.snackBar.open(
					`${err.error.message[0]}`,
					'',
					{
						horizontalPosition: 'center',
						verticalPosition: 'top',
						duration: 5000,
						panelClass: ['red-snackbar']
					}
				);
			}
		});
	}

	public searchApplicantById(): void {
		if (this.getApplicantInfoSubscription) this.getApplicantInfoSubscription.unsubscribe();
		const publicationRequest: PublicationRequest = this.form.value as unknown as PublicationRequest;
		if (!publicationRequest.applicantType || !publicationRequest.searchApplicantIdentification) {
			this.form.controls.applicantType.markAsTouched();
			this.form.controls.applicantType.markAsDirty();
			return;
		}
		this.getApplicantInfoSubscription = this.api.searchApplicantByIdentificationNumber(
			publicationRequest.applicantType,
			publicationRequest.searchApplicantIdentification
		).subscribe({
			next: (value: Applicant[]) => {
				if(this.rolIDSession==='16') {
					this.personIdB=value[0].personID;
					this.studentIDB=value[0].studentID;
				}
				if (!value.length) {
					this.snackBar.open(
						'No se ha encontrado información del solicitante.',
						'',
						{
							horizontalPosition: 'center',
							verticalPosition: 'top',
							duration: 5000,
							panelClass: ['warning-snackbar']
						}
					);
					this.applicant=null;
					return;
				}

				this.applicant = value.find(() => true);
				this.form.patchValue({
					applicantId: this.applicant.personID
				});
			},
			error: (err: HttpErrorResponse) => {
				console.log(err);
				this.snackBar.open(
					'Hubo un error al obtener la información del solicitante. Por favor, intenta de nuevo.',
					'',
					{
						horizontalPosition: 'center',
						verticalPosition: 'top',
						duration: 5000,
						panelClass: ['red-snackbar']
					}
				);
			}
		});
	}

	public onChangeApplicantType(event: MatSelectChange): void {
		// this.form.patchValue({
		// 	applicantId: null
		// });
		// this.applicant = null;
	}

	protected readonly ROL = ROL;
}
