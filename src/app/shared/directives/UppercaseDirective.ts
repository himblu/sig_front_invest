import { Directive, HostListener, ElementRef, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
	standalone: true,
	selector: '[dUppercase]',
})
export class UppercaseDirective {
	constructor(
		private el: ElementRef,
		@Optional() private control: NgControl // Hacerlo opcional
	) {}

	@HostListener('input', ['$event'])
	onInput(event: Event): void {
		const input = event.target as HTMLInputElement;
		const uppercaseValue = input.value.toUpperCase();
		input.value = uppercaseValue;

		// Si `NgControl` está disponible, actualiza el valor del modelo reactivo
		if (this.control) {
			this.control.control?.setValue(uppercaseValue, { emitEvent: false });
		}
	}
}
