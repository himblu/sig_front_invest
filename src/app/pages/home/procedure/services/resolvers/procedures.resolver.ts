import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { forkJoin, map, Observable } from 'rxjs';
import { ApiService } from '@services/api.service';
import { AdministrativeService } from '@services/administrative.service';
import { RrhhService } from '@services/rrhh.service';

export const proceduresResolver: ResolveFn<any> = (

	route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
	api: ApiService = inject(ApiService),
	admin: AdministrativeService = inject(AdministrativeService),
	rrhh: RrhhService= inject(RrhhService),

): Observable<any> => {

	const observables = [
		admin.getCycles(),
		admin.getCurrentPeriodItca(),
		admin.getPeriods(),
		api.getTypeRolByRolID(+sessionStorage.getItem('rolID')),
		api.getDepartmentsByRol(+sessionStorage.getItem('rolID')),
		rrhh.getArea()
	];

  return forkJoin(observables).pipe(map(([cycles, currentPeriod, periods, types, departments, areas]) => {
		return {
			cycles,
			currentPeriod,
			periods,
			types,
			departments,
			areas
		};
	}));
}
