import { ViewScheduleComponent } from './components/view-schedule/view-schedule.component';
import { NgForOf, NgIf, TitleCasePipe, CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Form, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { ActivatedRoute } from '@angular/router';
import { ProgressComponent } from '@components/progress/progress.component';
import { AdministrativeService } from '@services/administrative.service';
import { SPGetCareer} from '@utils/interfaces/campus.interfaces';
import { CurrentPeriodItca, Period } from '@utils/interfaces/period.interfaces';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { map } from 'rxjs';
import {ViewExpandLimitComponent} from './components/view-expand-limit/view-expand-limit.component';
import {MatTooltipModule} from '@angular/material/tooltip';

const PERIOD_HEADER: string[] = ['Escuela',"Carrera",'Malla Curricular','Modalidad','Sección/Módulo','Nivel y Paralelo','Aula','Acción'];

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  standalone: true,
	imports: [
		MatButtonModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatSelectModule,
		NgForOf,
		NgIf,
		ProgressComponent,
		TitleCasePipe,
		MatSliderModule,
		CommonModule,
		MatDialogModule,
		MatIconModule,
		MatTooltipModule
	]
})
export class ViewComponent extends OnDestroyMixin implements OnInit {

  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  periods: Period[];
	private adminApi: AdministrativeService = inject(AdministrativeService);
  formFilters: FormGroup;
  careers: SPGetCareer[];
  distibutive!:any;
  distributiveHeader: string[] = PERIOD_HEADER;
  cycles: any[];
  private dialog: MatDialog = inject(MatDialog);

  constructor(
    private fb:FormBuilder
  ) {
    super();
  }

  ngOnInit(): void {
    this.getDataFromResolver();
    this.initForm();
    this.loadInformation();
  }

  initForm() {
    this.formFilters = this.fb.group({
      periodID: [null, Validators.required],
      levelID: [null, Validators.required],
      careerID: [null, Validators.required],
    })
  }
  loadInformation(){
    this.adminApi.getCurrentPeriodItca().subscribe({
      next: (resp:CurrentPeriodItca) => {
        this.formFilters.get('periodID')?.setValue(resp.periodID);
        this.adminApi.getDistibutive(resp.periodID,0,0).subscribe({
          next: (resp:any) => {
						//console.log(resp);
            this.distibutive = resp;
          }
        })
      }
    });
  }

  private getDataFromResolver(): void {
		this.activatedRoute.data
			.pipe(
				untilComponentDestroyed(this),
				map((value: any) => value['resolver']))
			.subscribe({
				next: (value: { periods: Period[], careers: any[], cycles:any[] }) => {
					this.periods = value.periods;
          this.careers = value.careers
          this.cycles = value.cycles
          //console.log(this.cycles);

				},
			});
	}


  searchDistibutive(){
    if(this.formFilters.invalid){
      this.formFilters.markAllAsTouched();
      return;
    }
    const { periodID, careerID, levelID } = this.formFilters.value;
    this.adminApi.getDistibutive(periodID, careerID, levelID).subscribe({
      next: (resp:any) => {
				//console.log(resp);
        this.distibutive = resp;
      }
    })
  }

  transformNumber(word: string): string {
    if(!word) return '';
    const numberObj = word.split('-');
    const numberToWordsMap: { [key: number]: string } = {
      1: 'Primero',
      2: 'Segundo',
      3: 'Tercero',
      4: 'Cuarto',
      5: 'Quinto',
    };
    let result = numberToWordsMap[Number(numberObj[0])];
    result = result + ' - ' + numberObj[1];
    return result;
  }

  showSchedule(obj:any){
    obj['periodID'] = this.formFilters.get('periodID')?.value;
    const config: MatDialogConfig = new MatDialogConfig();
    config.id = 'DistributiveSchedule';
    config.autoFocus = false;
    config.minWidth = '70vw';
    config.maxWidth = '80vw';
    config.minHeight = '70vh';
    config.maxHeight = '90vh';
    config.panelClass = 'transparent-panel';
    config.data = {
      obj
    }
    const dialog = this.dialog.open(ViewScheduleComponent, config);
    dialog.afterClosed()
    .pipe(untilComponentDestroyed(this))
    .subscribe((res: boolean) => {
      if (res) {
        console.log(res);
      }
    });
  }

	showAddVacancies(obj:any){
		obj['periodID'] = this.formFilters.get('periodID')?.value;
		const config: MatDialogConfig = new MatDialogConfig();
		config.id = 'DistributiveLimitAdd';
		config.autoFocus = false;
		config.minWidth = '70vw';
		config.maxWidth = '80vw';
		config.minHeight = 'auto';
		config.maxHeight = 'auto';
		config.panelClass = 'transparent-panel';
		config.data = {
			obj
		};
		const dialog = this.dialog.open(ViewExpandLimitComponent, config);
		dialog.afterClosed()
			.pipe(untilComponentDestroyed(this))
			.subscribe((res: boolean) => {
				if (res) {
					console.log(res);
				}
			});
	}
}
