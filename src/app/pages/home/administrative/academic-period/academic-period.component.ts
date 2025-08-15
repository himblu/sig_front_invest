import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroupDirective, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateAdapter, ErrorStateMatcher, MatNativeDateModule } from '@angular/material/core';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { CampusData, Period } from '@utils/interfaces/period.interfaces';
import { NgForOf, NgIf, UpperCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { InputSearchComponent } from '@components/input-shearch/input-search.component';
import { ButtonArrowComponent } from '@components/button-arrow/button-arrow.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-academic-period',
  templateUrl: './academic-period.component.html',
	styleUrls: ['./academic-period.component.scss'],
  styles: [],
    imports: [
        UpperCasePipe,
        NgIf,
        NgForOf,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        ReactiveFormsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        InputSearchComponent,
        ButtonArrowComponent,
				MatTooltipModule,
				MatIconModule
    ],
  standalone: true
})

export class AcademicPeriodComponent implements OnInit {

  matcher = new MyErrorStateMatcher();
  periodsList: CampusData[] = [];
  currentPeriodsList: CampusData[] = [];
  currentPeriod: CampusData;
  pastPeriod!: CampusData;
  cargando: boolean = false;
  count: number = 0;
  totalPage:number = 1;
  actual: number = 1;
  limit: number = 10;
	title: any='';
	flagOnSubmit:  number=0;

	@ViewChild('modalClose', { read: ElementRef }) public modalClose: ElementRef;

  constructor( private dateAdapter: DateAdapter<Date>,
                private fb: FormBuilder,
                private common: CommonService,
                private admin: AdministrativeService ){
    // this.dateAdapter.setLocale('en-GB'); //dd/MM/yyyy
  }
  ngOnInit(): void {
    this.loadPeriods();
  }

  rangeDateStartFormControl = new FormControl('', [Validators.required]);
  rangeDateEndFormControl = new FormControl('', [Validators.required]);

  newPeriodFrom = this.fb.group({
		periodID:					[0],
    periodName:       ['', [Validators.required] ],
    periodDetail:     [''],
    periodDateStart:  ['', [Validators.required] ],
    periodDateEnd:    ['', [Validators.required] ],
		user:							[sessionStorage.getItem('name')],
  });

  changePage( page: number){
    this.actual = page;
    this.search('');
  }

  getCurrentPeriod(){
    this.admin.getCurrentPeriod()
      .subscribe( period => {
        if(period.count > 0){
          this.currentPeriodsList = period.data
          this.currentPeriod = this.currentPeriodsList[0];
          this.pastPeriod = this.currentPeriodsList[1];
        }
      })
  }

  loadPeriods(){
    this.cargando = true;
    this.getCurrentPeriod();
    this.admin.getPeriod()
      .subscribe( period => {
        if(period.count > 0){
          this.count = period.count;
          this.periodsList = period.data;
          this.cargando= false;
          this.totalPage = Math.ceil(this.count / this.limit);
        }else{
          this.cargando= false;
        }
      })
  }

	openModal(auxForSubmit:number, item?:any){
		if(auxForSubmit==0){
			this.title='Agregar periodo Académico'
			this.newPeriodFrom.reset()
			this.flagOnSubmit=0;
		}else if(auxForSubmit==1){
			this.title='Actualizar periodo Académico'
			this.newPeriodFrom.patchValue(item);
			this.flagOnSubmit=1;
		}
	}

  public onSubmit(): void{
		this.cargando=true;
		if(this.newPeriodFrom.valid){
			const formvalue = this.newPeriodFrom.value as Period;
			//console.log(formvalue)
			if(this.flagOnSubmit == 0){
				this.admin.postPeriod(formvalue)
				.subscribe( (resp: any) => {
					this.common.message(`${resp.message}`,'','success','#86bc57');
					this.loadPeriods();
					this.cargando = false;
					this.modalClose.nativeElement.click();
				}, (err) => {
					this.cargando = false;
					this.common.message(`${err.error.error}`,`${err.error.message[0]}`, 'error', '#f5637e');
				});
			}else if(this.flagOnSubmit == 1){
				this.admin.putPeriod(formvalue)
				.subscribe( (resp: any) => {
					this.common.message(`${resp.message}`,'','success','#86bc57');
					this.loadPeriods();
					this.cargando = false;
					this.modalClose.nativeElement.click();
				}, (err) => {
					this.cargando = false;
					this.common.message(`${err.error.error}`,`${err.error.message[0]}`, 'error', '#f5637e');
				});
			}
			}else{
				this.cargando = false;
				this.common.message('Informacón Incompleta','Revise que ningun campo este en color rojo', 'error','#f5637e');
			}
  }

  search( filter: string ){
    this.admin.getPeriod(this.actual, filter)
    .subscribe( period => {
      this.count = period.count;
      this.periodsList = period.data;
      this.totalPage = Math.ceil(this.count / this.limit);
    })
  }

}
