import {Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation, booleanAttribute} from '@angular/core';
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {KeyValuePipe, NgForOf, NgIf, TitleCasePipe} from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import {MatTooltipModule} from '@angular/material/tooltip';
import {Label} from '@utils/interfaces/others.interfaces';

@Component({
	selector: 'app-cards-users',
	standalone: true,
	templateUrl: './dynamicCardsUsers.component.html',
	styleUrls: ['./dynamicCardsUsers.component.css'],
	encapsulation: ViewEncapsulation.None,
	imports: [
		MatListModule,
		MatIconModule,
		MatInputModule,
		MatCardModule,
		FormsModule,
		ReactiveFormsModule,
		TitleCasePipe,
		NgForOf,
		KeyValuePipe,
		MatTooltipModule,
		NgIf
	]
})
export class DynamicCardsUsersComponent implements OnInit {
	@Input() data: { [key: string]: any[] } = {}; // Recibe las categorías dinámicamente
	@Input({transform: booleanAttribute}) isDisabled: boolean = false; // Bloquear selección
	@Input({transform: booleanAttribute}) selectAll: boolean = false; // Seleccionar todo por defecto
	@Output() selectionChange = new EventEmitter<any>(); // Emite cambios al padre

	searchText: { [key: string]: string } = {}; // Buscador para cada categoría
	form: FormGroup = new FormGroup({}); // Formulario para almacenar selección

	constructor() {}

	ngOnInit() {
		this.initializeFormControls(); // ✅ Separamos la lógica en un método


		// Emitir cambios al padre cuando se selecciona algo, incluyendo valores deshabilitados
		this.form.valueChanges.subscribe(() => {
			this.emitSelection();
		});

		// Emitir valores iniciales también
		this.emitSelection();
	}

	private initializeFormControls(): void {
		Object.keys(this.data).forEach(category => {
			this.searchText[category] = ''; // Inicializa el buscador

			// Obtener todas las opciones si `selectAll` está activado, sino dejar vacío
			const initialSelection = this.selectAll ? this.data[category].map(option => option) : [];

			const control = new FormControl(initialSelection);

			if (this.isDisabled) {
				control.disable(); // Deshabilitar selección si `isDisabled` es true
			}

			this.form.addControl(category, control);
		});
	}

	// ✅ Emitir valores del formulario incluyendo los deshabilitados
	private emitSelection() {
		this.selectionChange.emit(this.form.getRawValue()); // getRawValue() incluye los valores deshabilitados
	}


	// Método para filtrar opciones dinámicamente según el input de búsqueda
	filteredOptions(category: string) {
		return this.data[category].filter(option =>
			option.label?.fullName.toLowerCase().includes(this.searchText[category].toLowerCase())
		);
	}

	// Método para obtener el FormControl de una categoría
	getFormControl(category: string): FormControl {
		return this.form.get(category) as FormControl;
	}


	getFullText(label: Label): string {
		if (!label) return '';

		let text = '';

		if (label.projectDesc) {
			text += label.projectDesc;
		}
		if (label.fullName) {
			text += (text ? ' - ' : '') + label.fullName;
		}
		if (label.courseName) {
			text += (text ? ' - ' : '') + label.courseName;
		}
		if (label.cycleDesc) {
			text += (text ? ' - ' : '') + label.cycleDesc;
		}
		if (label.parallelCode) {
			text += (text ? ' - ' : '') + label.parallelCode;
		}
		if (label.codeProject) {
			text += (text ? ' - ' : '') + label.codeProject;
		}
		if (label.position) {
			text += (text ? ' - ' : '') + label.position;
		}

		return text;
	}
}
