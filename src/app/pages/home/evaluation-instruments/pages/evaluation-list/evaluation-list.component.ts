import { Component, ViewChild, ElementRef, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { NgClass, NgFor, NgForOf, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { CurrentPeriod, EvaluationInstrumentList } from '@utils/interfaces/others.interfaces';
import { UserService } from '@services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-evaluation-list',
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
		MatDialogModule,
		NgClass
	],
  templateUrl: './evaluation-list.component.html',
  styleUrls: ['./evaluation-list.component.css']
})

export class EvaluationListComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public loading: boolean = false;
	private currentPeriod: CurrentPeriod;
	public evaluationInstruments: EvaluationInstrumentList[] = [];

	private dialog: MatDialog = inject(MatDialog);

	constructor(private fb: FormBuilder,
		private common: CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		public user: UserService,
		private router: Router ){
		super();
	}

	ngOnInit(): void {
		this.getCurrentPeriod();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	private getCurrentPeriod(): void {
		this.loading = true;
    this.api.getCurrentPeriod().subscribe({
      next: (res: CurrentPeriod) => {
        this.currentPeriod = res;
				if(this.currentPeriod?.periodID) this.getEvaluationInstrumentsByPerson(res.periodID);
				this.loading = false;
      },
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.loading = false;
			}
    });
  }

	private getEvaluationInstrumentsByPerson(periodID: number): void {
		const studentID= +sessionStorage.getItem('studentID')! || 0;
		this.loading = true;
    this.api.getEvaluationInstrumentsByPerson(periodID, this.user.currentUser.PersonId, studentID).subscribe({
      next: (res: EvaluationInstrumentList[]) => {
        //console.log('InstrumentsByPerson', res);
				this.evaluationInstruments= res;
				this.loading = false;
      },
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.loading = false;
			}
    });
  }

	continueEvaluation(item: any): void {
		this.router.navigate(['/instrumentos/cuestionario', item.settingEvaluationInstrumentID, this.user.currentUser.PersonId]);
	}
}
