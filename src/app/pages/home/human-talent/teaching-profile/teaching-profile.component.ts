import { Component, OnInit, inject, ViewChild, ElementRef, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TeacherAux } from '@utils/interfaces/person.interfaces';
import { Router } from '@angular/router';
import { CommonService } from '@services/common.service';
import { RrhhService } from '@services/rrhh.service';
import { NgForOf, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PipesModule } from '../../../../pipes/pipes.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { map } from 'rxjs';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { ValidateFilesComponent } from '@components/validate-files/validate-files.component';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { DatePipe } from '@angular/common'
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { Identity } from '@utils/interfaces/others.interfaces';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ApiService } from '@services/api.service';
import { AdministrativeService } from '@services/administrative.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { CourseDetailShort, TimeAvailability } from '@utils/interfaces/campus.interfaces';
import { UserService } from '@services/user.service';
import { Colaborator, ExperienceMatter, SustantiveFunctions } from '@utils/interfaces/rrhh.interfaces';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdministrativeProvisionComponent } from './components/administrative-provision/administrative-provision.component';
import { SustantiveFunctionsComponent } from '../components/sustantive-functions/sustantive-functions.component';

interface FiltersForm {
  state: number;
  search: string;
}

@Component({
  selector: 'app-teaching-profile',
  templateUrl: './teaching-profile.component.html',
  styleUrls: ['./teaching-profile.component.scss'],
  providers:[
    DatePipe
  ],
  standalone: true,
	imports: [
		NgIf,
		MatIconModule,
		MatButtonModule,
		PipesModule,
		NgForOf,
		MatFormFieldModule,
		MatSelectModule,
		MatTableModule,
		MatMenuModule,
		MatDialogModule,
		MatPaginatorModule,
		ReactiveFormsModule,
		MatInputModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatCheckboxModule,
		MatTooltipModule,
		MatSnackBarModule,
	]
})
export class TeachingProfileComponent extends OnDestroyMixin implements OnInit {

	testPattern = {
    S: { pattern: new RegExp('[A-Za-z0-9]') },
  };
  phone = {
    S: { pattern: new RegExp('[+0-9]') },
  };

  formUser: FormGroup;
  personID: number = 0;
  campus: any[] = [];

  get identityList(): Identity[] {
    return this.common.identityList;
  }

	public filtersForm!: FormGroup;
	public subjectsForm!: FormGroup;
	public sustantiveForm!: FormGroup;
	public courses: CourseDetailShort[] = [];
	public currentTeacher: Colaborator;
	public currentTeacherSubjects: ExperienceMatter[] = [];
	color='#004899';
  charging: boolean= false;
	currentPeriodID: number;
	addingSubjects: boolean= false;
  chargingTeacher: boolean= false;
  teachingSelect: TeacherAux [] = [];
  teachingCount: number = 0;
  totalPage: number = 1;
  actualPage: number = 1;
  countTeacher: number = 0;
	limit:number=10;
  collaborators!: MatTableDataSource<Colaborator>;;
  displayedColumns: string[] = ['PersonDocumentNumber', 'fullName', 'dateInit', 'dateContract', 'status', 'actions'];
  private dialog: MatDialog = inject(MatDialog);
	private formBuilder: FormBuilder = inject(FormBuilder);

	@ViewChild('modalClose', { read: ElementRef }) public modalClose: ElementRef;
	@ViewChild('subjectsModalClose', { read: ElementRef }) public subjectsModalClose: ElementRef;
	@ViewChild('sustantiveModalClose', { read: ElementRef }) public sustantiveModalClose: ElementRef;
	@ViewChild('search', { read: ElementRef }) public search: ElementRef;
	@ViewChild('paginator') paginator: any;
	private api: ApiService = inject(ApiService);
	private sanitizer: DomSanitizer = inject(DomSanitizer);

  constructor( private fb: FormBuilder,
								private common: CommonService,
                private rrhh: RrhhService,
                private router:Router,
                public datepipe: DatePipe,
								private admin: AdministrativeService,
								private user: UserService,
								private snackBar: MatSnackBar,){
                super();
								this.filterForm();
                }

  ngOnInit(): void {
		this.getCurrentPeriod();
    this.loadTeacher();
		this.getAllCourses();
		this.initForm();
    this.common.charging();
    this.loadInformation();
  }

  loadTeacher(){
    this.charging = true;
    this.load(this.limit ,this.actualPage, this.filtersForm.get('search').value, this.filtersForm.get('state').value);
  }

	filterForm(){
		this.filtersForm = this.formBuilder.group({
      state: [2],
      search: ['']
    });
		const searchInput: FormControl = this.filtersForm.get('search') as FormControl;
	}

	getFilterCollaborator(value?: any){
		this.chargingTeacher=true;
		//console.log(this.status);
		this.actualPage=1;
		this.paginator.firstPage();
		this.search.nativeElement.value='';
		this.load(this.limit, this.actualPage, this.filtersForm.get('search').value, this.filtersForm.get('state').value);
  }

	getInputFilter(value?: any){
		this.chargingTeacher=true;
		//console.log(value);
		this.actualPage=1;
		this.paginator.firstPage();
		this.load(this.limit, this.actualPage, this.filtersForm.get('search').value, this.filtersForm.get('state').value);
	}

  load(limit:number, page: number, filter: string, status: number){
    // this.rrhh.getTeacher(page, filter, limit)
    //   .subscribe( teachers => {
    //     this.teachingSelect = teachers.data;
    //     this.teachingCount = teachers.count;
    //     this.totalPage = Math.ceil(this.teachingCount / 10);
    //     this.charging = false;
    //     this.chargingTeacher = false;
    //   })
    this.rrhh.getCollaborators(limit, page, filter, status).pipe(map((elements:any)=>{
      //console.log('elements', elements);
      this.totalPage = elements.count;
      return elements.data.map((element: any) => {
        return {
          'PersonId':element.PersonId,
          'PersonDocumentNumber': element.PersonDocumentNumber,
          'fullName': element.PersonFirstName + ' ' + element.PersonMiddleName + ' ' + element.PersonLastName,
          'dateInit': this.datepipe.transform(element.initDate, 'yyyy-MM-dd'),
          'dateContract': element.contractDate,
          'status': (element.state==1)?'ACTIVO':'INACTIVO',
					'statusFileID': element.statusFileID,
					'expMatt': element.expMatt,
					'timeAv': element.timeAv,
					'typeStaffID': element.typeStaffID
        };
      });
    })).subscribe({
      next: (collaborators: Colaborator[]) => {
				//console.log('collaborators', collaborators);
        this.collaborators = new MatTableDataSource<Colaborator>(collaborators);
        this.charging = false;
        this.chargingTeacher = false;
      }
    })
  }

  rout(id: number){
    if(id === 0){
      this.router.navigateByUrl('talento-humano/crear-colaborador').then()
    }else {
      this.router.navigateByUrl(`talento-humano/editar-docente/${id}`).then();
    }
  }

  /* *********************************** -------------------------- *********************************** */

  validateFiles(row: Colaborator){
      const config: MatDialogConfig = new MatDialogConfig();
      config.id = 'ValidateFilesComponent';
      config.autoFocus = false;
      config.minWidth = '70vw';
      config.maxWidth = '80vw';
      config.panelClass = 'transparent-panel';
      config.data = {
        enrolledStudent:row
      }
      const dialog = this.dialog.open(ValidateFilesComponent, config);
      dialog.afterClosed()
      .pipe(untilComponentDestroyed(this))
      .subscribe((res: boolean) => {
        if (res) {
          //console.log(res);

        }
      });
  }
  qualities(row: Colaborator){
    //console.log(row);
    localStorage.setItem('initDate', row.dateInit);
    localStorage.setItem('contractDate', row.dateContract);
    this.router.navigateByUrl(`talento-humano/cualidades-docente/${row.PersonId}`);
  }
  updateInformation(row: Colaborator){
    //console.log(row);
    // this.common.getTimeAvailability(6,row.PersonId).subscribe({
    //   next: (time: any) => {
    //     this.countTeacher = time;
        this.router.navigateByUrl(`talento-humano/editar-docente/${row.PersonId}`);
    //   }
    // })
  }

  history(){

  }

  downalodPdf(row: Colaborator){
		//console.log(row.PersonId)
		let id = row.PersonId;
		this.api.getCollaboratorPdfContent(id).subscribe( {
      next: (res: any) => {
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
      },
			error: (err: any) => {
				console.log('err',err);
				this.common.message('Debe completar la actualización de información','','warning','#2eb4d8');
			}
    })
  }

  onPageChange($event:any){
    //console.log($event.pageIndex+1);
		this.actualPage=parseInt($event.pageIndex+1);
    this.load(this.limit ,this.actualPage, this.filtersForm.get('search').value, this.filtersForm.get('state').value);
  }

	loadInformation(){
		/*this.rrhh.getPositionContract().subscribe({
			next: (resp: any) => {
				//console.log(resp);
				this.positions = resp;
			}
		})*/

		this.rrhh.getCampus().subscribe({
			next: (resp: any) => {
				//console.log(resp);
				this.campus = resp;
			}
		})
		// this.common.identityList().subscribe({
		//   next: (resp: any) => {
		//     this.identityList = resp;
		//     //(this.identityList);
		//   },
		//   error: (err: any) => {
		//     console.log('err',err);
		//   }
		// })
	 }

	 valid( valid: boolean, form: string ){

	 }
	 chargeID( personID: number ){
		 this.personID = personID;
	 }
	 initForm(){
		 this.formUser = this.fb.group({
			 typeDocId: ['', [Validators.required]],
			 personDocumentNumber: ['', Validators.required],
			 personFirstName: ['', [Validators.required]],
			 personMiddleName: ['', [Validators.required]],
			 personLastName: ['', [Validators.required]],
			 email: ['', [Validators.required, Validators.email]],
			 contratDate: ['', [Validators.required]],
			 sendMail: [1, [Validators.required]],
			 user: [''],
		 });

		 this.subjectsForm = this.fb.group({
			courseID: [[], [Validators.required]],
		});
	 }


 isValidField( field: string ): boolean | null{
	 return this.formUser.controls[field].errors
				 && this.formUser.controls[field].touched;
 }


 getFielError( field: string): string | null {
	 if( !this.formUser.controls[field] ) return null;

	 const errors = this .formUser.controls[field].errors || {};

	 for (const key of Object.keys(errors)) {
		 switch (key) {
			 case 'required':
					 return 'Campo requerido!';
			 case 'min':
				 if(errors['min'].min === 1){
					 return 'Debe seleccionar una opción!';
				 }else{
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

 saveUser(){
	 if( this.formUser.invalid ){
		 this.formUser.markAllAsTouched();
		 return;
	 }
	 this.rrhh.postCollaborator(this.formUser.value)
		 .subscribe({
			 next: (resp: any) => {
				this.personID = resp.personID;
				this.common.message('Se ha registrado un colaborador de manera exitosa.','','success','#2eb4d8');
				//this.router.navigate(['/talento-humano/perfil-docente']);
				this.modalClose.nativeElement.click();
				this.initForm();
				this.actualPage=1;
				this.loadTeacher();
			 },
			 error: (err: any) => {
				 //console.log('err',err);
				 this.modalClose.nativeElement.click();
				 this.initForm();
				 this.actualPage=1;
				 this.loadTeacher();
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
		 })
  }

	public getAllCourses(): void{
		this.admin.getAllCourses().subscribe({
			next: (res) => {
				this.courses = res;
			},
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
		});
	}

	public getTeacherSubjects(personID: number): void{
		this.admin.getTeacherSubjects(personID).subscribe({
			next: (res: ExperienceMatter[]) => {
				//console.log(res);
				this.currentTeacherSubjects = res;
			},
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
		});
	}

	public getCurrentPeriod(): void{
		this.charging=true;
		this.api.getCurrentPeriod().subscribe({
			next: (res) => {
				this.currentPeriodID = res.periodID;
			},
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
		});
	}

	public onSubmitSubjects(): void{
		if(this.subjectsForm.valid){
			let coursesID = this.subjectsForm.controls['courseID'].value;
			let dynamics = [];
			for(let i=0; i<coursesID.length; i++){
				let obj={
					personID: this.currentTeacher.PersonId,
					courseID: coursesID[i],
					commentary: '',
					user: this.user.currentUser.userName
				}
				dynamics.push(obj);
			}
			//console.log(dynamics);
			this.admin.postTeacherSubjects({"dynamics": dynamics}).subscribe({
				next: (res:any) => {
					//console.log(res);
					//this.subjectsModalClose.nativeElement.click();
					this.addingSubjects = false;
					this.actualPage= 1;
					this.loadTeacher();
					this.getTeacherSubjects(this.currentTeacher.PersonId);
					this.initForm();
					this.common.message(`${res.message[0].message}`,'','success','#2eb4d8');
				},
				error: (err: HttpErrorResponse) => {
					console.log('err',err);
				}
			});
		}
	}

	public statusSubject(item: ExperienceMatter, index: number): void {
		let body = {
			personID: item.personID,
			courseID: item.courseID,
			statusID: index,
			user: this.user.currentUser.userName
		}
		this.admin.subjectExperienceStatus(body).subscribe( (resp: any ) => {
			//console.log(resp);
			this.common.message(`${resp.message}`, '', 'success', '#86bc57');
			this.getTeacherSubjects(item.personID);
		})
	}

	public openAdministrativeProvisionDialog(item: Colaborator): void {
		const config: MatDialogConfig = new MatDialogConfig();
		config.id = 'administrativeProvisionDialog';
		config.autoFocus = false;
		config.minWidth = '30vw';
		config.maxWidth = '50vw';
		config.panelClass = 'transparent-panel';
		config.data = { item };
		config.disableClose = false;
		const dialog = this.dialog.open(AdministrativeProvisionComponent, config);
		dialog.afterClosed()
		.pipe(untilComponentDestroyed(this))
		.subscribe((res) => {
			if(res) {
				this.snackBar.open(
					`Registro Exitoso`,
					'',
					{
						horizontalPosition: 'center',
						verticalPosition: 'top',
						duration: 4000,
						panelClass: ['green-snackbar']
					}
				);
			}
		});
	}

	public openSustantiveDialog(personID: number, flag: boolean= true): void {
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
}
