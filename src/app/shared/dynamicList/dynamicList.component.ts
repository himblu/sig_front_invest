import { Component,  Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgForOf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import Swal from 'sweetalert2';

@Component({
	selector: 'app-dynamic-list',
	standalone: true,
	templateUrl: './dynamicList.component.html',
	styleUrls: ['./dynamicList.component.css'],
	imports: [
		MatListModule,
		MatIconModule,
		MatInputModule,
		MatCardModule,
		FormsModule,
		ReactiveFormsModule,
		NgForOf,
		MatButtonModule,
		MatCheckboxModule
	]
})
export class DynamicListComponent {
	@Input() availableEvaluators: any[] = [];
	@Output() data = new EventEmitter<any>(); // Emite cambios al padre

	form: FormGroup;
	filterAvailable = new FormControl('');
	filterSelected = new FormControl('');
	selectedEvaluated: any[] = [];

	constructor(private fb: FormBuilder) {
		this.form = this.fb.group({
			allAvailableSelected: [false],
			allSelectedSelected: [false],
			selectedAvailable: [[]],
			selectedSelected: [[]]
		});
	}

	get filteredAvailableEvaluators() {
		const filter = this.filterAvailable.value.toLowerCase();
		return this.availableEvaluators.filter(e => e.label.fullName.toLowerCase().includes(filter));
	}

	get filteredSelectedEvaluators() {
		const filter = this.filterSelected.value.toLowerCase();
		return this.selectedEvaluated.filter(e => e.label.fullName.toLowerCase().includes(filter));
	}

	toggleSelectAllAvailable() {
		const allSelected = this.form.get('allAvailableSelected')?.value;
		const currentSelection = allSelected ? [...this.availableEvaluators] : [];
		this.form.get('selectedAvailable')?.setValue(currentSelection);
	}

	toggleSelectAllSelected() {
		const allSelected = this.form.get('allSelectedSelected')?.value;
		const currentSelection = allSelected ? [...this.selectedEvaluated] : [];
		this.form.get('selectedSelected')?.setValue(currentSelection);
	}

	checkSelectAllAvailable() {
		const selected = this.form.get('selectedAvailable')?.value;
		this.form.get('allAvailableSelected')?.setValue(selected.length === this.availableEvaluators.length);
	}

	checkSelectAllSelected() {
		const selected = this.form.get('selectedSelected')?.value;
		this.form.get('allSelectedSelected')?.setValue(selected.length === this.selectedEvaluated.length);
	}

	moveToSelected() {
		const selectedAvailable = this.form.get('selectedAvailable')?.value;
		if (selectedAvailable.length > 0 && this.form.get('allSelectedSelected')?.value) {
			this.form.get('allSelectedSelected')?.setValue(false)
		}
		this.selectedEvaluated.push(...selectedAvailable);
		this.availableEvaluators = this.availableEvaluators.filter((c) => !selectedAvailable.includes(c));
		this.form.get('selectedAvailable')?.setValue([]);
		this.checkSelectAllAvailable();
		if (this.filteredAvailableEvaluators.length==0){
			this.form.get('allAvailableSelected')?.setValue(false)
		}
	}

	moveToAvailable() {
		const selectedSelected = this.form.get('selectedSelected')?.value;
		if (selectedSelected.length > 0 && this.form.get('allAvailableSelected')?.value) {
			this.form.get('allAvailableSelected')?.setValue(false)
		}

		this.availableEvaluators.push(...selectedSelected);
		this.selectedEvaluated = this.selectedEvaluated.filter((c) => !selectedSelected.includes(c));
		this.form.get('selectedSelected')?.setValue([]);
		this.checkSelectAllSelected();
		if (this.filteredSelectedEvaluators.length==0){
			this.form.get('allSelectedSelected')?.setValue(false)
		}
	}

	create() {
		const evaluadores = this.form.value.selectedAvailable;
		const evaluados = this.form.value.selectedSelected;

		if (!evaluadores?.length || !evaluados?.length) {
			Swal.fire({
				icon: 'warning',
				title: 'Falta información',
				text: 'Debe seleccionar al menos un evaluador y un evaluado antes de crear el grupo.',
				confirmButtonText: 'Entendido'
			});
			return;
		}

		this.data.emit({
			"Evaluadores": evaluadores,
			"Evaluados": evaluados
		});
	}
}

