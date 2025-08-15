import { Component } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { LoadingService } from '@services/loading.service';

@Component({
	selector: 'app-loading',
	template: `
		<div class="loading-overlay" *ngIf="isLoading$ | async">
			<div class="loading-modal">
				<div class="alert alert-info text-center">
					<h4 class="alert-heading">{{ loadingMessage$ | async }}</h4> <!-- Mensaje dinámico -->
					<i class="fa fa-spin fa-refresh fa-3x"></i>
					<p class="mb-0">Por favor esperar...</p>
				</div>
			</div>
		</div>
	`,
	styles: [`
		.loading-overlay {
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: rgba(0, 0, 0, 0.5);
			display: flex;
			justify-content: center;
			align-items: center;
			z-index: 1050;
		}

		.loading-modal {
			background: white;
			padding: 20px;
			border-radius: 8px;
			box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
			width: 45rem;
		}
	`],
	imports: [AsyncPipe, NgIf],
	standalone: true
})
export class LoadingComponent {
	isLoading$ = this.loadingService.loading$;
	loadingMessage$ = this.loadingService.loadingMessage$; // ✅ Obtiene el mensaje dinámico

	constructor(private loadingService: LoadingService) {}
}
