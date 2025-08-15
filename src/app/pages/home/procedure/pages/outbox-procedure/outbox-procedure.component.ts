import { Component, ViewChild, ElementRef, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { DatePipe, NgFor, NgForOf, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { ProcedureDetailComponent } from '../../components/procedure-detail/procedure-detail.component';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Subscription } from 'rxjs';
import { Cycle, ModalityByCareer, Parallel, SPGetCareer, StudyPlan } from '@utils/interfaces/campus.interfaces';
import { Tables, UserByTypeRol } from '@utils/interfaces/others.interfaces';
import { CurrentPeriodItca, Period, ProcedureUserInfo } from '@utils/interfaces/period.interfaces';
import { Department, DocumentManagement, TypeRol } from '@utils/interfaces/person.interfaces';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { ROL } from '@utils/interfaces/login.interfaces';
import { UserService } from '@services/user.service';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { Area } from '@utils/interfaces/rrhh.interfaces';

const TOOLBAR_EDITOR: Toolbar = [
	['bold', 'italic'],
	['underline', 'strike'],
	['code', 'blockquote'],
	['ordered_list', 'bullet_list'],
	[{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
	['link', 'image'],
	['text_color', 'background_color'],
	['align_left', 'align_center', 'align_right', 'align_justify'],
	['horizontal_rule', 'format_clear'],
];

@Component({
  selector: 'app-outbox-procedure',
	standalone: true,
  templateUrl: './outbox-procedure.component.html',
  styleUrls: ['./outbox-procedure.component.scss'],
	imports: [
		ReactiveFormsModule,
		NgForOf,
		NgFor,
		NgIf,
		MatInputModule,
		MatButtonModule,
		MatFormFieldModule,
		MatSelectModule,
		MatTooltipModule,
		MatIconModule,
		//ProcedureDetailComponent,
		MatAutocompleteModule,
		MatCheckboxModule,
		NgxEditorModule,
		MatSnackBarModule
	],
	providers: [
		DatePipe,
	],
})

export class OutboxProcedureComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	protected readonly ROL = ROL;
	public charging: boolean = false;
	public filtersForm!: FormGroup;
	public messageForm!: FormGroup;
	public replaceForm!: FormGroup;
	public careers: SPGetCareer[] = [];
	public studyPlan: StudyPlan[] = [];
	public modalities: ModalityByCareer[] = [];
	public cycles: Cycle[] = [];
	public currentPeriod: CurrentPeriodItca;
	public parallels: Parallel[] = [];
	public types: TypeRol[] = [];
	public periods: Period[] = [];
	public procedures: DocumentManagement[] = [];
	public departments: string= '';
	public departmentsByRol: Department[] = [];
	public users: UserByTypeRol[] = [];
	public usersCC: UserByTypeRol[] = [];
	public areas: Area[] = [];
	public currentRol = sessionStorage.getItem('rol') || '';
	public personsToMessage: number= 0;
	public sendingNumber: number= 0;
	public sendingCCNumber: number= 0;
	private listFilesUpload: File[] = [];
	public messageDescription: string= '';
	public messageDetail: string= '';
	public details: Editor;
	public toolbar: Toolbar = TOOLBAR_EDITOR;
	public valueToChange: string;
	public currentProcedure: DocumentManagement;
	public userInfo: ProcedureUserInfo= null;
	public now: string= this.formattedDate(new Date);

	constructor(private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private user: UserService,
		private snackBar: MatSnackBar,
		private datePipe: DatePipe, ){
		super();
		this.initForm();
		this.details = new Editor();
	}

	ngOnInit(): void {
		this.getDataFromResolver();
		this.getMessageInfo();
		if(this.currentRol !== ROL.ADMIN) this.getDocumentManagementByRolID();
	}

	override ngOnDestroy(): void {
		this.details.destroy();
		super.ngOnDestroy();
	}

	private getDataFromResolver(): void {
    this.activatedRoute.data.pipe(untilComponentDestroyed(this),
    map((value) => value['resolver'])).subscribe({
			next: (value: {
				cycles: Cycle[],
				currentPeriod: CurrentPeriodItca,
				periods: Period[],
				types: TypeRol[],
				departments: Department[],
				areas: Area[],
			}) => {
				this.cycles= value.cycles,
				this.currentPeriod= value.currentPeriod,
				this.periods= value.periods,
				this.types= value.types,
				this.departmentsByRol= value.departments,
				this.areas= value.areas
			},
    });
		this.filtersForm.get('periodID').patchValue(this.currentPeriod.periodID);
		this.getCareersByPeriod(this.currentPeriod.periodID);
  }


	public initForm(): void {
		this.filtersForm = this.fb.group({
			typeRolID: [''],
			periodID: [0, Validators.required],
			careerID: [0, Validators.required],
			schoolID: [0, Validators.required],
			studyPlanID: [0, Validators.required],
			modalityID: [0, Validators.required],
			cycleID: [0, Validators.required],
			parallelCode: [''],
			documentManagementID: ['', Validators.required],
			settingDocumentManagementID: 0,
			selectedUsers: [[]],
			areaID: [0],
			detailArea: [[]],
			cc: [null],
			detailAddressee: [[]],
		});

		this.messageForm= this.fb.group({
			subject: ['', Validators.required],
			messageManagementDetail: ['', Validators.required],
			stateMessageManagement: [''],
			settingDocumentManagementID: [0],
			userID: this.user.currentUser.userId,
			studentID: +sessionStorage.getItem('studentID')! || null,
			userCreated: this.user.currentUser.userName
		})

		this.replaceForm= this.fb.group({
			names: [null],
			identification: [null],
			school: [null],
			career: [null],
			modality: [null],
			grade: [null],
			parallel: [null],
			department: [null],
			charge: [null],
			description: [null],
			sender: [null],
			date: [this.now],
			status: 0
		})
	}

	public getDocumentManagementByRolID(): void {
		if(this.currentRol !== ROL.REGISTRY) this.api.getDocumentManagementByRolID(+sessionStorage.getItem('rolID')).subscribe({
			next: (res) => {
				//console.log('DocumentManagement', res);
				this.procedures= res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		})
	}

	public getDocumentManagementByTypeRolID(): void {
		this.users= [];
		this.api.getDocumentManagementByTypeRolID(this.filtersForm.get('typeRolID').value).subscribe({
			next: (res) => {
				//console.log('DocumentManagement', res);
				this.procedures= res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		})
	}

	public getMessageInfo(): void{
		this.admin.getMessageInfo(+sessionStorage.getItem('personID'), +sessionStorage.getItem('studentID') | 0).subscribe({
			next: (res) => {
				//console.log('MessageInfo', res);
				this.userInfo= res;
				if(this.messageDescription.includes('(-descripción-)')) this.messageForm.get('messageManagementDetail').patchValue(
					this.messageForm.get('messageManagementDetail').value.replace('(-descripción-)', this.userInfo.fullName)
				);
				this.replaceForm.get('names').patchValue(this.userInfo.fullName);
				this.replaceForm.get('identification').patchValue(this.userInfo.documentNumber);
				this.replaceForm.get('school').patchValue(this.userInfo.schoolName);
				this.replaceForm.get('career').patchValue(this.userInfo.careerName);
				this.replaceForm.get('modality').patchValue(this.userInfo.modalityName);
				this.replaceForm.get('grade').patchValue(this.userInfo.cycle);
				this.replaceForm.get('parallel').patchValue(this.userInfo.parallelCode);
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public replaceHtml(): void {
		Swal.fire({
			icon: 'question',
			title: ``,
			text: `¿Está seguro de proceder?`,
			showCancelButton: true,
			confirmButtonText: "Si",
			cancelButtonText: "No",
			allowOutsideClick: false,
		}).then(result => {
			if(result.value){
				this.messageReplace('(-nombres-)', 'names');
				this.messageReplace('(-documento-)', 'identification');
				this.messageReplace('(-escuela-)', 'school');
				this.messageReplace('(-carrera-)', 'career');
				this.messageReplace('(-modalidad-)', 'modality');
				this.messageReplace('(-curso-)', 'grade');
				this.messageReplace('(-paralelo-)', 'parallel');
				this.messageReplace('(-departamento-)', 'department');
				this.messageReplace('(-cargo-)', 'charge');
				this.messageReplace('(-remitente-)', 'sender');
				this.messageReplace('(-descripción-)', 'description');
				this.messageReplace('(-fecha-)', 'date');
				this.replaceForm.get('status').patchValue(1);
			}
		});
	}

	private messageReplace(html: string, control: string): void {
		this.messageForm.get('messageManagementDetail').patchValue(
			this.messageForm.get('messageManagementDetail').value.replace(html,
			this.replaceForm.get(control).value)
		);
	}

	public getCareersByPeriod(periodID: number): void{
		this.admin.getCareersByPeriod(periodID).subscribe({
			next: (res) => {
				this.careers = res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getSelectedSchool(event: MatOptionSelectionChange, item: SPGetCareer): void {
		if(event.isUserInput){
			this.filtersForm.get('schoolID').patchValue(item.schoolID);
		}
	}

	public getStudyPlan(careerID: number): void{
		this.admin.getStudyPlansByCareerAndPeriod(careerID, this.filtersForm.get('periodID').value).subscribe({
			next: (res) => {
				this.studyPlan = res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getModalities(careerID: number): void{
		this.admin.getModalitiesByCareer(careerID).subscribe({
			next: (res) => {
				this.modalities= res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getParallels(cycleID: number): void{
		let filters= this.filtersForm.value;
		this.api.getParallelsByFilters(filters.periodID, filters.studyPlanID, cycleID, filters.modalityID, filters.careerID).subscribe({
			next: (res) => {
				//console.log('parallels', res);
				this.parallels= res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public selectedProcedure(event: MatOptionSelectionChange, item: DocumentManagement): void {
		if(event.isUserInput){
			//console.log(item);
			this.currentProcedure= item;
			this.filtersForm.get('areaID').patchValue(item.areaID);
			this.messageForm.get('settingDocumentManagementID').patchValue(item.settingDocumentManagementID);
			this.messageForm.get('subject').patchValue(item.documentManagementSubject);
			this.messageDescription= item.documentManagementDesc;
			this.messageForm.get('messageManagementDetail').patchValue(this.messageDescription);
			this.messageDetail= item.documentManagementEsp;
			this.departments= item.areaName;
		}
	}

	public replaceString(string: string, key: string): void {
		let replace;
		if(this.messageForm.get('messageManagementDetail').value.includes(key)) replace= key;
		else replace= this.valueToChange;
		this.messageForm.get('messageManagementDetail').patchValue(
		this.messageForm.get('messageManagementDetail').value.replace(replace, string));
	}

	public getTypeRolByDocumentManagementID(documentManagementID: number | string): void{
		this.api.getDepartmentsByRol(+sessionStorage.getItem('rolID')).subscribe({
			next: (res: Department[]) => {
				//console.log('TypeRolByDocumentManagementID', res);
				this.departments= '';
				for(let i=0; i<res.length; i++){
					if(i === 0)this.departments = this.departments + res[i].areaName;
					else this.departments = this.departments + ', ' + res[i].areaName;
				}
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});

	}

	public getCCUsersByTypeRol(filter: string): void{
		if(filter === '') this.usersCC= [];
		else{
			this.admin.getUsersByTypeRolID(this.filtersForm.get('cc').value, this.filtersForm.get('periodID').value, 0, filter).subscribe({
				next: (res: UserByTypeRol[]) => {
					//console.log('UsersCCByTypeRol', res, this.filtersForm.get('detailAddressee').value);
					this.usersCC= res;
					let selectedUsers: number[]= this.filtersForm.get('detailAddressee').value;
					for(let i=0; i<selectedUsers.length; i++){
						let filterUser= this.usersCC.filter((item: UserByTypeRol)=> item.userID === selectedUsers[i])[0];
						if(filterUser) filterUser.selected= true;
					};
				},
				error: (err: HttpErrorResponse) => {
					//console.log('err',err);
				}
			});
		}
	}

	public getUsersByRolID(filter: string, rolID: number= +sessionStorage.getItem('rolID')): void{
		if(filter === '') this.users= [];
		else{
			this.admin.getUsersByRolID(rolID, filter).subscribe({
				next: (res: UserByTypeRol[]) => {
					//console.log('UsersByTypeRol', res);
					this.users= res;
				},
				error: (err: HttpErrorResponse) => {
					//console.log('err',err);
				}
			});
		}
	}

	public getUsersByTypeRolID(filter: string): void{
		if(filter === '') this.users= [];
		else{
			let area= 0;
			if(this.currentProcedure) area= this.currentProcedure.areaID;
			this.admin.getUsersByTypeRolID(this.filtersForm.get('typeRolID').value, this.filtersForm.get('periodID').value, area, filter).subscribe({
				next: (res: UserByTypeRol[]) => {
					//console.log('UsersByTypeRol', res);
					this.users= res;
					let selectedUsers: number[]= this.filtersForm.get('selectedUsers').value;
					for(let i=0; i<selectedUsers.length; i++){
						let filterUser= this.users.filter((item: UserByTypeRol)=> item.userID === selectedUsers[i])[0];
						if(filterUser) filterUser.selected= true;
					};
				},
				error: (err: HttpErrorResponse) => {
					//console.log('err',err);
				}
			});
		}
	}

	public getUsersByAreaID(filter: string): void{
		if(filter === '') this.users= [];
		else{
			this.admin.getUsersByAreaID(this.currentProcedure.areaID, filter).subscribe({
				next: (res: UserByTypeRol[]) => {
					this.users= res;
					let selectedUsers: number[]= this.filtersForm.get('selectedUsers').value;
					for(let i=0; i<selectedUsers.length; i++){
						let filterUser= this.users.filter((item: UserByTypeRol)=> item.userID === selectedUsers[i])[0];
						if(filterUser) filterUser.selected= true;
					};
				},
				error: (err: HttpErrorResponse) => {
					//console.log('err',err);
				}
			});
		}
	}

	public optionClicked(event: Event, user: UserByTypeRol): void {
    event.stopPropagation();
    this.toggleSelection(user);
  }

  public toggleSelection(user: UserByTypeRol): void {
    user.selected = !user.selected;
		let selectedUsers: number[]= this.filtersForm.get('selectedUsers').value;
		//console.log('array', selectedUsers);
    if (user.selected) {
      selectedUsers.push(user.userID);
    } else {
      const i = selectedUsers.findIndex(value => value === user.userID);
      selectedUsers.splice(i, 1);
    }
		//console.log('selectedUsers', selectedUsers);
		this.sendingNumber= selectedUsers.length;
  }

	public optionCCClicked(event: Event, user: UserByTypeRol): void {
    event.stopPropagation();
    this.toggleCCSelection(user);
  }

  public toggleCCSelection(user: UserByTypeRol): void {
    user.selected = !user.selected;
		let selectedUsers: number[]= this.filtersForm.get('detailAddressee').value;
		//console.log('array', selectedUsers);
    if (user.selected) {
      selectedUsers.push(user.userID);
    } else {
      const i = selectedUsers.findIndex(value => value === user.userID);
      selectedUsers.splice(i, 1);
    }
		this.sendingCCNumber= selectedUsers.length;
  }

	public getPersonsToMessage(event: boolean): void{
		if(event){
			let filters= this.filtersForm.value;
			let body= {
				"typeRoleID": filters.typeRolID,
				"periodID": filters.periodID,
				"cycleID": filters.cycleID,
				"modalityID": filters.modalityID,
				"careerID": filters.careerID,
				"parallelCode": filters.parallelCode,
				"areaID": this.currentProcedure?.areaID | 0
			}
			this.admin.getPersonsToMessage(body).subscribe({
				next: (res) => {
					//console.log('PersonsToMessage', res);
					this.personsToMessage= res.count;
					this.sendingNumber= this.personsToMessage;
				},
				error: (err: HttpErrorResponse) => {
					//console.log('err',err);
				}
			});
		}
	}

	public onChangeInput(files: FileList, input: HTMLInputElement): void{
		if (files) {
			for(let i=0; i<files.length; i++){
				let file: File = files.item(i);
				this.listFilesUpload.push(file);
			}
			//console.log('listFiles', this.listFilesUpload);
			if(this.listFilesUpload.length > 5){
				this.listFilesUpload= [];
				input.value= '';
				this.snackBar.dismiss();
				this.snackBar.open(
          `Máximo 5 archivos permitidos`,
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
	}

	public postMessageManagement(): void {
		let formData: FormData = new FormData();
		let filters= this.filtersForm.value;
		//console.log(this.filtersForm, this.messageForm,);
		if(this.filtersForm.valid && this.messageForm.valid){
			this.charging= true;
			const selectedUsers: number[]= this.filtersForm.get('selectedUsers').value;
			let detail;
			if(selectedUsers.length) detail= {};
			else if(this.filtersForm.get('documentManagementID').value === 0){
				detail= {};
				if(this.sendingNumber <= 0){
					this.snackBar.dismiss();
					this.snackBar.open(
						`Debe seleccionar al menos 1 receptor`,
						null,
						{
							horizontalPosition: 'center',
							verticalPosition: 'top',
							duration: 4000,
							panelClass: ['red-snackbar']
						}
					);
					this.charging= false;
					return;
				}
			}
			else detail = {
				"modalityID": filters.modalityID,
				"schoolID": filters.schoolID,
				"careerID": filters.careerID,
				"cycleID": filters.cycleID,
				"periodID": filters.periodID,
				"areaID": filters.areaID,
				"positionID": 0,
				"parallelCode": filters.parallelCode
			};
			formData.append('detail', JSON.stringify(detail));
			formData.append('message', JSON.stringify(this.messageForm.value));
			formData.append('addressees', JSON.stringify(selectedUsers));
			for(let i=0; i<this.listFilesUpload.length; i++){
				formData.append('attachments', this.listFilesUpload[i]);
			}
			formData.append('detailArea', JSON.stringify(this.filtersForm.get('detailArea').value));
			formData.append('detailAddressee', JSON.stringify(this.filtersForm.get('detailAddressee').value));
			this.admin.postMessageManagement(formData).subscribe({
				next: (res: any) => {
					//console.log('post', res);
					this.common.message(`${res.message}`,'','success','#86bc57');
					this.initForm();
					this.listFilesUpload= [];
					this.sendingNumber= 0;
					this.charging= false;
				},
				error: (err: HttpErrorResponse) => {
					//console.log('err',err);
					this.charging= false;
				}
			});
		}else{
			this.filtersForm.markAllAsTouched();
			this.messageForm.markAllAsTouched();
		}
	}

	private formattedDate(date: Date): string {
		return <string>this.datePipe.transform(date, 'yyyy-MM-dd');
	}

}
