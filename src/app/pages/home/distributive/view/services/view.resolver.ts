import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { forkJoin, map, Observable } from 'rxjs';
import { AdministrativeService } from '@services/administrative.service';

export const ViewResolver: ResolveFn<any> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  api: AdministrativeService = inject(AdministrativeService)
): Observable<any> => {
  const observables = [
    api.getPeriods(),
    api.getCareesCurrentPerod(),
    api.getCycles()
  ];
  return forkJoin(observables)
    .pipe(map(([periods, careers, cycles]) => {
      return {
        periods,
        careers,
        cycles
      };
  }));
}
