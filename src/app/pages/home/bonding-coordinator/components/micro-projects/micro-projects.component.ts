import { Component, ViewChild, ElementRef, OnInit, OnDestroy, SecurityContext, Inject, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, FormArray, FormsModule } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { HttpErrorResponse } from '@angular/common/http';
import { map, Subscription } from 'rxjs';
import { NgForOf, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatRippleModule } from '@angular/material/core';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { UserService } from '@services/user.service';
import { ApiService } from '@services/api.service';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MicroProject, Project } from '@utils/interfaces/campus.interfaces';
import { DomSanitizer } from '@angular/platform-browser';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-micro-projects',
  standalone: true,
  templateUrl: './micro-projects.component.html',
  styleUrls: ['./micro-projects.component.css'],
	imports: [
		NgIf,
		NgForOf,
		ReactiveFormsModule,
		FormsModule,
		MatInputModule,
		MatButtonModule,
		MatFormFieldModule,
		MatIconModule,
		MatDialogModule,
		SpinnerLoaderComponent,
		MatDatepickerModule,
		MatSelectModule,
		MatSnackBarModule,
		MatTooltipModule
	],
})

export class MicroProjectsComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public isLoading: boolean = false;
	public microProjects: MicroProject[] = [];

	private snackBar: MatSnackBar = inject(MatSnackBar);
	private sanitizer: DomSanitizer = inject(DomSanitizer);

	constructor( @Inject(MAT_DIALOG_DATA) private data: { item: Project  },
		private dialogRef: MatDialogRef<MicroProjectsComponent>,
		private fb: FormBuilder,
		private api: ApiService,
		private admin: AdministrativeService,
		private common: CommonService,
		private user: UserService ){
		super();
	}

	ngOnInit(): void {
		this.getProjectPracticesMicro(this.data.item.projectPracticasID, this.data.item.studyPlanID);
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	public getProjectPracticesMicro(projectPracticasID: number, studyPlanID: number): void {
		this.admin.getProjectPracticesMicro(projectPracticasID, studyPlanID).subscribe({
      next: (res) => {
				//console.log('microProjects', res);
				this.microProjects = res;
      }
    });
	}

	public getProjectPracticesExcelContent(item: MicroProject): void{
		this.admin.getProjectPracticesExcelContent(item.projectPracInformativeID).subscribe({
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
				//console.log('err',err);
			}
		});
	}

}
