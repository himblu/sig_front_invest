import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from "@environments/environment";
import {Observable} from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class FormInstrumentService {
	private apiURL: string = environment.url;

	constructor(private http: HttpClient) {
	}

	getOptions(endpoint: string): Observable<any> {
		return this.http.get<any>(`${this.apiURL}${endpoint}`);
	}

	getData(endpoint: string, params: any): Observable<any> {
		let httpParams = new HttpParams();
		// Agregar dinámicamente los parámetros si existen
		if (params) {
			Object.keys(params).forEach(key => {
				httpParams = httpParams.set(key, params[key]);
			});
		}
		return this.http.get<any>(`${this.apiURL}${endpoint}`, {params: httpParams});
	}

	postDataForm(endpoint: string, body: any): Observable<any> {
		return this.http.post(
			`${this.apiURL}${endpoint}`,
			body
		);
	}


}
