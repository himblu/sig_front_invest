import { Component, ViewChild, ElementRef, OnInit, OnDestroy, inject, SecurityContext } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { NgForOf, NgIf } from '@angular/common';
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
import { Period } from '@utils/interfaces/period.interfaces';
import { CurrentPeriod } from '@utils/interfaces/others.interfaces';
import { UserService } from '@services/user.service';
import { StudentGrades } from '@utils/interfaces/campus.interfaces';
import { Subscription } from 'rxjs';
import { environment } from '@environments/environment';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-grades',
  templateUrl: './grades.component.html',
  styleUrls: ['./grades.component.css'],
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
		MatTabsModule,
		MatCheckboxModule
	],
})
export class GradesComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public charging: boolean = false;
	public filtersForm!: FormGroup;
	public periods: Period[];
	public currentPeriod: CurrentPeriod;
	public title: string = '';
	public grades: StudentGrades[];
	public studentID: number= +sessionStorage.getItem('studentID');

	private getPdfContentSubscription!: Subscription;
	private sanitizer: DomSanitizer = inject(DomSanitizer);

	constructor(private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService ){
		super();
	}

	public ngOnInit(): void {
		this.getPeriods();
		this.initForm();
		this.getCurrentPeriod();
  }

  public override ngOnDestroy() {
    super.ngOnDestroy();
  }

	private getPeriods(): void {
    this.api.getPeriods().subscribe({
      next: (res) => {
        this.periods = res.data;
      }
    });
  }

	private getCurrentPeriod(): void {
    this.api.getCurrentPeriod().subscribe({
      next: (res: CurrentPeriod) => {
        this.currentPeriod = res;
				this.filtersForm.get('periodID').patchValue(this.currentPeriod.periodID);
				this.getGradesReport(this.currentPeriod.periodID);
      }
    });
  }

	public initForm():void{
    this.filtersForm = this.fb.group({
      periodID: ['']
    });
	}

	public getGradesReport(periodID:number):void{
		this.api.getStudentGradesReport(periodID, +sessionStorage.getItem('studentID')).subscribe({
      next: (res) => {
				//console.log(res);
				this.grades=res;
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
