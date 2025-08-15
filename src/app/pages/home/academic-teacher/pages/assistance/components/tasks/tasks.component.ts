import { Component, ViewChild, ElementRef, OnInit, OnDestroy, inject, ChangeDetectorRef, SecurityContext, Input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { NgForOf, NgIf, DatePipe } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { InputSearchComponent } from '@components/input-shearch/input-search.component';
import { ButtonArrowComponent } from '@components/button-arrow/button-arrow.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MatNativeDateModule, MatOptionSelectionChange } from '@angular/material/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { SubjectsList } from '@utils/interfaces/others.interfaces';
import { Router } from '@angular/router';
import { Partial, Period, SettingTaskPractice, SettingTasks, SubComponent } from '@utils/interfaces/period.interfaces';
import { MatSelectChange } from '@angular/material/select';
import { UserService } from '@services/user.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Student } from '@utils/interfaces/campus.interfaces';
import { environment } from '@environments/environment';
import { DomSanitizer } from '@angular/platform-browser';

const MAX_FILE_SIZE = 5000000;

@Component({
  selector: 'component-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css'],
	standalone: true,
	imports: [
		NgIf,
		NgForOf,
		ReactiveFormsModule,
		MatInputModule,
		MatButtonModule,
		MatFormFieldModule,
		MatSelectModule,
		InputSearchComponent,
		ButtonArrowComponent,
		MatTooltipModule,
		MatIconModule,
		MatTabsModule,
		MatCheckboxModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatButtonToggleModule,
		MatSnackBarModule,
		DatePipe
	],
	providers: [
    DatePipe
  ],
})
export class TasksComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	charging: boolean = false;
	public filtersForm!: FormGroup;
	public tasksForm!: FormGroup;
	public studentsList!: Student[];
	@Input('subject') subject: SubjectsList;
	partialList: Partial[];
	activitiesList: SubComponent[];
	tasksList: SettingTasks[];
	settingTaskPractice: SettingTaskPractice[]= [];
	currentPeriod: Period;
	actualTasks: number = 1;
	totalPageTasks: number = 0;
	countTasks: number = 0;
	pageTasksLimit: number = 10;
	title: string = '';
	flagOnSubmit: number = 0;
	minDate:string;
	file:File;
	tasksFlag: number=0;
	currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm');
	currentTask: SettingTasks= null;

	private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
	private snackBar: MatSnackBar = inject(MatSnackBar);
	private user: UserService = inject(UserService);
	private sanitizer: DomSanitizer = inject(DomSanitizer);
	@ViewChild('modalClose', { read: ElementRef }) public modalClose: ElementRef;

	constructor(private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private router: Router,
		private datePipe: DatePipe, ){
		super();
	}

	public ngOnInit(): void {
		this.initForm();
		this.getSubject();
  }

  public override ngOnDestroy() {
    super.ngOnDestroy();
  }

	private getSubject(): void{
		//this.subject = this.common.sendSubject;
		if(!this.subject){
			this.ngOnDestroy();
		}else{
			this.getSettingTasks();
			this.getPartials();
			this.getPeriodById();
			this.getStudents();
		}
	}

	public initForm():void{
    	this.filtersForm = this.fb.group({
				componentID: ['']
    	});

		this.tasksForm = this.fb.group({
			taskID: [0],
			flgFile: [0],
			periodID: ['', [Validators.required]],
			courseID: ['', [Validators.required]],
			studyPlanID: ['', [Validators.required]],
			modalityID: ['', [Validators.required]],
			schoolID: ['', [Validators.required]],
			careerID: ['', [Validators.required]],
			cycleID: ['', [Validators.required]],
			personID: ['', [Validators.required]],
			taskDesc: ['', [Validators.required]],
			taskName: ['', [Validators.required]],
			startDate: ['', [Validators.required]],
			endDate: ['', [Validators.required]],
			componentID: ['', [Validators.required]],
			subComponentID: ['', [Validators.required]],
			percentage: ['', [Validators.required]],
			parallelCode: ['', [Validators.required]],
			attempts: [1, [Validators.required]],
			titleGap: [''],
			formats: [".jpg, .pdf, .png"],
			ruleCalc: [''],
			toggle: ['1'],
			urlFile: [''],
			urlWeb: [''],
			gradable: [''],
			user: [this.user.currentUser.userName],
		});
	}

	public onSubmitTasks():void{
		this.tasksForm.patchValue(this.subject);
		this.tasksForm.get('parallelCode').patchValue(this.subject.parallelCode);
		this.tasksForm.get('startDate').patchValue(this.datePipe.transform(this.tasksForm.get('startDate').value, 'yyyy-MM-dd HH:mm'));
		this.tasksForm.get('endDate').patchValue(this.datePipe.transform(this.tasksForm.get('endDate').value, 'yyyy-MM-dd HH:mm'));
		if(this.tasksForm.get('flgFile').value === true) this.tasksForm.get('flgFile').patchValue(1);
		else if(this.tasksForm.get('flgFile').value === false) this.tasksForm.get('flgFile').patchValue(0);
		if(this.tasksForm.valid){
			this.charging=true;
			if(this.flagOnSubmit == 0){
				this.api.postSettingTasks(this.tasksForm.getRawValue()).subscribe({
					next: (res:any) => {
						if(res[0].taskID === 409){
							this.snackBar.open(
								`Configuración de tarea ya registrado`,
								'',
								{
									horizontalPosition: 'center',
									verticalPosition: 'top',
									duration: 4000,
									panelClass: ['red-snackbar']
								}
							);
							this.modalClose.nativeElement.click();
						}else{
							if(this.file){
								this.postFile(res[0].taskID);
							}else{
								this.charging=false;
								this.modalClose.nativeElement.click();
								this.common.message(`Se guardó la configuración`,'','success','#86bc57');
								this.initForm();
								this.file=null;
							}
						}
					},
					error: (err: HttpErrorResponse) => {
						this.charging=false;
						console.log('err',err);
					}
				});
			}else if(this.flagOnSubmit == 1){
				this.api.putSettingTasks(this.tasksForm.getRawValue()).subscribe({
					next: (res:any) => {
						if(this.file){
							this.postFile(this.tasksForm.get('taskID').value);
						}else{
							this.charging=false;
							this.modalClose.nativeElement.click();
							this.common.message(`${res.message}`,'','success','#86bc57');
							this.initForm();
							this.getSettingTasks();
							this.file=null;
						}
					},
					error: (err: HttpErrorResponse) => {
						this.charging=false;
						//console.log('err',err);
						this.snackBar.open(
							`${err.error.message}`,
							'',
							{
								horizontalPosition: 'center',
								verticalPosition: 'top',
								duration: 4000,
								panelClass: ['red-snackbar']
							}
						);
						this.modalClose.nativeElement.click();
					}
				});
			}
		} else this.tasksForm.markAllAsTouched();
	}

	private postFile(taskID:number): void {
		this.admin.postTaskDocs(this.file, taskID, this.subject.periodID, 1, this.subject.parallelCode).subscribe({
      next: (res:any) => {
        //console.log(res);
				this.charging=false;
				this.modalClose.nativeElement.click();
				this.common.message(`${res[0].message}`,'','success','#86bc57');
				this.initForm();
				this.getSettingTasks();
      },
			error: (err: HttpErrorResponse) => {
				this.charging=false;
				console.log('err',err);
			}
    });
  }

	public onChangeInput(files: FileList, input:any): void{
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
					this.file=file;
				}
			 }
		}
	}

	public openModal(auxForSubmit: number, item?: SettingTasks): void{
		//console.log(item);
		if(auxForSubmit==0){
			this.flagOnSubmit=0;
			this.currentTask= null;
			this.title='Nueva tarea';
			this.initForm();
		}else if(auxForSubmit==1){
			this.flagOnSubmit=1;
			this.currentTask= item;
			item.startDate=item.startDate.slice(0, -1);
			item.endDate=item.endDate.slice(0, -1);
			this.title='Actualizar tarea';
			this.getActivities(item.componentID);
			this.getSettingsTasksPractice(item.componentID);
			setTimeout(() => {
				this.tasksForm.patchValue(item);
				this.tasksForm.get('subComponentID').patchValue(item.subComponentID);
				if(item.taskDesc) this.tasksForm.get('titleGap').patchValue(item.taskDesc);
			}, 300);

		}
	}

	public getSettingTasks(){
		this.charging = true;
    this.api.getSettingTasks(this.subject.periodID, this.subject.personID, this.subject.courseID, this.subject.careerID, this.subject.parallelCode,
			this.pageTasksLimit, this.actualTasks, this.filtersForm.get('componentID').value).subscribe({
      next: (res) => {
				//console.log(res);
				this.tasksList=res.data;
				this.countTasks=res.count;
        this.totalPageTasks = Math.ceil(this.countTasks/this.pageTasksLimit);
				this.charging = false;
      },error: (err: HttpErrorResponse) => {
				console.log('err',err);
				this.charging = false;
			}
    });
	}

	public getPartials(){
		this.charging = true;
    this.api.getPartials(this.subject.periodID).subscribe({
      next: (res) => {
        this.partialList = res.data;
				this.charging = false;
      },
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.charging = false;
			}
    });
	}

	private getPeriodById(): void {
		this.charging = true;
    this.api.getPeriodById(this.subject.periodID).subscribe({
      next: (res) => {
        this.currentPeriod = res;
				//console.log(this.currentPeriod);
				this.charging = false;
      },
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.charging = false;
			}
    });
	}

	public getActivities(componentID:number=this.tasksForm.get('componentID').value){
		this.tasksForm.get('subComponentID').patchValue('');
		this.api.getSubComponent(this.subject.periodID, componentID).subscribe({
			next: (res) => {
			this.activitiesList = res;
			},
				error: (err: HttpErrorResponse) => {
					console.log('err',err);
				}
		});
	}

	public updateGradable(item:SettingTasks, gradable:number){
		let arr={
			periodID: item.periodID,
			taskID: item.taskID,
			gradable: gradable,
			user: this.user.currentUser.userName
		};
		this.charging = true;
		this.api.putGradable(arr).subscribe({
			next: (res:any) => {
				this.common.message(`${res.message}`,'','success','#86bc57');
				this.getSettingTasks();
				this.charging = false;
			},
				error: (err: HttpErrorResponse) => {
					console.log('err',err);
					this.charging = false;
				}
		});
	}

	public changePageTasks(page:number):void{
		this.actualTasks = page;
    this.getSettingTasks();
	}

	public getMinDate(starDate:string){
		let date = new Date(starDate)
		date.setDate(date.getDate() + 1)
		this.minDate = this.datePipe.transform(date, 'yyyy-MM-dd HH:mm');
	}

	public getSelectedActivity(item: SubComponent, event: MatOptionSelectionChange){
		//console.log(item);
		if(event.isUserInput){
			if(item.subComponentTypeName === 'Práctica'){
				this.tasksFlag=1;
			}else{
				this.tasksFlag=0;
				this.tasksForm.get('titleGap').disable();
			}
		}
	}

	public getSettingsTasksPractice(componentID: number = this.tasksForm.get('componentID').value){
		this.api.getSettingsTasksPractice(componentID, this.subject.periodID, this.subject.schoolID,
			this.subject.careerID, this.subject.studyPlanID, this.subject.courseID).subscribe({
			next: (res) => {
				this.settingTaskPractice=res;
				this.getSettingsTasksPracticeFlag();
			},
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
		});
	}

	public getSettingsTasksPracticeFlag(){
		if(this.tasksFlag){
			this.api.getSettingsTasksPracticeFlag(this.subject.careerID, this.subject.studyPlanID, this.subject.courseID).subscribe({
				next: (res) => {
					//console.log('flag', res.flgTaskPractice);
					if(res?.flgTaskPractice){
						this.tasksForm.get('titleGap').patchValue('');
						this.tasksForm.get('titleGap').setValidators([Validators.required]);
						this.tasksForm.get('titleGap').enable();
					}
				},
				error: (err: HttpErrorResponse) => {
					console.log('err',err);
				}
			});
		}
	}

	public getPractice(title: string):void {
		this.tasksForm.get('taskDesc').patchValue(title);
	}

	public getStudents(): void{
		this.admin.getAttendanceStudents(this.subject.periodID, this.subject.classSectionNumber, 1, 0).subscribe({
			next: (res) => {
				//console.log('Students', res);
				this.studentsList = res.data;
			},
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
		});
	}

	public openFile(relativeRoute: string): void {
    const route: string = `${environment.url}/${relativeRoute}`;
    this.api.getPdfContent(route).subscribe((res: HttpResponse<Blob>) => {
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
