import {
	AfterContentChecked,
	AfterViewInit,
	ChangeDetectorRef,
	Component,
	inject,
	OnDestroy,
	OnInit
} from '@angular/core';
import {
	FormArray,
	FormBuilder,
	FormControl,
	FormGroup,
	FormsModule,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import {
	ClassRoom,
	CycleDetail,
	DayFormValue,
	DistributiveSubject,
	DistributiveTeacher,
	Filter,
	Parallel,
	School,
	SPGetBuilding,
	SPGetCareer,
	SPGetModality,
	StudyPlan,
	TemporalCode,
	WorkingDay,
	WorkingDayHour
} from '@utils/interfaces/campus.interfaces';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { DndDraggableDirective, DndDropEvent, DndDropzoneDirective, DndPlaceholderRefDirective } from 'ngx-drag-drop';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { forkJoin, map, Subscription, take } from 'rxjs';
import { Campus, Module, Period } from '@utils/interfaces/period.interfaces';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgForOf, NgIf, NgTemplateOutlet, SlicePipe } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AllTeachersWereSelectedPipe } from './pipes/all-teachers-were-selected.pipe';
import { ConfirmationComponent } from '../../academic-management/components/confirmation/confirmation.component';
import { FilterClassroomsPipe } from './pipes/filter-classrooms.pipe';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

interface FilterDependent {
	name: filter;
	dependents: filter[];
}

interface ScheduleFormValue {
	days: DayFormValue[];
	startTime: string;
	endTime: string;
}

const FILTER_DEPENDENTS: FilterDependent[] = [
	{ name: 'campus', dependents: ['building', 'classroom', 'period', 'school', 'career', 'studyPlan', 'modality', 'module', 'workingDay', 'cycle', 'section', 'capacity'] },
	{ name: 'period', dependents: ['school', 'career', 'studyPlan', 'modality', 'module', 'workingDay', 'cycle', 'section', 'capacity'] },
	{ name: 'school', dependents: ['career', 'studyPlan', 'modality', 'module', 'workingDay', 'cycle', 'section', 'capacity']},
	{ name: 'career', dependents: ['studyPlan', 'modality', 'module', 'workingDay', 'cycle', 'section', 'capacity']},
	{ name: 'studyPlan', dependents: ['modality', 'module', 'workingDay', 'cycle', 'section', 'capacity']},
	{ name: 'modality', dependents: ['module', 'workingDay', 'cycle', 'section', 'capacity']},
	{ name: 'module', dependents: ['cycle', 'section', 'capacity']},
	{ name: 'workingDay', dependents: ['cycle', 'section', 'capacity']},
	{ name: 'cycle', dependents: ['section', 'capacity'] },
	{ name: 'building', dependents: ['classroom'] }
];
type filter = 'campus' | 'building' | 'classroom' | 'period' | 'school' | 'studyPlan' | 'career' | 'modality' | 'module' | 'workingDay' | 'cycle' | 'section' | 'capacity';
type day = 'lun' | 'mar' | 'mie' | 'jue' | 'vie' | 'sab' | 'dom';
const WEEK_DAYS: day[] = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];
const SCHEDULE_HEADER: string[] = ['HORA INICIO', 'HORA FIN', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];

@Component({
	selector: 'app-modeler',
	templateUrl: './modeler.component.html',
	styleUrls: ['./modeler.component.scss'],
	standalone: true,
	imports: [
		ReactiveFormsModule,
		MatFormFieldModule,
		MatSelectModule,
		NgForOf,
		DndDraggableDirective,
		NgTemplateOutlet,
		MatMenuModule,
		DndDropzoneDirective,
		MatButtonModule,
		NgIf,
		MatDialogModule,
		MatSnackBarModule,
		DndPlaceholderRefDirective,
		MatIconModule,
		MatInputModule,
		FormsModule,
		AllTeachersWereSelectedPipe,
		FilterClassroomsPipe,
		SlicePipe,
		NgxMaskDirective
	],
	providers: [
		provideNgxMask(),
	],
})

export class ModelerComponent extends OnDestroyMixin implements OnInit, OnDestroy, AfterViewInit, AfterContentChecked {
  public form: FormGroup;
	public campuses: Campus[] = []; // Sucursal
	public buildings: SPGetBuilding[] = [];
  public classrooms: ClassRoom[] = [];
	public periods: Period[] = []; // Periodo Académico
	public schools: School[] = []; // Escuela
	public studyPlans: StudyPlan[] = []; // Malla Académica
	public careers: SPGetCareer[] = []; // Carrera
	public modalities: SPGetModality[] = []; // Modalidad
	public modules: Module[] = []; // Módulo
	public workingDays: WorkingDay[] = []; // Jornada
	public cycles: CycleDetail[] = []; // Nivel
	public subjects: DistributiveSubject[] = []; // Materia
	public scheduleHeader: string[] = SCHEDULE_HEADER;
	public weekDays: day[] = WEEK_DAYS;
	public teachers: DistributiveTeacher[] = []; // Maestro
	public scheduleClassrooms: ClassRoom[][] = []; // Aula
	public parallels: Parallel[] = []; // Paralelo
	public selectedModality: SPGetModality;
	public disableSubjects: boolean = false;
	public maxSubjects: number = 0; // Para la máxima cantidad de asignaturas que se pueden configurar
	public allTeachersWereSelectedAndEachOneHasAtLeastOneAvailableHour: boolean = false;
  private getClassroomsByBuildingSubscription: Subscription;
	private getPeriodsSubscription: Subscription;
	private getBuildingsSubscription: Subscription;
	private getStudyPlansSubscription: Subscription;
	private getModalitiesSubscription: Subscription;
	private getHoursSubscription: Subscription;
	private getModuleOrWorkingDaysSubscription: Subscription;
	private getSubjectsSubscription: Subscription;
	private getCyclesSubscription: Subscription;
	private getSchoolsSubscription: Subscription;
	private postOrUpdateTemporalSubjectScheduleSubscription: Subscription;
	private postScheduleSubscription: Subscription;
	private deleteTemporalSubjectScheduleSubscription: Subscription;
	private getScheduleClassroomsByBuildingSubscription: Subscription;

	private adminApi: AdministrativeService = inject(AdministrativeService);
	private formBuilder: FormBuilder = inject(FormBuilder);
	private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private snackBar: MatSnackBar = inject(MatSnackBar);
	private common: CommonService = inject(CommonService);
	private dialog: MatDialog = inject(MatDialog);
	private changeDetector: ChangeDetectorRef = inject(ChangeDetectorRef);
	constructor() {
		super();
	}

	public override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	public ngAfterViewInit(): void {
	}

	public ngAfterContentChecked(): void {
		this.changeDetector.detectChanges();
	}

	public ngOnInit(): void {
		this.deleteUserWork();
		this.initForm();
		this.getDataFromResolver();
	}

	public deleteUserWork(): void {
		this.adminApi.deleteUserWorkOnTemporalSubjectSchedule().subscribe({
			next: (value: any) => {
				// console.log(value);
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	public get filters(): Filter {
		return this.form.getRawValue().filters as Filter;
	}

	public get filtersFormGroup(): FormGroup {
		return this.form.get('filters') as FormGroup;
	}

	public resetDependents(control: filter, setNullToSelectedModality = true): void {
		const filterDependent: FilterDependent = FILTER_DEPENDENTS.find((item) => item.name === control);
		if (filterDependent) {
			if (this.scheduleHasAtLeastOneSubject) {
				this.deleteUserWork();
			}
			filterDependent.dependents.map((dependent: string) => {
				this.formFilters.get(dependent).patchValue('');
			});
			if (setNullToSelectedModality) {
				this.selectedModality = null;
			}
			this.setSectionState('disable');
			// const section: FormControl = this.filtersFormGroup.get('section') as FormControl;
			// section.enable();
		}
		this.scheduleClassrooms = this.subjects = this.teachers = [];
    this.maxSubjects = 0;
		this.removeSchedule();
	}

	// public resetSubjectsTeacherAndRemoveSchedule(): void {
	// 	if (this.deleteUserWorkOnTemporalSubjectScheduleSubscription) {
	// 		this.deleteUserWorkOnTemporalSubjectScheduleSubscription.unsubscribe();
	// 	}
	// 	this.deleteUserWorkOnTemporalSubjectScheduleSubscription = this.adminApi.deleteUserWorkOnTemporalSubjectSchedule()
	// 		.subscribe({
	// 			next: (value: any) => {
	// 				this.resetDependents('campus');
	// 			}
	// 		});
	// }

	private getDataFromResolver(): void {
		this.activatedRoute.data
			.pipe(
				untilComponentDestroyed(this),
				map((value: any) => value['resolver']))
			.subscribe({
				next: (value: { campuses: Campus[], parallels: Parallel[] }) => {
					this.campuses = value.campuses;
					this.parallels = value.parallels;
				},
			});
	}

	private initForm(): void {
		this.form = this.formBuilder.group({
			// Al nivel de filtros, todos los campos son numéricos.
			filters: this.formBuilder.group({
				campus: ['', Validators.required], // Sucursal,
        building: ['', Validators.required], // Edificio
        classroom: ['', Validators.required], // Aulas
				school: ['', Validators.required], // Escuela
				period: ['', Validators.required], // Período Académico
				studyPlan: ['', Validators.required], // Malla
				career: ['', Validators.required], // Carrera
				modality: ['', Validators.required], // Modalidad
				module: [''], // Módulo
				workingDay: [''], // Jornada
				cycle: ['', Validators.required], // Semestre
				section: [{ value: null, disabled: true }, Validators.required], // Paralelo
				capacity: ['', [Validators.required, Validators.min(1)]]
			}),
			schedule: this.formBuilder.array([])
		});
	}

	private setSectionState(state: 'enable' | 'disable'): void {
		const filtersFormGroup: FormGroup = this.filtersFormGroup;
		const sectionFormControl: FormControl = filtersFormGroup.get('section') as FormControl;
		sectionFormControl.patchValue(null);
		if (state === 'enable') {
			sectionFormControl.enable();
			return;
		}
		sectionFormControl.disable();
	}

	public get scheduleForm(): FormArray {
		return this.form.get('schedule') as FormArray;
	}

	// isSelectingSubject se usa para cuando se está seleccionando la asignatura.
	public getSelectedTeachers(subjects: DistributiveSubject[]): DistributiveTeacher[] {
		let teachers: DistributiveTeacher[] = [];
		subjects.forEach((subject: DistributiveSubject) => {
			const filteredTeachers: DistributiveTeacher[] = subject.teachers.filter((t: DistributiveTeacher) => t.personID === +subject.selectedTeacher);
			if (filteredTeachers.length) {
				teachers = teachers.concat(filteredTeachers);
			}
		});
		return teachers;
	}

	private removeDuplicatedTeachers(teachers: DistributiveTeacher[]): DistributiveTeacher[] {
		return teachers.reduce((accumulator: DistributiveTeacher[], currentTeacher: DistributiveTeacher) => {
			const existingTeacher: DistributiveTeacher = accumulator.find((teacher) => teacher.personID === currentTeacher.personID);
			if (!existingTeacher) {
				accumulator.push(currentTeacher);
			}
			return accumulator;
		}, []);
	}

	public get scheduleFormArray(): FormArray {
		return this.form.get('schedule') as FormArray;
	}

	private removeSchedule(): void {
		while (this.scheduleFormArray.length) {
			this.scheduleFormArray.removeAt(0);
		}
	}

	// public getHourAsFormArray(index: number): FormArray {
	//   return this.scheduleFormArray.at(index).get('hour');
	// }

	// private buildSchedule(workingDayHours: WorkingDayHour[]): void {
	// 	this.removeSchedule();
	// 	this.scheduleClassrooms = [];
	//
	// 	workingDayHours.map((workingDayHour: WorkingDayHour) => {
	// 		const hour: FormGroup = this.formBuilder.group({
	// 			startTime: [workingDayHour.startTime],
	// 			endTime: [workingDayHour.endTime],
	// 			days: this.formBuilder.array([])
	// 		});
	// 		const days: FormArray = hour.get('days') as FormArray;
	// 		this.weekDays.map((day: day, index: number) => {
	// 			// Lista de aulas está vacía. Se carga cuando se selecciona un edificio.
	// 			this.scheduleClassrooms.push([]);
	// 			// Index representa el día.
	// 			const cell: FormGroup = this.cellFormGroup(index, workingDayHour.hoursID);
	// 			days.push(cell);
	// 		});
	// 		// La hora representa el row, que contiene todos los días
	// 		this.scheduleFormArray.push(hour);
	// 	});
	// }

	public addRow(): void {
		const hour: FormGroup = this.formBuilder.group({
			startTime: ['00:00', Validators.required],
			endTime: ['00:00', Validators.required],
			days: this.formBuilder.array([])
		});
		const days: FormArray = hour.get('days') as FormArray;
		this.weekDays.map((day: day, index: number) => {
			// Lista de aulas está vacía. Se carga cuando se selecciona un edificio.
			this.scheduleClassrooms.push([]);
			// Index representa el día.
			const cell: FormGroup = this.cellFormGroup(index);
			days.push(cell);
		});
		this.scheduleFormArray.push(hour);
	}

	public updateHourToRow(indexSchedule: number, control: 'startTime' | 'endTime', hours: number, minutes?: number): void {
		if (this.rowHasAtLeastOneSubject(indexSchedule)) {
			return;
		}
		const schedule: FormGroup = this.scheduleFormArray.at(indexSchedule) as FormGroup;
		const currentTime: string = schedule.get(control).value;
		const newHour: string = this.addOrSubtractHour(currentTime, hours, minutes);
		schedule.patchValue({
			[control]: newHour
		});
		const daysFormArray: FormArray = this.getDaysFormArray(indexSchedule);
		daysFormArray.controls.forEach((dayFormControl) => {
			dayFormControl.patchValue({
				[control]: newHour
			});
		});
	}

	public rowHasAtLeastOneSubject(indexSchedule: number): boolean {
		const scheduleForm: FormArray = this.scheduleForm;
		const row: ScheduleFormValue = scheduleForm.at(indexSchedule).value as ScheduleFormValue;
		return row.days.some((day) => day.temporalId);
	}

	public deleteRow(indexSchedule: number): void {
		if (!this.rowHasAtLeastOneSubject(indexSchedule)) {
			this.scheduleForm.removeAt(indexSchedule);
			return;
		}
		const row: ScheduleFormValue = this.scheduleForm.at(indexSchedule).value as ScheduleFormValue;
		const idsToBeDeleted: string[] = row.days.map((day) => day.temporalId).filter((id) => id !== '');
		if (this.deleteTemporalSubjectScheduleSubscription) this.deleteTemporalSubjectScheduleSubscription.unsubscribe();
		this.deleteTemporalSubjectScheduleSubscription = this.adminApi.deleteTemporalSubject(idsToBeDeleted)
			.subscribe({
				next: (value: any) => {
					const daysFormArray: FormArray = this.getDaysFormArray(indexSchedule);
					daysFormArray.controls.forEach((day, index) => {
						const dayFormGroup: FormGroup = daysFormArray.controls[index] as FormGroup;
						const dayValue: DayFormValue = dayFormGroup.value;
						const subject: DistributiveSubject = this.subjects.find((s) => s.courseID === +dayValue.subjectId);
						this.setTemporalIdToACell(indexSchedule, index);
						this.setSubjectToACell(indexSchedule, index);
						this.setTeacherToACell(indexSchedule, index);
						this.resetBuildingAndClassRoom(indexSchedule, index);
						if (subject) {
							subject.busyHours--;
						}
					});
				},
				error: (err: HttpErrorResponse) => {
				}
			});
		// console.log(idsToBeDeleted);
	}

	private addOrSubtractHour(currentHour: string, hours: number, minutes?: number): string {
		let [hh, mm] = currentHour.split(':').map(Number);
		const now = new Date();
		now.setHours(hh);
		now.setMinutes(mm);
		const minutesToBeAdded: number = minutes ? minutes : hours * 60;
		now.setMinutes(now.getMinutes() + minutesToBeAdded);
		const updatedHours: number = now.getHours();
		const updatedMinutes: number = now.getMinutes();
		return `${updatedHours < 10 ? `0${updatedHours}`: updatedHours.toString()}:${updatedMinutes < 10 ? `0${updatedMinutes}`: updatedMinutes.toString()}`;
	}

	private cellFormGroup(day: number): FormGroup {
		return this.formBuilder.group({
			startTime: ['00:00', Validators.required],
			endTime: ['00:00', Validators.required],
			temporalId: [''],
			day: [day, Validators.required],
			subjectId: [''], // Requerido cuando se inserta un teacher o un subject
			subject: this.formBuilder.group({
				courseID: [''],
				courseName: ['']
			}),
			building: [{value: '', disabled: true}],
			classroom: [{value: '', disabled: true}], // Requerido cuando se inserta un teacher o un subject
			// Sólo necesitamos el personId. De teacher no necesitamos nada para enviar o recibir los datos.
			personId: [''], // Requerido cuando se inserta un teacher o un subject
			teacher: this.formBuilder.group({
				teacher: [''],
				personID: [''],
			}),
			subjectHours: ['']
		});
		// this.scheduleFormArray.push(classroom);
	}

	public getScheduleClassroomsByBuilding(building: string, indexSchedule: number, indexDay: number): void {
		const daysFormArray: FormArray = this.getDaysFormArray(indexSchedule);
		const dayFormGroup: FormGroup = daysFormArray.controls[indexDay] as FormGroup;
		const dayValue: DayFormValue = dayFormGroup.value;
		if (!building) {
			dayFormGroup.patchValue({ classroom: '' });
			this.scheduleClassrooms[(indexSchedule * this.weekDays.length) + indexDay] = [];
			return;
		}
		if (this.getScheduleClassroomsByBuildingSubscription) this.getScheduleClassroomsByBuildingSubscription.unsubscribe();
		this.getScheduleClassroomsByBuildingSubscription = this.adminApi.getClassroomsByBuilding(+building, false, true)
			.subscribe({
				next: (value: ClassRoom[]) => {
					// FIXME: Filtrar por backend
					this.scheduleClassrooms[(indexSchedule * this.weekDays.length) + indexDay] = value.filter((c) => !c.classroomName.toLowerCase().includes('aula de clase'));
					// console.warn(this.scheduleClassrooms[(indexSchedule * this.weekDays.length) + indexDay]);
				},
				error: (err: HttpErrorResponse) => {
					this.scheduleClassrooms[(indexSchedule * this.weekDays.length) + indexDay] = [];
				}
			});
	}

	public getDaysFormArray(index: number): FormArray {
		return this.scheduleFormArray.controls[index].get('days') as FormArray;
	}

	public get formFilters(): FormGroup {
		return this.form.get('filters') as FormGroup;
	}

	public onDrop(event: DndDropEvent, indexSchedule: number, indexDay: number): void {
		// Si no ha seleccionado todos los items (selects)
		if (this.filtersFormGroup.invalid) {
			this.filtersFormGroup.markAllAsTouched();
			this.filtersFormGroup.markAsDirty();
			this.snackBar.dismiss();
			this.snackBar.open(
				`Información incompleta. Selecciona una opción de los campos marcados`,
				null,
				{
					duration: 5000,
					verticalPosition: 'bottom',
					horizontalPosition: 'center',
					panelClass: ['warning-snackbar']
				}
			);
			// dayFormGroup.patchValue({
			// 	classroom: ''
			// });
			return;
		}
		// Primero hay que verificar el tipo de evento que se arrastró.
		// Si es tipo subject, se tiene que verificar:
		// 1. Si ya existe una materia en esa fila, el maestro se coloca de forma automática.
		// 2. Antes de colocar al maestro, se tienen que verificar las horas que tiene disponibles.
		// 3. Si el maestro tiene más horas de las que debe, esa materia no se podrá agregar. Se muestra un mensaje
		//    usuario, indicándole que ese maestro ya no dispone de horas.
		// 4.
		const type: 'subject' | 'teacher' = event.type;
		// TOMAR NOTA: NO SE PUEDE AGREGAR UN MAESTRO SI ANTES NO SE AGREGÓ UNA MATERIA.
		// ENTONCES LOS SELECTS DE EDIFICIOS Y AULAS SE HABILITAN AL AGREGAR AL MAESTRO
		// Y SE DESHABILITAN AL ELIMINAR ESTA CELDA.
		if (type === 'subject') {
			// Buscar si hay una materia con el mismo ID en esa fila.
			// Si la hay, se setea el maestro, la materia y el aula.
			// Si no la hay, pues se cargan los maestros.
			// this.teachers = [];
			// this.disableSubjects = true;
			const subject: DistributiveSubject = event.data?.subject as DistributiveSubject;
			const teacher: DistributiveTeacher = this.teachers.find((t: DistributiveTeacher) => t.personID === +subject.selectedTeacher);
			if (subject.busyHours === subject.hours) {
				this.snackBar.dismiss();
				this.snackBar.open(
					`Esta asignatura tiene sus horas completas.`,
					null,
					{
						duration: 5000,
						verticalPosition: 'bottom',
						horizontalPosition: 'center',
						panelClass: ['warning-snackbar']
					}
				);
				return;
			}
			if (!teacher) {
				return;
			}
			if (teacher.availableHours === teacher.busyHours) {
				this.snackBar.dismiss();
				this.snackBar.open(
					`El docente no tiene más horas disponibles`,
					null,
					{
						duration: 5000,
						verticalPosition: 'bottom',
						horizontalPosition: 'center',
						panelClass: ['warning-snackbar']
					}
				);
				return;
			}
			this.setSubjectToACell(indexSchedule, indexDay, subject);
			this.setTeacherToACell(indexSchedule, indexDay, teacher);
			this.setDefaultBuildingAndClassroomToACell(indexSchedule, indexDay);
			this.postOrUpdateTemporalSubject(indexSchedule, indexDay);
		}
	}

	public setDefaultBuildingAndClassroomToACell(indexSchedule: number, indexDay: number): void {
		const daysFormArray: FormArray = this.getDaysFormArray(indexSchedule);
		const dayFormGroup: FormGroup = daysFormArray.controls[indexDay] as FormGroup;
		const filters: Filter = this.filters;
		this.scheduleClassrooms[(indexSchedule * this.weekDays.length) + indexDay] = this.classrooms.filter(c => !c.classroomName.toLowerCase().includes('aula de clase') || c.classroomID === +filters.classroom);
		dayFormGroup.patchValue({
			building: filters.building,
			classroom: filters.classroom
		});
		dayFormGroup.get('building').enable();
		dayFormGroup.get('classroom').enable();
	}

	public setSubjectToACell(indexSchedule: number, indexDay: number, subject?: DistributiveSubject): void {
		const daysFormArray: FormArray = this.getDaysFormArray(indexSchedule);
		const dayFormGroup: FormGroup = daysFormArray.controls[indexDay] as FormGroup;
		dayFormGroup.patchValue({
			subjectId: subject?.courseID || '',
			subject: {
				courseID: subject?.courseID || '',
				courseName: subject?.courseName || '',
			},
			subjectHours: subject?.hours || ''
		});
	}

	public setTemporalIdToACell(indexSchedule: number, indexDay: number, temporalId?: number): void {
		const daysFormArray: FormArray = this.getDaysFormArray(indexSchedule);
		const dayFormGroup: FormGroup = daysFormArray.controls[indexDay] as FormGroup;
		dayFormGroup.patchValue({
			temporalId: temporalId || '',
		});
	}

	public resetBuildingAndClassRoom(indexSchedule: number, indexDay: number, disableControls = true): void {
		const daysFormArray: FormArray = this.getDaysFormArray(indexSchedule);
		const dayFormGroup: FormGroup = daysFormArray.controls[indexDay] as FormGroup;
		dayFormGroup.patchValue({
			building: '',
			classroom: ''
		});
		if (disableControls) {
			dayFormGroup.get('building').disable();
			dayFormGroup.get('classroom').disable();
			dayFormGroup.markAsUntouched();
			dayFormGroup.markAsPristine();
		}
	}

	public setClassRoomToACell(indexSchedule: number, indexDay: number, classroom: number | string): void {
		const daysFormArray: FormArray = this.getDaysFormArray(indexSchedule);
		const dayFormGroup: FormGroup = daysFormArray.controls[indexDay] as FormGroup;
		dayFormGroup.patchValue({
			classroom
		});
	}

	public setTeacherToACell(indexSchedule: number, indexDay: number, teacher?: DistributiveTeacher): void {
		const daysFormArray: FormArray = this.getDaysFormArray(indexSchedule);
		const dayFormGroup: FormGroup = daysFormArray.controls[indexDay] as FormGroup;
		const teacherId: number = dayFormGroup.value.teacher.personID as number;
		dayFormGroup.patchValue({
			personId: teacher?.personID || '',
			teacher: {
				personID: teacher?.personID || '',
				teacher: teacher?.teacher || '',
			}
		});
		if (teacher) {
			const teacherInList: DistributiveTeacher = this.teachers.find((t: DistributiveTeacher) => t.personID === teacher.personID);
			if (teacherInList) {
				teacherInList.busyHours++;
			}
		} else {
			const teacherInList: DistributiveTeacher = this.teachers.find((t: DistributiveTeacher) => t.personID === +teacherId);
			if (teacherInList) {
				teacherInList.busyHours--;
			}
		}
	}

	// Al cambiar de sucursal, traer los periodos
	public getPeriodsByCampus(event: MatSelectChange, control: filter): void {
		this.formFilters.get(control).patchValue(event.value);
		if (this.getPeriodsSubscription) this.getPeriodsSubscription.unsubscribe();
		this.getPeriodsSubscription = this.adminApi.getPeriodsByCampus(event.value)
			.subscribe({
				next: (value: Period[]) => {
					this.resetDependents(control);
					this.periods = this.schools = this.studyPlans = this.careers = this.modalities = this.modules = this.workingDays = this.cycles = [];
					this.periods = value;
				},
				error: (err: HttpErrorResponse) => {
				}
			});
	}

  // Al cambiar de edificio, se traen las aulas
  // Estas aulas no son las mismas que las aulas del horario.
  // Se manejan de forma distinta.
  public getClassroomsByBuilding(event: MatSelectChange, control: filter): void {
    this.formFilters.get(control).patchValue(event.value);
    if (this.getClassroomsByBuildingSubscription) this.getClassroomsByBuildingSubscription.unsubscribe();
    this.getClassroomsByBuildingSubscription = this.adminApi.getClassroomsByBuilding(event.value, true)
      .subscribe({
        next: (value: ClassRoom[]) => {
          this.classrooms = value;
					this.scheduleClassrooms = [];
        },
        error: (err: HttpErrorResponse) => {
          this.classrooms = this.scheduleClassrooms = [];
        }
    });
  }


  // Al cambiar de periodo, traer las escuelas
	public getSchoolsByPeriod(event: MatSelectChange, control: filter): void {
		this.formFilters.get(control).patchValue(event.value);
		if (this.getSchoolsSubscription) {
			this.getSchoolsSubscription.unsubscribe();
		}
		this.getSchoolsSubscription = this.adminApi.getSchoolsByPeriod(event.value)
			.subscribe({
				next: (value: School[]) => {
					this.resetDependents(control);
					this.schools = this.studyPlans = this.careers = this.modalities = this.modules = this.workingDays = [];
					this.schools = value;
				},
				error: (err: HttpErrorResponse) => {
				}
			});
	}

	// Al cambiar de escuela, traer las mallas
	public getCareersBySchool(event: MatSelectChange, control: filter): void {
		this.formFilters.get(control).patchValue(event.value);
		if (this.getStudyPlansSubscription) {
			this.getStudyPlansSubscription.unsubscribe();
		}
		const filters: Filter = this.filters;
		this.getStudyPlansSubscription = this.adminApi.getCareersBySchool(filters.period, event.value)
			.subscribe({
				next: (value: SPGetCareer[]) => {
					this.resetDependents(control);
					this.studyPlans = this.careers = this.modalities = this.modules = this.workingDays = this.cycles = [];
					this.careers = value;
				},
				error: (err: HttpErrorResponse) => {
				}
			});
	}

	// Al cambiar de carrera (plan de estudio), traer las carreras y los ciclos.
	// public getCareersByStudyPlanAndSchoolAndPeriod(event: MatSelectChange, control: filter): void {
	// 	this.formFilters.get(control).patchValue(event.value);
	// 	if (this.getCareersSubscription) {
	// 		this.getCareersSubscription.unsubscribe();
	// 	}
	// 	const filters: Filter = this.filters;
	// 	this.getCareersSubscription = this.adminApi.getCareersByStudyPlanAndSchoolAndPeriod(event.value, filters.school, filters.period)
	// 		.subscribe({
	// 			next: (value: SPGetCareer[]) => {
	// 				this.resetDependents(control);
	// 				this.careers = this.modalities = this.modules = this.workingDays = this.cycles = [];
	// 				this.careers = value;
	// 			},
	// 			error: (err: HttpErrorResponse) => {
	// 			}
	// 		});
	// }

	public getStudyPlansByCareer(event: MatSelectChange, control: filter): void {
		this.formFilters.get(control).patchValue(event.value);
		if (this.getStudyPlansSubscription) {
			this.getStudyPlansSubscription.unsubscribe();
		}
		const filters: Filter = this.filters;
		this.getStudyPlansSubscription = this.adminApi.getStudyPlansByCareer(event.value)
			.subscribe({
				next: (value: StudyPlan[]) => {
					this.resetDependents(control);
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
	public getModalitiesByCareer(event: MatSelectChange, control: filter): void {
		this.formFilters.get(control).patchValue(event.value);
		if (this.getModalitiesSubscription) this.getModalitiesSubscription.unsubscribe();
		this.getModalitiesSubscription = this.adminApi.getModalitiesByCareer(event.value)
			.subscribe({
				next: (value: SPGetModality[]) => {
					this.resetDependents(control);
					this.modalities = this.modules = this.workingDays = this.cycles = [];
					this.modalities = value;
				},
				error: (err: HttpErrorResponse) => {
				}
			});
	}

	// Al cambiar de malla y plan de estudios, traer los ciclos
	public getCyclesByCareerAndStudyPlan(event: MatSelectChange, control: filter): void {
		this.formFilters.get(control).patchValue(event.value);
		if (this.getCyclesSubscription) this.getCyclesSubscription.unsubscribe();
		const filters: Filter = this.filters;
		this.getCyclesSubscription = this.adminApi.getCyclesByCareerAndStudyPlan(event.value, filters.career)
			.subscribe({
				next: (value: CycleDetail[]) => {
					this.resetDependents(control);
					// this.modalities = this.modules = this.workingDays = this.cycles = [];
					this.cycles = value;
				},
				error: (err: HttpErrorResponse) => {
				}
			});
	}

	// Al cambiar de modalidad, traer los módulos o jornadas.
	public getModulesOrWorkingDaysByModality(event: MatSelectChange): void {
		const selectedModality: SPGetModality = this.modalities.find((modality) => modality.modalityID === +event.value);
		if (selectedModality) {
			// La variable global se setea para mostrar u ocultar las listas de módulos y jornadas.
			this.selectedModality = selectedModality;
			if (this.getModuleOrWorkingDaysSubscription) {
				this.getModuleOrWorkingDaysSubscription.unsubscribe();
			}
			this.modules = this.workingDays = [];
			this.formFilters.patchValue({
				module: '',
				workingDay: ''
			});
			// Si la modalidad es en línea, traer los módulos.
			if (selectedModality.workingORmodule === 'M') {
				// Marcar el control de módulo como requerido
				const moduleFormControl: FormControl = this.formFilters.get('module') as FormControl;
				moduleFormControl.addValidators(Validators.required);

				// Quitar las validaciones de la jornada
				const workingDayFormControl: FormControl = this.formFilters.get('workingDay') as FormControl;
				workingDayFormControl.clearValidators();
				workingDayFormControl.updateValueAndValidity();

        this.resetDependents('modality', false);
				this.getModuleOrWorkingDaysSubscription = this.adminApi.getModulesByModality(event.value)
					.subscribe({
						next: (value: Module[]) => {
							this.modules = value;
						}
					})
			} else {
				// Marcar la jornada como requerida
				const workingDayFormControl: FormControl = this.formFilters.get('workingDay') as FormControl;
				workingDayFormControl.addValidators(Validators.required);

				// Quitar las validaciones del módulo
				const moduleFormControl: FormControl = this.formFilters.get('module') as FormControl;
				moduleFormControl.clearValidators();
				moduleFormControl.updateValueAndValidity();

				this.resetDependents('modality', false);

				this.getModuleOrWorkingDaysSubscription = this.adminApi.getWorkingDaysByModality(event.value)
					.subscribe({
						next: (value: WorkingDay[]) => {
							this.workingDays = value;
						}
					});
			}
		}
	}

	// Sólo se reinicia el horario
	public getHoursByWorkingDayOrModuleAndModality(event: MatSelectChange, control: filter): void {
		this.resetDependents(control, false);
		// if (this.getHoursSubscription) {
		// 	this.getHoursSubscription.unsubscribe();
		// }
		// const filters: Filter = this.filters;
		// this.getHoursSubscription = this.adminApi.getHoursByWorkingDayOrModuleAndModality(event.value, filters.modality)
		// 	.subscribe({
		// 		next: (value: WorkingDayHour[]) => {
		// 			this.buildSchedule(value);
		// 		},
		// 		error: (err: HttpErrorResponse) => {
		// 		}
		// 	});
	}

	public get scheduleHasAtLeastOneSubject(): boolean {
		const scheduleForm: FormArray = this.scheduleForm;
		const scheduleFormValue = scheduleForm.value as ScheduleFormValue[];
		return scheduleFormValue.some((row) => row.days.some((day) => day.temporalId));
	}

  // public get scheduleHasAtLeastOneLocalSubject(): boolean {
  //   const scheduleForm: FormArray = this.scheduleForm;
  //   const scheduleFormValue = scheduleForm.value as ScheduleFormValue[];
  //   return scheduleFormValue.some((row) => row.days.some((day) => day.subjectId));
  // }

	public get checkIfTheOnlineHoursOfTheSubjectsAreComplete(): boolean {
		const maximumHours: number = this.subjects.length > 0 ? this.subjects[0].maximumHours : 0;
		// Filtra las materias donde busyHours es igual a hours
		const subjectsWithCompleteHours = this.subjects.filter((subject: DistributiveSubject) => subject.busyHours === subject.hours);
		// Verifica si la cantidad de materias con horas completas es igual a maximumHours
		return (subjectsWithCompleteHours.length > 0 && subjectsWithCompleteHours.length <= maximumHours);
	}

  public get checkIfTheHoursOfTheSubjectsAreComplete(): boolean {
    const maximumHours: number = this.subjects.length > 0 ? this.subjects[0].maximumHours : 0;
    // Filtra las materias donde busyHours es igual a hours
    const subjectsWithCompleteHours = this.subjects.filter((subject: DistributiveSubject) => subject.busyHours === subject.hours);
    // Verifica si la cantidad de materias con horas completas es igual a maximumHours
    return (subjectsWithCompleteHours.length > 0 && subjectsWithCompleteHours.length === maximumHours);
  }

	public sendForm(): void {
		// console.log(this.form.value);
		if (this.form.valid) {
			if (this.scheduleHasAtLeastOneSubject) {
        if (this.selectedModality?.workingORmodule === 'M' && !this.checkIfTheOnlineHoursOfTheSubjectsAreComplete) {
          this.snackBar.open(
            `El máximo de asignaturas a configurar es de ${this.maxSubjects}`,
            null,
            {
              duration: 4000,
              verticalPosition: 'bottom',
              horizontalPosition: 'center',
              panelClass: ['warning-snackbar']
            }
          );
          return;
        }
        if (this.selectedModality?.workingORmodule === 'J' && !this.checkIfTheHoursOfTheSubjectsAreComplete) {
          this.snackBar.open(
            `Debes completar todas las asignaturas`,
            null,
            {
              duration: 4000,
              verticalPosition: 'bottom',
              horizontalPosition: 'center',
              panelClass: ['warning-snackbar']
            }
          );
          return;
        }
				const config: MatDialogConfig = new MatDialogConfig();
				config.id = 'postScheduleConfirmationDialog';
				config.autoFocus = false;
				config.minWidth = '200px';
				config.maxWidth = '600px';
				config.panelClass = 'transparent-panel';
				config.data = {
					message: '¿Estás seguro de crear este horario?'
				}
				const dialog = this.dialog.open(ConfirmationComponent, config);
				dialog.afterClosed()
					.pipe(untilComponentDestroyed(this))
					.subscribe((res: boolean) => {
						if (res) {
							if (this.postScheduleSubscription) {
								this.postScheduleSubscription.unsubscribe();
							}
							const filters: Filter = this.filters;
							this.postScheduleSubscription = this.adminApi.postSchedule(filters.period).subscribe((res: any) => {
								// console.log(res);
								if (res) {
									this.common.message('Éxito', 'Modelador guardado con éxito', 'success', '#86bc57');
									this.removeSchedule();
									this.form.reset('');
									this.allTeachersWereSelectedAndEachOneHasAtLeastOneAvailableHour = false;
									this.periods = this.cycles = this.studyPlans = this.careers = this.modalities = this.subjects = this.modules = this.workingDays = this.teachers = this.scheduleClassrooms = [];
								}
							});
						}
				});
			} else {
				this.snackBar.dismiss();
				this.snackBar.open(
					`No hay Materias configuradas en el horario`,
					null,
					{
						duration: 7000,
						verticalPosition: 'bottom',
						horizontalPosition: 'center',
						panelClass: ['warning-snackbar']
					}
				);
			}
		} else {
		  this.form.markAsDirty();
		  this.form.markAllAsTouched();
		}
	}

	public resetScheduleAndEnableSection(control: filter): void {
		this.resetDependents(control, false);
		this.setSectionState('enable');
	}

	public removeSubjectAndTeacher(indexSchedule: number, indexDay: number): void {
		// No vamos a eliminar algo del formulario. Sólo vamos a sobrescribir los datos.
		// Sólo vamos a sobrescribir las materias de esa semana.
		const daysFormArray: FormArray = this.getDaysFormArray(indexSchedule);
		const dayFormGroup: FormGroup = daysFormArray.controls[indexDay] as FormGroup;
		const dayValue: DayFormValue = dayFormGroup.value;
		const subject: DistributiveSubject = this.subjects.find((s) => s.courseID === +dayValue.subjectId);
		// Si tiene un temporalId, significa que tiene un registro en la tabla temporal, entonces se hará la petición para eliminar ese registro.
		if (dayValue.temporalId) {
			if (this.deleteTemporalSubjectScheduleSubscription) this.deleteTemporalSubjectScheduleSubscription.unsubscribe();
			this.deleteTemporalSubjectScheduleSubscription = this.adminApi.deleteTemporalSubject([dayValue.temporalId])
				.subscribe({
				next: (value: TemporalCode) => {
					this.setTemporalIdToACell(indexSchedule, indexDay);
					this.setSubjectToACell(indexSchedule, indexDay);
					this.setTeacherToACell(indexSchedule, indexDay);
					this.resetBuildingAndClassRoom(indexSchedule, indexDay);
					if (subject) {
						subject.busyHours--;
					}
				},
				error: (err: HttpErrorResponse) => {
				}
			});
		} else {
			// Si no tiene un temporalId, pues lo eliminamos sin hacer la petición.
			this.setSubjectToACell(indexSchedule, indexDay);
			this.setTeacherToACell(indexSchedule, indexDay);
			this.resetBuildingAndClassRoom(indexSchedule, indexDay);
		}
		// const rows: FormArray = this.getDaysFormArray(indexSchedule);
		// rows.controls.forEach((day: AbstractControl) => {
		// 	const subjectId = day.get('subjectId') as FormControl;
		// 	if (subjectId.value === subject.courseID) {
		// 		this.setSubjectToACell(indexSchedule, indexDay);
		// 		this.setTeacherToACell(indexSchedule, indexDay);
		// 		day.patchValue({
		// 			building: '',
		// 			personId: '',
		// 			subjectId: '',
		// 			classroom: ''
		// 		});
		// 	}
		// });
		// this.disableSubjects = false;
	}

	public showMessageToPreventFormReset(selectIsHasBeenOpened: boolean, control: filter): void {
		if (selectIsHasBeenOpened) {
			const formControl: FormControl = this.formFilters.get(control) as FormControl;
			if (formControl.value) {
				this.snackBar.dismiss();
				this.snackBar.open(
					`La selección de otro item de esta lista, borrará el horario que hayas configurado.`,
					null,
					{
						duration: 7000,
						verticalPosition: 'bottom',
						horizontalPosition: 'center',
						panelClass: ['warning-snackbar']
					}
				);
			}
		}
	}

	public getBuildingsByCampus(event: MatSelectChange): void {
		if (this.getBuildingsSubscription) this.getBuildingsSubscription.unsubscribe();
		this.getBuildingsSubscription = this.adminApi.getBuildingsByCampus(event.value)
			.subscribe({
				next: (value: SPGetBuilding[]) => {
					this.buildings = value;
				},
				error: (err: HttpErrorResponse) => {
				}
			});
	}

  public removeScheduleFromClassroom(event: MatSelectChange): void {
    // Si hay materias en el horario, borrar el horario.
    // A ese punto no se ha traido la lista de las materias.
		// Pero se contempla únicamente el caso donde hay al menos una materia configurada.
    if (this.scheduleHasAtLeastOneSubject) {
      // Si hay materias en el horario, hay que borrar las materias y volver a cargarlas.
      // La lógica es tener la lista de materias en un lado, junto con el docente para esa materia.
      // Al lado derecho se tiene la lista de los maestros (sin repetirse) para mostrar las horas de ese maestro
      this.deleteUserWork();
      this.removeSchedule();
			// TRAER DE NUEVO LA LISTA DE LAS ASIGNATURAS Y MAESTROS.
			this.getSubjectsAndBuildSchedule('section');
      if (this.getHoursSubscription) {
        this.getHoursSubscription.unsubscribe();
      }
      const filters: Filter = this.filters;
      if (filters.modality && (filters.module || filters.workingDay)) {
        this.getHoursSubscription = this.adminApi.getHoursByWorkingDayOrModuleAndModality(filters.module || filters.workingDay, filters.modality)
          .subscribe({
            next: (value: WorkingDayHour[]) => {
							// console.log('Construir horario');
              // this.buildSchedule(value);
            },
            error: (err: HttpErrorResponse) => {
            }
          });
      }
    }
  }

	// Para el section o paralelo
	// public removeScheduleFromSection(event: MatSelectChange): void {
  //   if (this.scheduleHasAtLeastOneSubject) {
  //     this.deleteUserWork();
  //     this.removeSchedule();
  //     // this.teachers = [];
  //     if (this.getHoursSubscription) {
  //       this.getHoursSubscription.unsubscribe();
  //     }
  //     const filters: Filter = this.filters;
  //     if (filters.modality && (filters.module || filters.workingDay)) {
  //       this.getHoursSubscription = this.adminApi.getHoursByWorkingDayOrModuleAndModality(filters.module || filters.workingDay, filters.modality)
  //         .subscribe({
  //           next: (value: WorkingDayHour[]) => {
  //             this.buildSchedule(value);
  //           },
  //           error: (err: HttpErrorResponse) => {
  //           }
  //         });
  //     }
  //   }
	// }

	public getSubjectsAndBuildSchedule(control: filter, event?: MatSelectChange): void {
		// Si hay algo hecho, se borra y luego se construye de nuevo el horario.
		if (this.scheduleHasAtLeastOneSubject) {
			this.deleteUserWork();
			this.removeSchedule();
		}
		this.subjects = this.teachers = [];
		if (this.getHoursSubscription) {
			this.getHoursSubscription.unsubscribe();
		}
		const filters: Filter = this.filters;
		if (filters.modality && (filters.module || filters.workingDay)) {
			forkJoin({
				subjects: this.adminApi.getSubjectsByCycleAndStudyPlanAndCareerAndSection(filters.studyPlan, filters.career, filters.cycle, filters.period, filters.modality, event?.value || filters.section),
				// workingDayHours: this.adminApi.getHoursByWorkingDayOrModuleAndModality(filters.module || filters.workingDay, filters.modality)
			}).pipe(take(1)).subscribe({
				next: (value: { subjects: DistributiveSubject[] }) => {
				// next: (value: { subjects: DistributiveSubject[], workingDayHours: WorkingDayHour[] }) => {
					this.subjects = value.subjects.map((item: DistributiveSubject) => {
						return {
							...item,
							selectedTeacher: '',
							busyHours: 0
						}
					});
					this.maxSubjects = this.subjects.length > 0 ? this.subjects[0].maximumHours : 0;
					// this.teachers = this.getUniqueTeachers(this.subjects);
					// this.buildSchedule(value.workingDayHours);
				}
			});
		}
	}

	public getSubjectsByCycleAndStudyPlanAndCareerAndSection(control: filter, event?: MatSelectChange): void {
		this.subjects = this.teachers = [];
		if (this.getSubjectsSubscription) {
			this.getSubjectsSubscription.unsubscribe();
		}
		const filters: Filter = this.filters;
		this.getSubjectsSubscription = this.adminApi.getSubjectsByCycleAndStudyPlanAndCareerAndSection(filters.studyPlan, filters.career, filters.cycle, filters.period, filters.modality, event?.value || filters.section)
			.subscribe({
				next: (value: DistributiveSubject[]) => {
					this.subjects = value.map((item: DistributiveSubject) => {
						return {
							...item,
							selectedTeacher: '',
							busyHours: 0
						}
					});
					// this.teachers = this.getUniqueTeachers(this.subjects);
					// Setear en un string vacío en el paralelo.
					const filterDependent: FilterDependent = FILTER_DEPENDENTS.find((item) => item.name === control);
					if (filterDependent) {
						if (this.scheduleHasAtLeastOneSubject) {
							this.deleteUserWork();
							this.removeSchedule();
						}
					}
				},
				error: (err: HttpErrorResponse) => {
				}
			});
	}

	public postOrUpdateTemporalSubject(indexSchedule: number, indexDay: number): void {
		const scheduleForm: FormArray = this.scheduleForm;
		const row: ScheduleFormValue = scheduleForm.at(indexSchedule).value as ScheduleFormValue;
		const daysFormArray: FormArray = this.getDaysFormArray(indexSchedule);
		const dayFormGroup: FormGroup = daysFormArray.controls[indexDay] as FormGroup;
		dayFormGroup.patchValue({
			startTime: row.startTime,
			endTime: row.endTime
		});
		const dayValue: DayFormValue = dayFormGroup.value;
		const subject: DistributiveSubject = this.subjects.find((s) => s.courseID === +dayValue.subjectId);
		if (this.postOrUpdateTemporalSubjectScheduleSubscription) this.postOrUpdateTemporalSubjectScheduleSubscription.unsubscribe();
		if (dayValue.temporalId) {
			this.postOrUpdateTemporalSubjectScheduleSubscription = this.adminApi.updateTemporalSubject(dayValue.temporalId, +dayValue.classroom)
				.subscribe({
					next: (value: any) => {
					},
					error: (err: HttpErrorResponse) => {
						this.resetBuildingAndClassRoom(indexSchedule, indexDay, false);
					}
				});
		} else {
			const filters: Filter = this.filters;
			this.postOrUpdateTemporalSubjectScheduleSubscription = this.adminApi.postTemporalSubject(filters, dayValue)
				.subscribe({
					next: (value: TemporalCode) => {
						if (value.codeGenerate === '409') {
							this.removeSubjectAndTeacher(indexSchedule, indexDay);
							this.snackBar.open(
								`Ya existe un registro con los valores que intentas agregar`,
								null,
								{
									duration: 4000,
									verticalPosition: 'bottom',
									horizontalPosition: 'center',
									panelClass: ['warning-snackbar']
								}
							);
							return;
						}
						dayFormGroup.patchValue({
							temporalId: value.codeGenerate
						});
						if (subject) {
							subject.busyHours++;
						}
					},
					error: (err: HttpErrorResponse) => {
						this.removeSubjectAndTeacher(indexSchedule, indexDay);
					}
				});
		}
	}

	// public filterSelectedTeachers(event: number | string): void {
	// 	this.teachers = this.teachers.concat(this.getSelectedTeachers(this.subjects, event));
	// 	this.teachers = this.removeDuplicatedTeachers(this.teachers);
	// }

	public setAvailableTeachers(): void {
		const allTeachersWereSelectedAndEachOneHasAtLeastOneAvailableHour: boolean = this.subjects.length && this.subjects.every((s) => s.hours > 0 && s.selectedTeacher);
		if (!allTeachersWereSelectedAndEachOneHasAtLeastOneAvailableHour) {
			alert('Selecciona los docentes de todas las asignaturas, así como las horas de esas asignaturas.');
			return;
		}
		this.allTeachersWereSelectedAndEachOneHasAtLeastOneAvailableHour = true;
		const selectedTeachers: DistributiveTeacher[] = this.getSelectedTeachers(this.subjects);
		this.teachers = this.removeDuplicatedTeachers(selectedTeachers);
	}
}
