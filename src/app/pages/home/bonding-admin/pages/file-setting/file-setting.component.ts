import { Component, ViewChild, ElementRef, OnInit, OnDestroy, inject, SecurityContext, Input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, } from '@angular/forms';
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
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { filter, map, Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '@services/user.service';
import { TemplateComponent } from '../../components/template/template.component';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { StudentProcessTemplate } from '@utils/interfaces/campus.interfaces';
import { environment } from '@environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UpdateFileTypesComponent } from '../../components/update-file-types/update-file-types.component';
import { Period } from '@utils/interfaces/period.interfaces';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-file-setting',
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
		//TemplateComponent,
		MatDialogModule,
		MatSnackBarModule,
		MatPaginatorModule
	],
  templateUrl: './file-setting.component.html',
  styleUrls: ['./file-setting.component.css']
})

export class FileSettingComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public charging: boolean = false;
	public filtersForm!: FormGroup;
	public files: StudentProcessTemplate[] = [];
	public periods: Period[] = [];
	public pageIndex: number = 1;
  public pageSize: number = 10;
  public length: number = 0;
  public pageEvent!: PageEvent;
  public pageSizeOptions: number[] = [5, 10, 25, 50, 100];

	private getPdfContentSubscription!: Subscription;
	private sanitizer: DomSanitizer = inject(DomSanitizer);
	private dialog: MatDialog = inject(MatDialog);
	private snackBar: MatSnackBar = inject(MatSnackBar);

	constructor(private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService ){
		super();
		this.initFiltersForm();
	}

	ngOnInit(): void {
		this.getStudentProcessTemplate();
		this.getPeriods();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	private initFiltersForm(): void{
		this.filtersForm = this.fb.group({
			periodID: [0]
		});
	}

	public getStudentProcessTemplate(state: boolean= true): void{
		this.charging= state;
		this.admin.getStudentProcessTemplate(this.pageIndex, this.pageSize, this.filtersForm.get('periodID').value).subscribe({
			next: (res) => {
				//console.log('getStudentProcessTemplate', res);
				this.files = res.data;
				this.length = res.count;
				this.charging = false;
			},
			error: (err: HttpErrorResponse) => {
				this.charging = false;
			}
		});
	}

	public getPeriods():void{
		this.api.getPeriods().subscribe({
      next: (res) => {
				this.periods = res.data;
      }
    });
	}

	public getPaginator(event: PageEvent): PageEvent {
		//console.log(event);
		this.pageIndex = event.pageIndex+1;
		this.pageSize = event.pageSize;
		this.getStudentProcessTemplate(false);
		return event;
	}

	public openDialog(item?: StudentProcessTemplate): void {
		const config: MatDialogConfig = new MatDialogConfig();
		const periods= this.periods;
		config.id = 'TemplateComponent';
		config.autoFocus = false;
		config.minWidth = '45vw';
		config.maxWidth = '45vw';
		config.panelClass = 'transparent-panel';
		config.data = { periods, item };
		config.disableClose = false;
		const dialog = this.dialog.open(TemplateComponent, config);
		dialog.afterClosed()
		.pipe(untilComponentDestroyed(this))
		.subscribe((res) => {
			if (res) {
				this.snackBar.open(
          `Registro exitoso`,
          null,
          {
            horizontalPosition: 'center',
            verticalPosition: 'top',
            duration: 4000,
            panelClass: ['green-snackbar']
          }
        );
				this.getStudentProcessTemplate();
			}
		});
	}

	public openFilesDialog(): void {
		const config: MatDialogConfig = new MatDialogConfig();
		config.id = 'UpdateFileTypesComponent';
		config.autoFocus = false;
		config.minWidth = '45vw';
		config.maxWidth = '45vw';
		config.panelClass = 'transparent-panel';
		config.data = { };
		config.disableClose = false;
		const dialog = this.dialog.open(UpdateFileTypesComponent, config);
		dialog.afterClosed()
		.pipe(untilComponentDestroyed(this))
		.subscribe((res) => {
			this.getStudentProcessTemplate();
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
