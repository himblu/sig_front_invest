import {CommonModule, DatePipe} from '@angular/common';
import {ChangeDetectorRef, Component, ElementRef, inject, OnInit, ViewChild} from '@angular/core';
import {
	AbstractControl,
	FormBuilder,
	FormGroup,
	FormsModule,
	ReactiveFormsModule,
	ValidatorFn,
	Validators
} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AdministrativeService} from '@services/administrative.service';
import {RrhhService} from '@services/rrhh.service';
import {onlyNumbers} from 'app/constants';
import {WidgetSearchPersonComponent} from 'app/widgets/widget-search-person/widget-search-person.component';
import * as moment from 'moment';
import {BsModalRef, BsModalService, ModalDirective, ModalModule} from 'ngx-bootstrap/modal';
import {TabsModule} from 'ngx-bootstrap/tabs';
import Swal from 'sweetalert2';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatInputModule} from '@angular/material/input';
import {MatOptionModule} from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {SPGetPerson2} from '@utils/interfaces/person.interfaces';
import {HttpErrorResponse} from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CommonService} from '@services/common.service';

@Component({
	selector: 'app-assignment-of-course-new',
	templateUrl: './assignment-of-course-new.component.html',
	styleUrls: ['./assignment-of-course-new.component.css'],
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		ModalModule,
		TabsModule,
		MatListModule,
		MatIconModule,
		MatTooltipModule,
		MatInputModule,
		MatOptionModule,
		MatSelectModule,
		MatButtonModule
	],
	providers: [
		DatePipe
	],
})
export class AssignmentOfCourseNewComponent implements OnInit {

	constructor(
		private Administrative: AdministrativeService,
		private CommonService: CommonService,
		private RRHH: RrhhService,
		private ActivatedRoute: ActivatedRoute,
		private Router: Router,
		private Modal: BsModalService,
		private ElementRef: ElementRef,
		private datePipe: DatePipe,
		private fb: FormBuilder,
		private cdr: ChangeDetectorRef,
	) {
		this.initUsersForm();
	}

	@ViewChild('selectTypeSignatorie', {static: false}) selectTypeSignatorie: ModalDirective;
	@ViewChild('usersModal', {static: false}) usersModal: ModalDirective;
	// private snackBar: MatSnackBar = inject(MatSnackBar);

	public now: string = this.formattedDate(new Date);
	public externalTeacherForm!: FormGroup;

	typeCertifications: any[] = [];
	typeTeachers: any[] = [];
	teachers: any[] = [];
	classSessions: any[] = [];
	courses: any[] = [];

	newAssignment: any = {};

	typeSignatories: any[] = [
		{id: 1, name: 'Persona Interna', icon: 'fa fa-download'},
		{id: 2, name: 'Persona Externa', icon: 'fa fa-upload'},
	];

	typeCategory: any[] = [
		{id: 1, name: 'Educacion Continua'},
		{id: 2, name: 'UNACEM'},
	];

	typeSignatorySelected: any = {};

	// Para la creación del horario
	initDay: string = '8:00';
	finishDay: string = '16:00';
	timeDistribution: any[] = [];
	schedule: any = [];
	typeDocument: any = []

	totalDays: number = 6;
	timeDistributionGenerated: boolean = false;

	days: any = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
	dayNumber: any = [6, 0, 1, 2, 3, 4, 5]
	headerTimeDistribution: any[] = [];
	signatories: any[] = [];
	user: any;
	assignmentID: number = 0;
	periodID: number;
	classSectionNumber: number;
	searchPersonModal: BsModalRef;
	personID: number;
	scheduleProggrameds: any[] = [];
	currentDate: any;
	exampleSubtitle: string = 'UNACEM ECUADOR OTORGA: '
	exampleOrganizes: string = 'ORGANIZADO POR LA UNIDAD DE SEGURIDAD DE UNACEM CON UNA DURACIÓN DE:';
	startDateAdministrativa: string;
	endDateAdministrativa: string;

	async ngOnInit() {
		this.currentDate = moment().format('YYYY-MM-DD');
		this.personID = +sessionStorage.getItem('personID');
		this.user = sessionStorage.getItem('userId');
		let params: any = this.ActivatedRoute.snapshot.params;

		const assignmentData = this.Administrative.getAssignmentData();
		this.startDateAdministrativa = assignmentData?.startDate || null;
		this.endDateAdministrativa = assignmentData?.endDate || null;
		//console.log(params.assignmentID);
		if (params.assignmentID === 'nuevo') {
			//console.log('NUEVA ASIGNACIÓN');
			this.newAssignment = {
				sectionStatusID: 1
			};
			Swal.fire({
				html: '<i class="fa fa-cog fa-spin fa-3x"></i> <br> <h2 class="text-center">Buscando Información de la Persona.</h2>',
				showConfirmButton: false,
				showCancelButton: false,
				allowEnterKey: false,
				allowEscapeKey: false,
				allowOutsideClick: false
			});
		} else {
			this.periodID = +params.assignmentID.split('-')[0];
			this.classSectionNumber = +params.assignmentID.split('-')[1];
			if (isNaN(this.periodID) || isNaN(this.classSectionNumber)) {
				Swal.fire({
					text: 'La asignación de curso no existe',
					icon: 'error',
				});
				this.Router.navigate([`/unacem/asignacion-de-cursos`]);
				return;
			}
			let body: any = {
				"filter": {},
				"pagination": {"recordNumber": 1000, "totalRecords": 31, "currentPage": 1},
				"show": true
			};

			// let result: any = await this.Administrative.getUnacemClassSectionByFilterAndPagination(1, 250, '', '2024-01-01', this.now, 1).toPromise();
			let result: any = await this.Administrative.getUnacemClassSectionByFilterAndPagination(1, 250, '', this.startDateAdministrativa, this.endDateAdministrativa, 1).toPromise();
			//console.log(this.periodID);
			//console.log(this.classSectionNumber);
			//console.log('result', result);
			this.newAssignment = result.data.find((r: any) => r.periodID === this.periodID && r.classSectionNumber === this.classSectionNumber);
			//console.log('newAssignment', this.newAssignment);

			this.newAssignment.editing = true;
			this.newAssignment.courseID = this.newAssignment.extensionCoursesID;
			this.newAssignment.costSection = this.newAssignment.cost ? parseFloat(this.newAssignment.cost) : this.newAssignment.cost;
			this.newAssignment.durationHours = this.newAssignment.hours;
			Swal.fire({
				html: '<i class="fa fa-cog fa-spin fa-3x"></i> <br> <h2 class="text-center">Buscando Información de la Persona.</h2>',
				showConfirmButton: false,
				showCancelButton: false,
				allowEnterKey: false,
				allowEscapeKey: false,
				allowOutsideClick: false
			});
			let signatures: any = await this.Administrative.getUnacemSettingSignature(this.periodID, this.classSectionNumber).toPromise();
			this.signatories = signatures;
			//console.log(this.signatories);

			let schedules: any = await this.Administrative.getScheduleUnacemByPeriodIDAndClassSectionNumber(this.periodID, this.classSectionNumber).toPromise();
			//console.log(schedules);
			this.scheduleProggrameds = schedules;
			this.scheduleProggrameds.map((s: any) => {
				s.weekdayID = s.weekdayID ? parseInt(s.weekdayID) : s.weekdayID;
			});
			this.generateTimeDistribution();
			//console.log('VERIFICAR SI EXISTE CON UN GET POR ID');
		}
		this.getTypeCertifications();
	}

	async getTypeCertifications() {
		let result: any = await this.Administrative.getTypeCertification().toPromise();
		this.typeCertifications = result;
		this.getTypeTeachers();
	}

	async getTypeTeachers() {
		let result: any = await this.Administrative.getTypeTeacher().toPromise();
		this.typeTeachers = result;
		this.getTeachers();
	}

	async getTeachers() {
		let result: any = await this.RRHH.getTeacher().toPromise();
		this.teachers = result.data;
		this.teachers.sort((a: any, b: any) => a.PersonFullName.localeCompare(b.PersonFullName));
		if (this.newAssignment.editing) {
			this.newAssignment.teacherID = this.teachers.filter(t =>
				this.newAssignment.teachers.map((teach: any) => teach.teacherID).includes(t.teacherID)
			);
		}

		this.getClassSessions();
	}

	async getTeachersUnacem() {
		let result: any = await this.RRHH.getTeacherUnacem().toPromise();
		this.teachers = result;
	}

	async getClassSessions() {
		let result: any = await this.Administrative.getClassSessions().toPromise();
		this.classSessions = result;
		this.getExtensionCourses();
	}

	async getExtensionCourses() {
		let body: any = {
			filter: {},
			pagination: {currentPage: 1, recordNumber: 1000}
		};
		let resultQuantity: any = await this.Administrative.getExtensionCourseQuantityByFilter(body).toPromise();
		body.pagination.recordNumber = resultQuantity.quantity;
		let result: any = await this.Administrative.getExtensionCourse().toPromise();
		this.courses = result;
		this.getTypeDocument()
	}

	async getTypeDocument() {
		let result: any = await this.CommonService.getDocumentType().toPromise();
		this.typeDocument = result;
		Swal.close();
	}

	generateTimeDistribution() {
		//console.log(this.newAssignment);
		this.resetDistribution();
		this.newAssignment.timeDurationSession = +this.newAssignment.timeDurationSession;
		// this.timeDistributionGenerated = false;
		let initDay: any = moment(this.newAssignment.startDate);
		let finishDay: any = moment(this.newAssignment.endDate).add(1, 'day');
		while (initDay.isBefore(finishDay)) {
			let initDayProcess: any = moment(this.newAssignment.startHourDay, 'HH:mm');
			let finishDayProcess: any = moment(this.newAssignment.endHourDay, 'HH:mm');
			let counterHour = 1;
			while (initDayProcess.isBefore(finishDayProcess)) {
				// let finishDayProcess: any = initDayProcess.add(this.intervalTimeInMinutes, 'minutes');
				let academicHour: any = {
					day: initDay.weekday(),
					dayNumber: this.dayNumber[initDay.weekday()],
					dayLetter: this.days[initDay.weekday()],
					date: initDay.format('DD/MM/YYYY'),
					dateNumber: initDay.unix(),
					hourAcademic: counterHour,
					init: initDayProcess,
					initLetter: initDayProcess.format('HH:mm a'),
					finish: finishDayProcess,
					finishLetter: initDayProcess.add(this.newAssignment.timeDurationSession, 'minutes').format('HH:mm a'),
					isBusy: false
				};
				this.timeDistribution.push(academicHour);
				counterHour++;
			}
			initDay.add(1, 'day');
		}

		//console.log("zz<<<<<<<<<<<<<<<<<<<<<<<this.scheduleProggrameds>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<azz");
		//console.log(this.scheduleProggrameds.map((s: any) => s.weekdayID));
		//console.log(this.timeDistribution.map((t: any) => t.day));
		let applyAll: boolean = false;
		if (this.scheduleProggrameds.length) {
			applyAll = this.scheduleProggrameds[0].startDate === this.newAssignment.startDate
				&& this.scheduleProggrameds[0].endDate === this.newAssignment.endDate;
		}
		//console.log("><<<<<<<<<<<<<<<<<<<<<<<<<<<<<applyAll>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
		//console.log(applyAll);
		this.scheduleProggrameds.map((s: any) => {
			if (applyAll) {
				let timeFounds: any = this.timeDistribution.filter((t: any) => t.day === s.weekdayID);
				timeFounds.filter((t: any) => t.initLetter.startsWith(s.startTime.substr(0, 5))).map((t: any) => {
					t.isSelected = true;
					t.inBD = true;
					// s.isSelected = true;
				});
			} else {
				// Buscar por Fechas
				let timeFounds: any = this.timeDistribution.filter((t: any) => t.date === moment(s.startDate, 'YYYY-MM-DD').format('DD/MM/YYYY'));
				timeFounds.filter((t: any) => t.initLetter.startsWith(s.startTime.substr(0, 5))).map((t: any) => {
					t.isSelected = true;
					t.inBD = true;
				});
			}
		})
		//console.log(this.timeDistribution);
		let hours: any = [...new Set(this.timeDistribution.map((t: any) => t.hourAcademic))];
		let header: any = [...new Set(this.timeDistribution.map((t: any) => t.date))];
		this.headerTimeDistribution = header.map((h: any) => {
			//console.log(h);
			return {
				date: moment(h, 'DD/MM/YYYY').format('DD/MM/YYYY'),
				dayLetter: this.days[moment(h, 'DD/MM/YYYY').weekday()]
			};
		})
		//console.log(hours);
		hours.map((h: any) => {
			this.schedule.push({
				hour: h,
				config: this.timeDistribution.filter((t: any) => t.hourAcademic === h).sort((a: any, b: any) => a.dateNumber - b.dateNumber)
			})
		});
		//console.log(this.schedule);
		this.timeDistributionGenerated = true;
		this.calculateQuantities();
	}

	calculateNextHour() {
		this.newAssignment.nextMinHour = moment(this.newAssignment.startHourDay, 'HH:mm').add(this.newAssignment.timeDurationSession, 'minutes').format('HH:mm');
		//console.log(this.newAssignment);
	}

	validateHour() {
		//console.log(moment(this.newAssignment.startHourDay,'HH:mm').isAfter(moment(this.newAssignment.endHourDay, 'HH:mm')));
		if (moment(this.newAssignment.startHourDay, 'HH:mm').isAfter(moment(this.newAssignment.endHourDay, 'HH:mm'))) {
			Swal.fire({
				text: 'Debes asignar una hora superior a la Hora de inicio',
				icon: 'error'
			});
			this.newAssignment.endHourDay = undefined;
		}
	}

	resetDistribution() {
		this.timeDistributionGenerated = false;
		this.timeDistribution = [];
		this.schedule = [];
	}

	toggleTimeDistribution() {
		if (this.newAssignment.typeCategory === 2) {
			this.timeDistributionGenerated = true;
		}
	}

	saveChanges() {
		Swal.fire({
			text: '¿Estás seguro de guardar los cambios de la Asignación?',
			icon: 'question',
			showConfirmButton: true,
			showCancelButton: true,
			confirmButtonColor: '#014898',
			allowEnterKey: false,
			allowEscapeKey: false,
			allowOutsideClick: false,
			cancelButtonText: 'Cancelar'
		}).then(async (choice) => {
			if (choice.isConfirmed) {
				//console.log(this.newAssignment);
				this.newAssignment.extensionCoursesID = this.newAssignment.courseID;
				this.newAssignment.userCreated = this.user || 'MIGRA';
				let body: any = {};
				let result: any;
				let resultSchedule: any;

				if (this.newAssignment.typeCategory === 2) {
					this.newAssignment.timeDurationSession = 0
					this.newAssignment.startHourDay = ""
					this.newAssignment.endHourDay = ""
				} else {
					this.newAssignment.NroHrasVirt = null;
					this.newAssignment.NroHrasPres = null;
				}

				if (!this.newAssignment.editing) {

					this.newAssignment.userCreated = this.user || 'MIGRA';
					body.news = [this.newAssignment];
					result = await this.Administrative.postUnacemClassSection(body).toPromise();

					//console.log(this.timeDistribution.filter((t: any) => t.isSelected));
					//console.log(result);
				} else {
					this.newAssignment.periodSection = this.newAssignment.periodID;
					body.updates = [this.newAssignment];
					result = await this.Administrative.updateUnacemClassSection(body).toPromise();
				}
				this.signatories.map((s: any) => {
					s.periodID = this.newAssignment.periodID || result[0].periodSection;
					s.classSectionNumber = this.newAssignment.classSectionNumber || result[0].classSectionNumber;
					// s.urlFileFirm = s.urlFileFirm || 'VERIFICAR';
				});
				let newSignaturesFiles: any = this.signatories.filter((s: any) => !s.urlFileFirm);
				for (let x = 0; x < newSignaturesFiles.length; x++) {
					let signature = newSignaturesFiles[x];
					//console.log(signature);
					const file: HTMLInputElement = this.ElementRef.nativeElement.querySelector(`#signature-${signature.index}`)
					//console.log(file);
					let fileCount: number = file.files.length;
					let formData = new FormData();
					if (fileCount > 0) {
						formData.append('file', file.files.item(0));
						let fileUpload: any = await this.Administrative.uploadSignature(formData, this.personID).toPromise();
						signature.urlFileFirm = fileUpload.pathFile;
					}
				}
				//console.log(this.signatories);
				let newSignatures: any = this.signatories.filter((s: any) => s.isNew);
				if (newSignatures.length) {
					newSignatures.map((s: any) => {
						s.statusID = 1;
					});
					let bodyNewSignatures: any = {
						news: newSignatures
					};

					let resultSignature: any = await this.Administrative.postUnacemSettingSignature(bodyNewSignatures).toPromise();
				}

				let updatesSignatures: any = this.signatories.filter((s: any) => !s.isNew);
				if (updatesSignatures.length) {
					updatesSignatures.map((s: any) => {
						s.statusID = 1;
					});
					let bodyNewSignatures: any = {
						updates: updatesSignatures
					};
					let resultSignature: any = await this.Administrative.updateUnacemSettingSignature(bodyNewSignatures).toPromise();
				}

				const {classSectionNumber, periodSection} = !this.newAssignment.editing ? result[0] : result[0][0]
				const payloadToAssignTeacherCourse = this.newAssignment.teacherID.map((teacher: any) => ({
					periodSection,
					classSectionNumber,
					teacherID: teacher.teacherID
				}))
				await this.Administrative.postAssignTeacherCourse({news: [...payloadToAssignTeacherCourse]}).toPromise();

				if (this.newAssignment?.typeCategory == 1) {
					let bodySchedule: any = {
						news: this.timeDistribution.filter((t: any) => t.isSelected).map((t: any) => {
							return {
								classSectionNumber: this.newAssignment.classSectionNumber || result[0].classSectionNumber,
								periodSection: this.newAssignment.periodID || result[0].periodSection,
								weekdayID: t.dayNumber,
								startTime: t.initLetter,
								endTime: t.finishLetter,
								startDate: moment(t.date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
								endDate: moment(t.date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
								userCreated: this.user || 'MIGRA'
							}
						})
					}

					resultSchedule = await this.Administrative.postScheduleUnacem(bodySchedule).toPromise();

					if (!resultSchedule) {
						Swal.fire({
							text: `Hubo un problema al ${this.newAssignment.editing ? 'insertar' : 'actualizasr'} la asignación`,
							icon: 'error'
						});
						return;
					}

					Swal.fire({
						text: `Se guardarón los cambios correctamente`,
						icon: 'success'
					});
				}


				this.Router.navigate([`/unacem/asignacion-de-cursos`]);
			}
		})
	}

	calculateQuantities() {
		this.newAssignment.inBusy = this.timeDistribution.filter((t: any) => t.isBusy).length;
		this.newAssignment.inFree = this.timeDistribution.filter((t: any) => !t.isBusy && !t.isSelected).length;
		this.newAssignment.inSelect = this.timeDistribution.filter((t: any) => t.isSelected).length;
		this.newAssignment.totals = this.timeDistribution.length;
	}

	toggleSelectHour(hour: any) {
		if (!hour.isBusy) {
			if (this.timeDistribution.filter((t: any) => t.isSelected).length < this.newAssignment.durationHours || hour.isSelected) {
				hour.isSelected = hour.isBusy ? false : !hour.isSelected;
			} else {
				Swal.fire({
					text: 'Ya no puedes asignar más horas al curso',
					icon: 'error'
				});
				return;
			}
		}
		this.calculateQuantities();
	}

	toggleSignatories(signatory?: any, index?: number) {
		if (signatory) {
			Swal.fire({
				text: '¿Estás seguro de eliminar al Firmante?',
				icon: 'question',
				allowEnterKey: false,
				allowEscapeKey: false,
				allowOutsideClick: false,
				showConfirmButton: true,
				showCancelButton: true,
				confirmButtonColor: '#014898',
				cancelButtonText: 'Cancelar'
			}).then(async (choice) => {
				if (choice.isConfirmed) {
					signatory.statusID = 0;
					let body: any = {
						updates: [signatory]
					};
					let result: any = await this.Administrative.updateUnacemSettingSignature(body).toPromise();
					this.signatories.splice(index, 1);
				}
			})
		} else {
			this.toggleTypeSignatorie();
		}
	}

	toggleTypeSignatorie() {
		if (this.selectTypeSignatorie.isShown) {
			this.selectTypeSignatorie.hide();
			this.typeSignatorySelected = {};
		} else {
			this.selectTypeSignatorie.config.keyboard = false;
			this.selectTypeSignatorie.config.ignoreBackdropClick = true;
			this.selectTypeSignatorie.show();
		}
	}


	resetFile(signature: any) {
		signature.urlFileFirm = undefined;
	}

	back() {
		this.Router.navigate(['/unacem/asignacion-de-cursos']);
	}

	onlyNumbers(e: any) {
		onlyNumbers(e);
	}

	ussageExample(field: string, content: string) {
		this.newAssignment[field] = content;
	}

	selectTypeSignatory(typeSignatory: any) {
		this.typeSignatorySelected = typeSignatory;
	}

	choiceTypeSignatory() {
		switch (this.typeSignatorySelected.id) {
			case 1:
				this.toggleTypeSignatorie();
				this.searchPersonModal = this.Modal.show(WidgetSearchPersonComponent, {class: 'modal-lg'});
				this.searchPersonModal.content.onClose.subscribe((data: any) => {
					if (data) {
						let personSelected = data;
						let mapFilter: any = (i: any) => `${i.personID}-${i.username || i.userName}`;
						if (!this.signatories.map((i: any) => mapFilter(i)).includes(mapFilter(data))) {
							this.signatories.push({
								isNew: true,
								personID: personSelected.personID,
								personFullName: personSelected.PersonFullName,
								index: this.signatories.length + 1,
								nameFirms: personSelected.PersonFullName,
								positionFirms: 'ORGANIZADOR',
								type: this.typeSignatorySelected.id,
								statusID: 1
							});
							//console.log(this.signatories, 'CASE 1')
							this.typeSignatorySelected = {};
						} else {
							Swal.fire({
								text: 'La persona seleccionada ya está INCLUIDA en la lista en mención',
								icon: 'error'
							});
							return;
						}
					}
				});
				break;

			default:
				// CASE 2
				this.signatories.push({
					isNew: true,
					personID: undefined,
					personFullName: undefined,
					index: this.signatories.length + 1,
					nameFirms: undefined,
					positionFirms: 'ORGANIZADOR',
					type: this.typeSignatorySelected.id,
					statusID: 1
				});
				//console.log(this.signatories, 'CASE 2')
				this.typeSignatorySelected = {};
				this.toggleTypeSignatorie();
				break;
		}
	}

	private formattedDate(date: Date): string {
		return <string>this.datePipe.transform(date, 'yyyy-MM-dd');
	}

	public toggleUsersModal() {
		if (this.usersModal.isShown) {
			this.usersModal.hide();
		} else {
			//console.log("Inicializando el formulario..."); // <-- Depuración

			this.usersModal.config.keyboard = false;
			this.usersModal.config.ignoreBackdropClick = true;
			this.usersModal.show();
		}
	}


	public initUsersForm(): void {
		this.externalTeacherForm = this.fb.group({
			p_typeDocument: ['', Validators.required],
			p_numberDocument: ['', [
				Validators.required,
				this.numeroDocumentoValidator(() => this.externalTeacherForm?.get('p_typeDocument')?.value)
			]],
			p_name: ['', Validators.required],
			p_lastName: ['', Validators.required],
			p_secondName: ['', Validators.required],
			p_email: ['', [Validators.required, Validators.email]],
			p_phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10),  Validators.pattern(/^[0-9]*$/)]],
		});

		this.externalTeacherForm.get('p_typeDocument')?.valueChanges.subscribe(() => {
			this.externalTeacherForm.get('p_numberDocument')?.setValue('');
			this.externalTeacherForm.get('p_numberDocument')?.updateValueAndValidity();
		});
	}

	numeroDocumentoValidator(tipoControl: () => number): ValidatorFn {
		return (control: AbstractControl): { [key: string]: any } | null => {
			const tipo = tipoControl();
			const valor = control.value;

			if (!valor) return null;

			if (tipo === 1 && valor.length !== 10) {
				return {minLengthDoc: 'Debe tener 10 caracteres'};
			}

			if (tipo === 3 && valor.length < 8) {
				return {minLengthDoc: 'Debe tener al menos 8 caracteres'};
			}

			return null;
		};
	}

	public getPersonByDocumentNumber(document: string): void {
		//console.log('manda a trare')
	}


	async onSubmitUsers() {
		if (this.externalTeacherForm.invalid) {
			//console.log('Formulario inválido');
			this.externalTeacherForm.markAllAsTouched();
			this.cdr.detectChanges(); // <-- Forzar la detección de cambios
			return;
		}

		const body = {
			"typeDocId": +this.externalTeacherForm.value.p_typeDocument,
			"personDocumentNumber": this.externalTeacherForm.value.p_numberDocument,
			"personFirstName": this.externalTeacherForm.value.p_name,
			"personMiddleName": this.externalTeacherForm.value.p_secondName,
			"personLastName": this.externalTeacherForm.value.p_lastName,
			"emailDesc": this.externalTeacherForm.value.p_email,
			"phoneNumber": this.externalTeacherForm.value.p_phone
		}

		const resultSchedule = await this.Administrative.postTeacherExternal(body).toPromise();
		this.getTypeTeachers();
		this.toggleUsersModal();
	}

	changeTypeTeacher(event: any) {
		if (this.newAssignment.typeTeacherID == 1) {
			this.getTypeTeachers();
		} else {
			//this.getTeachersUnacem();
			this.getTypeTeachers();
		}
	}
}

