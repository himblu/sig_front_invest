import { Component, OnInit, OnDestroy, ViewChild, ElementRef, SecurityContext, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import { CommonService } from '@services/common.service';
import { LoginService } from '@services/login.service';
import { MatButtonModule } from '@angular/material/button';
import { Consulta } from '@utils/interfaces/cedula.interfaces';
import Swal from 'sweetalert2';
import { NgForOf, NgIf } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { Login } from '@utils/interfaces/login.interfaces';
import { alphaNumeric, onlyNumbers, onlyLetters } from 'app/constants';
import { CivilStatus, Identity, Nationality } from '@utils/interfaces/others.interfaces';
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { ParticipationArea } from '@utils/interfaces/person.interfaces';
import { DocumentTypee } from '@utils/interfaces/person.interfaces';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-sign-up-vinculacion',
  templateUrl: './sign-up-vinculacion.component.html',
  styleUrls: ['./sign-up-vinculacion.component.css'],
	standalone: true,
	imports: [
    ReactiveFormsModule,
    RouterModule,
    NgIf,
    NgForOf,
    MatButtonModule,
    MatSelectModule,
		MatSnackBarModule,
		MatCheckboxModule
  ],
})
export class SignUpVinculacionComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public registerForm!: FormGroup;
	public personForm!: FormGroup;
	public loginForm!: FormGroup;
	private token: string;
	loading: boolean = false;
  numeroIngresado: string = '';
  numeroIngresadoInvalido: boolean = false;
  registroCivil!: Consulta;
  showAnotherFields: boolean = true;
  recordFounded: boolean = true;
  hasPersonInfo: boolean = true;
  personExists: boolean = true;
  cedula: string;
	areaParticipationID: number;
	typeDocId: number;
  civilStatuses: CivilStatus[] = [];
  nationalities: Nationality[] = [];
	documentTypes: Identity[] = [];
	public participationArea: ParticipationArea[] = [];
	public documentType: DocumentTypee[] = [];
	public showForms: number= null;

	private snackBar: MatSnackBar = inject(MatSnackBar);

	constructor( private fb:FormBuilder,
		private loginService: LoginService,
		private common:CommonService,
		private router: Router ){
			super();
		}

	ngOnInit(): void {
		this.loginInvitado();
		this.showForms=0;
		this.initForms();
	}
	public override ngOnDestroy() {
    super.ngOnDestroy();
  }

	onlyLetters(e: any) {
    onlyLetters(e);
  }

  onlyNumbers(e: any) {
    onlyNumbers(e);
  }

  alphaNumeric(e: any) {
    alphaNumeric(e);
  }

	onSubmit(){
		if(!this.registerForm.get('accept').value){
			this.snackBar.open(
				`Acepte términos y condiciones`,
				null,
				{
					horizontalPosition: 'center',
					verticalPosition: 'top',
					duration: 4000,
					panelClass: ['red-snackbar']
				}
			);
			return;
		}
		this.registerForm.get('p_areaParticipationID').patchValue(this.areaParticipationID);
		this.registerForm.get('p_typeDocId').patchValue(this.typeDocId);
		//this.registerForm.get('p_nameInstitucion').patchValue(1);
		if(this.registerForm.valid){
			let body = JSON.parse(JSON.stringify(this.registerForm.value, [
				'p_areaParticipationID',
				'p_typeDocId',
				'p_personDocumentNumber',
				'p_personFirstName',
				'p_personMiddleName',
				'p_personLastName',
				'p_emailDesc',
				'p_numberPhone',
				'p_nameInstitucion',
				'p_user',
			]))
			//console.log(body)
			this.common.postExternsRegister(body).subscribe({
				next: (res) => {
					//console.log(res);
					this.snackBar.open(
						`Registro exitoso`,
						null,
						{
							horizontalPosition: 'center',
							verticalPosition: 'top',
							duration: 4000,
							panelClass: ['green-snackbar']
						}
					);
					this.router.navigateByUrl('/autenticacion/login-vinculacion');
				},
					error: (err: HttpErrorResponse) => {
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
						this.loading = false;
					}
			});
		}else{
			this.registerForm.markAllAsTouched();
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

	public initForms(): void{
		this.registerForm = this.fb.group({
			p_areaParticipationID:        [ , [Validators.required]],
			p_typeDocId:       [ , [Validators.required]],
			p_personDocumentNumber:       [ , [Validators.required]],
			p_personFirstName:       [ , [Validators.required]],
			p_personMiddleName:       [ , [Validators.required]],
			p_personLastName:       [ , [Validators.required]],
			p_emailDesc:       [ , [Validators.required]],
			p_numberPhone:       [ , [Validators.required]],
			p_nameInstitucion:       [ , [Validators.required]],
			p_user:       [ 'MIGRA', [Validators.required]],
			accept:      [false]
		});
	}

	/*public selectDocumentType(): void {
    console.log('selectDocumentType');
    this.showAnotherFields = this.registerForm.get('p_typeDocId').value === 3;
  }*/

	private getParticipationArea(): void{
		this.loading = true;
		this.common.getParticipationArea().subscribe({
				next: (res: ParticipationArea[]) => {
						//console.log(res);
						this.loading = false;
						this.participationArea=res
				},
				error: (err: HttpErrorResponse) => {
						this.loading = false;
				}
		});
	}

	private getDocumentType(): void {
		this.loading = true;
		this.common.getDocumentType().subscribe({
				next: (res) => {
						//console.log(res);
						this.loading = false;
						this.documentType=res
				},
				error: (err: HttpErrorResponse) => {
						this.loading = false;
				}
		});
	}

	public selectedDocument(item:DocumentTypee): void{
		//console.log(item.typeDocDesc)
		this.typeDocId = item.typeDocId
	}

	private async loginInvitado(){
		let credentials: Login = {
      p_userName: 'invitado',
      p_userPassword: '123456',
      remember: true
    };
		this.loading = true;
		let auth: any = await this.loginService.login(credentials, true).toPromise();
    setTimeout(() => {
      this.getData();
    }, 1000);
	}

	public selectedArea(item:ParticipationArea): void{
		console.log(item.areaParticipationID);
		this.areaParticipationID = item.areaParticipationID
		if(item.areaParticipationDesc=='Investigacion'){
			this.showForms=1
		}else{
			this.showForms=2
		}
	}

	private getData(): void{
		this.getParticipationArea();
		this.getDocumentType();
	}

	public getRegistroCivil(id: string): void {
		this.common.registoCivil(id).subscribe({
			next: (res) => {
				//console.log('registoCivil', res);
				if(res.consulta.cedula){
					let nameParts = res.consulta.nombre.split(' ');
					this.registerForm.get('p_personFirstName').patchValue(`${nameParts[2]}${nameParts[3] ? ' '+nameParts[3] : ''}`);
					this.registerForm.get('p_personMiddleName').patchValue(`${nameParts[0]}`);
					this.registerForm.get('p_personLastName').patchValue(`${nameParts[1]}`);
				}else{
					this.registerForm.get('p_personFirstName').patchValue('');
					this.registerForm.get('p_personMiddleName').patchValue('');
					this.registerForm.get('p_personLastName').patchValue('');
				}
			},
				error: (err: HttpErrorResponse) => {
					this.registerForm.get('p_personFirstName').patchValue('');
					this.registerForm.get('p_personMiddleName').patchValue('');
					this.registerForm.get('p_personLastName').patchValue('');
				}
		});
	}

}
