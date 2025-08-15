import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { NgForOf, NgIf } from '@angular/common';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { InputSearchComponent } from '@components/input-shearch/input-search.component';
import { ButtonArrowComponent } from '@components/button-arrow/button-arrow.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DatePipe } from '@angular/common';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css'],
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
	],
	providers: [
    DatePipe
  ],
})
export class LibraryComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	charging: boolean = false;
	public filtersForm!: FormGroup;
	public reservationsForm!: FormGroup;
	shortcuts:any[]=[''];
	books:any[]=[''];
	actualBooks: number = 1;
  totalPageBooks: number = 0;
  countBooks: number = 0;
	pageLimit:number = 10;
	currentDate = new Date();

	constructor(private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private datePipe: DatePipe, ){
		super();
	}

	public ngOnInit(): void {
		this.initForm();
  }

  public override ngOnDestroy() {
    super.ngOnDestroy();
  }

	public initForm():void{
    this.filtersForm = this.fb.group({
      search: [''],
			shortcuts: [''],
    });

		this.reservationsForm = this.fb.group({
			startDate: [this.datePipe.transform(this.currentDate, 'yyyy-MM-dd HH:mm'), [Validators.required]],
			endDate: ['', [Validators.required]],
    });
	}

	private formattedDate(date: Date): string {
    return <string>this.datePipe.transform(date, 'yyyy-MM-dd');
  }

	public changePageBooks(page:number):void{
		this.actualBooks = page;
	}

	public onSubmitReservations(): void{
		//console.log(this.reservationsForm.value);
	}

}
