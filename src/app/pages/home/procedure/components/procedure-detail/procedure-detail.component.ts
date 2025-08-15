import { Component, Inject, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { filter, Observable, Subscription, take } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { DocumentManagement, Roles, TypeManagement, TypeRol } from '@utils/interfaces/others.interfaces';
import { UserService } from '@services/user.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

const TOOLBAR_EDITOR: Toolbar = [
	['bold', 'italic'],
	['underline', 'strike'],
	['code', 'blockquote'],
	['ordered_list', 'bullet_list'],
	[{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
	['link', 'image'],
	['text_color', 'background_color'],
	['align_left', 'align_center', 'align_right', 'align_justify'],
	['horizontal_rule', 'format_clear'],
];

export enum TYPE_ROLES {
	ESTUDIANTE= 1,
	DOCENTE= 2,
	ADMINISTRATIVO= 3
}

@Component({
  selector: 'app-procedure-detail',
  standalone: true,
  templateUrl: './procedure-detail.component.html',
  styleUrls: ['./procedure-detail.component.scss'],
	imports: [
		ReactiveFormsModule,
		MatButtonModule,
		MatDialogModule,
		MatIconModule,
		MatRippleModule,
		NgForOf,
		NgIf,
		SpinnerLoaderComponent,
		MatInputModule,
		MatSelectModule,
		NgxEditorModule,
		MatSnackBarModule,
		//DatePipe
	],
	providers: [
    DatePipe
  ],
})

export class ProcedureDetailComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public isLoading: boolean = false;
	public filtersForm!: FormGroup;
	public procedureForm!: FormGroup;
	public details: Editor;
	public specifications: Editor;
	public toolbar: Toolbar = TOOLBAR_EDITOR;
	public rol= TYPE_ROLES;
	public roles: Roles[] = [];
	public typeRoles: TypeRol[] = [];
	public typesManagement: TypeManagement[] = [];
	public currentUser: string= sessionStorage.getItem('name');
	public now: string= this.formattedDate(new Date);

	private snackBar: MatSnackBar = inject(MatSnackBar);

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: { item?: DocumentManagement },
		private dialogRef: MatDialogRef<ProcedureDetailComponent>,
		private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService,
		private datePipe: DatePipe,
	) {
		super();
		this.initForm();
		this.initProcedureForm();
	}

	override ngOnDestroy(): void {
		this.details.destroy();
		this.specifications.destroy();
		super.ngOnDestroy();
	}

	ngOnInit(): void {
		if(this.data.item){
			//console.log(this.data.item);
			this.procedureForm.get('p_documentManagementCode').clearValidators();
 			this.procedureForm.get('p_documentManagementCode').updateValueAndValidity();
			this.procedureForm.get('p_documentManagementID').patchValue(this.data.item.documentManagementID);
			this.procedureForm.get('p_documentManagementDesc').patchValue(this.data.item.documentManagementDesc);
			this.procedureForm.get('p_documentManagementEsp').patchValue(this.data.item.documentManagementEsp);
			this.procedureForm.get('p_subject').patchValue(this.data.item.subject);
		}
		this.details = new Editor();
		this.specifications = new Editor();
		this.getTypeManagement();
		this.getTypeRoles();
	}

	public initForm(): void {
		this.filtersForm = this.fb.group({
			p_typeManagementID: ['', Validators.required],
			p_documentManagementID: [0],
			p_typeRolID: [null, Validators.required],
			p_rolID: [[], Validators.required],
			p_user: this.user.currentUser.userName
		})
	}

	public initProcedureForm(): void {
		this.procedureForm = this.fb.group({
			p_documentManagementID: '',
			p_subject: ['', Validators.required],
			p_documentManagementDesc: ['', Validators.required],
			p_documentManagementEsp: [''],
			p_documentManagementCode: ['', [Validators.required, Validators.maxLength(15)]],
			p_user: this.user.currentUser.userName
		});
	}

	public getRolByTypeRolID():void {
		this.admin.getRolByTypeRolID(this.filtersForm.get('p_typeRolID').value).subscribe({
      next: (res: Roles[]) => {
				this.roles = res;
      },
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
    });
	}

	public getRoles():void {
		this.admin.getRoles().subscribe({
      next: (res: Roles[]) => {
				this.roles = res;
      },
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
    });
	}

	public getTypeRoles():void {
		this.isLoading= true;
		this.admin.getTypeRoles().subscribe({
      next: (res: TypeRol[]) => {
				this.typeRoles = res;
				this.isLoading= false;
      },
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.isLoading= false;
			}
    });
	}

	public getTypeManagement():void {
		this.isLoading= true;
		this.admin.getTypeManagement().subscribe({
      next: (res: TypeManagement[]) => {
				this.typesManagement= res;
				this.isLoading= false;
      },
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.isLoading= false;
			}
    });
	}

	public onSubmit(): void {
		//console.log('forms', this.procedureForm.value, this.filtersForm.value);
		if(this.procedureForm.valid && this.filtersForm.valid){
			this.isLoading= true;
			let rolID= [];
			rolID.push(+this.filtersForm.get('p_typeRolID').value);
			this.filtersForm.get('p_typeRolID').patchValue(rolID);
			this.admin.postDocumentManagement(this.procedureForm.value).subscribe({
				next: (res: any) => {
					if(res[0].documentManagementID){
						this.filtersForm.get('p_documentManagementID').patchValue(res[0].documentManagementID);
						this.postDocumentManagementSettings();
					}else{
						this.snackBar.open(
							`${res[0].message}`,
							null,
							{
								horizontalPosition: 'center',
								verticalPosition: 'top',
								duration: 4000,
								panelClass: ['red-snackbar']
							}
						);
						this.isLoading= false;
					}
				},
				error: (err: HttpErrorResponse) => {
					//console.log('err',err);
					this.isLoading= false;
				}
			});
		}else{
			this.procedureForm.markAllAsTouched();
			this.filtersForm.markAllAsTouched();
			this.snackBar.open(
				`Campos vacíos`,
				null,
				{
					horizontalPosition: 'center',
					verticalPosition: 'top',
					duration: 4000,
					panelClass: ['red-snackbar']
				}
			);
		}
	}

	public update(): void {
		if(this.procedureForm.valid){
			this.isLoading= true;
			this.admin.putDocumentManagement(this.procedureForm.value).subscribe({
				next: (res) => {
					this.isLoading= false;
					this.dialogRef.close(res);
				},
				error: (err: HttpErrorResponse) => {
					//console.log('err',err);
					this.isLoading= false;
				}
			});
		}else{
			this.procedureForm.markAllAsTouched();
		}
	}

	public postDocumentManagementSettings(): void {
		this.admin.postDocumentManagementSettings(this.filtersForm.value).subscribe({
			next: (res) => {
				this.isLoading= false;
				this.dialogRef.close(res);
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.isLoading= false;
			}
		});
	}

	public selectedTypeRol(): void {
		this.roles= [];
		if(+this.filtersForm.get('p_typeRolID').value.length === 1){
			this.getRolByTypeRolID();
		}else{
			this.getRoles();
		}
	}

	public addString(string: string): void {
		this.details.commands.insertText(string).exec();
	}

	public addSpecification(string: string): void {
		this.specifications.commands.insertText(string).exec();
	}

	private formattedDate(date: Date): string {
    return <string>this.datePipe.transform(date, 'fullDate');
  }

}
