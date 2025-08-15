import { Component, ViewChild, ElementRef, OnInit, OnDestroy, inject } from '@angular/core';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, FormArray, FormControl} from '@angular/forms';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { NgClass, NgForOf, NgIf, NgStyle } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Period } from '@utils/interfaces/period.interfaces';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { School, SPGetCareer } from '@utils/interfaces/campus.interfaces';
import { CurrentPeriod, Director, Tables } from '@utils/interfaces/others.interfaces';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { AssignSchoolComponent } from '../../components/assign-school/assign-school.component';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '@services/api.service';
import { CommonService } from '@services/common.service';
import { AdministrativeService } from '@services/administrative.service';

export interface Data {
	currentPeriod: CurrentPeriod,
	periods: Period[],
	careers: SPGetCareer[],
	schools: School[],
}

@Component({
  selector: 'app-directors',
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
		MatPaginatorModule,
		MatDialogModule,
		NgStyle,
		NgClass
	],
  templateUrl: './directors.component.html',
  styleUrls: ['./directors.component.css']
})

export class DirectorsComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public isLoading: boolean= false;
	public filtersForm!: FormGroup;
	public periods: Period[];
	public currentPeriod: CurrentPeriod;
	public careers: SPGetCareer[] = [];
	public schools: School[] = [];
	public pageIndex: number = 1;
  public pageSize: number = 10;
  public length: number = 0;
	public pageEvent!: PageEvent;
  public pageSizeOptions: number[] = [5, 10, 25, 50, 100];
	public directorsList: Director[] = [];

	private dialog: MatDialog = inject(MatDialog);

	constructor(
		private fb: FormBuilder,
		private activatedRoute: ActivatedRoute,
		private api: ApiService,
		private common: CommonService,
		private admin: AdministrativeService,
	){
		super();
		this.initForm();
	}

	ngOnInit(): void {
		this.getDataFromResolver();
		this.getDirectorList();
	}

	public initForm():void{
    this.filtersForm = this.fb.group({
      periodID: [0],
			search: ['']
    });
		const search: FormControl = this.filtersForm.get('search') as FormControl;
		if (search) {
			search.valueChanges.pipe(
				debounceTime(300),
				distinctUntilChanged(),
				untilComponentDestroyed(this)
			).subscribe({
				next: (search) => {
					this.getDirectorList();
				}
			});
		}
  }

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	private getDataFromResolver(): void {
		this.activatedRoute.data.pipe(untilComponentDestroyed(this),
		map((value: any) => value['resolver'])).subscribe({
			next: (value: { periods: Period[], currentPeriod: CurrentPeriod, careers: Tables<SPGetCareer>, schools: Tables<School>}) => {
				this.periods= value.periods,
				this.currentPeriod= value.currentPeriod,
				this.careers= value.careers.data;
				this.schools= value.schools.data;
			},
		});
	}

	public getDirectorList(){
		this.api.getDirectorList(this.filtersForm.get('periodID').value, this.filtersForm.get('search').value, this.pageIndex, this.pageSize).subscribe({
			next: (res) => {
				//console.log(res);
				this.directorsList= res.data;
				this.length = res.count;
			},
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
		});
	}

	public getPaginator(event: PageEvent): PageEvent {
		this.pageIndex = event.pageIndex+1;
		this.pageSize = event.pageSize;
		this.getDirectorList();
		return event;
	}

	public openDialog(): void {
		const arr: Data= {
			currentPeriod: this.currentPeriod,
			periods: this.periods,
			careers: this.careers,
			schools: this.schools
		};
		const config: MatDialogConfig = new MatDialogConfig();
		config.id = 'AssignSchoolComponent';
		config.autoFocus = false;
		config.minWidth = '45vw';
		config.maxWidth = '45vw';
		config.panelClass = 'transparent-panel';
		config.data = { arr };
		config.disableClose = false;
		const dialog = this.dialog.open(AssignSchoolComponent, config);
		dialog.afterClosed()
		.pipe(untilComponentDestroyed(this))
		.subscribe((res) => {
			if(res) this.getDirectorList();
		});
	}

	public putStatusDirector(item: Director){
		let status = 1;
		if(item.statusID) status= 0;
		let body={
			"periodID": item.periodID,
			"schoolID": item.schoolID,
			"personID": item.personID,
			"statusID" : status
		}
		this.isLoading = true;
		this.admin.putStatusDirector(body)
		.subscribe({
			next: (res) => {
				//console.log(resp);
				this.common.message(`${res.message}`,'','success','#86bc57');
				this.getDirectorList();
				this.isLoading = false;
			},
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
				this.isLoading = false;
			}
		})
	}
}
