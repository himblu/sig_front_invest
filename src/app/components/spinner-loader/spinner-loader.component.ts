import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgStyle } from '@angular/common';

@Component({
	selector: 'spinner-loader',
	templateUrl: './spinner-loader.component.html',
	styleUrls: ['./spinner-loader.component.css'],
	imports: [
		MatProgressSpinnerModule,
		NgStyle
	],
	standalone: true
})

export class SpinnerLoaderComponent {
	@Input({ required: false }) public absolute: boolean = false;
}
