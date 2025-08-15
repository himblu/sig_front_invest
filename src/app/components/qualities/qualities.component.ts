import { Component, Input, OnInit, SecurityContext, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatNativeDateModule, MatOptionSelectionChange } from '@angular/material/core';
import { CommonService } from '@services/common.service';
import { RrhhService } from '@services/rrhh.service';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Course, TimeAvailability } from '@utils/interfaces/campus.interfaces';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '@services/api.service';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { combineLatest, from, map, mergeMap, startWith, Subscription, take } from 'rxjs';
import { SCHEDULE_TYPES } from '@utils/interfaces/others.interfaces';
import { Colaborator, CollaboratorPrev2, EmployeeContract, ExperienceMatter } from '@utils/interfaces/rrhh.interfaces';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Charge, ConsultedStudent, SPGetPerson } from '@utils/interfaces/person.interfaces';
import { AdministrativeService } from '@services/administrative.service';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '@environments/environment';
import { DomSanitizer } from '@angular/platform-browser';

const MAX_FILE_SIZE = 5000000;

@Component({
  selector: 'components-qualities',
  templateUrl: './qualities.component.html',
  styleUrls: ['./qualities.component.scss'],
  providers:[
    DatePipe,
		provideNgxMask()
  ],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    NgFor,
    NgIf,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatStepperModule,
    FormsModule,
    MatCheckboxModule,
		//NgxMaskDirective,
		MatSnackBarModule,
		MatIconModule
  ]
})
export class QualitiesComponent implements OnInit {

	qualitiesForm: FormGroup;
  formTypeCollaborator:FormGroup;
  employeeTypes:any[]=[];
  contractTypes:any[]=[];
  dedications:any[]=[];
  courses:Course[]=[];
  sustantiveFunctions:any[]=[];
  sustantiveFunctionsMain:any[]=[];
  salaryScales:any[]=[];
  categories:any[]=[];
  charges: Charge[]=[];
  positions: any[]=[];
	staff: any[]=[];
	area: any[]=[];
  campus: any[]=[];
	public employeeContract: EmployeeContract;
	public colaborator: CollaboratorPrev2;
	file: File;

  inactive:boolean = false;

  personId:number = 0;
  currentPeriodId:number = 0;
  public formSustantiveFn!: FormGroup;
  public recordForm!: FormGroup;
	max_working_hours:number;
	min_working_hours:number;

	testPattern = {
    S: { pattern: new RegExp('[A-Za-z0-9]') },
  };
  phone = {
    S: { pattern: new RegExp('[+0-9]') },
  };

	private getPdfContentSubscription!: Subscription;
	private snackBar: MatSnackBar = inject(MatSnackBar);
	private sanitizer: DomSanitizer = inject(DomSanitizer);

  constructor(
    private rrhh: RrhhService,
    private fb: FormBuilder,
    private activeRoute: ActivatedRoute,
    private ApiService:ApiService,
    private common: CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
    private router: Router
  ) {
  }


  ngOnInit(): void {
    this.loadCatalog();
    this.activeRoute.params.subscribe({
      next: (data:any) => {
        this.personId = +data.id;
				this.initForm(+data.id);
				setTimeout(() => {
					this.getCollaborator();
					this.getEmployee();
					this.getTeacherSubjects(this.personId);
					this.getTimeAvailability(this.personId);
				}, 250);
      }
    })
  }

  initForm(personID: number= this.personId){
    this.qualitiesForm = this.fb.group({
			employeeContractID: 0,
      branchID:  [null, [Validators.required]],
      areaID:  [null,[Validators.required]],
      positionID:  [null, [Validators.required]],
			typeStaffID:  [null, [Validators.required]],
      employeeContrTypeID:  [null, [Validators.required]],
			nroContract:  [null, [Validators.required]],
      employeeTypeID: [0, [Validators.required]],
			salaryCategoryID:  [0],
      salaryScaleID:  [0],
      dedicationsID:  [0, [Validators.required]],
      personID:  [personID, [Validators.required]],
      initDate: [localStorage.getItem('initDate')],
			endDate: [localStorage.getItem('initDate')],
      salary:  [0, [Validators.required]],
      costHour:  [0],
      totalHours:  [0],
      hoursDedications:  [0, [Validators.required]],
      user : [sessionStorage.getItem('name'), [Validators.required]],
      listAsignatures: ['', [Validators.required]],
      inactive: [false, [Validators.required]],
    });
    this.formTypeCollaborator = this.fb.group({
			typeStaffID:  [null, [Validators.required]],
    });

    this.formSustantiveFn = this.fb.group({
      personID: [personID, [Validators.required]] ,
      scheduleTypeID:  [null, [Validators.required]],
      periodID: [ this.currentPeriodId],
      amount: [null, [Validators.required]],
      user: sessionStorage.getItem('name')
    })
    this.recordForm = this.fb.group({
      dynamics: this.fb.array([])
    })
  }

	public getCollaborator(): void {
		this.rrhh.getCollaboratorPrev2(this.personId, localStorage.getItem('contractDate')).subscribe({
			next: (res) => {
				//console.log(res);
				this.colaborator= res;
			},
      error: (error) => {
        console.log(error);
      }
		});
	}

	public getCharge(staffID: number): void {
		//getCharge
    this.rrhh.getChargeByStaff(staffID).subscribe({
      next: (data: Charge[]) => {
        //console.log('charges', data);
        this.charges = data;
      },
      error: (error) => {
        console.log(error);
      }
    });
	}

	public getEmployeeType(contractTypeID: number): void {
		this.rrhh.getEmployeeTypeByContract(contractTypeID).subscribe({
      next: (data) => {
				//console.log('employeeTypes',data);
        this.employeeTypes = data;
      },
      error: (error) => {
        console.log(error);
      }
    });
	}

  loadCatalog(){
    //getContractType
    this.rrhh.getContractType().subscribe({
      next: (data) => {
        //console.log('contractTypes',data);

        this.contractTypes = data;
      },
      error: (error) => {
        console.log(error);
      }
    });

    //getDedications
    this.rrhh.getDedications().subscribe({
      next: (data) => {
        //console.log('dedications',data);
        this.dedications = data;

      },
      error: (error) => {
        console.log(error);
      }
    });

    //getCourse
    this.rrhh.getCourse().subscribe({
      next: (data) => {
        this.courses = data;
      },
      error: (error) => {
        console.log(error);
      }
    });

    //getSustantiveFunctions
    this.rrhh.getSustantiveFunctions().subscribe({
      next: (data) => {
        this.sustantiveFunctions = data;
        //console.log('this.sustantiveFunctions',this.sustantiveFunctions);

        this.sustantiveFunctionsMain = data;
      },
      error: (error) => {
        console.log(error);
      }
    });

    this.ApiService.getCurrentPeriod().subscribe({
      next: (data) => {
        this.currentPeriodId = data.periodID;
      }
    })

		this.rrhh.getStaff().subscribe({
      next: (resp: any) => {
        //console.log(resp);
        this.staff = resp;
      }
    })

		this.rrhh.getArea().subscribe({
      next: (resp: any) => {
        //console.log(resp);
        this.area = resp;
      }
    })

    this.rrhh.getCampus().subscribe({
      next: (resp: any) => {
        this.campus = resp;
      }
    })
  }


  dedicationChange(dedication: any, event: MatOptionSelectionChange){
    //console.log('ev',ev);
		if(event.isUserInput){
			this.max_working_hours=dedication.totalHours;
			this.min_working_hours=dedication.hoursDedications;
			this.qualitiesForm.get('hoursDedications').setValue(Number(dedication.hoursDedications));
			this.qualitiesForm.get('totalHours').setValue(Number(dedication.totalHours));
			this.dynamicsArr.clear();
			if( dedication.dedicationsID === 3 ){
				//get sustantive functions by id
				this.sustantiveFunctions.forEach((element:any) => {
					if(element.scheduleTypeID === SCHEDULE_TYPES.horas_clases || element.scheduleTypeID === SCHEDULE_TYPES.horas_planificacion || element.scheduleTypeID === SCHEDULE_TYPES.tutorias || element.scheduleTypeID === SCHEDULE_TYPES.horas_adicionales){
						if(element.scheduleTypeID === SCHEDULE_TYPES.horas_clases){
							this.addSustantiveFnTwo(element.scheduleTypeID, dedication.hoursDedications);
						}else{
							this.addSustantiveFnTwo(element.scheduleTypeID, 0);
						}
					}
				})
			}else{
				this.sustantiveFunctions.forEach((element:any) => {
					if(element.scheduleTypeID === SCHEDULE_TYPES.horas_clases){
						this.addSustantiveFnTwo(element.scheduleTypeID, dedication.hoursDedications);
					}else{
						this.addSustantiveFnTwo(element.scheduleTypeID, 0);
					}
				})
			}
		}
  }

  changeTypeContract(eve: number, employeeContrTypeID: number= this.qualitiesForm.get('employeeContrTypeID').value){
    this.categories = [];
    if(employeeContrTypeID === 2){
      this.rrhh.getCategorySalary(eve).subscribe({
        next: (data) => {
          this.categories = data;
        }
      })
    }
  }

  changeCategory(eve: number){
    this.salaryScales = []
    this.rrhh.getScaleSalary(eve).subscribe({
      next: (data) => {
        this.salaryScales = data;
      }
    })
  }

  changeScale(scale: any, event: MatOptionSelectionChange){
    if(event.isUserInput) this.qualitiesForm.get('salary').setValue(Number(scale.salary));
  }


  saveQualities(){
    //console.log(this.qualitiesForm);

		if(this.qualitiesForm.get('typeStaffID').value === 1){
			this.qualitiesForm.get('listAsignatures').setValidators(null);
			this.qualitiesForm.get('listAsignatures').updateValueAndValidity();
		}

    if(this.qualitiesForm.invalid ){
      this.qualitiesForm.markAllAsTouched();
      return;
    }

		if(this.file || this.employeeContract?.urlDocument){
			//this.validateIfFillHoursSustantives();
			//let dataQualities = this.qualitiesForm.value;
			//dataQualities.dedicationsID = (dataQualities.dedicationsID!=0)?dataQualities.dedicationsID.dedicationsID:1;
			//let scaleId = (dataQualities.salaryScaleID!=0)?dataQualities.salaryScaleID.salaryScaleID:9;
			//dataQualities.salaryScaleID = scaleId;
			//salary
			//dataQualities.salary = Number(dataQualities.salary);
			//employeeTypeID
			//dataQualities.employeeTypeID = (dataQualities.employeeTypeID===0)?1:dataQualities.employeeTypeID;
			//console.log(this.qualitiesForm.value)
			this.rrhh.postEmployee(this.qualitiesForm.value).subscribe({
				next: (data:any) => {
					const dynamicsMatter = this.recordForm.getRawValue();
					const objDynamicsMatters:any = []
					dynamicsMatter.dynamics.forEach((element:any) => {
						objDynamicsMatters.push({
							"personID": this.personId,
							"courseID": element,
							"user": sessionStorage.getItem('name')
						})

					})

					if(dynamicsMatter.dynamics.length > 0){
						this.rrhh.postTimeAvailability(dynamicsMatter).subscribe({
							next: (dataPostTime) => {
								// console.log('postTimeAvailability',data);
							}
						})
					}
					const listAsignatures = this.qualitiesForm.get('listAsignatures').value;
					//console.log('listAsignatures',listAsignatures);
					if(Array.isArray(listAsignatures)){
							const objDynamics:any[] = [ ]
							listAsignatures.forEach((element:any) => {
								objDynamics.push({
									"personID": this.personId,
									"courseID": element,
									"user": sessionStorage.getItem('name')
								})
							});
							this.rrhh.postExperienceMatter({"dynamics":objDynamics}).subscribe({
								next: (data) => {
									// console.log('postExperienceMatter',data);
								}
							})
					}
					if(data.length > 0){
						if(data[0].error){
							this.common.message(data[0].message,'','error','#2eb4d8');
						}
					}
					if(!this.employeeContract?.urlDocument) this.submitFile();
					else {
						this.common.message('La información se ha guardado de manera exitosa','','success','#86bc57');
						this.router.navigateByUrl('talento-humano/perfil-docente');
					}
				},
				error: (error) => {
					console.log(error);
					this.common.message('Error al guardar la información','','error','#2eb4d8');
				}
			})
		}else{
			this.snackBar.open(
				`Contrato requerido`,
				null,
				{
					horizontalPosition: 'center',
					verticalPosition: 'top',
					duration: 4000,
					panelClass: ['green-snackbar']
				}
			);
		}
  }

  addSustantiveFn() {
    //console.log('formSustantiveFn', this.formSustantiveFn);

    // if(this.formSustantiveFn.invalid){
    //   this.formSustantiveFn.markAllAsTouched();
    //   return;
    // }
    // let sumHours = 0;
    const numberHours = this.qualitiesForm.get('totalHours').value;
    const form = this.formSustantiveFn.value;
    //console.log('form', form);
    const dynamicsArrControls = this.dynamicsArr.controls;

    if(dynamicsArrControls.length === 0 ){
      if(form.amount < numberHours){
      const record: FormGroup = this.fb.group({
        personID: [this.personId, [Validators.required]],
        scheduleTypeID: [form.scheduleTypeID, [Validators.required]], // funcion sustantiva
        periodID: this.currentPeriodId,
        amount: [form.amount, [Validators.required]],
        user: sessionStorage.getItem('name')
      });
      this.dynamicsArr.push(record);
      this.formSustantiveFn.reset({ personID: this.personId, periodID: this.currentPeriodId, amount:0, user: 'MIGRA' });
      this.sustantiveFunctionsMain = this.sustantiveFunctionsMain.filter(obj => obj.scheduleTypeID !== form.scheduleTypeID);

    }else{
      this.common.message('La suma de las funciones sustantivas no puede ser mayor a las horas totales', '', 'error', '#2eb4d8');
      return;
    }


    }else{
      let sum = dynamicsArrControls.reduce((acc, control) => {
        const amount = control.get('amount').value;
        return acc + Number(amount);
      }, 0);



      sum += Number(form.amount);
      //console.log('sum', sum);
      if (sum > numberHours) {
        this.common.message('La suma de las funciones sustantivas no puede ser mayor a las horas totales', '', 'error', '#2eb4d8');
        return;
      }

      if (this.formSustantiveFn.invalid) {
        this.formSustantiveFn.markAllAsTouched();
        return;
      }

      const record: FormGroup = this.fb.group({
        personID: [this.personId, [Validators.required]],
        scheduleTypeID: [form.scheduleTypeID, [Validators.required]], // funcion sustantiva
        periodID: this.currentPeriodId,
        amount: [form.amount, [Validators.required]],
        user: sessionStorage.getItem('name')
      });

      this.sustantiveFunctionsMain = this.sustantiveFunctionsMain.filter(obj => obj.scheduleTypeID !== form.scheduleTypeID);


      this.dynamicsArr.push(record);
      this.formSustantiveFn.reset({ personID: this.personId, periodID: this.currentPeriodId, amount: 0 , user: sessionStorage.getItem('name')});
    }
    // Assuming dynamicsArr is a FormArray

    // Create an array of observables from the valueChanges of each control

  }


  addSustantiveFnTwo(scheduleTypeID:number, amount:number = 0) {
      const record: FormGroup = this.fb.group({
        personID: [Number(this.personId), [Validators.required]],
        scheduleTypeID: [{value:scheduleTypeID, disabled:true}, [Validators.required]], // funcion sustantiva
        periodID: this.currentPeriodId,
        amount: [amount, [Validators.required]],
        user: sessionStorage.getItem('name')
      });
      this.dynamicsArr.push(record);
  }


  get dynamicsArr(): FormArray {
    return this.recordForm.get('dynamics') as FormArray;
  }

  public deleteDynamic(index: number): void {
    const scheduleTypeID = this.dynamicsArr.controls[index].value.scheduleTypeID;
    const foundObject = this.sustantiveFunctions.find(obj => obj.objectIdToFind === scheduleTypeID);
    this.sustantiveFunctions.push(foundObject);

    this.dynamicsArr.removeAt(index);
  }

  changePersonalType($event:any){
    this.qualitiesForm.get('typeStaffID').setValue($event.value);
  }

  validateIfFillHoursSustantives(){
    const dynamicsArrControls = this.dynamicsArr.controls;
    from(dynamicsArrControls).pipe(
      mergeMap(control => {
        return control.valueChanges.pipe(
          startWith(control.value.amount)
        );
      }),
      take(dynamicsArrControls.length),
      map((amounts: any) => {
        // Extract values from the object
        const values = Object.values(amounts);
        // Use reduce on the array of values
        return values.reduce((acc: any, val: any) => acc + Number(val), 0);
      })
    ).subscribe((sum:any) => {
      if(sum != this.qualitiesForm.get('totalHours').value){
        this.common.message('Debe completar las horas sustantivas', '', 'error','#2eb4d8');
        return;
      }
    });
  }

  blurCostPerHour(eve:any){
    /*if(eve.target.value !== ''){
      this.qualitiesForm.get('salary').setValue(
        Number(eve.target.value)* Number(this.qualitiesForm.get('totalHours').value)*4
      );
    }else{
      this.qualitiesForm.get('salary').setValue(0);
    }*/
  }

  blurAmount(index:number){
    const dynamicsArrControls = this.dynamicsArr.controls;
    const sum = dynamicsArrControls.reduce((acc, control) => {
      let amount = control.get('amount').value;
      return acc + Number(amount);
    }, 0);

    if(sum > this.qualitiesForm.get('totalHours').value){
       this.common.message('La suma de las horas sustantivas no puede ser mayor al total de horas', '', 'error','#2eb4d8');
       dynamicsArrControls[index].get('amount').setValue(0);
       return;
    }

  }

	public onChangeInput(files: FileList, input: HTMLInputElement): void{
		if (files) {
			if(files[0].size > MAX_FILE_SIZE){
				input.value='';
				this.snackBar.open(
          `Máximo 5MB permitido`,
          null,
          {
            horizontalPosition: 'center',
            verticalPosition: 'top',
            duration: 4000,
            panelClass: ['red-snackbar']
          }
        );
			 }else{
				const file: File = files.item(0);
				const fileReader = new FileReader();
				if (file) {
					this.file= file;
				}
			 }
		}
	}

	public submitFile(): void {
		this.rrhh.postCollaboratorDocs(this.file, this.personId, 24, 1).subscribe({
			next: (res) => {
				//console.log(res);
				this.common.message('La información se ha guardado de manera exitosa','','success','#86bc57');
				this.router.navigateByUrl('talento-humano/perfil-docente');
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	public getEmployee(): void {
		this.rrhh.getEmployeeContract(this.personId).subscribe({
      next: (res) => {
				if(res[0]){
					this.employeeContract= res[0];
					this.changePersonalType(this.employeeContract.typeStaffID);
					this.getCharge(this.employeeContract.typeStaffID);
					this.getEmployeeType(this.employeeContract.employeeContrTypeID);
					this.changeTypeContract(this.employeeContract.employeeTypeID, this.employeeContract.employeeContrTypeID);
					this.changeCategory(this.employeeContract.salaryCategoryID);
					this.formTypeCollaborator.get('typeStaffID').patchValue(this.employeeContract.typeStaffID);
					this.qualitiesForm.patchValue(this.employeeContract);
					this.qualitiesForm.get('salary').patchValue(+this.employeeContract.salary);
					//console.log('employeeContract', this.employeeContract);
				}
      },
      error: (error: HttpErrorResponse) => {
        //console.log(error);
      }
    });
	}

	public getTeacherSubjects(personID: number): void{
		this.admin.getTeacherSubjects(personID).subscribe({
			next: (res: ExperienceMatter[]) => {
				//console.log('ExperienceMatter', res);
				let arr= [];
				for(let i=0; i<res.length; i++){
					arr.push(res[i].courseID);
				}
				this.qualitiesForm.get('listAsignatures').patchValue(arr);
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getTimeAvailability(personID: number): void {
		this.admin.getTimeAvailability(this.currentPeriodId, personID).subscribe({
			next: (res: TimeAvailability[]) => {
				//console.log('TimeAvailability', res);
				if(res.length){
					for(let i=0; i<res.length; i++){
						this.addSustantiveFnTwo(res[i].scheduleTypeID, res[i].amount);
					}
				}
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
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

}
