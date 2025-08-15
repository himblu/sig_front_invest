import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class LoadingService {
	private loadingSubject = new BehaviorSubject<boolean>(false);
	private loadingMessageSubject = new BehaviorSubject<string>('Cargando'); // Mensaje por defecto

	loading$ = this.loadingSubject.asObservable();
	loadingMessage$ = this.loadingMessageSubject.asObservable();

	show(message: string = 'Cargando') {
		this.loadingMessageSubject.next(message); // ✅ Establece el mensaje dinámico
		this.loadingSubject.next(true);
	}

	hide() {
		this.loadingSubject.next(false);
	}
}
