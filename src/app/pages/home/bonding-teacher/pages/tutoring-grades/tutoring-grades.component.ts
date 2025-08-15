import { Component, ViewChild, ElementRef, OnInit, OnDestroy, inject, SecurityContext, Input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, FormArray, } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { NgFor, NgForOf, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '@services/user.service';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { StudentGradesLinkage } from '@utils/interfaces/campus.interfaces';
import { Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { FilesListComponent } from '../../components/files-list/files-list.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-tutoring-grades',
  standalone: true,
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
		MatPaginatorModule,
		MatDialogModule,
		//FilesListComponent,
		MatSnackBarModule
	],
  templateUrl: './tutoring-grades.component.html',
  styleUrls: ['./tutoring-grades.component.css']
})

export class TutoringGradesComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public charging: boolean = false;
	public filtersForm!: FormGroup;
	public gradesForm!: FormGroup;
	public pageIndex: number = 1;
  public pageSize: number = 10;
  public length: number = 0;
  public pageEvent!: PageEvent;
  public pageSizeOptions: number[] = [5, 10, 25, 50, 100];
	public gradesList: StudentGradesLinkage[] = [];

	@ViewChild('paginator', { static: true }) public paginator!: MatPaginator;
	private reportsSubscription!: Subscription;
	private sanitizer: DomSanitizer = inject(DomSanitizer);
	private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private dialog: MatDialog = inject(MatDialog);
	private snackBar: MatSnackBar = inject(MatSnackBar);

	constructor(private fb: FormBuilder,
		private common: CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService ){
		super();
		this.initForms();
		this.initGradesForm();
	}

	ngOnInit(): void {
		this.activatedRoute.params.subscribe({
			next: (params: any) => {
				this.filtersForm.get('projectPracInformativeID').patchValue(+params.projectPracInformativeID);
			}
		});
		this.getStudentsGradesLinkageList();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	public initForms(): void {
		this.filtersForm= this.fb.group({
			filter: '',
			tutorPersonID: this.user.currentUser.PersonId,
			projectPracInformativeID: ['', Validators.required],
			page: '',
			size: ''
		})
	}

	public initGradesForm(): void {
		this.gradesForm= this.fb.group({
			grades: this.fb.array([])
		})
	}

	public getGradesArray(): FormArray {
		return this.gradesForm.controls['grades'] as FormArray;
	}

	public addGradesRow(gradeLinkageID: number, grade: number, observation: string) {
    this.getGradesArray().push(this.gradesRow(gradeLinkageID, grade, observation));
	}

	public gradesRow(gradeLinkageID: number, grade: number, observation: string): FormGroup {
    return this.fb.group({
			observation: [observation],
			grade: [grade, [Validators.required, Validators.max(10), Validators.min(1)]],
			gradeLinkageID: gradeLinkageID || null,
		});
	}

	public getStudentsGradesLinkageList(state: boolean= true): void{
		this.filtersForm.get('page').patchValue(this.pageIndex);
		this.filtersForm.get('size').patchValue(this.pageSize);
		if(this.filtersForm.valid){
			this.charging= state;
			this.admin.getStudentsGradesLinkageList(this.filtersForm.value).subscribe({
				next: (res) => {
					//console.log('getStudentsGradesLinkageList', res.data);
					this.gradesList= res.data;
					this.length= res.count;
					this.initGradesForm();
					if(this.gradesList.length > 0) for(let i=0; i<this.gradesList.length; i++){
						this.addGradesRow(this.gradesList[i].gradeLinkageID, +this.gradesList[i].grade, this.gradesList[i].observation);
					}
					this.charging = false;
				},
				error: (err: HttpErrorResponse) => {
					this.charging = false;
				}
			});
		}else{
			this.filtersForm.markAllAsTouched();
		}
	}

	public getPaginator(event: PageEvent): PageEvent {
		//console.log(event);
    this.pageIndex = event.pageIndex+1;
    this.pageSize = event.pageSize;
		this.getStudentsGradesLinkageList(false);
    return event;
  }

	public onSubmit(): void {
		//console.log(this.gradesForm.value);
		if(this.gradesForm.valid){
			this.admin.putStudentsGradesLinkageList(this.gradesForm.value).subscribe({
				next: (res) => {
					//console.log('put', res);
					this.getStudentsGradesLinkageList(false);
					this.common.message('Registro exitoso', '', 'success', "#d3996a");
				},
				error: (err: HttpErrorResponse) => {
				}
			});
		}else{
			this.gradesForm.markAllAsTouched();
		}
	}

	public getStudentsGradeLinkageReport(): void {
		if (this.reportsSubscription) this.reportsSubscription.unsubscribe();
		this.reportsSubscription = this.admin.getStudentsGradeLinkageReport(this.filtersForm.get('projectPracInformativeID').value,
			this.user.currentUser.PersonId).subscribe({
			next: (res) => {
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
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	public openDialog(item?: StudentGradesLinkage): void {
		const config: MatDialogConfig = new MatDialogConfig();
		config.id = 'FilesListComponent';
		config.autoFocus = false;
		config.minWidth = '55vw';
		config.maxWidth = '65vw';
		config.panelClass = 'transparent-panel';
		config.data = { item };
		config.disableClose = false;
		const dialog = this.dialog.open(FilesListComponent, config);
		dialog.afterClosed()
		.pipe(untilComponentDestroyed(this))
		.subscribe((res) => {
			this.getStudentsGradesLinkageList();
			if(res) this.snackBar.open(
				`Archivos actualizados exitosamente`,
				null,
				{
					horizontalPosition: 'center',
					verticalPosition: 'top',
					duration: 3000,
					panelClass: ['green-snackbar']
				}
			);
		});
	}

}
