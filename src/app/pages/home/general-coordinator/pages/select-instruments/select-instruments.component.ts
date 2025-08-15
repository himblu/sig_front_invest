import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormsModule, ReactiveFormsModule} from "@angular/forms";
import { DynamicFormComponent } from "@shared/dynamicForm/dynamicForm.component";
import { MatCardModule } from "@angular/material/card";
import { MatInputModule } from "@angular/material/input";
import { NgForOf, NgIf } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { DynamicCardsUsersComponent } from "@shared/dynamicCardsUsers/dynamicCardsUsers.component";
import { FormInstrumentService } from "@services/formInstrument.service";
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '@services/api.service';
import { MatSnackBar , MatSnackBarModule } from "@angular/material/snack-bar";
import { DynamicListComponent } from "@shared/dynamicList/dynamicList.component";
import { MatMenuModule } from '@angular/material/menu';
import { LoadingService } from '@services/loading.service';
import { FormRow , Instrument } from '@utils/interfaces/others.interfaces';

@Component({
	selector: 'app-pea-list',
	templateUrl: './select-instruments.component.html',
	styleUrls: ['./select-instruments.component.css'],
	imports: [
		DynamicFormComponent,
		MatCardModule,
		MatInputModule,
		FormsModule,
		ReactiveFormsModule,
		MatIconModule,
		MatListModule,
		MatButtonModule,
		MatTooltipModule,
		NgIf,
		NgForOf,
		DynamicCardsUsersComponent,
		MatSnackBarModule,
		DynamicListComponent,
		MatMenuModule,
	],
	standalone: true
})
export class SelectInstrumentsComponent implements OnInit {
	searchText: string = '';
	formConfig: FormRow[] = [];
	instrumentSelected?: Instrument;
	isFormActive: boolean = false;
	instruments: Instrument[] = [];
	data: any[] = [];
	dataFollowUp: any[] = [];
	dataEvaluationTeachers: any[] = [];
	selectedUsers: Record<string, any> = {};
	valuesSelected: Record<string, any> = {};

	constructor(
		private cdr: ChangeDetectorRef,
		private formService: FormInstrumentService,
		private api: ApiService,
		private snackBar: MatSnackBar,
		private loadingService: LoadingService
	) {}

	ngOnInit(): void {
		this.getAllInstruments();
	}

	getAllInstruments() {
		this.loadingService.show('Cargando instrumentos...');
		this.api.getAllInstruments().subscribe({
			next: (res: Instrument[]) => {
				this.instruments = res;
				this.loadingService.hide();
			},
			error: (err: HttpErrorResponse) => {
				console.error("Error al obtener instrumentos", err);
				this.loadingService.hide();
			}
		});
	}

	filteredInstruments() {
		return this.instruments.filter(instrument =>
			instrument.FormName.toLowerCase().includes(this.searchText.toLowerCase())
		);
	}

	showForm(formConfig: Instrument) {
		this.formConfig = formConfig.FormData;
		this.instrumentSelected = formConfig;
		this.isFormActive = true;
	}

	goBack() {
		this.instruments = [];
		this.isFormActive = false;
		this.data = [];
		this.selectedUsers = {};
		this.formConfig = [];
		this.dataFollowUp = [];
		this.dataEvaluationTeachers = [];
		this.getAllInstruments();
	}

	onSubmit() {
		this.loadingService.show('Guardando información...');
		if (!this.instrumentSelected) return;

		this.formService.postDataForm(this.instrumentSelected.endPointPostResult, {
			...(this.instrumentSelected.evaluationTeachers ? { data: this.data } : this.selectedUsers),
			...this.valuesSelected
		}).subscribe({
			next: () => {
				this.loadingService.hide();
				this.snackBar.open('Configuración guardada exitosamente', '', {
					duration: 3000,
					verticalPosition: 'top',
					horizontalPosition: 'end',
					panelClass: ['success-snackbar']
				});
			},
			error: () => {
				this.loadingService.hide();
				this.snackBar.open('Error, contacte al administrador', '', {
					duration: 3000,
					verticalPosition: 'top',
					horizontalPosition: 'end',
					panelClass: ['warning-snackbar']
				});
			}
		});
	}

	onSelectionChange(selectedValues: any) {
		this.selectedUsers = selectedValues;
	}

	onFormChange(event: any) {
		if (!event || Object.keys(event).length === 0 ) {
			this.selectedUsers = {};
			this.dataEvaluationTeachers = [];
		} else {
			this.valuesSelected = event.form;
			if (!this.instrumentSelected) return;

			this.formService.getData(this.instrumentSelected.endPointGetInstrument, event.form).subscribe(response => {
				if (this.instrumentSelected.evaluationTeachers) {
					this.dataEvaluationTeachers = response;
				} else {
					this.dataFollowUp = response;
				}
				this.cdr.detectChanges();
			});
		}
	}

	fillData(event: any) {
		this.data.push(event);
	}

	clearResult() {
		this.dataFollowUp = [];
		this.dataEvaluationTeachers = [];
		this.data = [];
	}

	deleteGroup(index: number) {
		this.data.splice(index, 1);
		this.data = [...this.data];

		if (this.data.length === 0) {
			this.selectedUsers = {};
		}
	}

	protected readonly Object = Object;
	protected readonly Array = Array;
}
