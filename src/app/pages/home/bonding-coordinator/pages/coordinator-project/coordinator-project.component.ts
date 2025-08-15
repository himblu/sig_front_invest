import { Component, ViewChild, ElementRef, OnInit, OnDestroy, SecurityContext, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { formatDate, NgForOf, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule, MatOption, MatOptionSelectionChange } from '@angular/material/core';
import { UserService } from '@services/user.service';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MatStepperModule } from '@angular/material/stepper';
import { MatStepper } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Canton, CurrentPeriod, Parish, Province } from '@utils/interfaces/others.interfaces';
import { CareerAgreement, CycleDetail, ListStudent, ListTeacher, ParallelList, Project, ProjectTypes, ProjectTypesMeasurement } from '@utils/interfaces/campus.interfaces';
import { DatePipe } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { CreateNewImpactComponent } from '../../components/create-new-impact/create-new-impact.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-coordinator-project',
  standalone: true,
  imports: [
		NgIf,
		NgForOf,
		ReactiveFormsModule,
		MatInputModule,
		MatButtonModule,
		MatFormFieldModule,
		MatSelectModule,
		MatTooltipModule,
		MatIconModule,
		MatNativeDateModule,
		MatMenuModule,
		MatStepperModule,
		MatDatepickerModule,
		FormsModule,
		MatDialogModule,
		MatSnackBarModule,
		MatAutocompleteModule
	],
	providers: [
		DatePipe
	],
  templateUrl: './coordinator-project.component.html',
  styleUrls: ['./coordinator-project.component.scss']
})
export class CoordinatorProjectComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	loading: boolean = false;
	public isLinear = false;
	public firstFormGroup!: FormGroup;
	public secondFormGroup!: FormGroup;
	public projectTypesFormGroup!: FormGroup;
	public objetivesFormGroup!: FormGroup;
	public currentPeriod: CurrentPeriod;
	public provinces: Province[] = [];
  public cantons: Canton[] = [];
  public parishes: Parish[] = [];
	public studentsList: ParallelList[] = [];
	public teachersList: ListTeacher[] = [];
	public currentProject: Project;
	public projectTypes: ProjectTypes[] = [];
	public projectTypeMeasurement: ProjectTypesMeasurement[] = [];
	public CycleDetail: CycleDetail[]= [];
	public careerAgreements: CareerAgreement[] = [];

	private snackBar: MatSnackBar = inject(MatSnackBar);
	private dialog: MatDialog = inject(MatDialog);

	constructor(private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService,
		private router: Router,
		private activeRoute: ActivatedRoute,
		private datePipe: DatePipe){
		super();
		this.initFirstFormGroup();
		this.initSecondFormGroup();
		this.initProjectTypesFormGroup();
		this.initObjetivesFormGroup();
	}

	ngOnInit(): void {
		this.getCurrentPeriod();
		this.getProvinces();
		this.activeRoute.params.subscribe({
      next: (data: any) => {
				if(data.id){
					this.firstFormGroup.get('p_schoolID').patchValue(+data.schoolID);
					this.firstFormGroup.get('p_careerID').patchValue(+data.careerID);
					this.firstFormGroup.get('p_modalityID').patchValue(+data.modalityID);
					this.firstFormGroup.get('p_studyPlanID').patchValue(+data.studyPlanID);
					this.getProject(data.id, data.careerID, data.studyPlanID);
					this.getProjectType();
					this.getProjectTypeMeasurement();
				}else{
					this.router.navigateByUrl('/vinculacion-coordinador/lista-proyectos');
				}
      }
    });
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	private initFirstFormGroup(): void {
		this.firstFormGroup= this.fb.group({
			nameProyect: ['', Validators.required],
			p_cycleID: ['', Validators.required],
			p_projectPracticasID: ['', Validators.required],
			p_provinceID: ['', Validators.required],
			p_cantonID: ['', Validators.required],
			p_parishID: ['', Validators.required],
			p_budgeted: ['', Validators.required],
			p_periodID: ['', Validators.required],
			p_generalObjective: ['', Validators.required],
			p_aportITCA: ['', Validators.required],
			p_otherAports: ['', Validators.required],
			total: ['', [Validators.required, Validators.max(100)]],
			p_justification: ['', Validators.required],
			p_metedologies: ['', Validators.required],
			p_vulnerableGroups: [''],
			p_vulnerableContexts: [''],
			initdateEstimated: '',
			enddateEstimated: '',
			p_projectPracInformativeDesc: ['', Validators.required],
			p_projectPracticeHours: ['', Validators.required],
			coursesOfPractice: ['', Validators.required],
			p_schoolID: ['', Validators.required],
			p_careerID: ['', Validators.required],
			p_modalityID: ['', Validators.required],
			p_studyPlanID: ['', Validators.required],
			p_user: this.user.currentUser.userName
		})
	}

	private initSecondFormGroup(): void {
		this.secondFormGroup= this.fb.group({
			search: '',
			studentsList: this.fb.array([]),
			teachersList: ['', Validators.required],
			tutorsList: this.fb.array([]),
			studentsNumber: [0],
			teachersNumber: [0],
		})
	}

	public getSecondGroupArray(control: string): FormArray {
		return this.secondFormGroup.controls[control] as FormArray;
	}

	public deleteSecondGroupArray(control: string, i: number): void {
		this.getSecondGroupArray(control).removeAt(i);
	}

	public addStudentsControl(item: ParallelList) {
    this.getSecondGroupArray('studentsList').push(this.studentsRow(item));
	}

	public addTutorsControl() {
    this.getSecondGroupArray('tutorsList').push(this.tutorsRow());
	}

	public studentsRow(item: ParallelList): FormGroup {
    return this.fb.group({
			parallel: item,
			projectPracInformativeID: '',
			studentID: [[], Validators.required],
			tutorTeacherID: '',
		});
	}

	public tutorsRow(): FormGroup {
    return this.fb.group({
			projectPracInformativeID: '',
			teacherID: ['', Validators.required],
			isTutor: true,
		});
	}

	public setTeacherID(event: MatOptionSelectionChange, i: number, teacherID: number): void {
		if(event.isUserInput){
			let list = this.getSecondGroupArray('studentsList').controls[i];
			list.get('tutorTeacherID').patchValue(teacherID);
			list.updateValueAndValidity();
		}
	}

	public selectStudentByParallel(item: ParallelList, i: number, parallelsListDiv?: HTMLDivElement): void {
		let studentsList = this.getSecondGroupArray('studentsList').controls[i];
		let parallel = this.studentsList.filter((parallel: ParallelList) => parallel.parallelCode === item.parallelCode);
		let arr= [];
		studentsList.get('studentID').patchValue([]);
		for(let index=0; index<parallel[0].students.length; index++){
			arr.push(parallel[0].students[index].studentID);
		}
		if(parallelsListDiv) parallelsListDiv.style.display = "none";
		studentsList.get('studentID').patchValue(arr);
		//this.getStudentsHours();
	}

	public disableStudentsList(event: MatOptionSelectionChange, i: number, select: MatSelect, option: MatOption): void {
		if(event.isUserInput){
			const studentsList= this.getSecondGroupArray('studentsList').value;
			if(studentsList.length === 1) {
				this.snackBar.open(
					`Al menos debe seleccionar un paralelo`,
					null,
					{
						horizontalPosition: 'center',
						verticalPosition: 'top',
						duration: 4000,
						panelClass: ['red-snackbar']
					}
				);
				//console.log(this.getSecondGroupArray('studentsList').controls[i].value);
				let list = this.getSecondGroupArray('studentsList').controls[i];
				list.get('studentID').patchValue([]);
				option.deselect();
				select.close();
			}
			else{
				select.close();
				Swal.fire({
					icon: 'question',
					title: ``,
					text: `¿Está seguro de excluir el paralelo?`,
					showCancelButton: true,
					confirmButtonText: "Si",
					cancelButtonText: "No",
					allowOutsideClick: false,
				}).then(result => {
					if(result.value){
						this.deleteSecondGroupArray('studentsList', i);
						this.deleteSecondGroupArray('tutorsList', i);
					}else{
						let list = this.getSecondGroupArray('studentsList').controls[i];
						list.get('studentID').patchValue([]);
						option.deselect();
					}
				});
			}
		}
	}

	private initProjectTypesFormGroup(): void {
		this.projectTypesFormGroup= this.fb.group({
			types: this.fb.array([
				this.fb.group({
					projectPracticasID: '',
					projectTypeProcessID: 6,
					projectTypeImpactID: ['', Validators.required],
					projectPracInformativeID: '',
					measurementID: ['', Validators.required],
					userCreated: this.user.currentUser.userName
				})
			])
		});
	}

	private typesRow(): FormGroup {
		return this.fb.group({
			projectPracticasID: '',
			projectTypeProcessID: 6,
			projectTypeImpactID: ['', Validators.required],
			projectPracInformativeID: '',
			measurementID: ['', Validators.required],
			userCreated: this.user.currentUser.userName
		})
	}

	public getTypesRow(): FormArray {
		return (this.projectTypesFormGroup.controls['types'] as FormArray);
	}

	public addTypesRow(): void {
		this.getTypesRow().push(this.typesRow());
	}

	public deleteTypesRow(i: number): void {
		if (this.getTypesRow().length > 1) this.getTypesRow().removeAt(i);
	}

	private initObjetivesFormGroup(): void {
		this.objetivesFormGroup= this.fb.group({
			objetives: this.fb.array([
				this.fb.group({
					p_projectPracticasID: '',
					p_projectPracInformativeID: '',
					p_specificDescription: ['', Validators.required],
					p_user: this.user.currentUser.userName
				}),
				this.fb.group({
					p_projectPracticasID: '',
					p_projectPracInformativeID: '',
					p_specificDescription: ['', Validators.required],
					p_user: this.user.currentUser.userName
				}),
				this.fb.group({
					p_projectPracticasID: '',
					p_projectPracInformativeID: '',
					p_specificDescription: ['', Validators.required],
					p_user: this.user.currentUser.userName
				}),
			])
		});
	}

	private objetivesRow(): FormGroup {
		return this.fb.group({
			p_projectPracticasID: '',
			p_projectPracInformativeID: '',
			p_specificDescription: ['', Validators.required],
			p_user: this.user.currentUser.userName
		})
	}

	public getObjetivesRow(): FormArray {
		return (this.objetivesFormGroup.controls['objetives'] as FormArray);
	}

	public addObjetivesRow(): void {
		if (this.getObjetivesRow().length < 4) this.getObjetivesRow().push(this.objetivesRow());
	}

	public deleteObjetivesRow(i: number): void {
		if (this.getObjetivesRow().length > 1) this.getObjetivesRow().removeAt(i);
	}

	private async getProvinces() {
		this.provinces = await this.common.cargaCombo(6).toPromise();
	}

	public async getCantons() {
		this.cantons = await this.common.getCantonByProvince(7, this.firstFormGroup.get('p_provinceID').value).toPromise();
	}

	public async getParishesByCanton() {
    this.parishes = await this.common.getParishByCanton(8, this.firstFormGroup.get('p_cantonID').value).toPromise();
  }

	public patchTotal(): void {
		let total= (+this.firstFormGroup.get('p_aportITCA').value) + (+this.firstFormGroup.get('p_otherAports').value);
		this.firstFormGroup.get('total').patchValue(+total);
		this.firstFormGroup.get('total').markAsTouched();
	}

	private getCurrentPeriod(): void{
		this.api.getCurrentPeriod().subscribe({
			next: (res: CurrentPeriod) => {
					this.currentPeriod= res;
					this.firstFormGroup.get('p_periodID').patchValue(res.periodID);
					this.loading = false;
			},
			error: (err: HttpErrorResponse) => {
					this.loading = false;
			}
		});
	}

	/* public getStudentsHours(): void {
		let arr= this.secondFormGroup.get('studentsList').value;
		this.secondFormGroup.get('studentsNumber').patchValue(arr.length);
	} */

	public getTeachersHours(): void {
		let arr= this.secondFormGroup.get('teachersList').value;
		this.secondFormGroup.get('teachersNumber').patchValue(arr.length);
	}

	public getListStudent(): void {
		this.loading = true;
		this.studentsList= null;
		this.getSecondGroupArray('studentsList').clear();
		let filters= this.firstFormGroup.value;
		this.admin.getListStudent(this.currentProject.periodID, this.currentProject.modalityID, this.firstFormGroup.get('p_studyPlanID').value,
			this.firstFormGroup.get('p_careerID').value, filters.p_cycleID, this.secondFormGroup.get('search').value).subscribe({
			next: (res: ParallelList[]) => {
				//console.log('ListStudent', res);
				this.studentsList= res;
				for(let i=0; i<res.length; i++){
					this.addStudentsControl(res[i]);
					this.addTutorsControl();
				}
				this.loading = false;
			},
			error: (err: HttpErrorResponse) => {
				this.loading = false;
			}
		});
	}

	public getListTeacher(): void {
		this.admin.getListTeacher(this.currentProject.periodID, this.currentProject.schoolID).subscribe({
			next: (res: ListTeacher[]) => {
				//console.log('ListTeacher', res);
				this.teachersList= res;
			},
			error: (err: HttpErrorResponse) => {
				this.loading = false;
			}
		});
	}

	private getProjectType(): void {
		this.admin.getProjectType().subscribe({
			next: (res) => {
				//console.log('ProjectType', res);
				this.projectTypes= res;
			},
			error: (err: HttpErrorResponse) => {
				this.loading = false;
			}
		});
	}

	private getProjectTypeMeasurement(): void {
		this.admin.getProjectTypeMeasurement().subscribe({
			next: (res) => {
				//console.log('ProjectTypeMeasurement', res);
				this.projectTypeMeasurement= res;
			},
			error: (err: HttpErrorResponse) => {
				this.loading = false;
			}
		});
	}

	private getProject(projectPracticasID: number, careerID: number, studyPlanID: number): void {
		this.loading = true;
		this.admin.getProjectByID(projectPracticasID).subscribe({
			next: (res) => {
				//console.log('project', res);
				this.firstFormGroup.get('nameProyect').patchValue(res[0].nameProyect);
				this.firstFormGroup.get('initdateEstimated').patchValue(formatDate(res[0].initdateEstimated, 'yyyy-MM-dd', 'es'));
				this.firstFormGroup.get('enddateEstimated').patchValue(formatDate(res[0].enddateEstimated, 'yyyy-MM-dd', 'es'));
				this.firstFormGroup.get('p_projectPracticasID').patchValue(res[0].projectPracticasID);
				setTimeout(() => {
					this.getProjectPracticesByID(res[0].projectPracticasID);
					this.getStudyPlans(careerID, studyPlanID);
				}, 100);
				this.loading = false;
			},
			error: (err: HttpErrorResponse) => {
				this.loading = false;
			}
		});
	}

	public getProjectPracticesByID(projectPracticasID: number): void {
		this.loading = true;
		let	filters= this.firstFormGroup.value;
		this.admin.getProjectPracticesByID(filters.p_periodID, projectPracticasID, this.firstFormGroup.get('p_careerID').value, this.firstFormGroup.get('p_studyPlanID').value).subscribe({
			next: (res) => {
				//console.log('ProjectPracticesByID', res);
				this.currentProject= res[0];
				this.getListTeacher();
				this.loading = false;
			},
			error: (err: HttpErrorResponse) => {
					this.loading = false;
			}
		});
	}

	public impactsSelection(projectTypeImpactID: number, i: number): void {
		if(projectTypeImpactID === 7) this.openDialog(i);
	}

	public onSubmit(): void {
		console.log(this.firstFormGroup, this.secondFormGroup, this.projectTypesFormGroup, this.objetivesFormGroup);
		if(this.firstFormGroup.valid && this.secondFormGroup.valid && this.projectTypesFormGroup.valid && this.objetivesFormGroup.valid){
			this.loading = true;
			this.admin.postProjectPracticesInformative(this.firstFormGroup.value).subscribe({
				next: (res: any) => {
					//console.log('post1', res[0].projectPracInformativeID);
					this.postStudents(res[0].projectPracInformativeID);
					this.postSubjects(res[0].projectPracInformativeID);
					//this.loading = false;
				},
				error: (err: HttpErrorResponse) => {
					this.loading = false;
					this.snackBar.open(
						`Ha excedido el límite de palabras.`,
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
		}else{
			this.firstFormGroup.markAllAsTouched();
			this.secondFormGroup.markAllAsTouched();
			this.projectTypesFormGroup.markAllAsTouched();
			this.objetivesFormGroup.markAllAsTouched();
			this.snackBar.open(
				`Campos en rojo`,
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

	private postSubjects(p_projectPracInformativeID: number): void {
		this.loading = true;
		let arr= [];
		let courses= this.firstFormGroup.get('coursesOfPractice').value;
		for(let i=0; i<courses.length; i++){
			let obj= {
				p_projectPracInformativeID: p_projectPracInformativeID,
				p_courseID: courses[i].coursePractice,
				p_user: this.user.currentUser.userName
			}
			arr.push(obj);
		}
		this.admin.postProjectPracticesSubjects({'coursesOfPractice': arr}).subscribe({
			next: (res) => {
				//console.log('postSubjects', res);
			},
			error: (err: HttpErrorResponse) => {
				this.loading = false;
			}
		});
	}

	private setProjectPracInformativeID(id: number): void{
		let studentsList= this.getSecondGroupArray('studentsList').value;
		let tutorsList= this.getSecondGroupArray('tutorsList').value;
		for(let i=0; i<studentsList.length; i++){
			studentsList[i].projectPracInformativeID= id;
			tutorsList[i].projectPracInformativeID= id;
		}
	}

	public postStudents(projectPracInformativeID: number): void {
		this.setProjectPracInformativeID(projectPracInformativeID);
		let body= {
			"students": this.getSecondGroupArray('studentsList').value,
			"teachers": this.getSecondGroupArray('tutorsList').value
		};
		//console.log(body);
		this.admin.postProjectPracticesParticipants(body).subscribe({
			next: (res) => {
				//console.log('post2', res);
				this.postTeachers(projectPracInformativeID);
				//this.loading = false;
			},
			error: (err: HttpErrorResponse) => {
					this.loading = false;
			}
		});
	}

	public postTeachers(projectPracInformativeID: number): void {
		let arr= [];
		let teachersList= this.secondFormGroup.get('teachersList').value;
		for(let i=0; i<teachersList.length; i++){
			let obj={
				p_projectPracInformativeID: projectPracInformativeID,
				p_teacherID: teachersList[i],
				p_user: this.user.currentUser.userName
			};
			arr.push(obj);
		}
		this.admin.postProjectPracticesTeachers({'teachers': arr}).subscribe({
			next: (res) => {
				//console.log('post3', res);
				this.postProjectPracticesImpacts(projectPracInformativeID);
				this.postProjectPracticesObjetives(projectPracInformativeID);
				//this.loading = false;
			},
			error: (err: HttpErrorResponse) => {
					this.loading = false;
			}
		});
	}

	public postProjectPracticesImpacts(projectPracInformativeID: number): void {
		for(let i=0; i<this.getTypesRow().length; i++){
			this.getTypesRow().controls[i].get('projectPracticasID').patchValue(this.currentProject.projectPracticasID);
			this.getTypesRow().controls[i].get('projectPracInformativeID').patchValue(projectPracInformativeID);
		}
		this.admin.postProjectPracticesImpacts({'news': this.getTypesRow().value}).subscribe({
			next: (res) => {
				//console.log('post4', res);
				//this.loading = false;
			},
			error: (err: HttpErrorResponse) => {
					this.loading = false;
			}
		});
	}

	public postProjectPracticesObjetives(projectPracInformativeID: number): void {
		for(let i=0; i<this.getObjetivesRow().length; i++){
			this.getObjetivesRow().controls[i].get('p_projectPracticasID').patchValue(this.currentProject.projectPracticasID);
			this.getObjetivesRow().controls[i].get('p_projectPracInformativeID').patchValue(projectPracInformativeID);
		}
		this.admin.postProjectPracticesObjetives({'dynamics': this.getObjetivesRow().value}).subscribe({
			next: (res) => {
				//console.log('post5', res);
				this.common.message(`Registro exitoso`,'','success','#86bc57');
				this.router.navigateByUrl('/vinculacion-coordinador/lista-proyectos');
				this.loading = false;
			},
			error: (err: HttpErrorResponse) => {
					this.loading = false;
			}
		});
	}

	public wordLimit(input: HTMLTextAreaElement, hint: any, limit: number):void{
    let val = input.value
    let words = val.split(/\s+/);
    let legal = "";
		let i;
    for(i = 0; i < words.length; i++) {
			if(i < limit) {
					legal += words[i] + " ";
			}
			if(i >= limit) {
					input.value = legal;
			}
			hint.textContent='Palabras: '+i
    }
	}

	/* public selectAllStudents(studentsListDiv: HTMLDivElement): void {
		studentsListDiv.style.display = "none";
		this.secondFormGroup.get('studentsList').patchValue('');
		let studentArray: number[] = [];
		for(let i=0; i<this.studentsList.length; i++){
			for(let index=0; index<this.studentsList[i].students.length; index++){
				studentArray.push(this.studentsList[i].students[index].studentID);
			}
		}
		this.secondFormGroup.get('studentsList').patchValue(studentArray);
		//this.getStudentsHours();
	} */

	public getStudyPlans(careerID: number, studyPlanID: number): void{
		this.admin.getCyclesByCareerAndStudyPlan(studyPlanID, careerID).subscribe({
			next: (res: CycleDetail[]) => {
				this.CycleDetail=res;
				this.loading = false;
			},
			error: (err: HttpErrorResponse) => {
				this.loading = false;
			}
		});
	}

	public getCareerAgreement(): void {
		this.careerAgreements= [];
		let filters= this.firstFormGroup.value;
		this.admin.getCareerAgreement(this.firstFormGroup.get('p_studyPlanID').value, this.firstFormGroup.get('p_careerID').value, filters.p_cycleID).subscribe({
			next: (res: CareerAgreement[]) => {
				//console.log('careerAgreements+++', res);
				this.careerAgreements= res;
			},
			error: (err: HttpErrorResponse) => {
				this.loading = false;
			}
		});
	}

	public getProjectHours(): void {
		let arr= this.firstFormGroup.get('coursesOfPractice').value;
		let sum= 0;
		for(let i=0; i<arr.length; i++){
			sum += +arr[i].hours;
		}
		this.firstFormGroup.get('p_projectPracticeHours').patchValue(sum*1);
	}

	public openDialog(i: number): void {
		const config: MatDialogConfig = new MatDialogConfig();
		config.id = 'CreateNewImpactComponent';
		config.autoFocus = false;
		config.minWidth = '45vw';
		config.maxWidth = '45vw';
		config.panelClass = 'transparent-panel';
		config.data = { };
		config.disableClose = true;
		const dialog = this.dialog.open(CreateNewImpactComponent, config);
		dialog.afterClosed()
		.pipe(untilComponentDestroyed(this))
		.subscribe((res: any) => {
			this.getProjectType();
			if(res) this.getTypesRow().controls[i].get('projectTypeImpactID').patchValue(
				res[0].projectTypeImpactID
			);
			else this.getTypesRow().controls[i].get('projectTypeImpactID').patchValue('');
		});
	}

}
