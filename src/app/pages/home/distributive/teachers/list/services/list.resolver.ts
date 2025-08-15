import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { forkJoin, map, Observable } from 'rxjs';
import { AdministrativeService } from '@services/administrative.service';

export const ListResolver: ResolveFn<any> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  api: AdministrativeService = inject(AdministrativeService)
): Observable<any> => {
  const observables = [
    api.getPeriods(),
		api.getAllCourses()
  ];
  return forkJoin(observables)
    .pipe(map(([periods, courses]) => {
      return {
        periods,
				courses
      };
  }));
}
