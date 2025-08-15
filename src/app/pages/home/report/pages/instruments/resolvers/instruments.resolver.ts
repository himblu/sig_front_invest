import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { forkJoin, map, Observable } from 'rxjs';
import { ApiService } from '@services/api.service';
import { AdministrativeService } from '@services/administrative.service';

export const instrumentsResolver: ResolveFn<any> = (

	route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
	api: ApiService = inject(ApiService),
	admin: AdministrativeService = inject(AdministrativeService)

): Observable<any> => {

	const observables = [
		admin.getAllPeriods(),
		api.getCurrentPeriod(),
	];

  return forkJoin(observables).pipe(map(([periods, currentPeriod]) => {
		return {
			periods,
			currentPeriod,
		};
	}));
}
