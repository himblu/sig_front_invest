import { RrhhService } from './../../services/rrhh.service';
import { Canton, Country, Disability, Discapacidad, Parish, Province } from './../../utils/interfaces/others.interfaces';
import { Component, OnInit, Input, Output, EventEmitter, inject, SecurityContext } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateAdapter, MatOptionSelectionChange } from '@angular/material/core';
import { ActivatedRoute } from '@angular/router';
import { Consulta } from '@utils/interfaces/cedula.interfaces';
import { BloodType, CivilStatus, Etnia, Gender, Identity, Nationality, Sex } from '@utils/interfaces/others.interfaces';
import { ConsultedStudent, SPGetPerson } from '@utils/interfaces/person.interfaces';
import { CommonService } from '@services/common.service';
import { OnDestroyMixin, untilComponentDestroyed } from "@w11k/ngx-componentdestroyed";
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ComboComponent } from '@components/combo/combo.component';
import { Subscription, switchMap } from 'rxjs';
import { tap } from 'rxjs';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { environment } from '@environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { ApiService } from '@services/api.service';
import { Colaborator } from '@utils/interfaces/rrhh.interfaces';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { SustantiveFunctionsComponent } from 'app/pages/home/human-talent/components/sustantive-functions/sustantive-functions.component';

@Component({
	selector: 'components-profile-picture',
	templateUrl: './profile-picture.component.html',
	styleUrls: ['./profile-picture.component.css'],
	providers: [
		DatePipe,
		provideNgxMask()
	],
	standalone: true,
	imports: [
		NgIf,
		ReactiveFormsModule,
		NgForOf,
		MatIconModule,
		MatFormFieldModule,
		MatSelectModule,
		MatInputModule,
		MatTooltipModule,
		MatButtonModule,
		MatStepperModule,
		NgxMaskDirective,
		MatDatepickerModule,
		SpinnerLoaderComponent,
		MatTooltipModule,
		MatDialogModule
	]
})

export class ProfilePictureComponent extends OnDestroyMixin implements OnInit {

	/* *************************************** INPUTS & OUTPUTS ***************************************** */
	@Output() validForm: EventEmitter<boolean> = new EventEmitter();
	@Output() idPerson: EventEmitter<number> = new EventEmitter();
	@Output()
	public formularioDatos: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Input('type') type: string = '';
	fd = new FormData();
	/* *************************************** ---------------- ***************************************** */


	/* ************************************ LISTAS GETTERS SETTERS ************************************** */

	/* *********************************** ------------------ ******************************************* */


	/* *********************************** VARIABLES GLOBALES ******************************************* */

	testPattern = {
		S: { pattern: new RegExp('[A-Za-z0-9]') },
	};
	phone = {
		S: { pattern: new RegExp('[+0-9]') },
	};
	fileDisability: File;
	isLoading: boolean = false;
	consultation!: Consulta;
	disability: boolean = false;
	person!: ConsultedStudent;
	imgDefault: string = 'assets/images/avatar.jpg';
	personID: number = 0;
	countries: Country[] = [];
	nationalTownsList: any[] = [];
	provinces: Province[]=[];
	cantonsByProvince: Canton[] = [];
	parishByCantons: Parish[] = [];
	imgBase64: string = 'data:image/png;base64,';
	showImg:boolean = false;
	isUpdating: boolean= false;
	personImage: string | ArrayBuffer;

	private getPdfContentSubscription!: Subscription
	private sanitizer: DomSanitizer = inject(DomSanitizer);;
	private dialog: MatDialog = inject(MatDialog);

	/* *********************************** ------------------ ******************************************* */


	/* *********************************** COSTRUCTOR Y CICLO DE VIDA *********************************** */

	constructor(
		private fb: FormBuilder,
		private common: CommonService,
		private rrhh: RrhhService,
		private api: ApiService,
		private dateAdapter: DateAdapter<Date>,
		private activateRoute: ActivatedRoute,
		private datePipe: DatePipe) {
		super();
	}

	ngOnInit(): void {
		//get params url
		this.activateRoute.params.subscribe({
			next: (params: any) => {
				this.personID = params.id;
				this.common.getStudentInformation(params.id).subscribe({
					next: (resp) => {
						//console.log('teacher', resp);
						this.person= resp;
						if(this.person.avatar) this.getPersonImage(this.person);
						this.personForm.patchValue(resp);
						this.personForm.get('email').patchValue(resp.emailDesc);
						this.personForm.get('birthPlace').patchValue(resp.placeOfBirth);
						this.personForm.get('housePhone').patchValue(resp.phone);
						this.personForm.get('emergencyPhone').patchValue(resp.phoneEmergency);
						if(resp.disabilityID) this.isUpdating= true;
					}
				})
			}
		});
		this.loadParams();
		this.loading();
		this.onProvinceChange();
    this.onCantonsChange();
	}

	changeEtnia(eve: any) {
		if (eve.value === 1) {
			this.common.getNationalTowns()
				.subscribe(nationalTowns => this.nationalTownsList = nationalTowns)
		} else {
			this.nationalTownsList = []
		}
	}

	/* *********************************** -------------------------- *********************************** */


	/* *********************************** GETERS Y SETERS ********************************************** */

	get identityList(): Identity[] {
		return this.common.identityList;
	}
	get sexList(): Sex[] {
		return this.common.sexList;
	}
	get genderList(): Gender[] {
		return this.common.genderList;
	}
	get etniaList(): Etnia[] {
		return this.common.etniaList;
	}
	get bloodList(): BloodType[] {
		return this.common.bloodList;
	}
	get civilList(): CivilStatus[] {
		return this.common.civilList;
	}
	get nationalityList(): Nationality[] {
		return this.common.nationalityList;
	}
	get disabilityList(): Disability[] {
		return this.common.disabilityList;
	}

	fileAvatar:File;
	/* *********************************** -------------------------- *********************************** */


	/* *********************************** FORMULARIOS DEL FORMULARIO *********************************** */

	personForm: FormGroup = this.fb.group({
		personID: [this.personID],
		typeDocument: [0, [Validators.required, Validators.min(1)]],
		sexID: [0, [Validators.required, Validators.min(1)]],
		genderID: [0, [Validators.required, Validators.min(1)]],
		nationalityID: [0, [Validators.required, Validators.min(1)]],
		ethnicityID: [0, [Validators.required, Validators.min(1)]],
		civilStatusID: [0, [Validators.required, Validators.min(1)]],
		bloodTypeID: [0, [Validators.required, Validators.min(1)]],
		documentNumber: ['', [Validators.required]],
		email: ['', [Validators.required, Validators.email]],
		firstName: ['', [Validators.required]],
		surname: ['', [Validators.required]],
		secondSurname: ['', [Validators.required]],
		birthday: ['', [Validators.required]],
		placeResidence: ['', [Validators.required]],
		birthPlace: ['', [Validators.required]],
		celularPhone: ['', [Validators.required, Validators.minLength(10)]],
		housePhone: [''],
		emergencyPhone: ['', [Validators.required, Validators.minLength(10)]],
		disabilityID: [null],
		percentageDisability: [0],
		cometaryDisability: [''],
		avatar: [' ', [Validators.required]],
		parishID: [0, [Validators.required]],
		provinceID: [' ', [Validators.required]],
		contactName: [' '],
		contactAddress: [' '],
		cantonID: [0, [Validators.required]],
		cellularOperator: [1, [Validators.required]],
		nationalTownID: [0],
		fileDisability: [null],
		countryID: [59],
		userName: [sessionStorage.getItem('name')],
	});
	/* *********************************** -------------------------- *********************************** */


	/* *********************************** FUNCIONES VARIAS ********************************************* */
	modalOpen() {

	}

	loadParams() {
		this.activateRoute.params
			.pipe(
				untilComponentDestroyed(this)
			)
			.subscribe((data: any) => {
				this.personID = data.id;
			})
	}

	public onSelectCounty(event: MatOptionSelectionChange, item: Country): void {
		if(event.isUserInput){
			this.isLoading= true;
			if(item.countryName != 'Ecuador'){
				this.personForm.get('provinceID').setValidators(null);
				this.personForm.get('cantonID').setValidators(null);
				this.personForm.get('parishID').setValidators(null);
				this.personForm.updateValueAndValidity();
				setTimeout(() => {
					this.isLoading= false;
				}, 15);
			}else{
				this.personForm.get('provinceID').setValidators([Validators.required]);
				this.personForm.get('cantonID').setValidators([Validators.required]);
				this.personForm.get('parishID').setValidators([Validators.required]);
				this.personForm.updateValueAndValidity();
				setTimeout(() => {
					this.isLoading= false;
				}, 15);
			}
		}
	}

	async loading() {
		this.isLoading = true;
		this.common.getCountries().subscribe({
			next: (res) => {
				this.countries = res;
				//console.log(this.countries);
			}
		})

		this.common.cargaCombo(6).subscribe( province => {
			this.provinces= province;
    })

		await this.common.charging();
		this.isLoading = false;
	}

	onProvinceChange(): void{
		this.isLoading= true;
		this.personForm.get('provinceID')?.valueChanges
		.pipe(
				untilComponentDestroyed( this ),
			tap( () => this.personForm.get('cantonID')!.setValue('') ),
			switchMap((province) => {
				return this.common.getCantonByProvince(7, province || '')
			}),
			)
			.subscribe( canton => {
			this.cantonsByProvince = canton;
			this.isLoading=false
		},(err) => {
			//console.log(err);
			this.isLoading=false;
		})
	}

	onCantonsChange(): void{
		this.isLoading= true;
		this.personForm.get('cantonID')?.valueChanges
		.pipe(
			untilComponentDestroyed( this ),
			tap( () => this.personForm.get('parishID')!.setValue('') ),
			switchMap((cantons) => {
				return this.common.getParishByCanton(8, cantons || '')
			}),
		)
		.subscribe( parish => {
			this.parishByCantons = parish;
			this.isLoading=false
		},(err) => {
			//console.log(err);
			this.isLoading=false;
		})
	}

	savePerson() {
		//console.log('form', this.personForm.value);
		if (!this.personForm.valid) {
			this.idPerson.emit(this.personID);
			this.personForm.markAllAsTouched();
			this.common.message('Información Incompleta o Incorrecta', ' Revise que no existan campos en color rojo', 'error', '#f5637e');
			return;
		}
		if (this.disability) {
			if (this.personForm.get('percentageDisability')?.value === 0 || this.personForm.get('cometaryDisability')?.value === '' || this.personForm.get('fileDisability')?.value === null) {
				this.idPerson.emit(this.personID);
				this.personForm.markAllAsTouched();
				this.common.message('Información Incompleta o Incorrecta', '', 'error', '#f5637e');
				return;
			}
		}

		const discapacidad: Discapacidad = {
			personID: Number(this.personID),
			disabilityID: this.personForm.get('disabilityID').value,
			percentageDisability: this.personForm.get('percentageDisability').value,
			commentary: this.personForm.get('cometaryDisability').value,
			user: sessionStorage.getItem('name')
		};

		const person = this.personForm.getRawValue();
		person.personID = this.personID;
		person.birthday = this.formattedDate(person.birthday);
		person.placeOfBirth = person.birthPlace;
		const form = Object.assign(person);
		this.rrhh.postProfileImage(this.fileAvatar, this.personID, 6).subscribe({
			next: (res) => {
				//this.common.message('Imagen Actualizada', '', 'success', '#d3996a');
			}
		})
		this.isLoading= true;
		this.common.savePerson2(person)
			.subscribe((resp: any) => {
				if (this.personForm.get('disabilityID').value && this.personForm.get('disabilityID').value != 5 && this.isUpdating === false) {
					this.common.postGuardarDiscapacidadDocente(discapacidad)
						.subscribe(res => {
							this.rrhh.postFileDocs(this.fileDisability, Number(this.personID), 10, 1)
									.subscribe(res => {
										this.common.message('Información Actualizada', '', 'success', '#d3996a');
										this.common.nextStep.next(true);
										this.isLoading= false;
								});
						}
						);
				} else {
					this.common.message('Información Actualizada', '', 'success', '#d3996a');
					this.common.nextStep.next(true);
					this.isLoading= false;
				}
			}, (err) => {
				console.log(err);
				this.common.message(err.error.message[0], '', 'error', '#f5637e');
				this.isLoading= false;
			});
		this.formularioDatos.emit(true);
	}

	searchIdentity() {
		const identity = this.personForm.get('documentNumber')?.value;
		const typeIdentity = this.personForm.get('typeDocument')?.value;
		if (identity?.length === 10 && typeIdentity === 1) {
			this.isLoading = true;
			this.common.registoCivil(identity)
				.subscribe(cedula => {
					if (cedula.ok && cedula.consulta.nombre) {
						this.consultation = cedula.consulta;
						this.chargeInfo(this.consultation);
					} else {
						this.common.message('Cédula Incorrecta', 'Vuelva a ingresar el número de documento', 'warning', '#d3996a');
						this.personForm.get('documentNumber')?.setValue('');
					}
					this.isLoading = false;
				}, (err) => {
					console.log(err);
					this.isLoading = false;
				})
		}
	}

	chargeInfo(person: Consulta) {
		var split = person.nombre.split(' ');
		this.personForm.get('firstName')?.setValue(split[2] + ' ' + split[3]);
		this.personForm.get('surname')?.setValue(split[1]);
		this.personForm.get('secondSurname')?.setValue(split[0]);

		// Tipo de documento
		if (this.personForm.get('typeDocument').value !== '') {
			this.personForm.get('typeDocument').disable();
		}

		// Tipo de documento
		if (this.personForm.get('typeDocId').value !== '') {
			this.personForm.get('typeDocId').disable();
		}

		//sexo
		if (person.genero === 'HOMBRE') {
			this.personForm.get('sexID')?.setValue(2);
		} else {
			this.personForm.get('sexID')?.setValue(1);
		}
		this.personForm.get('sexID').disable();

		//Estado civil
		if (person.estadoCivil === 'SOLTERO') {
			this.personForm.get('civilStatusID')?.setValue(1);
		} else if (person.estadoCivil === 'CASADO') {
			this.personForm.get('civilStatusID')?.setValue(2);
		} else if (person.estadoCivil === 'DIVORCIADO') {
			this.personForm.get('civilStatusID')?.setValue(3);
		} else if (person.estadoCivil === 'VIUDO') {
			this.personForm.get('civilStatusID')?.setValue(4);
		}
		this.personForm.get('civilStatusID').disable();

		//Nacionalidad
		if (person.nacionalidad === 'ECUATORIANA') {
			this.personForm.get('nationalityID')?.setValue(59);
			this.personForm.get('nationalityID').disable();
		}

		//Nacionalidad
		if (person.nacionalidad === 'ECUATORIANA') {
			this.personForm.get('nationality')?.setValue(59);
			this.personForm.get('nationality').disable();
		}

		//Fecha de nacimiento
		var splitDate = person.fechaNacimiento.split('/');
		let dateBirthday: Date = new Date(splitDate[2] + '-' + splitDate[1] + '-' + splitDate[0]);
		if (person.fechaNacimiento !== '') {
			this.personForm.get('birthday')?.setValue(this.formattedDate(new Date(dateBirthday)));
			this.personForm.get('birthday').disable();
		}

		//Nombre completo
		if (person.nombre !== '') {
			this.personForm.get('firstName').disable();
			this.personForm.get('surname').disable();
			this.personForm.get('secondSurname').disable();
		}

		//Cedula
		if (this.personForm.get('documentNumber').value !== '') {
			this.personForm.get('documentNumber').disable();
		}
	}

	isValidField(field: string): boolean | null {
		return this.personForm.controls[field].errors
			&& this.personForm.controls[field].touched;
	}

	getFielError(field: string): string | null {
		if (!this.personForm.controls[field]) return null;

		const errors = this.personForm.controls[field].errors || {};

		for (const key of Object.keys(errors)) {
			switch (key) {
				case 'required':
					return 'Campo requerido!';
				case 'min':
					if (errors['min'].min === 1) {
						return 'Debe seleccionar una opción!';
					} else {
						return 'Cantidad Incorrecta!';
					}

				case 'email':
					return 'No es un formato de email valido!';
				case 'minlength':
					return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
			}
		}
		return '';
	}

	public onChangeInputDisability(files: FileList): void {
		if (files) {
			const file: File = files.item(0);
			const fileReader = new FileReader();
			if (file) {
				this.fileDisability = file;
			}
		}
	}
	public async onChangeInput(files: FileList) {
		if (files) {
			const file: File = files.item(0);
			const fileReader = new FileReader();
			fileReader.onload = function (e) {
				const base64String = e.target.result;

			  };
			if (file) {
				this.showImg = true;
				this.fileAvatar = file;
				this.imgBase64 += await this.convertFileToBase64(file);
				this.personForm.get('avatar').patchValue(' ');
			}
		}
	}

	public fileChangeEvent(event: any): void {

		if (event.target.files.length) {
			const file = event.target.files[0];
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => {
				if (reader.result) {
					this.personForm.get('avatar')?.setValue(reader.result as string);
					this.personForm.get('avatar')?.markAsTouched();
					this.personForm.get('avatar')?.markAsDirty();
				}
			}
		}
	}

	private formattedDate(date: Date): string {
		return <string>this.datePipe.transform(date, 'yyyy-MM-dd');
	}

	private async convertBase64ToFile(urlFile: string): Promise<File> {
		const res = await fetch(urlFile);
		const blobFile = await res.blob();
		const file = new File([blobFile], 'image', { type: blobFile.type });
		this.personForm.get('avatar')?.setValue("upload");
		return new Promise(resolve => resolve(file));
	}


	/* *********************************** -------------------------- *********************************** */

	getParish(eve: any) {
		this.personForm.get('parishID')?.setValue(eve);
	}
	getProvince(eve: any) {
		this.personForm.get('provinceID')?.setValue(eve);
	}
	getCanton(eve: any) {
		this.personForm.get('cantonID')?.setValue(eve);
	}

	changeDisability(eve: any) {
		if (eve.value && eve.value !== 5) {
			this.personForm.get('percentageDisability')?.setValidators([Validators.required]);
			this.personForm.get('cometaryDisability')?.setValidators([Validators.required]);
			this.personForm.get('fileDisability')?.setValidators([Validators.required]);
			this.disability = true;
			this.personForm.updateValueAndValidity();
		}
		else if (eve.value === 5) {
			this.disability = false;
			this.personForm.get('percentageDisability')?.setValidators(null);
			this.personForm.get('cometaryDisability')?.setValidators(null);
			this.personForm.get('fileDisability')?.setValidators(null);
			this.personForm.updateValueAndValidity();
		}else if(!eve.value){
			this.disability= false;
		}
	}

	convertFileToBase64(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => {
		const base64String = reader.result?.toString().split(',')[1];
		if (base64String) {
			resolve(base64String);
		} else {
			reject('Failed to convert file to Base64.');
		}
		};

		reader.readAsDataURL(file);
	});
	}

	blurBirthday(eve:any){
	const age = this.calculateAge(eve.value);
	if(age < 18){
		this.common.message('Debe ser mayor a 18 años', '', 'warning', '#d3996a');
		this.personForm.get('birthday')?.setValue('');
	}
	}

	calculateAge(date:string): number {
	const today: Date = new Date();
	const birthDate: Date = new Date(date);


	let age: number = today.getFullYear() - birthDate.getFullYear();
	const monthDiff: number = today.getMonth() - birthDate.getMonth();

	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
		age--;
	}

	return age;
	}

	public openFile(relativeRoute: string): void {
		const route: string = `${environment.url}/${relativeRoute}`;
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
	}

	public openSustantiveDialog(personID: number, flag: boolean= false): void {
		const config: MatDialogConfig = new MatDialogConfig();
		config.id = 'SustantiveFunctionsComponent';
		config.autoFocus = false;
		config.minWidth = '50vw';
		config.maxWidth = '50vw';
		config.panelClass = 'transparent-panel';
		config.data = { personID, flag };
		config.disableClose = false;
		const dialog = this.dialog.open(SustantiveFunctionsComponent, config);
		dialog.afterClosed()
		.pipe(untilComponentDestroyed(this))
		.subscribe((res) => {});
	}

	private getPersonImage(currentPerson: ConsultedStudent): void {
		this.isLoading= true;
		let rute= currentPerson.avatar;
		this.api.getTeacherImage(rute).subscribe({
			next: (res) => {
				this.createImageFromBlob(res);
				this.isLoading= false;
			},
			error: (_err: HttpErrorResponse) => {
				this.isLoading= false;
			}
		});
	}

	private createImageFromBlob(image: Blob) {
		let reader = new FileReader();
		reader.addEventListener("load", () => {
				this.personImage = reader.result;
		}, false);

		if (image) reader.readAsDataURL(image);
	}
}

