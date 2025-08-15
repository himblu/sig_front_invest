import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { forkJoin, map, Observable } from 'rxjs';
import { AdministrativeService } from '@services/administrative.service';

export const CareersResolver: ResolveFn<any> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  api: AdministrativeService = inject(AdministrativeService)
): Observable<any> => {
  const observables = [
    api.getPeriods(),
		api.getAllBuilds()
  ];
  return forkJoin(observables)
    .pipe(map(([periods, builds]) => {
      return {
        periods,
				builds
      };
  }));
}
