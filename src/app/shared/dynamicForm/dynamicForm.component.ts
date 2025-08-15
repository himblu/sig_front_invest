import {Component, OnInit, Input, EventEmitter, Output, inject, SecurityContext} from '@angular/core';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {FormInstrumentService} from '@services/formInstrument.service';
import {LoadingService} from '@services/loading.service';
import {Field, FormRow} from '@utils/interfaces/others.interfaces';
import { environment } from '@environments/environment';
import { Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { ApiService } from '@services/api.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';


@Component({
	selector: 'app-dynamic-form',
	standalone: true,
	templateUrl: './dynamicForm.component.html',
	styleUrls: ['./dynamicForm.component.css'],
	imports: [
		ReactiveFormsModule,
		NgForOf,
		NgIf,
		MatSelectModule,
		MatInputModule,
		MatButtonModule,
		MatCardModule,
		NgClass,
		MatSnackBarModule
	]
})
export class DynamicFormComponent implements OnInit {
	private getPdfContentSubscription!: Subscription;
	private sanitizer: DomSanitizer = inject(DomSanitizer);
	private snackBar: MatSnackBar = inject(MatSnackBar);
	@Input() formConfig: FormRow[] = [];
	@Input() urlReport: string ='';
	@Output() changeEvent = new EventEmitter<any>();
	@Output() clearResult = new EventEmitter<any>();

	form!: FormGroup;
	options: { [key: string]: any[] } = {};

	constructor(private fb: FormBuilder,
							private formService: FormInstrumentService,
							private loadingService: LoadingService,
							private api: ApiService
							) {
	}

	ngOnInit() {
		if (this.formConfig.length > 0) {
			this.createForm();
			this.loadInitialOptions();
		}
	}

	createForm(): void {
		let formControls: { [key: string]: any[] } = {};

		this.formConfig.forEach((row: FormRow) => {
			row.fields.forEach((field: Field) => {
				const validators = field.validators
					? field.validators.map(v => this.mapValidator(v))
					: [];

				if (field.required) {
					validators.push(Validators.required);
				}

				const defaultValue = field.defaultValue !== undefined ? field.defaultValue : null;
				const isDisabled = field.dependsOn || defaultValue !== null; // Deshabilitar si tiene valor predeterminado

				formControls[field.key] = [
					{ value: defaultValue, disabled: isDisabled },
					Validators.compose(validators)
				];
			});
		});

		this.form = this.fb.group(formControls);

		this.formConfig.forEach((row: FormRow) => {
			row.fields.forEach((field: Field, index, fieldsArray) => {
				const control = this.form.get(field.key);

				if (!control) {
					return;
				}

				if (field.type === 'select' || field.type === 'text' || field.type === 'number') {
					control.valueChanges.subscribe(() => {
						this.clearFollowingFields(index, fieldsArray);
					});
				}

				if (field.dependsOn) {
					this.form.get(field.dependsOn)?.valueChanges.subscribe(() => {
						this.handleFieldDependency(field);
					});
				}
			});
		});
	}

// Método para limpiar los campos (selects e inputs) que siguen después de uno que ha cambiado
	clearFollowingFields(currentIndex: number, currentFields: Field[]) {

		// 🔹 Limpiar los siguientes campos en la misma fila
		for (let i = currentIndex + 1; i < currentFields.length; i++) {
			const nextFieldKey = currentFields[i].key;
			this.form.get(nextFieldKey)?.reset();
		}

		// 🔹 Limpiar todas las filas siguientes
		const currentRowIndex = this.formConfig.findIndex(row => row.fields === currentFields);
		for (let rowIndex = currentRowIndex + 1; rowIndex < this.formConfig.length; rowIndex++) {
			this.formConfig[rowIndex].fields.forEach(field => {
				this.form.get(field.key)?.reset();
			});
		}
		this.clearResult.emit(true);
	}

// Función que mapea strings de validadores a funciones de Validators
	mapValidator(validatorObj: any) {
		switch (validatorObj.rule) {
			case 'required':
				return Validators.required;
			case 'minLength':
				return Validators.minLength(validatorObj.value || 5); // Si no hay valor, usa 5 como predeterminado
			case 'maxLength':
				return Validators.maxLength(validatorObj.value || 10);
			case 'email':
				return Validators.email;
			default:
				console.warn(`⚠️ Validador desconocido: ${validatorObj.rule}`);
				return null;
		}
	}


	loadInitialOptions() {
		this.loadingService.show('Cargando opciones...'); // ✅ Muestra el modal de carga con un mensaje personalizado

		let requests = 0; // Contador de peticiones pendientes

		this.formConfig.forEach((row: FormRow) => {
			row.fields.forEach((field: Field) => {
				if (field.type === 'select' && field.optionsEndpoint && !field.dependsOn) {
					requests++; // ✅ Incrementa el número de peticiones pendientes

					this.formService.getOptions(field.optionsEndpoint.path).subscribe({
						next: (response) => {
							const dataArray = Array.isArray(response) ? response : response.data;
							if (Array.isArray(dataArray)) {
								this.options[field.key] = dataArray.map(item => ({
									value: item[field.optionsEndpoint!.value],
									label: item[field.optionsEndpoint!.label]
								}));
							} else {
								this.options[field.key] = [];
							}
						},
						error: (err) => {
							console.error(`Error al cargar opciones para ${field.key}:`, err);
							this.options[field.key] = [];
						},
						complete: () => {
							requests--; // ✅ Disminuye el contador cuando la petición finaliza
							if (requests === 0) {
								this.loadingService.hide(); // ✅ Oculta el modal cuando todas las peticiones han terminado
							}
						}
					});
				}
			});
		});

		// ✅ En caso de que no haya peticiones, ocultar el modal inmediatamente
		if (requests === 0) {
			this.loadingService.hide();
		}
	}

	handleFieldDependency(field: Field) {
		const parentValue = this.form.get(field.dependsOn!)?.value;
		if (field.type === 'number') {
			if (parentValue !== null && parentValue !== undefined && parentValue !== '') {
				this.form.get(field.key)?.enable();
			} else {
				this.form.get(field.key)?.disable();
			}
		} else {
			this.loadDependentOptions(field);
		}
	}

	loadDependentOptions(field: Field) {
		if (field.optionsEndpoint && field.pathParams) {
			let missingValues = field.pathParams.filter(param =>
				this.form.get(param)?.value === null || this.form.get(param)?.value === undefined
			);

			if (missingValues.length > 0) {
				console.warn(`⚠️ No se cargaron opciones para ${field.key} porque faltan valores:`, missingValues);
				this.options[field.key] = [];
				this.form.get(field.key)?.disable();
				return;
			}

			let fullUrl = field.optionsEndpoint.path;
			field.pathParams.forEach(param => {
				fullUrl = fullUrl.replace(`{${param}}`, this.form.get(param)?.value.toString());
			});

			this.formService.getOptions(fullUrl).subscribe(response => {
				const dataArray = Array.isArray(response) ? response : response.data;
				if (Array.isArray(dataArray) && dataArray.length > 0) {
					this.options[field.key] = dataArray.map(item => ({
						value: item[field.optionsEndpoint!.value],
						label: item[field.optionsEndpoint!.label]
					}));
					this.form.get(field.key)?.enable();
				} else {
					console.warn(`⚠️ No se encontraron opciones en ${field.key}:`, response);
					this.options[field.key] = [];
					this.form.get(field.key)?.disable();
				}
			});
		}
	}

	onSubmit() {
		if (this.form.valid) {
			console.log('Formulario enviado:', this.form.value);
		}
	}

	markTouched(key: string) {
		const control = this.form.get(key);
		if (control && !control.touched) {
			control.markAsTouched();
		}
	}

	emitChange(sendForm: boolean) {
		const formValues = this.form.getRawValue(); // Obtener valores incluso si hay campos deshabilitados
		const hasValues = Object.values(formValues).some(value => value !== null && value !== undefined && value !== '');

		if (sendForm && hasValues && this.form.valid) {
			this.changeEvent.emit({ form: formValues, sendForm});
		}else {
			this.changeEvent.emit(null);
		}
	}

	getReport(){
		//endPointPostReport
		const fileName='reporte'
		const relativeRoute=this.urlReport;
		const route: string = `${environment.url}${relativeRoute}`;
		const body={
			periodID:this.form.getRawValue().p_periodID,
			evaluationInstrumentsID:this.form.getRawValue().evaluationInstrument
		}
		if (this.getPdfContentSubscription) this.getPdfContentSubscription.unsubscribe();
		this.api.getPdfBodyContent(route,body).subscribe({
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
