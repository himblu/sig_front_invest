import { Component, inject, OnDestroy, OnInit, Pipe, PipeTransform, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { Instruction as AcademicLevel, Profession } from '@utils/interfaces/enrollment.interface';
import {
  AcademicDegree,
  BasicService,
  CivilStatus,
  HealthType,
  HousingType,
  IncomeExpense,
  Relationship,
  SocioeconomicForm1,
  SocioeconomicForm2,
  SocioeconomicForm3,
  SocioeconomicForm4, SocioeconomicForm5, SocioeconomicForm6, SocioeconomicForm7,
  SocioeconomicInformation,
  Zone
} from '@utils/interfaces/others.interfaces';
import { forkJoin, map, Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { User } from '@utils/models/user.models';
import { AdministrativeService } from '@services/administrative.service';
import { UserService } from '@services/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonService } from '@services/common.service';
import { MatCheckboxChange } from '@angular/material/checkbox';

interface EndpointForm {
  form: number;
  endpoints: Observable<any>[];
}

@Pipe({
  name: 'stepFormGroup',
  standalone: true
})

class StepFormGroupPipe implements PipeTransform {
  transform(form: FormGroup, number: number): FormGroup {
    return form.get(number.toString()) as FormGroup;
  }
}

@Component({
  selector: 'app-socioeconomic-sheet',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatStepperModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSnackBarModule,
    StepFormGroupPipe,
    NgForOf,
    DatePipe,
    NgIf,
    NgxMaskDirective,
    MatIconModule,
    MatTooltipModule
  ],
  providers: [
    provideNgxMask()
  ],
  templateUrl: './socioeconomic-sheet.component.html',
  styleUrls: ['./socioeconomic-sheet.component.css']
})

export class SocioeconomicSheetComponent extends OnDestroyMixin implements OnInit, OnDestroy {
  public user: User;
  public form: FormGroup;
  public academicLevels: AcademicLevel[] = [];
  public professions: Profession[] = [];
  public civilStatuses: CivilStatus[] = [];
  public incomesAndExpenses: IncomeExpense[] = [];
  public academicDegrees: AcademicDegree[] = [];
  public housingTypes: HousingType[] = [];
  public relationships: Relationship[] = [];
  public basicServices: BasicService[] = [];
  public healthTypes: HealthType[] = [];
  public zones: Zone[] = [];
  public socioeconomicInformation: SocioeconomicInformation;
  public infoPerson:any;
  public studentCommitment: boolean = false;

  @ViewChild('stepper', { static: true }) private stepper: MatStepper;
  private sendFormSubscription: Subscription;
  private formBuilder: FormBuilder = inject(FormBuilder);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private snackBar: MatSnackBar = inject(MatSnackBar);
  private router: any = inject(Router);
  private userService: UserService = inject(UserService);
  private adminApi: AdministrativeService = inject(AdministrativeService);
  private common: CommonService = inject(CommonService);
  constructor() {
    super();
    this.user = this.userService.currentUser;
    this.getDataFromResolver();
  }

  public initForm(): void {
    this.form = this.formBuilder.group({
      '1': this.buildFamilyPersonalInformationFormGroup(2),
      '2': this.formBuilder.group({
        relativesWhoDependOnTheSameIncome: this.formBuilder.array([])
      }),
      '3': this.buildLaborDataFormGroup(),
      '4': this.buildFamilyEconomicDataFormGroup(),
      '5': this.buildHousingInformation(),
      '6': this.buildHealthFormGroup(),
      '7': this.buildEducationAndSkillsFormGroup()
    });
    this.addFamilyMemberWhoDependsOnTheSameIncome(false, this.user.userName);
  }

  public ngOnInit(): void {
    this.initForm();
		this.relativesWhoDependOnTheSameIncomeFormArray.removeAt(0);
  }

  private getDataFromResolver(): void {
    this.activatedRoute.data
    .pipe(
    untilComponentDestroyed(this),
    map((value: any) => value['resolver']))
    .subscribe({
      next: (value: {
        incomesAndExpenses: IncomeExpense[]
        academicLevels: AcademicLevel[],
        professions: Profession[],
        civilStatuses: CivilStatus[],
        housingTypes: HousingType[],
        academicDegrees: AcademicDegree[],
        relationships: Relationship[],
        basicServices: BasicService[],
        healthTypes: HealthType[],
        zones: Zone[],
        socioeconomicInformation: SocioeconomicInformation,
        person:any
      }) => {
        this.incomesAndExpenses = value.incomesAndExpenses;
        this.academicLevels = value.academicLevels;
        this.professions = value.professions;
        this.civilStatuses = value.civilStatuses;
        this.housingTypes = value.housingTypes;
        this.academicDegrees = value.academicDegrees;
        this.relationships = value.relationships;
        this.basicServices = value.basicServices;
        this.healthTypes = value.healthTypes;
        this.zones = value.zones;
        this.socioeconomicInformation = value.socioeconomicInformation;
        this.infoPerson = value.person
      },
    });
  }

  public override ngOnDestroy() {
    super.ngOnDestroy();
  }

	public checkClick(event:MatCheckboxChange, aux:number){
		let familyInformation = this.form.get('1').get('familyInformation') as FormArray;
		let father = familyInformation.at(0);
		let mother = familyInformation.at(1);
		if(aux == 1){ //padre
			if(event.checked){
				this.familyPersonalInformation.get('liveWithHisFather').patchValue(1);
				father.get('profession').setValidators([Validators.required]);
				father.get('profession').updateValueAndValidity();
				father.get('academicLevel').setValidators([Validators.required]);
				father.get('academicLevel').updateValueAndValidity();
			}else{
				this.familyPersonalInformation.get('liveWithHisFather').patchValue(0);
				father.get('profession').clearValidators();
				father.get('profession').updateValueAndValidity();
				father.get('academicLevel').clearValidators();
				father.get('academicLevel').updateValueAndValidity();
			}
		}else if(aux == 2){ //madre
			if(event.checked){
				this.familyPersonalInformation.get('liveWithHisMother').patchValue(1)
				mother.get('profession').setValidators([Validators.required]);
				mother.get('profession').updateValueAndValidity();
				mother.get('academicLevel').setValidators([Validators.required]);
				mother.get('academicLevel').updateValueAndValidity();
			}else{
				this.familyPersonalInformation.get('liveWithHisMother').patchValue(0)
				mother.get('profession').clearValidators();
				mother.get('profession').updateValueAndValidity();
				mother.get('academicLevel').clearValidators();
				mother.get('academicLevel').updateValueAndValidity();
			}
		}
	}

  // Formulario 1 => Datos personales del grupo familiar
  private buildFamilyPersonalInformationFormGroup(familyQuantityDataRequired: number = 2): FormGroup {
    const familyPersonalInfoFormGroup: FormGroup = this.formBuilder.group({
      socioeconomicSheet: [this.socioeconomicInformation.socioeconomicSheetID],
      liveWithHisMother: [0, Validators.required],
      liveWithHisFather: [0, Validators.required],
      familyInformation: this.formBuilder.array([])
    });
    const familyInformationFormArray: FormArray = familyPersonalInfoFormGroup.get('familyInformation') as FormArray;
    for (let i = 0; i < 2; i++) {
      const requiredInfoFormGroup = this.formBuilder.group({
        socioeconomicSheet: [this.socioeconomicInformation.socioeconomicSheetID],
        familyMemberNames: ['', Validators.required],
        relationship: [i+1, Validators.required],
        profession: [null],
        academicLevel: [null]
      });
      familyInformationFormArray.push(requiredInfoFormGroup);
    }
    return familyPersonalInfoFormGroup;
  }

  public get familyInformationFormArray(): FormArray {
    return this.form.get('1').get('familyInformation') as FormArray;
  }

  public get familyPersonalInformation() {
    return this.form.get('1');
  }

  // Formulario 2 => Registro del grupo familiar actual y que dependen del mismo ingreso
  // Nombre del formGroup: relativesWhoDependOnTheSameIncome
  // Este formulario es dinámico. El estudiante puede agregar hasta 10 personas que dependen de él/ella.
  // Aquí sólo se cargará un item por defecto. Los demás items tendrán que ser añadidos o removidos por el estudiante.
  // Este formulario debe tener SIEMPRE al menos un item.

  // Para Formulario 2
  public addFamilyMemberWhoDependsOnTheSameIncome(relationshipRequired: boolean = true, familyMemberNames?: string): void {
    const relativesWhoDependOnTheSameIncomeFormArray: FormArray = this.relativesWhoDependOnTheSameIncomeFormArray;
    if (relativesWhoDependOnTheSameIncomeFormArray.length >= 10) {
      this.snackBar.dismiss();
      this.snackBar.open(
        `Puedes agregar información de hasta 10 personas que dependen del mismo ingreso`,
        null,
        {
          duration: 4000,
          verticalPosition: 'top',
          horizontalPosition: 'right',
          panelClass: ['warning-snackbar']
        }
      );
      return;
    }
    const familyMemberInfoFormGroup: FormGroup = this.formBuilder.group({
      socioeconomicSheet: [this.socioeconomicInformation.socioeconomicSheetID],
      familyMemberNames: [{ value: familyMemberNames || '', disabled: familyMemberNames !== undefined }, familyMemberNames ? null : Validators.required],
      relationship: ['', relationshipRequired ? Validators.required : null],
      age: ['', Validators.required],
      civilStatus: ['', Validators.required],
      profession: ['', Validators.required],
      income: ['', Validators.required],
      expense: ['', Validators.required]
    }, {validators: [this.parentsValidator]});
    relativesWhoDependOnTheSameIncomeFormArray.push(familyMemberInfoFormGroup);
  }

  public get relativesWhoDependOnTheSameIncomeFormArray(): FormArray {
    return (this.form.get('2') as FormGroup).get('relativesWhoDependOnTheSameIncome') as FormArray;
  }

  // Para Formulario 2
  public removeFamilyMemberWhoDependsOnTheStudent(index: number): void {
    const relativesWhoDependOnTheSameIncomeFormArray: FormArray = this.relativesWhoDependOnTheSameIncomeFormArray;
    // if (relativesWhoDependOnTheSameIncomeFormArray.length === 1) {
    //   this.snackBar.dismiss();
    //   this.snackBar.open(
    //   `No puedes eliminar tu propio registro`,
    //   null,
    //   {
    //     duration: 4000,
    //     verticalPosition: 'top',
    //     horizontalPosition: 'right',
    //     panelClass: ['warning-snackbar']
    //   }
    //   );
    //   return;
    // }
    relativesWhoDependOnTheSameIncomeFormArray.removeAt(index);
  }

  // Para Formulario 3 => Datos Laborales
  private buildLaborDataFormGroup(): FormGroup {
    const laborDataFormGroup: FormGroup = this.formBuilder.group({
      socioeconomicSheet: [this.socioeconomicInformation.socioeconomicSheetID],
      isEmployed: [false, Validators.required],
      companyName: [{ value: '', disabled: true }],
      companyAddress: [{ value: '', disabled: true }],
      jobTitle: [{ value: '', disabled: true }],
      phone: [{ value: '', disabled: true }],
      workingHours: [{ value: '', disabled: true }],
      serviceTime: [{ value: '', disabled: true }]
    });
    laborDataFormGroup.get('isEmployed').valueChanges.subscribe({
      next: (value: boolean) => {
        // Cada vez que el estudiante interactúa con el control "¿Está actualmente laborando?"
        // Los controles se deshabilitan y se habilitan, además de ser requeridos o no. Dependiendo de la selección.
        for (const controlName in laborDataFormGroup.controls) {
          if (controlName !== 'isEmployed') {
            if (value) {
              laborDataFormGroup.get(controlName).enable();
              laborDataFormGroup.get(controlName).addValidators(Validators.required);
              laborDataFormGroup.get(controlName).updateValueAndValidity();
            } else {
              laborDataFormGroup.get(controlName).patchValue('');
              laborDataFormGroup.get(controlName).disable();
              laborDataFormGroup.get(controlName).clearValidators();
              laborDataFormGroup.get(controlName).updateValueAndValidity();
            }
          }
        }
      }
    });
    return laborDataFormGroup;
  }

  // Para Formulario 4 => Datos económicos familiares
  private buildFamilyEconomicDataFormGroup(): FormGroup {
    const familyEconomicDataFormGroup: FormGroup = this.formBuilder.group({
      incomes: this.formBuilder.array([]),
      expenses: this.formBuilder.array([])
    }, {validator:[this.incomeValidator]});
    const incomesFormArray: FormArray = familyEconomicDataFormGroup.get('incomes') as FormArray;
    const expensesFormArray: FormArray = familyEconomicDataFormGroup.get('expenses') as FormArray;
    this.incomesAndExpenses.map((item: IncomeExpense) => {
      const incomeOrExpenseFormGroup: FormGroup = this.formBuilder.group({
        socioEconomicSheetID: [this.socioeconomicInformation.socioeconomicSheetID],
        name: [item.incomeEgressName],
        incomeEgressID: [item.incomeEgressID],
        mount: ['', Validators.required]
      });
      // Para hacer esta condición, se tienen que filtrar únicamente los INGRESOS y EGRESOS
      // al capturar la información del resolver.
      if (item.incomeEgressTypeName === 'EGRESO') {
        expensesFormArray.push(incomeOrExpenseFormGroup);
      } else {
        incomesFormArray.push(incomeOrExpenseFormGroup);
      }
    });
    return familyEconomicDataFormGroup;
  }

  public get incomesFormArray(): FormArray {
    return this.form.get('4').get('incomes') as FormArray;
  }

  public get expensesFormArray(): FormArray {
    return this.form.get('4').get('expenses') as FormArray;
  }

  // Para Formulario 5 => Información sobre la vivienda
  private buildHousingInformation(): FormGroup {
    return this.formBuilder.group({
      socioeconomicSheet: [this.socioeconomicInformation.socioeconomicSheetID],
      type: ['', Validators.required],
      address: [''],
      zone: ['', Validators.required],
      services: ['', Validators.required],
      numberOfMenLivingThere: ['', Validators.required],
      numberOfWomenLivingThere: ['', Validators.required]
    });
  }

  // Para Formulario 6 => Información sobre salud
  private buildHealthFormGroup(): FormGroup {
    return this.formBuilder.group({
      socioeconomicSheetID: [this.socioeconomicInformation.socioeconomicSheetID],
      healthTypeID: ['', Validators.required],
			numberOfChildren: ['', Validators.required],
      numberOfMen: ['', Validators.required],
      numberOfWomen: ['', Validators.required],
    }, { validators: [this.sumValidator]} );
  }

	public get healthFormGroup() {
    return this.form.get('6');
  }

  // Para Formulario 7 => Educación y Aptitudes
  private buildEducationAndSkillsFormGroup(): FormGroup {
    const educationAndSkillsFormGroup: FormGroup = this.formBuilder.group({
      academicDegree: this.formBuilder.array([])
    });
    const academicDegreeFormArray: FormArray = educationAndSkillsFormGroup.get('academicDegree') as FormArray;
    this.academicDegrees.map((item: AcademicDegree) => {
      const academicDegreeFormGroup: FormGroup = this.formBuilder.group({
        socioeconomicSheetID: [this.socioeconomicInformation.socioeconomicSheetID],
        name: [item.titleTypeName],
        titleTypeID: [item.titleTypeID],
        educationSkillName: ['']
      });
      if(item.isRequired){
        academicDegreeFormGroup.get('educationSkillName').setValidators([Validators.required]);
      }
      academicDegreeFormGroup.get('educationSkillName').updateValueAndValidity();
      academicDegreeFormArray.push(academicDegreeFormGroup);
    });
    return educationAndSkillsFormGroup;
  }

  public get academicDegreeFormArray(): FormArray {
    return this.form.get('7').get('academicDegree') as FormArray;
  }

  sumValidator(control: AbstractControl): ValidationErrors | null {
    const f1Value = control.get('numberOfChildren').value;
    const f2Value = control.get('numberOfMen').value;
    const f3Value = control.get('numberOfWomen').value;

    if (f1Value < f2Value + f3Value) {
      return { sumError: true };
    }

    if(f1Value > f2Value + f3Value){
      return { sumError: true };
    }
    return null;
  }

  parentsValidator(control: AbstractControl): ValidationErrors | null {
    const ageValue = control.get('age').value;
    const income = control.get('income').value;
    const expense = control.get('expense').value;
    if (ageValue > 110 || ageValue < 1) {
      return { ageError: true };
    }

    if(income < expense){
      return { incomeError: true };
    }

    return null;
  }

  incomeValidator(control: AbstractControl): ValidationErrors | null {
    const incomesF = control.get('incomes') as FormArray;
    const expensesF = control.get('expenses') as FormArray;
    let incomes = 0;
    let expenses = 0;
    incomesF.value.forEach((item: any) => {
      incomes += item.mount;
    })
    expensesF.value.forEach((item: any) => {
      expenses += item.mount;
    })
    if(incomes < expenses){
      return { incomeError: true };
    }
    return null;
  }

  public trackByAcademicLevelId(index: number, item: AcademicLevel): number {
    return item.academicInstructionID;
  }

  public trackByProfessionId(index: number, item: Profession): number {
    return item.professionID;
  }

  public trackByCivilStatusId(index: number, item: CivilStatus): number {
    return item.civilStatusID;
  }

  public trackByHousingTypeId(index: number, item: HousingType): number {
    return item.housingTypeID;
  }

  public trackByRelationshipId(index: number, item: Relationship): number {
    return item.relationShipID;
  }

  public trackByBasicServiceId(index: number, item: BasicService): number {
    return item.basicServiceID;
  }

  public trackByHealthTypeId(index: number, item: HealthType): number {
    return item.healthTypeID;
  }

  public trackByZoneId(index: number, item: Zone): number {
    return item.zoneID;
  }

	async postAll() {
		if (this.form.valid) {
			if (this.sendFormSubscription) {
        this.sendFormSubscription.unsubscribe();
      }
			if(!this.studentCommitment){
				this.snackBar.open(
				`Debe aceptar el acuerdo para continuar`,
				null,
				{
					horizontalPosition: 'center',
					verticalPosition: 'top',
					duration: 4000,
					panelClass: ['warning-snackbar']
				});
				return;
			}else{
				await this.sendForm(1);
				await this.sendForm(2);
				await this.sendForm(3);
				await this.sendForm(4);
				await this.sendForm(5);
				await this.sendForm(6);
				await this.sendForm(7);
			}
		}else {
      this.form.markAllAsTouched();
      this.form.markAsDirty();
			this.snackBar.open(
				`Revise que no existan campos vacíos`,
				null,
				{
					horizontalPosition: 'center',
					verticalPosition: 'top',
					duration: 4000,
					panelClass: ['red-snackbar']
				});
    }

	}

  public sendForm(number: number): void {

    const form: FormGroup = this.form.get(number.toString()) as FormGroup;

      const endpointsForm: EndpointForm[] = this.endpointsForm;
      const endpointForm: EndpointForm = endpointsForm.find((item) => item.form === number);
      if (endpointForm) {
        if(number === 7){
          console.log('studentCommitment',this.studentCommitment);

          if(!this.studentCommitment){
              this.snackBar.open(
              `Debe aceptar el acuerdo para continuar`,
              null,
              {
                horizontalPosition: 'center',
                verticalPosition: 'top',
                duration: 4000,
                panelClass: ['warning-snackbar']
              });
              return;
          }
        }
        this.sendFormSubscription = forkJoin(endpointForm.endpoints).subscribe({
          next: (value: any) => {
            if (value) {
              this.snackBar.dismiss();
              /*this.snackBar.open(
              `Formulario Guardado con Éxito`,
              null,
              {
                horizontalPosition: 'center',
                verticalPosition: 'top',
                duration: 4000,
                panelClass: ['green-snackbar']
              });
              this.stepper.next();*/

              if(number === 7){

              let aux = {
                p_personID: +sessionStorage.getItem('id')! || 0,
								p_studentID: +sessionStorage.getItem('studentID')! || 0,
                p_companyID: 1,
                p_processEnrollCode: '02',
                p_state: 1
              }

              let bodyAgree:any =
              {
                socioeconomicSheetID: this.socioeconomicInformation.socioeconomicSheetID,
                agreementMessageID: 1,
                isAgreement: 1,
                p_user: this.infoPerson.firstName + ' ' + this.infoPerson.middleName + ' ' +  this.infoPerson.lastName
              }
              this.common.acceptAgree(bodyAgree).subscribe({
                next: (data:any)=>{
                  this.common.validateStatus(aux)
                .subscribe( {
                  next: (data:any)=>{
										this.snackBar.dismiss();
										this.snackBar.open(
										`Formulario Guardado con Éxito`,
										null,
										{
											horizontalPosition: 'center',
											verticalPosition: 'top',
											duration: 4000,
											panelClass: ['green-snackbar']
										});
                    this.router.navigate(['/matriculacion/carga-de-documentos']);
                  }, error: (err:any)=>{
                    console.log(err);
                  }
                })
                }, error: (err:any)=>{
                  console.log(err);
                }
              })
              }
            }
          },
          error: (err) => {
            console.log('error in ',err);
            if(err.status === 409){
              this.stepper.next();
            }
            // this.snackBar.open(
            //   `Ha ocurrido un error, verifique la información ingresada`,
            //   null,
            //   {
            //     horizontalPosition: 'center',
            //     verticalPosition: 'top',
            //     duration: 4000,
            //     panelClass: ['warning-snackbar']
            //   });
          }
        });
      }
  }

  public get endpointsForm(): EndpointForm[] {
    return [
      {
        form: 1,
        endpoints: [this.adminApi.postSocioeconomicForm1(this.form.get('1').value as SocioeconomicForm1)]
      },
      {
        form: 2,
        endpoints: [this.adminApi.postSocioeconomicForm2(this.form.get('2').getRawValue() as SocioeconomicForm2)]
      },
      {
        form: 3,
        endpoints: [this.adminApi.postSocioeconomicForm3(this.form.get('3').value as SocioeconomicForm3)]
      },
      {
        form: 4,
        endpoints: [this.adminApi.postSocioeconomicForm4(this.form.get('4').value as SocioeconomicForm4)]
      },
      {
        form: 5,
        endpoints: [this.adminApi.postSocioeconomicForm5(this.form.get('5').value as SocioeconomicForm5)]
      },
      {
        form: 6,
        endpoints: [this.adminApi.postSocioeconomicForm6(this.form.get('6').value as SocioeconomicForm6)]
      },
      {
        form: 7,
        endpoints: [this.adminApi.postSocioeconomicForm7(this.form.get('7').value as SocioeconomicForm7)]
      }
    ]
  }
  getDate(){
    const date = new Date();
    const datePipe = new DatePipe('en-US');
    const dateNow = datePipe.transform(date, 'yyyy-MM-dd');
    return dateNow;
  }
  changeStudentCommitment(eve:any){
    this.studentCommitment = eve.checked;
  }

  getFullNamePerson(){
    const { firstName, middleName, lastName  } = this.infoPerson;
    //check thah never value is null or undefined and concat
    return `${firstName || ''} ${middleName || ''} ${lastName || ''}`;
  }

  checkLivingParent(eve:any, type:string, index:number){
    const relation = this.relationships.filter((item:any) => item.relationName === type.toUpperCase())[0];
    if(eve.checked){
      const familyInformationFormArray: FormArray = this.familyInformationFormArray;
      const requiredInfoFormGroup = this.formBuilder.group({
        socioeconomicSheet: [this.socioeconomicInformation.socioeconomicSheetID],
        familyMemberNames: ['', Validators.required],
        relationship: [relation.relationShipID, Validators.required],
        profession: ['', Validators.required],
        academicLevel: ['', Validators.required]
      });
      familyInformationFormArray.push(requiredInfoFormGroup);
    }else{
      const familyInformationFormArray: FormArray = this.familyInformationFormArray;
      familyInformationFormArray.removeAt(1);
    }

  }
}
