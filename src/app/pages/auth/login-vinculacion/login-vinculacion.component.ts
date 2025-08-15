import { BondingLogin, ChangePassword, VerificationFirst } from './../../../utils/interfaces/person.interfaces';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, SecurityContext, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
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
import { NgForOf, NgIf } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { Login } from '@utils/interfaces/login.interfaces';
import { alphaNumeric, onlyNumbers, onlyLetters } from 'app/constants';
import { CivilStatus, Identity, Nationality } from '@utils/interfaces/others.interfaces';
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormArray, FormsModule, } from '@angular/forms';
import { AdministrativeService } from '@services/administrative.service';
import { ApiService } from '@services/api.service';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InputSearchComponent } from '@components/input-shearch/input-search.component';
import { ButtonArrowComponent } from '@components/button-arrow/button-arrow.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { UserService } from '@services/user.service';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login-vinculacion',
  templateUrl: './login-vinculacion.component.html',
  styleUrls: ['./login-vinculacion.component.css'],
	standalone: true,
	imports: [
		ReactiveFormsModule,
    RouterModule,
    NgIf,
    NgForOf,
    MatButtonModule,
    MatSelectModule,
		MatSnackBarModule,
		MatInputModule,
		MatFormFieldModule,
		InputSearchComponent,
		ButtonArrowComponent,
		MatTooltipModule,
		MatIconModule,
		MatNativeDateModule,
		MatPaginatorModule,
		MatMenuModule
  ],

})
export class LoginVinculacionComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public loginForm!: FormGroup;
	public paswordForm!: FormGroup;
	public changePasForm!: FormGroup;
	public sesionRegisterForm!: FormGroup;
	loading: boolean = false;
	personID!: number;
	userID!: number;
	user!: string;
	rol!: number;
	public showForms: number= 1;

	@ViewChild('modalClose', { read: ElementRef }) public modalClose: ElementRef;
	@ViewChild('modalOpen', { read: ElementRef }) public modalOpen: ElementRef;

	constructor( private fb:FormBuilder,
		private loginService: LoginService,
		private common:CommonService,
		private snackBar: MatSnackBar,
		private userService: UserService,
		private router: Router
	 ){
			super();
		}

	ngOnInit(): void {
		sessionStorage.clear();
		localStorage.clear();
		this.initForms();
	}

	public override ngOnDestroy() {
    super.ngOnDestroy();
  }

	private initLoginForm(): void {
		this.loginForm= this.fb.group({
			p_userName:       [localStorage.getItem('email') || '', [Validators.required]],
			p_userPassword:   ['', [Validators.required, Validators.minLength(5)]],
			remember:        	[localStorage.getItem('remember') || false]
		});
	}

	private initPaswordForm(): void {
		this.paswordForm= this.fb.group({
			p_userPassword1:   ['', [Validators.required, Validators.minLength(5)]],
			p_userPassword2:   ['', [Validators.required, Validators.minLength(5)]]
		});
	}

	private changePasswordForm(): void {
		this.changePasForm= this.fb.group({
			p_userId: ['', [Validators.required]],
			p_userPassword: ['', Validators.required],
			p_recoveryEmail: ['prueba15@gmail.com'],
			p_userCreated: ['MIGRA'],
		});
	}

	private sesionsRegister(): void {
		this.sesionRegisterForm= this.fb.group({
			p_userId: ['', [Validators.required]],
			p_user: ['MIGRA'],
		});
	}

	public getChangePassword(): FormArray{
		return (this.changePasForm.controls['news'] as FormArray);
	}

	public onSubmit(): void {
		if(this.loginForm.valid){
			this.loading = true;
			this.common.postLoginBonding(this.loginForm.value).subscribe({
				next: (res: any) => {
					let login= this.loginForm.value;
					if(login.remember){
						localStorage.setItem('email', login.p_userName);
						localStorage.setItem('remember', 'true');
					} else{
						localStorage.removeItem('email');
						localStorage.removeItem('remember');
					}
					//console.log('login', res);
					localStorage.removeItem('selectedPublications');
					sessionStorage.setItem('token', res.token);
					sessionStorage.setItem('mail', res.user.userEmail);
					sessionStorage.setItem('name', res.user.userName);
					sessionStorage.setItem('personID', String(res.user.PersonId));
					sessionStorage.setItem('img', res.user.userImg);
					sessionStorage.setItem('rol', res.rol[0].rolName);
					sessionStorage.setItem('rolID', String(res.rol[0].rolId));
					sessionStorage.setItem('id', String(res.user.PersonId));
					sessionStorage.setItem('userId', String(res.user.userId));
					this.loading = false;
					this.personID = res.user.PersonId;
					this.userID = res.user.userId;
					this.user = res.user.userEmail;
					this.rol = res.rol[0].rolId;
					this.getData();
				},
				error: (err: HttpErrorResponse) => {
						//console.log(err);
						this.loading = false;
						this.snackBar.open(
							`${err.error.message[0]}`,
							'',
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

	private getVerificationFirst(id: number): void{
		this.loading = true;
		this.common.getVerificationFirst(id).subscribe({
				next: (res: VerificationFirst[]) => {
					//console.log(res[0].numbersessions);
					this.loading = false;
					if(res[0].numbersessions == 0){
						Swal.fire({
							icon: 'success',
							title: `<span style="color:#86bc57;">Ingreso por primera vez</span>`,
							text: `Por favor cambie la contraseña para continuar`,
						})
						this.showForms=2
					}else{
						this.router.navigateByUrl('/administracion').then();
					}
			},
				error: (err: HttpErrorResponse) => {
						this.loading = false;
				}
		});
	}

	private getData(): void{
		this.getVerificationFirst(this.personID);
		this.getMenu(this.userID, 3, this.rol)
	}

	private initForms(): void{
		this.initLoginForm();
		this.initPaswordForm();
		this.changePasswordForm();
		this.sesionsRegister();
	}

	private upadtePassword(id: number): void{
		this.changePasForm.get('p_userId').patchValue(this.userID);
		this.changePasForm.get('p_userPassword').patchValue(this.paswordForm.get('p_userPassword2').value);
		let body = JSON.parse(JSON.stringify(this.changePasForm.value, [
			'p_userId',
			'p_userPassword',
			'p_recoveryEmail',
			'p_userCreated',
		]))
		this.common.putChangePassword(id, body).subscribe({
				next: (res: ChangePassword[]) => {
					//console.log(res);
					//console.log("Actualizado");
					this.sesionRegister();
			},
				error: (err: HttpErrorResponse) => {
						this.loading = false;
				}
		});
	}

	public validUpdatePassword(): void{
		if(this.paswordForm.valid){
			if(this.paswordForm.get("p_userPassword1").value == this.paswordForm.get("p_userPassword2").value) {
				this.upadtePassword(this.userID);
			}else{
				Swal.fire({
					icon: 'warning',
					title: `ADVERTENCIA`,
					text: `Por favor verifique que las contraseñas sean iguales`,
				})
			}
		}
	}

	private getMenu(id:number, entidad:number=3, rol:number): void{
		this.loading = true;
		//console.log(id+'-'+entidad+'-'+rol);
		this.common.getMenus(id, entidad, rol).subscribe({
				next: (res) => {
					//console.log(res);
					this.loading = false;
			},
				error: (err: HttpErrorResponse) => {
						this.loading = false;
				}
		});
	}

	private sesionRegister(): void{
		this.sesionRegisterForm.get('p_userId').patchValue(this.personID);
		let body = JSON.parse(JSON.stringify(this.sesionRegisterForm.value, [
			'p_userId',
			'p_user'
		]))
		//console.log(body)
		this.common.postSesionRegister(body).subscribe({
				next: (res) => {
					//console.log(res);
					//console.log("La sesion cambio a 1")
					this.router.navigateByUrl('/administracion').then();
			},
				error: (err: HttpErrorResponse) => {
						this.loading = false;
				}
		});
	}

}
