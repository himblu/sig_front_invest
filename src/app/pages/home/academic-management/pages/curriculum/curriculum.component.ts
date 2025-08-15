import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { DecimalPipe, JsonPipe, NgForOf, NgIf, NgTemplateOutlet } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { map, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Curriculum, PracticeHour, PracticeUnit, SPGetCareer, Subject, SubjectDependency, Unit } from '@utils/interfaces/campus.interfaces';
import { DndDraggableDirective, DndDropEvent, DndDropzoneDirective } from 'ngx-drag-drop';
import { HoursPerSubjectPipe } from '../../pipes/hours-per-subject.pipe';
import { HoursPerUnitPipe } from '../../pipes/hours-per-unit.pipe';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationComponent } from '../../components/confirmation/confirmation.component';
import { AdministrativeService } from '@services/administrative.service';
import { MatMenuModule } from '@angular/material/menu';
import { FilterSubjectByPeriodPipe } from './pipes/filter-subject-by-period.pipe';
import { OrganizationUnit } from '@utils/interfaces/others.interfaces';
import { PracticeHoursPerUnitPipe } from '../../pipes/practice-hours-per-unit.pipe';
import { PracticeHoursPipe } from '../../pipes/practice-hours.pipe';
import { MatTabsModule } from '@angular/material/tabs';
import { TotalHoursPipe } from '../../pipes/total-hours.pipe';
import { TotalPracticeHoursPipe } from '../../pipes/total-practice-hours.pipe';
import { MatOptionModule } from '@angular/material/core';
import { FilterUnits } from './pipes/filter-units.pipe';
import { FilterSubjectToPracticeHourPipe } from './pipes/filter-subject-to-practice-hour.pipe';
import { CommonService } from '@services/common.service';
import { SubjectsByUnitPipe } from './pipes/subjects-by-unit.pipe';
import { TotalHoursPerUnitByOrganizationUnitPipe } from './pipes/total-hours-per-unit-by-organization-unit.pipe';
import { PercentPipe } from '@angular/common';

const ROMAN_NUMERALS: RomanNumeral[] = [
  { value: 1000, numeral: 'M' },
  { value: 900, numeral: 'CM' },
  { value: 500, numeral: 'D' },
  { value: 400, numeral: 'CD' },
  { value: 100, numeral: 'C' },
  { value: 90, numeral: 'XC' },
  { value: 50, numeral: 'L' },
  { value: 40, numeral: 'XL' },
  { value: 10, numeral: 'X' },
  { value: 9, numeral: 'IX' },
  { value: 5, numeral: 'V' },
  { value: 4, numeral: 'IV' },
  { value: 1, numeral: 'I' }
];

interface RomanNumeral {
  value: number;
  numeral: string;
}

interface Period {
  name: string;
  number: number;
}

interface Resume {
	hourType: 'FF' | 'UH' | 'EH';
	item: string;
}

const RESUME_ITEMS: Resume[] = [
	{
		hourType: 'FF',
		item: 'Horas de actividad con el docente'
	},
	{
		hourType: 'EH',
		item: 'Horas de actividad práctica - experimental'
	},
	{
		hourType: 'UH',
		item: 'Horas de trabajo autónomo'
	}
];

@Component({
  selector: 'app-curriculum',
  standalone: true,
	imports: [
		MatButtonModule,
		MatTableModule,
		NgForOf,
		NgIf,
		ReactiveFormsModule,
		NgTemplateOutlet,
		MatInputModule,
		MatIconModule,
		MatTooltipModule,
		MatRippleModule,
		DndDropzoneDirective,
		DndDraggableDirective,
		HoursPerSubjectPipe,
		HoursPerUnitPipe,
		NgxMaskDirective,
		MatDialogModule,
		MatMenuModule,
		FilterSubjectByPeriodPipe,
		DecimalPipe,
		//JsonPipe,
		PracticeHoursPerUnitPipe,
		PracticeHoursPipe,
		MatTabsModule,
		TotalHoursPipe,
		TotalPracticeHoursPipe,
		MatOptionModule,
		FilterUnits,
		FilterSubjectToPracticeHourPipe,
		SubjectsByUnitPipe,
		TotalHoursPerUnitByOrganizationUnitPipe,
		PercentPipe
	],
  providers: [
    provideNgxMask(),
  ],
  templateUrl: './curriculum.component.html',
  styleUrls: ['./curriculum.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CurriculumComponent extends OnDestroyMixin implements OnInit, OnDestroy {
  public form: FormGroup;
	public resumeItems: Resume[] = RESUME_ITEMS;
  public careerSubjects: Subject[] = [];
  public takenSubjects: Subject[] = [];
  public periods: Period[] = [];
	public currentCareer: SPGetCareer;
	public organizationUnits: OrganizationUnit[] = [];
  public sendFormSubscription: Subscription;
	public updateTakenSubjectsPipe: boolean = false; //Esta asignación es para que el filterSubjectToPracticeHour pipe detecte los cambios.
	public currentMajor: number;
  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private adminApi: AdministrativeService,
    private cdr: ChangeDetectorRef,
		private common: CommonService,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.buildInitialCurriculum();
    this.getDataFromResolver();
		this.currentMajor = +this.activatedRoute.snapshot.paramMap.get('career-course');
  }

  public override ngOnDestroy() {
    super.ngOnDestroy();
  }

  private getDataFromResolver(): void {
    this.activatedRoute.data
      .pipe(
        untilComponentDestroyed(this),
        map((value: any) => value['resolver']))
      .subscribe({
        next: (value: { subjects: Subject[], organizationUnits: OrganizationUnit[], career: SPGetCareer }) => {
          this.careerSubjects = value.subjects;
					this.organizationUnits = value.organizationUnits;
					this.currentCareer = value.career;
					//console.log(this.organizationUnits);
        },
      });
  }

  private buildInitialCurriculum(): void {
    this.initForm();
    this.addUnit();
    this.addPeriod();
		this.addPracticeHour();
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
			name: ['', [Validators.required, Validators.min(1), Validators.max(255)]],
      units: this.formBuilder.array([]),
			practiceHours: this.formBuilder.array([])
    });
  }

	public getRowsOfPracticeHour(practiceHourIndex: number): FormArray {
		const practiceHours: FormArray = this.practiceHoursFormArray;
		return practiceHours.controls[practiceHourIndex].get('rows') as FormArray;
	}

	public newVoidPracticeHourFormGroup(period: number): FormGroup {
		return this.formBuilder.group({
			name: [''], //Es el id de la materia para ese periodo.
			cycle: [period],
			hours: ['']
		});
	}

	public removeRowFromPracticeHour(practiceHourIndex: number): void {
		const practiceHour: FormGroup = this.practiceHoursFormArray.controls[practiceHourIndex] as FormGroup;
		const rows: FormArray = practiceHour.get('rows') as FormArray;
		if (rows.length !== 1) {
			rows.removeAt(rows.length - 1);
			// this.practiceHoursFormArray.removeAt(practiceHourIndex);
		}
	}

  public addUnit(): void { // Pasó
		//if (this.unitsAsFormArray.length < this.organizationUnits.filter((organizationUnit: OrganizationUnit) => organizationUnit.isForPracticeHours === false).length){
			const unit: FormGroup = this.formBuilder.group({
				name: ['', [Validators.required]],
				rows: this.formBuilder.array([])
			});
			this.unitsAsFormArray.push(unit);
			this.addRowToUnit(this.unitsAsFormArray.length - 1);
		//}
  }

	public addPracticeHour(): void {
		const practiceHour: FormGroup = this.formBuilder.group({
			name: ['', [Validators.required]],
			rows: this.formBuilder.array([])
		});
		this.practiceHoursFormArray.push(practiceHour);
		this.addRowToPracticeHour(this.practiceHoursFormArray.length - 1);
	}

	public addRowToUnit(indexUnit: number): void {
		let rows: FormArray = new FormArray<any>([]);
		this.periods.map((p: Period) => {
			const group: FormGroup = this.newVoidSubjectFormGroup(p.number);
			rows.push(group);
		});
		const unit: FormArray = this.unitsAsFormArray;
		const rowFormArray: FormArray = unit.controls[indexUnit].get('rows') as FormArray;
		rowFormArray.push(rows);
  }

	public addRowToPracticeHour(practiceHourIndex: number): void {
		let rows: FormArray = new FormArray<any>([]);
		this.periods.map((p: Period) => {
			const group: FormGroup = this.newVoidPracticeHourFormGroup(p.number);
			rows.push(group);
		});
		const practiceHours: FormArray = this.practiceHoursFormArray;
		const rowFormArray: FormArray = practiceHours.controls[practiceHourIndex].get('rows') as FormArray;
		rowFormArray.push(rows);
	}

  public removeRowFromUnit(indexUnit: number): void {
    const unit: FormGroup = this.unitsAsFormArray.controls[indexUnit] as FormGroup;
    const rows: FormArray = unit.get('rows') as FormArray;
		// TODO: Mejorar esto para eliminar por el índice seleccionado, por el último row.
    const row: FormArray = rows.at(rows.length - 1) as FormArray;
    row.controls.forEach((subjectFormControl) => {
      const subjectValue = subjectFormControl.value as Subject;
      // Si tiene un ID, ese elemento lo vamos a regresar a la lista de Materias disponibles.
      if (subjectValue.courseID) {
        const indexSubject = this.takenSubjects.findIndex((s) => s.courseID === subjectValue.courseID);
        if (indexSubject !== -1) {
          this.takenSubjects[indexSubject].cycle = 0; // Se coloca en cero antes de regresarlo a las materias disponibles.
          this.careerSubjects.push(this.takenSubjects[indexSubject]);
          this.takenSubjects.splice(indexSubject, 1);
        }
      }
    });
    // Si solo hay un row en esa unidad, se elimina la unidad completa.
    if (rows.length === 1) {
      this.unitsAsFormArray.removeAt(indexUnit);
    }
    rows.removeAt(rows.length - 1);
  }

  // indexUnit: Unidad de Organización
  // indexRow: Columna o Periodo
  // indexSingleRow: Fila de la tabla de Unidad de Organización (Es como una sub-tabla)
  // indexItem: Index del subject. Sirve para hacer el splice (eliminar de la lista de las materias disponibles).
  public addSubject(indexUnit: number, indexRow: number, indexSingleRow: number, subject: Subject, indexItem: number): void { // Pasó
    // El indexRow se puede usar para el periodo.
    const subjectFormGroup: FormGroup = this.formBuilder.group({
      courseID: [subject.courseID, Validators.compose([Validators.required])],
      courseName: [subject.courseName, Validators.compose([Validators.required])],
      cycle: [(indexSingleRow + 1), Validators.required], // Periodo
      // credits: [subject.credits, Validators.compose([Validators.required, Validators.min(0)])],
      experimentalHours: [subject.experimentalHours, Validators.compose([Validators.required, Validators.min(0)])],
      faceToFaceHours: [subject.faceToFaceHours, Validators.compose([Validators.required, Validators.min(0)])],
      unsupervisedHours: [subject.unsupervisedHours, Validators.compose([Validators.required, Validators.min(0)])],
      background: [subject.background],
      color: [subject.color],
      depends: this.formBuilder.array([])
    });

    const rows: FormArray = this.getRowsOfUnit(indexUnit);
    const row: FormArray = rows.controls.at(indexRow) as FormArray;
    row.setControl(indexSingleRow, subjectFormGroup);
    const subjectToBeRemoved: Subject = this.careerSubjects[indexItem];
    subjectToBeRemoved.cycle = indexSingleRow + 1; // Aquí se le agrega el periodo al que se asignó, para luego filtrarlo para las dependencias.
    this.takenSubjects.push(subjectToBeRemoved);
    this.careerSubjects.splice(indexItem, 1);
		// FIXME: Buscar una mejor forma para solucionar esto.
		this.updateTakenSubjectsPipe = !this.updateTakenSubjectsPipe; //Esta asignación es para que el filterSubjectToPracticeHour pipe detecte los cambios
		//y así evitar el uso de pipes impuros. El detector de cambios no funcionó para este caso.
  }


  // indexRow es el mismo que el index del periodo
  public removeSubject(indexUnit: number, indexRow: number, indexSingleRow: number): void {
    const config: MatDialogConfig = new MatDialogConfig();
    config.id = 'removeSubjectConfirmationDialog';
    config.autoFocus = false;
    config.minWidth = '200px';
    config.maxWidth = '600px';
    config.panelClass = 'transparent-panel';
    config.data = {
      message: '¿Estás seguro de eliminar esta materia? Se eliminará de la malla, pero seguirá estando disponible en la lista de Materias.'
    }
    const dialog = this.dialog.open(ConfirmationComponent, config);
    dialog.afterClosed()
      .pipe(untilComponentDestroyed(this))
      .subscribe((res) => {
        if (res) {
          const unitRows: FormArray = this.getRowsOfUnit(indexUnit);
          const unitRow: FormArray = unitRows.controls.at(indexRow) as FormArray;
          const subjectValue = unitRow.controls.at(indexSingleRow).value as Subject;
          const indexSubject = this.takenSubjects.findIndex((s) => s.courseID === subjectValue.courseID);
          // console.log(indexSubject, this.takenSubjects);
          if (indexSubject !== -1) {
						const takenSubjectToBeRemoved: Subject = this.takenSubjects[indexSubject];
            this.removeSubjectFromDependencies(subjectValue);
						const practiceHoursValue: PracticeUnit[] = this.practiceHoursFormArray.value;
						practiceHoursValue.forEach((practiceUnit: PracticeUnit, indexPracticeUnit: number, array: PracticeUnit[]) => {
							practiceUnit.rows.forEach((practiceHours: PracticeHour[], indexPracticeHours: number, array: PracticeHour[][]) => {
								practiceHours.forEach((practiceHour: PracticeHour, indexPracticeHour: number, array: PracticeHour[]) => {
									if (practiceHour.name === takenSubjectToBeRemoved.courseID) {
										const singleItemOfPracticeHour = this.getSingleItemOfPracticeHour(indexPracticeUnit, indexPracticeHours, indexPracticeHour);
										singleItemOfPracticeHour.patchValue({
											name: null
										});
										singleItemOfPracticeHour.updateValueAndValidity();
										this.updateTakenSubjectsPipe = !this.updateTakenSubjectsPipe;
									}
								});
							});
						});
            this.removeSubjectFromDependencies(subjectValue);
            this.takenSubjects[indexSubject].cycle = 0; // Se coloca en cero antes de regresarlo a las materias disponibles.
            this.careerSubjects.push(this.takenSubjects[indexSubject]);
            this.takenSubjects.splice(indexSubject, 1);
            // console.log(this.careerSubjects);
            unitRow.setControl(indexSingleRow, this.newVoidSubjectFormGroup(indexRow + 1));
            this.cdr.detectChanges();
          }
        }
    });
  }

  // Al momento de eliminar una materia (que puede ser o no dependiente de otras),
  // Verifica que, si hay dependencia de ella, se elimine dicha dependencia.
  public removeSubjectFromDependencies(subject: Subject): void {
    this.unitsAsFormArray.controls.map((control, index) => {
      const rows: FormArray = control.get('rows') as FormArray;
      rows.controls.forEach((rowFormArray) => {
        const row: FormArray = rowFormArray as FormArray;
        row.controls.forEach((element, index) => {
          const subjectFormGroup: FormGroup = element as FormGroup;
          const dependenciesFormArray: FormArray = subjectFormGroup.get('depends') as FormArray;
          const dependencies: SubjectDependency[] = dependenciesFormArray.value as SubjectDependency[];
          //console.log(dependencies);
          const indexDependency = dependencies.findIndex((d) => d.id === subject.courseID);
          if (indexDependency !== -1) {
            dependenciesFormArray.removeAt(indexDependency);
          }
        });
      });
    });
  }

  // Es básicamente agregar una columna en blanco.
  // Esa columna representa materias.
  public addPeriod(): void { // Pasó
    const periodsLength = this.periods.length;
    const periodRomanNumeral = this.intToRoman(periodsLength + 1);
    const period: Period = {
      name: `PERIODO ${periodRomanNumeral}`,
      number: periodsLength + 1
    };
    this.periods.push(period);
    this.unitsAsFormArray.controls.map((control: AbstractControl) => {
      const rows: FormArray = control.get('rows') as FormArray;
      rows.controls.map((rowFormArray) => {
        const group: FormGroup = this.newVoidSubjectFormGroup(period.number);
        const row: FormArray = rowFormArray as FormArray;
        row.push(group);
      });
    });
		this.practiceHoursFormArray.controls.map((control: AbstractControl) => {
			const rows: FormArray = control.get('rows') as FormArray;
			rows.controls.map((rowFormArray) => {
				const group: FormGroup = this.newVoidPracticeHourFormGroup(period.number);
				const row: FormArray = rowFormArray as FormArray;
				row.push(group);
			});
		});
		// console.log(this.form.value);
		// const practiceHours: FormArray = this.practiceHoursFormArray;
		// const rowFormArray: FormArray = practiceHours.controls[practiceHourIndex].get('rows') as FormArray;
		// this.periods.map((p: Period) => {
		// 	const group: FormGroup = this.newVoidPracticeHourFormGroup(p.number);
		// 	rowFormArray.push(group);
		// });
		// console.log(this.form);
  }

  public removePeriod(): void { // Pasó
    this.unitsAsFormArray.controls.map((control, index) => {
      const rows: FormArray = control.get('rows') as FormArray;
      rows.controls.forEach((rowFormArray) => {
        const row: FormArray = rowFormArray as FormArray;
        row.controls.forEach((element, index) => {
          // El index es básicamente el mismo número de Periodos.
          // Aquí nos aseguramos de solo evaluar el último item de cada row.
          if (index === this.periods.length - 1) {
            const subjectValue = element.value as Subject;
            // Si tiene un ID, ese elemento lo vamos a regresar a la lista de Materias disponibles.
            if (subjectValue.courseID) {
              const indexSubject = this.takenSubjects.findIndex((s) => s.courseID === subjectValue.courseID);
              if (indexSubject !== -1) {
                this.takenSubjects[indexSubject].cycle = 0; // Se coloca en cero antes de regresarlo a las materias disponibles.
                this.careerSubjects.push(this.takenSubjects[indexSubject]);
                this.takenSubjects.splice(indexSubject, 1);
              }
            }
          }
        });
        row.removeAt(row.length - 1);
      });
    });
    this.periods.pop();
  }

  public newVoidSubjectFormGroup(period: number): FormGroup { // Returns an empty subject formGroup
    return this.formBuilder.group({
      courseName: [''],
      courseID: [0],
      cycle: [period],
      // credits: [''],
      experimentalHours: [''],
      faceToFaceHours: [''],
      unsupervisedHours: [''],
      depends: this.formBuilder.array([])
    });
  }

  public getRowsOfUnit(indexUnit: number): FormArray {
    return (this.form.get('units') as FormArray).controls[indexUnit].get('rows') as FormArray;
  }

  public getSingleItemOfUnit(indexUnit: number, indexRow: number, indexSingleRow: number): FormGroup {
    const rows: FormArray = (this.form.get('units') as FormArray).controls[indexUnit].get('rows') as FormArray;
    const row: FormArray = rows.controls.at(indexRow) as FormArray;
    return row.at(indexSingleRow) as FormGroup;
  }

	public getSingleItemOfPracticeHour(indexPracticeHour: number, indexRow: number, indexSingleRow: number): FormGroup {
    const rows: FormArray = (this.form.get('practiceHours') as FormArray).controls[indexPracticeHour].get('rows') as FormArray;
    const row: FormArray = rows.controls.at(indexRow) as FormArray;
    return row.at(indexSingleRow) as FormGroup;
  }

  public trackByPeriod(index: number, period: Period): number {
    return period.number;
  }

  public addSubjectDependency(indexUnit: number, indexRow: number, indexSingleRow: number, subject: Subject): void {
    // console.log(subject);
    const rows: FormArray = this.getRowsOfUnit(indexUnit);
    const row: FormArray = rows.controls.at(indexRow) as FormArray;
    const subjectFormGroup: FormGroup = row.controls.at(indexSingleRow) as FormGroup;
    const dependenciesFormArray: FormArray = subjectFormGroup.get('depends') as FormArray;
    // const dependencies: SubjectDependency[] = dependenciesFormArray.value as SubjectDependency[];

    const newDependencyFormGroup: FormGroup = this.createDependencyFormGroup(subject);
    dependenciesFormArray.push(newDependencyFormGroup);
    // this.cdr.detectChanges();
  }

  public getSubjectDependencies(indexUnit: number, indexRow: number, indexSingleRow: number): SubjectDependency[] {
    const rows: FormArray = (this.form.get('units') as FormArray).controls[indexUnit].get('rows') as FormArray;
    const row: FormArray = rows.controls.at(indexRow) as FormArray;
    return row.at(indexSingleRow).get('depends').value as SubjectDependency[];
  }

  private createDependencyFormGroup(subject: Subject): FormGroup {
    return this.formBuilder.group({
      id: [subject.courseID],
      name: [subject.courseName],
      background: [subject.background],
      color: [subject.color]
    });
  }

  public get unitsAsFormArray(): FormArray {
    return this.form.get('units') as FormArray;
  }

	public get practiceHoursFormArray(): FormArray {
		return this.form.get('practiceHours') as FormArray;
	}

  private intToRoman(num: number): string {
    const romanNumerals: RomanNumeral[] = ROMAN_NUMERALS;
    let result: string = '';
    for (const { value, numeral } of romanNumerals) {
      while (num >= value) {
        result += numeral;
        num -= value;
      }
    }
    return result;
  }

  public trackBySubjectId(index: number, item: Subject): number {
    return item.courseID;
  }

  public onDrop(event: DndDropEvent, indexUnit: number, indexRow: number, indexSingleRow: number): void {
    const { subject, indexItem } = event.data; // El index pertenece al course
    if (subject) {
      this.addSubject(indexUnit, indexRow, indexSingleRow, subject, indexItem);
			//console.log('onDrop');
    }
  }

  public sendForm(): void {
		//console.log(this.form.value);
    if (this.form.valid) {
      const config: MatDialogConfig = new MatDialogConfig();
      config.id = 'createCurriculumConfirmationDialog';
      config.autoFocus = false;
      config.minWidth = '200px';
      config.maxWidth = '600px';
      config.panelClass = 'transparent-panel';
      config.data = {
        message: 'Esta malla será creada. Una vez creada, no podrás hacer modificaciones. ¿Estás seguro de crearla ahora?'
      }
      const dialog = this.dialog.open(ConfirmationComponent, config);
      dialog.afterClosed()
      .pipe(untilComponentDestroyed(this))
      .subscribe((res) => {
        if (res) {
          this.form.disable({ emitEvent: false });
          if (this.sendFormSubscription) {
            this.sendFormSubscription.unsubscribe();
          }
          const curriculum: Curriculum = Object.assign(this.form.getRawValue() as Curriculum);
          this.sendFormSubscription = this.adminApi.postCurriculum(curriculum, this.currentMajor).subscribe({
            next: (value:any) => {
              //console.warn('Éxito');
							this.common.message(`${value.message}`,'','success','#86bc57');
            },
            error: () => {
              this.form.enable({ emitEvent: false });
            }
          });
        }
      });
    } else {
      this.form.markAllAsTouched();
      this.form.markAsDirty();
    }
  }

  public removeDependency(indexUnit: number, indexRow: number, indexSingleRow: number, indexDependency: number): void {
    const rows: FormArray = this.getRowsOfUnit(indexUnit);
    const row: FormArray = rows.controls.at(indexRow) as FormArray;
    const subjectFormGroup: FormGroup = row.controls.at(indexSingleRow) as FormGroup;
    const dependenciesFormArray: FormArray = subjectFormGroup.get('depends') as FormArray;
    dependenciesFormArray.removeAt(indexDependency);
  }

	/*public manageRequiredField(indexUnit: number, indexRow: number, indexSingleRow: number): void {
		// console.log(indexUnit, indexRow, indexSingleRow);
		const item: FormGroup = this.getSingleItemOfPracticeHour(indexUnit, indexRow, indexSingleRow);
		if (item) {
			const value: PracticeHour = item.value as PracticeHour;
			if (+value.hours > 0 || value.name.trim() !== '') {
				console.log('REQUERIDOS');
				// If either hours or name is modified, make both fields required
				item.get('hours')?.setValidators([Validators.required]);
				item.get('name')?.setValidators([Validators.required]);
				item.markAllAsTouched();
				item.markAsDirty();
			} else {
				console.log('NO REQUERIDOS');
				// If both fields are empty, remove the required validators
				item.get('hours')?.clearValidators();
				item.get('name')?.clearValidators();
				item.markAsUntouched();
				item.markAsPristine();
			}

			item.get('hours')?.updateValueAndValidity();
			item.get('name')?.updateValueAndValidity();

			// console.log(item.errors);
		}
	}*/
}
