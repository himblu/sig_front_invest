import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { forkJoin, map, Observable } from 'rxjs';
import { AdministrativeService } from '@services/administrative.service';

export const ModelerResolver: ResolveFn<any> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  api: AdministrativeService = inject(AdministrativeService)
): Observable<any> => {
  const observables = [
    api.getAllCampuses(), // Sucursales
		api.getParallels()
  ];
  return forkJoin(observables)
    .pipe(map(([campuses, parallels]) => {
      return {
        campuses: campuses,
				parallels: parallels
      };
  }));
}
