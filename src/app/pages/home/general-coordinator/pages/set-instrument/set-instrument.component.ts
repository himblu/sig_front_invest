import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { catchError, forkJoin, lastValueFrom, map, Subscription } from 'rxjs';
import { ApiService } from '@services/api.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
	FormArray,
	FormBuilder,
	FormControl,
	FormGroup,
	FormsModule,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule, MatOptionSelectionChange, MatRippleModule } from '@angular/material/core';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { CommonModule, JsonPipe, NgForOf, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import {
	Campus, EvaluatorAdministratorForm, EvaluatorAdministratorFormValue,
	EvaluatorCoordinatorForm,
	EvaluatorCoordinatorFormValue,
	EvaluatorTeacherForm,
	EvaluatorTeacherFormValue,
	Module,
	Period,
	SetInstrumentForm,
	SetInstrumentFormValue,
	TeacherForm,
	TeacherFormValue
} from '@utils/interfaces/period.interfaces';
import {
	CycleDetail,
	EvaluationInstrumentsReport,
	InstrumentSubject, InstrumentTeacher, InstrumentTeacherByPeriod,
	School,
	SPGetCareer,
	SPGetModality,
	StudyPlan, WorkingDay
} from '@utils/interfaces/campus.interfaces';
import { HttpErrorResponse } from '@angular/common/http';
import { AdministrativeService } from '@services/administrative.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule, MatSelectionListChange } from '@angular/material/list';
import {
	AdministrativeStaff, CoordinatorList, EVALUATION_COMPONENT, ACTIVITY_CODES,
	EvaluationInstrument,
	InstrumentEvaluationActivity,
	InstrumentEvaluationComponent,
	InstrumentEvaluationType
} from '@utils/interfaces/others.interfaces';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTreeModule } from '@angular/material/tree';
import { MatMenuModule } from '@angular/material/menu';
import { SelectedEvaluatorPipe } from '../instruments/services/pipes/selected-evaluator.pipe';
import { FilterEvaluatorTeacherPipe } from '../instruments/services/pipes/filter-evaluator-teacher.pipe';
import { SelectedEvaluatorCoordinatorPipe } from '../instruments/services/pipes/selected-evaluator-coordinator.pipe';
import {
	SelectedEvaluatorAdministratorPipe
} from '../instruments/services/pipes/selected-evaluator-administrator.pipe';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationComponent } from '../../../academic-management/components/confirmation/confirmation.component';
import Swal from 'sweetalert2';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import { PipesModule } from 'app/pipes/pipes.module';

interface FilterDependent {
	name: keyof SetInstrumentForm;
	dependents: (keyof SetInstrumentForm)[];
}

const FILTER_DEPENDENTS: FilterDependent[] = [
	{ name: 'campus', dependents: ['period', 'school', 'career', 'studyPlan', 'modality', 'module', 'workingDay', 'cycle', 'coordinators', 'parallel',] },
	{ name: 'period', dependents: ['school', 'career', 'studyPlan', 'modality', 'module', 'workingDay', 'cycle', 'evaluationInstrument', 'coordinators', 'parallel'] },
	{ name: 'school', dependents: ['career', 'studyPlan', 'modality', 'module', 'workingDay', 'cycle', 'coordinators', 'parallel',]},
	{ name: 'career', dependents: ['studyPlan', 'modality', 'module', 'workingDay', 'cycle', 'coordinators', 'evaluators', 'parallel',]},
	{ name: 'studyPlan', dependents: ['modality', 'module', 'workingDay', 'cycle', 'parallel',]},
	{ name: 'modality', dependents: ['module', 'workingDay', 'cycle', 'parallel',]},
	{ name: 'module', dependents: ['cycle',]},
	{ name: 'workingDay', dependents: ['cycle',]},
	{ name: 'component', dependents: ['evaluationInstrument',]},
];

@Component({
  selector: 'app-set-instrument',
  standalone: true,
	imports: [
		CommonModule,
		MatDialogModule,
		MatSnackBarModule,
		FormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatOptionModule,
		MatSelectModule,
		NgForOf,
		NgIf,
		NgxMaskDirective,
		ReactiveFormsModule,
		MatButtonModule,
		MatIconModule,
		MatListModule,
		NgSwitchCase,
		NgSwitch,
		NgSwitchDefault,
		MatTreeModule,
		MatMenuModule,
		MatRippleModule,
		JsonPipe,
		SelectedEvaluatorPipe,
		FilterEvaluatorTeacherPipe,
		SelectedEvaluatorCoordinatorPipe,
		SelectedEvaluatorAdministratorPipe,
		ModalModule,
		PipesModule
	],
	providers: [
		provideNgxMask(),
	],
  templateUrl: './set-instrument.component.html',
  styleUrls: ['./set-instrument.component.css']
})

export class SetInstrumentComponent extends OnDestroyMixin implements OnDestroy, OnInit {
	// public form: FormGroup<SetInstrumentForm>;
	public coordinators: CoordinatorList[] = [];
	public administrationStaff: AdministrativeStaff[] = [];
	public components: InstrumentEvaluationComponent[] = [];
	public campuses: Campus[] = []; // Sucursal
	public periods: Period[] = []; // Periodo Académico
	public evaluationInstruments: EvaluationInstrument[] = []; // Instrumentos de evaluación
	public schools: School[] = []; // Escuela
	public studyPlans: StudyPlan[] = []; // Malla Académica
	public careers: SPGetCareer[] = []; // Carrera
	public modalities: SPGetModality[] = []; // Modalidad
	public modules: Module[] = []; // Módulo
	public workingDays: WorkingDay[] = []; // Jornada
	public cycles: CycleDetail[] = []; // Nivel
	public teachersBySubject: InstrumentTeacher[] = []; // Maestros por Asignatura
	public allTeachersByCareer: any[] = []; // Maestros por Carrera
	public teachersByCareer: any[] = []; // Maestros por Carrera
	public evaluatorsByCareer: any[] = []; // Maestros por Carrera
	public teachersByPeriod: InstrumentTeacherByPeriod[] = []; // Maestros por periodo
	public parallels: any[] = [];
	public selectedModality: SPGetModality;
	public subjects: any[] = []; // Asignaturas
	public evaluationInstrumentsReport: EvaluationInstrumentsReport[] = [];
	public instrumentEvaluationTypes: InstrumentEvaluationType[] = [];
	public instrumentEvaluationActivities: InstrumentEvaluationActivity[] = [];
	public allInstrumentEvaluationComponents: any[] = [];
	public instrumentEvaluationComponents: any[] = [];
	public isActivitiesActive: number= 0;
	public isComponentsActive: number= 0;
	private getEvaluationInstrumentsSubscription: Subscription;
	private getCareersSubscription: Subscription;
	private getPeriodsSubscription: Subscription;
	private getStudyPlansSubscription: Subscription;
	private getModalitiesSubscription: Subscription;
	private getEvaluatorTeachersSubscription: Subscription;
	private getCoordinatorsSubscription: Subscription;
	private getModuleOrWorkingDaysSubscription: Subscription;
	private getCyclesSubscription: Subscription;
	private getSchoolsSubscription: Subscription;
	private getSubjectsSubscription: Subscription;
	private getTeachersSubscription: Subscription;
	private getDataByPeriodSubscription: Subscription;
	private getDataByCareerSubscription: Subscription;
	private getParallelsSubscription: Subscription;
	private sendFormSubscription: Subscription;
	private messageContainerTimeout: any;
	protected readonly EVALUATION_COMPONENT = EVALUATION_COMPONENT;
	protected readonly ACTIVITIES = ACTIVITY_CODES;
	@ViewChild('messageContainer', { static: true }) public messageContainer: ElementRef<HTMLParagraphElement>;

	private api: ApiService = inject(ApiService);
	private adminApi: AdministrativeService = inject(AdministrativeService);
	private snackBar: MatSnackBar = inject(MatSnackBar);
	private formBuilder: FormBuilder = inject(FormBuilder);
	private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private dialog: MatDialog = inject(MatDialog);
	private router: Router = inject(Router);

	newConfig: any = {
		evaluators: [],
		evaluatorTeachers: [],
		evaluatorCoordinators: [],
		evaluatorAdministrators: []
	};

	categoryEvaluationInstruments: any[] = [];

	subjectSelecteds: any[] = [];

	projects: any[] = [];
	projectSelected: any = {};

	subjectSelected: any = {};
	teacherSelected: any = {};
	administratives: any[] = [];
	managementBoss: any[] = [];
	teacherToAssignEvaluator: any = {
		evaluators: []
	};

	newGroup: any = {
		teachers: [],
		evaluateds: []
	};

	@ViewChild('evaluatorModal', {static: false}) evaluatorModal: ModalDirective;

	constructor(
		private Administrative: AdministrativeService
	) {
		super();
		this.getDataFromResolver();
		this.initForm();
	}

	ngOnInit() {
		this.getCategoryEvaluationInstruments();
		this.getManagementBoss();
		this.newConfig = {
			attempts: undefined,
			evaluators: [],
			evaluatorTeachers: [],
			evaluatorCoordinators: [],
			evaluatorAdministrators: []
		};
	}

	async getManagementBoss() {
		let result: any = await this.Administrative.getManagementBoss().toPromise();
		this.managementBoss = result;
		//console.log(result);
		this.managementBoss.sort((a: any, b: any) => a.teacher.localeCompare(b.teacher));
	}

	async getCategoryEvaluationInstruments() {
		let result: any = await this.Administrative.getCategoryEvaluationInstruments().toPromise();
		this.categoryEvaluationInstruments = result;
		//console.log(this.categoryEvaluationInstruments);
	}

	private initForm(): void {
		// this.form = this.formBuilder.group<SetInstrumentForm>({
		// 	campus: this.formBuilder.control('', [Validators.required]),
		// 	evaluationInstrument: this.formBuilder.control('', [Validators.required]),
		// 	school: this.formBuilder.control('', [Validators.required]),
		// 	period: this.formBuilder.control('', [Validators.required]),
		// 	studyPlan: this.formBuilder.control('', [Validators.required]),
		// 	career: this.formBuilder.control('', [Validators.required]),
		// 	modality: this.formBuilder.control('', [Validators.required]),
		// 	module: this.formBuilder.control('', [Validators.required]),
		// 	workingDay: this.formBuilder.control(''),
		// 	cycle: this.formBuilder.control('', [Validators.required]),
		// 	parallel: this.formBuilder.control(''),
		// 	subject: this.formBuilder.control('', [Validators.required]),
		// 	coordinators: this.formBuilder.control([]),
		// 	// personType: this.formBuilder.control('', [Validators.required]),
		// 	// students: this.formBuilder.control([]),
		// 	evaluators: this.formBuilder.control([]),
		// 	teachersBySubject: this.formBuilder.control([]), // Sirve para autoevaluación y heteroevaluación
		// 	evaluatorTeachers: this.formBuilder.array<FormGroup<EvaluatorTeacherForm>>([]),
		// 	evaluatorCoordinators: this.formBuilder.array<FormGroup<EvaluatorCoordinatorForm>>([]),
		// 	evaluatorAdministrators: this.formBuilder.array<FormGroup<EvaluatorAdministratorForm>>([]),
		// 	component: this.formBuilder.control(''),
		// 	// teachers: this.formBuilder.array<FormGroup<LinkTeacherForm>>([]),
		// 	attempts: this.formBuilder.control('', [Validators.min(1), Validators.max(3), Validators.required]),
		// 	evaluationOrFollowup: this.formBuilder.control('', [Validators.required]),
		// 	typeEvaluationInstrumentID: this.formBuilder.control(0, [Validators.required]),
		// 	activityID: this.formBuilder.control(0, [Validators.required]),
		// });
	}

	private addTeacherToEvaluatorTeachers(teacher: any) {
		let itemFound: any = this.newConfig.evaluators.find((item: any) => item.id === teacher.teacherID);
		if (!itemFound) {
			this.newConfig.evaluators.push(
				{
					name: teacher.teacher,
					id: teacher.teacherID,
					personId: teacher.personID,
					teachersToBeEvaluated: []
				}
			);
		}
	}

	private addCoordinatorToEvaluatorCoordinators(coordinator: any) {
		let itemFound: any = this.newConfig.evaluatorCoordinators.find((item: any) => item.personId === coordinator.personID);
		if (!itemFound) {
			this.newConfig.evaluatorCoordinators.push(
				{
					id: coordinator.teacherID,
					name: coordinator.coordinator,
					personId: coordinator.personID,
					teachersToBeEvaluated: []
				}
			);
		}
	}

	private getDataFromResolver(): void {
		this.activatedRoute.data
			.pipe(
				untilComponentDestroyed(this),
				map((value: any) => value['resolver']))
			.subscribe({
				next: (value: { campuses: Campus[],
					// administrativeStaff: AdministrativeStaff[],
					components: InstrumentEvaluationComponent[],
					instrumentEvaluationTypes: InstrumentEvaluationType[],
					instrumentEvaluationActivities: InstrumentEvaluationActivity[],
					instrumentEvaluationComponents: InstrumentEvaluationComponent[]
				}) => {
					//console.warn(value);
					this.campuses = value.campuses;
					// this.administrationStaff = value.administrativeStaff;
					this.components = value.components;
					this.instrumentEvaluationTypes = value.instrumentEvaluationTypes;
					this.instrumentEvaluationActivities = value.instrumentEvaluationActivities;
					this.allInstrumentEvaluationComponents = value.instrumentEvaluationComponents;
				},
			});
	}

	async getPeriodsByCampus() {
		this.getPeriodsSubscription = this.adminApi.getPeriodsByCampus(this.newConfig.campus)
		.subscribe({
			next: (value: Period[]) => {
				this.periods = this.schools = this.studyPlans = this.careers = this.modalities = this.modules = this.workingDays = this.cycles = [];
				this.periods = value;
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	// Al cambiar de periodo, traer las escuelas
	public getSchoolsByPeriod(event: MatSelectChange, control: keyof SetInstrumentForm): void {
		if (this.getSchoolsSubscription) {
			this.getSchoolsSubscription.unsubscribe();
		}
		this.getSchoolsSubscription = this.adminApi.getSchoolsByPeriod(event.value)
			.subscribe({
				next: (value: School[]) => {
					this.schools = this.studyPlans = this.careers = this.modalities = this.modules = this.workingDays = [];
					this.schools = value;
				},
				error: (err: HttpErrorResponse) => {
				}
			});
	}

	// Al cambiar de periodo, traer y filtrar los docentes evaluadores
	public getTeachersByPeriod(event: MatSelectChange, control: keyof SetInstrumentForm): void {
		if (this.getEvaluatorTeachersSubscription) this.getEvaluatorTeachersSubscription.unsubscribe();
		this.getEvaluatorTeachersSubscription = this.adminApi.getTeachersByPeriod(event.value)
			.subscribe({
				next: (value: InstrumentTeacherByPeriod[]) => {
					this.schools = this.studyPlans = this.careers = this.modalities = this.modules = this.workingDays = [];
					this.teachersByPeriod = value;
				},
				error: (err: HttpErrorResponse) => {
					this.teachersByPeriod = [];
				}
			});
	}

	// Al cambiar de periodo, traer los instrumentos configurados
	async  getEvaluationInstrumentsByPeriodAndComponent() {
		if (this.newConfig.period && this.newConfig.component) {
			let result: any = await this.api.getEvaluationInstrumentsByPeriodAndComponent(this.newConfig.period, this.newConfig.component, this.newConfig.activity).toPromise();
			this.evaluationInstruments = result;
		}
		if (!this.newConfig.component && !this.newConfig.period) {
			this.newConfig.evaluatorCoordinators = [];
			this.newConfig.evaluatorTeachers = [];
		}
	}

	async getDataByPeriod() {
		let resultJoin: any = await forkJoin({
			schools: this.adminApi.getSchoolsByPeriod(this.newConfig.period).pipe(catchError(() => [])),
			teachers: this.adminApi.getTeachersByPeriod(this.newConfig.period).pipe(catchError(() => [])),
			instruments: this.api.getEvaluationInstrumentsByPeriodAndComponent(this.newConfig.period, this.newConfig.component || 0, this.newConfig.activity || 0).pipe(catchError(() => []))
		}).toPromise();
		//console.log(resultJoin);
		this.schools = resultJoin.schools;
		this.teachersByPeriod = resultJoin.teachers;
		this.evaluationInstruments = resultJoin.instruments;
	}

// Al cambiar de escuela, traer las mallas
	async getCareersBySchool() {

		this.getStudyPlansSubscription = this.adminApi.getCareersBySchool(this.newConfig.period, this.newConfig.school)
			.subscribe({
				next: (value: SPGetCareer[]) => {
					this.studyPlans = this.careers = this.modalities = this.modules = this.workingDays = this.cycles = [];
					this.careers = value;
					this.newConfig.career = undefined;
					this.newConfig.studyPlan = undefined;
					this.newConfig.modality = undefined;
					this.newConfig.evaluationInstrument = undefined;
					this.newConfig.module = undefined;
					this.newConfig.cycle = undefined;
					this.newConfig.attempts = undefined;
				},
				error: (err: HttpErrorResponse) => {
				}
			});
	}

	async selectEvaluationInstrument() {
		this.newConfig.module = undefined;
		this.newConfig.cycle = undefined;
		this.newConfig.attempts = undefined;
	}

	// Al cambiar de carrera, traer las modalidades
	public getCoordinatorsByCareer(event: MatSelectChange, control: keyof SetInstrumentForm): void {
		if (this.getCoordinatorsSubscription) this.getCoordinatorsSubscription.unsubscribe();
		this.getCoordinatorsSubscription = this.adminApi.getCoordinatorsByCareer(event.value)
			.subscribe({
				next: (value: CoordinatorList[]) => {

				},
				error: (err: HttpErrorResponse) => {
				}
			});
	}

	async getDataByCareer() {
		if (this.getDataByCareerSubscription) this.getDataByCareerSubscription.unsubscribe();
		let administrativeStaff: any = await this.Administrative.getAdministrativeStaffByActivityAndCareer(this.newConfig.activity || 0, this.newConfig.career).toPromise();
		//console.log(administrativeStaff);
		this.administratives = administrativeStaff;
		this.getDataByCareerSubscription = forkJoin({
			coordinators: this.adminApi.getCoordinatorsByCareer(this.newConfig.career).pipe(catchError(() => [])),
			studyPlans: this.adminApi.getStudyPlansByCareer(this.newConfig.career).pipe(catchError(() => [])),
			modalities: this.adminApi.getModalitiesByCareer(this.newConfig.career).pipe(catchError(() => [])),
			teachersByCareer: this.adminApi.getTeachersByPeriodSchoolAndCareer(this.newConfig.period, this.newConfig.school, this.newConfig.career).pipe(catchError(() => []))
		}).subscribe({
			next: async ({ coordinators, studyPlans, modalities, teachersByCareer }) => {
				//console.log(this.newConfig);
				this.coordinators = coordinators;
				this.studyPlans = studyPlans;
				this.modalities = modalities;
				//console.log("teachersByCareer");
				//console.log(JSON.parse(JSON.stringify(teachersByCareer)));
				//console.log("teachersByCareer");
				this.allTeachersByCareer = teachersByCareer;
				switch (true) {
					case this.newConfig.activity === ACTIVITY_CODES.ACADEMIC_DIRECTION_OR_MANAGEMENT && (this.newConfig.component === EVALUATION_COMPONENT.SELF_EVALUATION || this.newConfig.component === EVALUATION_COMPONENT.COEVALUATION_TWO_MANAGEMENT):
						let resultTeachersWithManagement: any = await this.Administrative.getTeacherWithManagementByPeriodSchoolAndCareer(this.newConfig.period, this.newConfig.school, this.newConfig.career).toPromise();
						console.log(resultTeachersWithManagement);
						teachersByCareer = resultTeachersWithManagement;
						break;
					default:
						break;
				}
				//console.log(this.newConfig);
				let result: any[] = [];
				let prefix = (t: any) => `${t.teacherID}-${t.courseID}-${t.parallelCode}`;
				if (this.newConfig.evaluationOrFollowup === 0 || (this.newConfig.activity === ACTIVITY_CODES.TEACHING && this.newConfig.component === EVALUATION_COMPONENT.SELF_EVALUATION)) {
					this.allTeachersByCareer.map((t: any) => {
						if (!result.map((r:any) => prefix(r)).includes(prefix(t))) {
							result.push(t);
						}
					});
					//console.log('AQUI ENTRO');
					this.allTeachersByCareer = result;
				} else {
					//console.log('entro aqui para autoevaluación')
					teachersByCareer.map((t: any) => {
						if (!result.map((x: any) => x.teacherID).includes(t.teacherID)) {
							result.push({
								teacherID: t.teacherID,
								teacher: t.teacher,
								personID: t.personID
							});
						}
					});
					this.allTeachersByCareer = result;
				}

				this.allTeachersByCareer.sort((a: any, b: any) => a.teacher.localeCompare(b.teacher));
				//console.log(this.allTeachersByCareer);
				this.newConfig.studyPlan = undefined;
				this.newConfig.modality = undefined;
				this.newConfig.evaluationInstrument = undefined;
				this.newConfig.module = undefined;
				this.newConfig.cycle = undefined;
				this.newConfig.attempts = undefined;
			},
			error: (err: HttpErrorResponse) => {
				console.error(err);
			},
			complete: () => {
				// this.modules = this.workingDays = this.cycles = this.teachersByCareer = this.teachersBySubject = [];
				// this.form.controls.evaluatorTeachers.clear();
			}
		});
	}

	// Al seleccionar una carrera, se traen las mallas de esa carrera -->
	// Al seleccionar una carrera, se traen las modalidades -> Carrera -->
	public getStudyPlansByCareer(event: MatSelectChange, control: keyof SetInstrumentForm): void {
		if (this.getStudyPlansSubscription) {
			this.getStudyPlansSubscription.unsubscribe();
		}
		this.getStudyPlansSubscription = this.adminApi.getStudyPlansByCareer(event.value)
			.subscribe({
				next: (value: StudyPlan[]) => {
					// La lista vacía en modalidades la asignaremos en el getModalities.
					// Se ejecutan dos peticiones asíncronas y puede causar problemas en la asignación de la lista vacía.
					this.modules = this.workingDays = this.cycles = [];
					this.studyPlans = value;
				},
				error: (err: HttpErrorResponse) => {
				}
			});
	}

	// Al cambiar de carrera, traer las modalidades
	public getModalitiesByCareer(event: MatSelectChange, control: keyof SetInstrumentForm): void {
		if (this.getModalitiesSubscription) this.getModalitiesSubscription.unsubscribe();
		this.getModalitiesSubscription = this.adminApi.getModalitiesByCareer(event.value)
			.subscribe({
				next: (value: SPGetModality[]) => {
					this.modalities = this.modules = this.workingDays = this.cycles = [];
					this.modalities = value;
				},
				error: (err: HttpErrorResponse) => {
				}
			});
	}

	// Al cambiar de malla y plan de estudios, traer los ciclos
	async getCyclesByCareerAndStudyPlan() {

		if (this.getCyclesSubscription) this.getCyclesSubscription.unsubscribe();

		this.getCyclesSubscription = this.adminApi.getCyclesByCareerAndStudyPlan(this.newConfig.studyPlan, this.newConfig.career)
			.subscribe({
				next: (value: CycleDetail[]) => {
					// this.modalities = this.modules = this.workingDays = this.cycles = [];
					this.cycles = value;
				},
				error: (err: HttpErrorResponse) => {
				}
			});
	}


	// Al cambiar de ciclo, traer las asignaturas
	async getSubjectsByPeriodSchoolCareerStudyPlanAndSection() {
		//console.warn('cycle', this.newConfig.cycle);
		this.newConfig.attempts = undefined;
		if (this.getSubjectsSubscription) this.getSubjectsSubscription.unsubscribe();

		this.getSubjectsSubscription = this.adminApi.getSubjectsByPeriodCareerStudyPlanAndSection(
			this.newConfig.period,
			this.newConfig.career,
			this.newConfig.studyPlan,
			this.newConfig.cycle
		).subscribe({
			next: (value: InstrumentSubject[]) => {
				this.subjects = value;
				//console.log(this.subjects);
				if (!value.length) {
					this.showMessage('No se encontraron asignaturas para la configuración seleccionada.');
					return;
				}
				this.hideMessage();
			},
			error: (err: HttpErrorResponse) => {
			}
		});

		if (EVALUATION_COMPONENT.STUDENT_EVALUATION) {
			// this.form.controls.parallel.addValidators([Validators.required]);
			if (this.getParallelsSubscription) this.getParallelsSubscription.unsubscribe();
			// const formValue: SetInstrumentFormValue = this.form.value as SetInstrumentFormValue;
			this.getParallelsSubscription = this.api.getParallelsByPeriodStudyPlanCycleModalityAndCareer(
				this.newConfig.period,
				this.newConfig.studyPlan,
				this.newConfig.cycle,
				this.newConfig.modality,
				this.newConfig.career
			).subscribe({
				next: (value: string[]) => {
					this.parallels = value;
				}
			});
		} else {
			this.newConfig.parallel = undefined;
			// this.form.controls.parallel.clearValidators();
			// this.form.controls.parallel.patchValue('');
			// this.form.controls.parallel.updateValueAndValidity();
			this.parallels = [];
		}
	}

	// Al cambiar de modalidad, traer los módulos o jornadas.
	async getModulesOrWorkingDaysByModality() {
		const selectedModality: SPGetModality = this.modalities.find((modality) => modality.modalityID === this.newConfig.modality);
		if (this.newConfig.activity === ACTIVITY_CODES.ENGAGEMENT) {
			this.newConfig.projectSearcheds = false;
			let resultProjects: any = await this.Administrative.getSettingEvaluationLinkageProjects(this.newConfig.period, this.newConfig.school, this.newConfig.career, this.newConfig.studyPlan).toPromise();
			this.projects = [];
			resultProjects.map((p: any) => {
				if (!this.projects.map((x: any) => x.projectPracInformativeID).includes(p.projectPracInformativeID)) {
					this.projects.push({
						projectPracInformativeID: p.projectPracInformativeID,
						nameProyect: p.nameProyect,
						teachers: resultProjects.filter((r: any) => r.projectPracInformativeID === p.projectPracInformativeID)
					});
				}
			});
			console.log(this.allTeachersByCareer);
			switch (true) {
				case this.newConfig.activity === ACTIVITY_CODES.ENGAGEMENT && (this.newConfig.component === EVALUATION_COMPONENT.SELF_EVALUATION || this.newConfig.component === EVALUATION_COMPONENT.COEVALUATION_ADMIN):
					this.allTeachersByCareer.map((t: any) => {
						t.projects = resultProjects.filter((r: any) => t.personID === r.personID && t.teacherID === r.teacherID);
					});
					this.allTeachersByCareer = this.allTeachersByCareer.filter((a: any) => a.projects.length);
					break;
				default:
					break;
			}
			this.newConfig.projectSearcheds = true;
		} else {
			this.projects = [];
		}

		if (selectedModality) {

			let validationResult: any = await this.Administrative.getSettingEvaluationConfigurateds(this.newConfig.period, this.newConfig.school, this.newConfig.career, this.newConfig.studyPlan, this.newConfig.modality, this.newConfig.cycle || 0).toPromise();
			console.log(validationResult);
			// La variable global se setea para mostrar u ocultar las listas de módulos y jornadas.
			this.selectedModality = selectedModality;
			if (this.getModuleOrWorkingDaysSubscription) {
				this.getModuleOrWorkingDaysSubscription.unsubscribe();
			}
			this.modules = this.workingDays = [];
			this.newConfig.module = undefined;
			this.newConfig.workingDay = undefined;
			// Si la modalidad es en línea, traer los módulos.
			if (selectedModality.workingORmodule === 'M') {
				// Marcar el control de módulo como requerido

				this.getModuleOrWorkingDaysSubscription = this.adminApi.getModulesByModality(this.newConfig.modality)
					.subscribe({
						next: (value: Module[]) => {
							this.modules = value;
						}
					});
			} else {
				// Marcar la jornada como requerida

				// Quitar las validaciones del módulo
				// const moduleFormControl: FormControl = this.form.get('module') as FormControl;
				// moduleFormControl.clearValidators();
				// moduleFormControl.updateValueAndValidity();


			}
		}
	}

	private setSectionState(state: 'enable' | 'disable'): void {
		// this.form.controls.section.patchValue(null);
		// if (state === 'enable') {
		// 	this.form.controls.section.enable();
		// 	return;
		// }
		// this.form.controls.section.disable();
	}

	public override ngOnDestroy(): void {
		if (this.getEvaluationInstrumentsSubscription) this.getEvaluationInstrumentsSubscription.unsubscribe();
		if (this.getCareersSubscription) this.getCareersSubscription.unsubscribe();
		if (this.getPeriodsSubscription) this.getPeriodsSubscription.unsubscribe();
		if (this.getStudyPlansSubscription) this.getStudyPlansSubscription.unsubscribe();
		if (this.getModalitiesSubscription) this.getModalitiesSubscription.unsubscribe();
		if (this.getEvaluatorTeachersSubscription) this.getEvaluatorTeachersSubscription.unsubscribe();
		if (this.getCoordinatorsSubscription) this.getCoordinatorsSubscription.unsubscribe();
		if (this.getModuleOrWorkingDaysSubscription) this.getModuleOrWorkingDaysSubscription.unsubscribe();
		if (this.getCyclesSubscription) this.getCyclesSubscription.unsubscribe();
		if (this.getSchoolsSubscription) this.getSchoolsSubscription.unsubscribe();
		if (this.getSubjectsSubscription) this.getSubjectsSubscription.unsubscribe();
		if (this.getTeachersSubscription) this.getTeachersSubscription.unsubscribe();
		if (this.getDataByPeriodSubscription) this.getDataByPeriodSubscription.unsubscribe();
		if (this.getDataByCareerSubscription) this.getDataByCareerSubscription.unsubscribe();
		if (this.sendFormSubscription) this.sendFormSubscription.unsubscribe();
	}

	public getConfiguredInstruments(): void {
		if (this.getEvaluationInstrumentsSubscription) this.getEvaluationInstrumentsSubscription.unsubscribe();
		this.getEvaluationInstrumentsSubscription = this.api.getConfiguredInstruments().subscribe({
			next: (value: any) => {
			}
		});
	}

	public addTeacherToEvaluation(teacherBySubject: any, evaluatorTeacherFormValue: any): void {
		// Para saber dónde se va a insertar el form group
		const itemFound: number = this.newConfig.evaluatorTeachers.find((item: any) => item.id === evaluatorTeacherFormValue.id);
		// Verificar si existe ese maestro en el listado de evaluados (agrupado por maestro evaluador)
		const doesIsTeacherBySubjectAssociatedToSelectedEvaluatorTeacher: boolean = this.newConfig.evaluatorTeachers.some((evaluatorTeacher: any) => {
			return evaluatorTeacher.teachersToBeEvaluated.some((teacherToBeEvaluated: any) => {
				return teacherToBeEvaluated.id === teacherBySubject.teacherID;
			}) && evaluatorTeacher.id === evaluatorTeacherFormValue.id;
		});
		// Verificar si el maestro a evaluar no está en el listado de maestros a evaluar (para el maestro evaluador seleccionado)
		if (!doesIsTeacherBySubjectAssociatedToSelectedEvaluatorTeacher && itemFound) {
			this.newConfig.evaluatorTeachers.at(this.newConfig.evaluatorTeachers.indexOf(itemFound)).teachersToBeEvaluated.push(
				{
					name: teacherBySubject.teacher,
					personId: teacherBySubject.personID,
					id: teacherBySubject.teacherID
				}
			);
		}
	}

	public addCoordinatorToEvaluation(coordinator: any, evaluatorAdministratorFormValue: any): void {
		// Verificar si existe ese maestro en el listado de evaluados (agrupado por maestro evaluador)
		let itemFound: any = this.newConfig.evaluatorAdministrators.find((item: any) => item.personId === evaluatorAdministratorFormValue.personId);
		const doesIsCoordinatorAssociatedToSelectedEvaluatorAdministrator: boolean = this.newConfig.evaluatorAdministrators.some((evaluatorAdministrator: any) => {
			return evaluatorAdministrator.coordinatorsToBeEvaluated.some((coordinatorToBeEvaluated: any) => {
				return coordinatorToBeEvaluated.id === coordinator.teacherID;
			}) && evaluatorAdministrator.personId === evaluatorAdministratorFormValue.personId;
		});
		// Verificar si el maestro a evaluar no está en el listado de maestros a evaluar (para el maestro evaluador seleccionado)
		if (!doesIsCoordinatorAssociatedToSelectedEvaluatorAdministrator && itemFound) {
			this.newConfig.evaluatorAdministrators.at(this.newConfig.evaluatorAdministrators.indexOf(itemFound)).coordinatorsToBeEvaluated.push(
				{
					name: coordinator.coordinator,
					personId: coordinator.personID,
					id: coordinator.teacherID
				}
			);
		}
	}

	public addTeacherToCoordinatorEvaluation(teacherBySubject: any, evaluatorCoordinatorFormValue: any): void {
		let itemFound: any = this.newConfig.evaluatorCoordinators.find((item: any) => item.personId === evaluatorCoordinatorFormValue.personId);
		// Verificar si existe ese maestro en el listado de evaluados (agrupado por maestro evaluador)
		const doesIsTeacherBySubjectAssociatedToSelectedEvaluatorTeacher: boolean = this.newConfig.evaluatorCoordinators.some((evaluatorCoordinator: any) => {
			return evaluatorCoordinator.teachersToBeEvaluated.some((teacherToBeEvaluated: any) => {
				return teacherToBeEvaluated.id === teacherBySubject.teacherID;
			}) && evaluatorCoordinator.personId === evaluatorCoordinatorFormValue.personId;
		});
		// Verificar si el maestro a evaluar no está en el listado de maestros a evaluar (para el coordinador evaluador seleccionado)
		if (!doesIsTeacherBySubjectAssociatedToSelectedEvaluatorTeacher && itemFound) {
			this.newConfig.evaluatorCoordinators.at(this.newConfig.evaluatorCoordinators.indexOf(itemFound)).teachersToBeEvaluated.push(
				{
					name: teacherBySubject.teacher,
					personId: teacherBySubject.personID,
					id: teacherBySubject.teacherID
				}
			);
		}
	}

	public showMessage(message: string): void {
		this.messageContainer.nativeElement.classList.add('d-block');
		this.messageContainer.nativeElement.innerHTML =
		`
			<span>${message}</span>
			<button style="cursor: pointer;" type="button" class="close" data-dismiss="alert" aria-label="Close">
				<span aria-hidden="true">&times;</span>
			</button>
		`;
		this.messageContainer.nativeElement.classList.add(...['fade', 'show']);
		clearTimeout(this.messageContainerTimeout);
		this.messageContainerTimeout = setTimeout(() => {
			this.messageContainer.nativeElement.classList.remove(...['d-block', 'fade']);
		}, 10 * 1000);
	}

	public hideMessage(): void {
		this.messageContainer.nativeElement.classList.remove(...['d-block', 'fade']);
	}

	public removeEvaluatedTeacher(evaluatorTeacherIndex: number, evaluatedTeacherIndex: number): void {
		this.newConfig.evaluatorTeachers.at(evaluatorTeacherIndex).teachersToBeEvaluated.removeAt(evaluatedTeacherIndex);
	}

	public removeEvaluatedTeacherFromEvaluatorCoordinator(evaluatorCoordinatorIndex: number, evaluatedTeacherIndex: number): void {
		this.newConfig.evaluatorTeachers.at(evaluatorCoordinatorIndex).teachersToBeEvaluated.removeAt(evaluatedTeacherIndex);
	}

	public removeEvaluatedCoordinatorFromEvaluatorAdministrator(evaluatorAdministratorIndex: number, evaluatedCoordinatorIndex: number): void {
		this.newConfig.evaluatorAdministrators.at(evaluatorAdministratorIndex).coordinatorsToBeEvaluated.removeAt(evaluatedCoordinatorIndex);
	}

	public removeTeacherFromEvaluatorTeachers(evaluatorTeacherIndex: number): void {
		let evaluatorTeacher: any = this.newConfig.evaluatorTeachers[evaluatorTeacherIndex];
		if (evaluatorTeacher) {

			const evaluatorTeacherFound: any = this.teachersByPeriod.find((item) => item.teacherID === evaluatorTeacher.id);
			if (evaluatorTeacherFound) {
				this.teachersByPeriod[this.teachersByPeriod.indexOf(evaluatorTeacherFound)].disabled = false;
				this.newConfig.evaluatorTeachers.removeAt(evaluatorTeacherIndex);
				const selectedEvaluatorTeachers: number[] = this.teachersByPeriod.filter((item) => item.disabled === true).map((item) => item.teacherID);

				// this.form.controls.evaluators.patchValue(selectedEvaluatorTeachers);
			}
		}
	}

	public sendForm(): void {
		const config: MatDialogConfig = new MatDialogConfig();
		config.autoFocus = false;
		config.minWidth = '200px';
		config.maxWidth = '600px';
		config.panelClass = 'transparent-panel';
		config.data = {
			message: '¿Estás seguro de crear esta configuración?'
		}
		this.dialog.open(ConfirmationComponent, config).afterClosed().subscribe({
			next: (confirmation: boolean) => {
				if (confirmation) {
					let typePerson: number = 2;
					switch (this.newConfig.component) {
						case EVALUATION_COMPONENT.COEVALUATION_BETWEEN_TEACHERS:
						case EVALUATION_COMPONENT.COEVALUATION_TWO_MANAGEMENT:
							typePerson = 2;
							break;
						case EVALUATION_COMPONENT.COEVALUATION_ADMIN:
						case EVALUATION_COMPONENT.HETEROEVALUATION_TO_MANAGEMENT_BOSS:
							typePerson = 3;
							break;
						case this.newConfig.component === EVALUATION_COMPONENT.STUDENT_EVALUATION:
						case this.newConfig.component === EVALUATION_COMPONENT.SELF_EVALUATION:
							typePerson = this.newConfig.component === EVALUATION_COMPONENT.SELF_EVALUATION ? 2 : 1;
							break;
						default:
							break;
					}
					console.log(this.newConfig);
					let body: any = [];
					switch (this.newConfig.component) {
						case EVALUATION_COMPONENT.COEVALUATION_ADMIN:
							body = [];
							switch (this.newConfig.activity) {
								case ACTIVITY_CODES.ACADEMIC_DIRECTION_OR_MANAGEMENT:
									this.allTeachersByCareer = this.allTeachersByCareer.filter((t: any) => t.selected);
									break;
								default:
									this.allTeachersByCareer = this.allTeachersByCareer;
									break;
							}
							this.administratives.filter((a: any) => a.selected).map((a: any) => {
								this.allTeachersByCareer.map((t: any) => {
									body.push({
										teacherID: t.teacherID,
										// typePerson: 3,
										typePerson: typePerson,
										studyPlanID: this.newConfig.studyPlan,
										careerID: this.newConfig.career,
										courseID: 0,
										cycleID: 0,
										parallelCode: null,
										evaluationInstrumentsID: this.newConfig.evaluationInstrument,
										modalityID: this.newConfig.modality,
										periodID: this.newConfig.period,
										numberAttemps: this.newConfig.attempts,
										personID: a.personID,
										projectID: 0,
										schoolID: this.newConfig.school,
										categoryInstrumentID: this.newConfig.evaluationOrFollowup,
										activityID: this.newConfig.activity
									})
								});
							})
							break;
						case EVALUATION_COMPONENT.COEVALUATION_BETWEEN_TEACHERS:
						case EVALUATION_COMPONENT.COEVALUATION_TWO_MANAGEMENT:
							// Iterando Evaluados x Evaluadores
							body = [];
							this.newConfig.evaluators.map((g: any) => {
								g.teachers.map((t: any) => {
									g.evaluateds.map((e: any) => {
										body.push({
											teacherID: e.teacherID,
											// typePerson: 2,
											typePerson: typePerson,
											studyPlanID: this.newConfig.studyPlan,
											careerID: this.newConfig.career,
											courseID: 0,
											cycleID: 0,
											parallelCode: null,
											evaluationInstrumentsID: this.newConfig.evaluationInstrument,
											modalityID: this.newConfig.modality,
											periodID: this.newConfig.period,
											numberAttemps: this.newConfig.attempts,
											personID: t.personID,
											projectID: 0,
											schoolID: this.newConfig.school,
											categoryInstrumentID: this.newConfig.evaluationOrFollowup,
											activityID: this.newConfig.activity
										})
									})
								})
							})
							break;
						default:
							if (this.newConfig.evaluationOrFollowup === 0) {
								body = [];
								this.coordinators.map((c: any) => {
									this.allTeachersByCareer.map((t: any) => {
										body.push({
											teacherID: t.teacherID,
											typePerson: typePerson,
											studyPlanID: this.newConfig.studyPlan,
											careerID: this.newConfig.career,
											courseID: t.courseID,
											cycleID: this.newConfig.cycle,
											parallelCode: null,
											evaluationInstrumentsID: this.newConfig.evaluationInstrument,
											modalityID: this.newConfig.modality,
											periodID: this.newConfig.period,
											numberAttemps: this.newConfig.attempts,
											personID: c.personID,
											projectID: 0,
											schoolID: this.newConfig.school,
											categoryInstrumentID: this.newConfig.evaluationOrFollowup,
											activityID: this.newConfig.activity
										});
									});
								});
							} else {
								switch (this.newConfig.activity) {
									case ACTIVITY_CODES.ACADEMIC_DIRECTION_OR_MANAGEMENT:
										switch (this.newConfig.component) {
											case EVALUATION_COMPONENT.HETEROEVALUATION_TO_MANAGEMENT_BOSS:
												this.managementBoss.filter((m: any) => m.selected).map((m: any) => {
													this.allTeachersByCareer.filter((t: any) => t.selected).map((t: any) => {
														body.push({
															teacherID: t.teacherID,
															typePerson: typePerson,
															studyPlanID: this.newConfig.studyPlan,
															careerID: this.newConfig.career,
															courseID: this.subjectSelected.courseID || 0,
															cycleID: this.newConfig.cycle || 0,
															parallelCode: null,
															evaluationInstrumentsID: this.newConfig.evaluationInstrument,
															modalityID: this.newConfig.modality,
															periodID: this.newConfig.period,
															numberAttemps: this.newConfig.attempts,
															personID: m.personID,
															projectID: 0,
															schoolID: this.newConfig.school,
															categoryInstrumentID: this.newConfig.evaluationOrFollowup,
															activityID: this.newConfig.activity
														})
													})
												})
												break;
											case EVALUATION_COMPONENT.SELF_EVALUATION:
												this.allTeachersByCareer.filter((t: any) => t.selected).map((t: any) => {
													body.push({
														teacherID: t.teacherID,
														typePerson: typePerson,
														studyPlanID: this.newConfig.studyPlan,
														careerID: this.newConfig.career,
														courseID: 0,
														cycleID: this.newConfig.cycle || 0,
														parallelCode: null,
														evaluationInstrumentsID: this.newConfig.evaluationInstrument,
														modalityID: this.newConfig.modality,
														periodID: this.newConfig.period,
														numberAttemps: this.newConfig.attempts,
														personID: t.personID,
														projectID: 0,
														schoolID: this.newConfig.school,
														categoryInstrumentID: this.newConfig.evaluationOrFollowup,
														activityID: this.newConfig.activity
													})
												})
												break;
											default:
												break;
										}
										break;
									case ACTIVITY_CODES.TEACHING:
										if (EVALUATION_COMPONENT.SELF_EVALUATION) {
											this.allTeachersByCareer.map((t: any) => {
												body.push({
													teacherID: t.teacherID,
													typePerson: typePerson,
													studyPlanID: this.newConfig.studyPlan,
													careerID: this.newConfig.career,
													courseID: this.subjectSelected.courseID || (t.courseID || 0),
													cycleID: this.newConfig.cycle || 0,
													parallelCode: t.parallelCode || null,
													evaluationInstrumentsID: this.newConfig.evaluationInstrument,
													modalityID: this.newConfig.modality,
													periodID: this.newConfig.period,
													numberAttemps: this.newConfig.attempts,
													personID: t.personID,
													projectID: 0,
													schoolID: this.newConfig.school,
													categoryInstrumentID: this.newConfig.evaluationOrFollowup,
													activityID: this.newConfig.activity
												})
											})
										} else {
											body = this.teacherSelected.parallels.filter((p: any) => p.selected).map((p: any) => {
												return {
													teacherID: this.teacherSelected.teacherID,
													// typePerson: typePerson,
													typePerson: 1,
													studyPlanID: this.newConfig.studyPlan,
													careerID: this.newConfig.career,
													courseID: this.subjectSelected.courseID,
													cycleID: this.newConfig.cycle,
													parallelCode: p.parallelCode || null,
													evaluationInstrumentsID: this.newConfig.evaluationInstrument,
													modalityID: this.newConfig.modality,
													periodID: this.newConfig.period,
													numberAttemps: this.newConfig.attempts,
													personID: this.teacherSelected.personID,
													projectID: 0,
													schoolID: this.newConfig.school,
													categoryInstrumentID: this.newConfig.evaluationOrFollowup,
													activityID: this.newConfig.activity
												};
											});
										}
										break;
									case ACTIVITY_CODES.ENGAGEMENT:
										switch (true) {
											case this.newConfig.component === EVALUATION_COMPONENT.SELF_EVALUATION:
												this.allTeachersByCareer.map((t: any) => {
													t.projects.map((p: any) => {
														body.push({
															periodID: this.newConfig.period,
															typePerson: typePerson,
															evaluationInstrumentsID: this.newConfig.evaluationInstrument,
															teacherID: t.teacherID,
															modalityID: this.newConfig.modality,
															schoolID: this.newConfig.school,
															careerID: this.newConfig.career,
															studyPlanID: this.newConfig.studyPlan,
															courseID: 0,
															cycleID: this.newConfig.cycle || 0,
															parallelCode: t.parallelCode || null,
															personID: t.personID,
															numberAttemps: this.newConfig.attempts,
															projectID: p.projectPracInformativeID,
															categoryInstrumentID: this.newConfig.evaluationOrFollowup,
															activityID: this.newConfig.activity,
														});
													})
												});
												break;
											default:
												body = this.projectSelected.teachers.filter((t: any) => t.selected).map((t: any) => {
													return {
														periodID: this.newConfig.period,
														// typePerson: typePerson,
														typePerson: 1,
														evaluationInstrumentsID: this.newConfig.evaluationInstrument,
														teacherID: t.teacherID,
														modalityID: this.newConfig.modality,
														schoolID: this.newConfig.school,
														careerID: this.newConfig.career,
														studyPlanID: this.newConfig.studyPlan,
														courseID: 0,
														cycleID: this.newConfig.cycle || 0,
														parallelCode: t.parallelCode || null,
														personID: t.personID,
														numberAttemps: this.newConfig.attempts,
														projectID: this.projectSelected.projectPracInformativeID,
														categoryInstrumentID: this.newConfig.evaluationOrFollowup,
														activityID: this.newConfig.activity,
													}
												});
												break;
										}
										break;
									default:
										break;
								}
							}
							break;
					}
					this.sendFormSubscription = this.api.postInstrumentConfiguration(body).subscribe({
						next: (value: any) => {
							if (value) {
								config.data = {
									message: 'La configuración del instrumento fue guardada. ¿Quieres seguir configurando?'
								}
								this.dialog.open(ConfirmationComponent, config).afterClosed().subscribe({
									next: (createAnotherConfig: boolean) => {
										if (!createAnotherConfig) {
											this.ngOnInit();
										}
									}
								});
							}
						},
						error: (err: HttpErrorResponse) => {
							this.snackBar.open(
								`${err.error.message[0]}`,
								null,
								{
									horizontalPosition: 'center',
									verticalPosition: 'top',
									duration: 4000,
									panelClass: ['red-snackbar']
								}
							);
						},
						complete: () => {
						}
					});
				} else {
					// return false;
				}
			}
		});
	}

	public showComponentsActivities(): void {
		console.log(this.newConfig);
		let item: any = this.evaluationInstrumentsReport.find((t: any) => t.typeEvaluationInstrumentID === this.newConfig.typeEvaluationInstrumentID);
		//console.log(item);
		if(item){
			this.isActivitiesActive = item.flgActivity;
			this.isComponentsActive = item.flgComponent;
			this.newConfig.campus = undefined;
			this.newConfig.period = undefined;
			this.newConfig.school = undefined;
			this.newConfig.career = undefined;
			this.newConfig.studyPlan = undefined;
			this.newConfig.modality = undefined;
			this.newConfig.evaluationInstrument = undefined;
			this.newConfig.module = undefined;
			this.newConfig.cycle = undefined;
			this.newConfig.attempts = undefined;
		}
	}

	async selectActivity() {
		let componentsByActivity: any = await this.Administrative.getComponentByActivity(this.newConfig.activity).toPromise();
		//console.log(componentsByActivity);
		//console.log(this.allInstrumentEvaluationComponents);
		this.instrumentEvaluationComponents = this.allInstrumentEvaluationComponents.filter((a: any) => componentsByActivity.includes(a.componentID));

		// if (this.newConfig.activity === ACTIVITY_CODES.ACADEMIC_DIRECTION_OR_MANAGEMENT) {
		// 	this.instrumentEvaluationComponents = this.allInstrumentEvaluationComponents.filter((a: any) => a.componentID !== 3);
		// } else {
		// 	this.instrumentEvaluationComponents = this.allInstrumentEvaluationComponents;
		// }
		this.newConfig.component = undefined;
		this.newConfig.campus = undefined;
		this.newConfig.period = undefined;
		this.newConfig.school = undefined;
		this.newConfig.career = undefined;
		this.newConfig.studyPlan = undefined;
		this.newConfig.modality = undefined;
		this.newConfig.evaluationInstrument = undefined;
		this.newConfig.module = undefined;
		this.newConfig.cycle = undefined;
		this.newConfig.attempts = undefined;
	}

	public getEvaluationInstrumentsReport(): void{
		this.adminApi.getEvaluationInstrumentsReport(this.newConfig.evaluationOrFollowup).subscribe({
			next: (res) => {
				this.evaluationInstrumentsReport= res;
				this.newConfig.typeEvaluationInstrumentID = undefined;
				this.newConfig.activity = undefined;
				this.newConfig.component = undefined;
				this.newConfig.campus = undefined;
				this.newConfig.period = undefined;
				this.newConfig.school = undefined;
				this.newConfig.career = undefined;
				this.newConfig.studyPlan = undefined;
				this.newConfig.modality = undefined;
				this.newConfig.evaluationInstrument = undefined;
				this.newConfig.module = undefined;
				this.newConfig.cycle = undefined;
				this.newConfig.attempts = undefined;
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	// Modificaciones - 023092024

	toggleSelectProject(project: any) {
		this.projects.map((p: any) => {
			p.selected = false;
		});
		if (project.projectPracInformativeID === this.projectSelected.projectPracInformativeID) {
			this.projectSelected = {};
			project.selected = true;
		}
		project.selected = !project.selected;
		if (project.selected) {
			this.projectSelected = project;
			this.projectSelected.teachers.map((t: any) => {
				t.selected = false;
			});
		}
	}

	toggleSelectTeacher(teacher: any, various: boolean = false, only: boolean = false) {
		if (only) {
			teacher.selected = !teacher.selected;
		} else {
			if (!various) {
				if (this.subjectSelected.teachers) {
					this.subjectSelected.teachers.map((t: any) => {
						t.selected = false;
					});
				}
			}
			teacher.selected = !teacher.selected;
			if (teacher.selected) {
				this.teacherSelected = teacher;
				if (this.newConfig.component === EVALUATION_COMPONENT.COEVALUATION_BETWEEN_TEACHERS || this.newConfig.component === EVALUATION_COMPONENT.COEVALUATION_TWO_MANAGEMENT) {
					this.teachersByCareer = this.allTeachersByCareer.filter((t: any) => t.teacherID !== this.teacherSelected.teacherID);
					if (!this.teachersByCareer.length) {
						Swal.fire({
							text: 'No se tiene docentes para realizar la COEVALUACIÓN EN PARES',
							icon: 'warning'
						});
						this.teacherSelected = {};
						teacher.selected = false;
						return;
					}
				}
			}
		}
	}

	toggleSelectParallel(parallel: any) {
		parallel.selected = !parallel.selected;
	}

	async toggleSelectSubject(subject: any) {
		this.subjects.map((s: any) => {
			s.selected = false;
		});
		if (subject.courseID === this.subjectSelected.courseID) {
			this.subjectSelected = {};
			subject.selected = true;
		}
		subject.selected = !subject.selected;
		if (subject.selected) {
			this.subjectSelected = subject;
			this.teacherSelected = {};
			if (subject.teachers) {
				this.subjectSelected.teachers.map((t: any) => {
					t.selected = false;
					if (t.parallels) {
						t.parallels.map((p: any) => {
							p.selected = false;
						})
					}
				});
			} else {
				let result: any = await this.adminApi.getTeachersByPeriodSchoolCareerStudyPlanSectionAndSubject(
					this.newConfig.period,
					this.newConfig.school,
					this.newConfig.career,
					this.newConfig.studyPlan,
					this.newConfig.modality,
					this.newConfig.cycle,
					this.newConfig.subject || 0
				).toPromise();
				this.subjects.map((s: any) => {
					let teachersOfCourse = result.filter((r: any) => r.courseID === s.courseID);
					s.teachers = [];
					teachersOfCourse.map((t: any) => {
						if (!s.teachers.map((x: any) => x.teacherID).includes(t.teacherID)) {
							s.teachers.push({
								teacherID: t.teacherID,
								teacher: t.teacher,
								personID: t.personID,
								courseID: t.courseID,
								parallels: teachersOfCourse.filter((y: any) => y.teacherID === t.teacherID && y.courseID === t.courseID)
							});
						}
					})
				});
			}
		}
	}

	toggleEvaluatorsModal(edit: boolean = false, group?: any) {
		if (!edit && group) {
			Swal.fire({
				text: '¿Estas seguro de eliminar el Grupo de Evaluación?',
				icon: 'question',
				showCancelButton: true,
				showConfirmButton: true,
				allowEnterKey: false,
				allowEscapeKey: false,
				allowOutsideClick: false,
				cancelButtonText: 'Cancelar'
			}).then((choice) => {
				if (choice.isConfirmed) {
					this.newConfig.evaluators.splice(this.newConfig.evaluators.indexOf(group), 1);
				}
			});
		} else {
			if (this.evaluatorModal.isShown) {
				this.evaluatorModal.hide();
			} else {
				if (edit) {
					this.newGroup = group;
					this.evaluatorsByCareer = JSON.parse(JSON.stringify(this.allTeachersByCareer.filter((t: any) => !this.newConfig.evaluators.map((e: any) => e.teachers.map((x: any) => x.teacherID)).flat().includes(t.teacherID))));
					this.newGroup.teachers.map((t: any) => {
						t.selected = true;
						t.isEvaluator = true;
					})

					this.evaluatorsByCareer = this.evaluatorsByCareer.concat(this.newGroup.teachers);
					this.newGroup.evaluateds.map((t: any) => {
						t.selected = true;
					})
					this.teachersByCareer = JSON.parse(JSON.stringify(this.allTeachersByCareer.filter((t: any) => !this.newConfig.evaluators.map((e: any) => e.teachers.map((x: any) => x.teacherID)).flat().includes(t.teacherID) && !this.newConfig.evaluators.map((e: any) => e.evaluateds.map((x: any) => x.teacherID)).flat().includes(t.teacherID))));
					this.teachersByCareer = this.teachersByCareer.concat(this.newGroup.evaluateds);
				} else {
					this.newGroup = {
						index: (this.newConfig.evaluators || []).length + 1,
						teachers: [],
						evaluateds: []
					};
					switch (this.newConfig.component) {
						case EVALUATION_COMPONENT.COEVALUATION_BETWEEN_TEACHERS:
						case EVALUATION_COMPONENT.COEVALUATION_TWO_MANAGEMENT:
							this.evaluatorsByCareer = [];

							this.allTeachersByCareer.map((t: any) => {
								t.selected = false;
								if (!this.evaluatorsByCareer.map((x: any) => x.teacherID).includes(t.teacherID)) {
									this.evaluatorsByCareer.push(t);
								}
							})
							this.teachersByCareer = JSON.parse(JSON.stringify(this.evaluatorsByCareer));
							break;
						default:
							this.evaluatorsByCareer = JSON.parse(JSON.stringify(this.allTeachersByCareer.filter((t: any) => !this.newConfig.evaluators.map((e: any) => e.teachers.map((x: any) => x.teacherID)).flat().includes(t.teacherID))));
							this.teachersByCareer = JSON.parse(JSON.stringify(this.allTeachersByCareer.filter((t: any) => !this.newConfig.evaluators.map((e: any) => e.teachers.map((x: any) => x.teacherID)).flat().includes(t.teacherID))));
							break;
					}

				}

				this.evaluatorsByCareer.sort((a: any, b: any) => a.teacher.localeCompare(b.teacher));
				this.teachersByCareer.sort((a: any, b: any) => a.teacher.localeCompare(b.teacher));
				// this.teachersByCareer.map((t: any) => {
				// 	t.selected = false;
				// });
				// this.teachersByCareer.filter((t: any) => this.teacherToAssignEvaluator.evaluators.map((x: any) => x.teacherID).includes(t.teacherID)).map((t: any) => {
				// 	t.selected = true;
				// });
				this.evaluatorModal.config.keyboard = false;
				this.evaluatorModal.config.ignoreBackdropClick = true;
				this.evaluatorModal.show();
			}
		}
	}

	toggleAddEvaluator(item?: any) {
		console.log(this.newConfig);
		if (item) {
			this.newConfig.evaluators.splice(this.newConfig.evaluators.indexOf(item), 1);
		} else {
			this.newConfig.evaluators.push(this.newGroup);
			this.toggleEvaluatorsModal();
		}
		// teacherSelected.evaluators = teacherSelected.evaluators || [];
		// if (item) {
		// 	teacherSelected.evaluators.splice(teacherSelected.evaluators.indexOf(item), 1);
		// } else {
		// 	teacherSelected.evaluators.push({});
		// }
	}


	toggleSelectEvaluator(teacher: any, list: string, group?: any) {
		if (group) {
			group[list] = group[list].filter((t: any) => t.teacherID !== teacher.teacherID);
		} else {
			teacher.isEvaluator = list === 'teachers';
			teacher.selected = !teacher.selected;
			if (!teacher.selected) {
				this.newGroup[list] = this.newGroup[list].filter((t: any) => t.teacherID !== teacher.teacherID);
			} else {
				this.newGroup[list].push(teacher);
			}
			if (list === 'teachers') {
				switch (this.newConfig.component) {
					case EVALUATION_COMPONENT.COEVALUATION_BETWEEN_TEACHERS:
						let allteachersByCareer = JSON.parse(JSON.stringify(this.evaluatorsByCareer));
						this.teachersByCareer = JSON.parse(JSON.stringify(allteachersByCareer.filter((t: any) => !this.newGroup.teachers.map((x: any) => x.teacherID).includes(t.teacherID))));
						this.newGroup.evaluateds.map((t: any) => {
							t.selected = true;
						})
						break;

					default:
						console.log(this.newGroup.teachers.map((x: any) => x.teacherID));
						console.log(this.allTeachersByCareer.filter((t: any) => !this.newConfig.evaluators.map((e: any) => this.newGroup.teachers.map((x: any) => x.teacherID).includes(t.teacherID))));
						this.teachersByCareer = JSON.parse(JSON.stringify(this.allTeachersByCareer.filter((t: any) => !this.newGroup.teachers.map((x: any) => x.teacherID).includes(t.teacherID))));
						this.newGroup.evaluateds.map((t: any) => {
							t.selected = true;
						})
						break;
				}
				this.teachersByCareer = this.teachersByCareer.concat(this.newGroup.evaluateds);
				this.teachersByCareer.sort((a: any, b: any) => a.teacher.localeCompare(b.teacher));
			}
		}
	}

	toggleSelectAdministrative(administrative: any) {
		administrative.selected = !administrative.selected;
	}

	toggleManagementBoss(managementBoss: any) {
		managementBoss.selected = !managementBoss.selected;
	}

}
