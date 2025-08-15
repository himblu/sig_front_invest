import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { forkJoin, map, Observable } from 'rxjs';
import { AdministrativeService } from '@services/administrative.service';
import { ApiService } from '@services/api.service';

export const BondingStudentResolver: ResolveFn<any> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  adminApi: AdministrativeService = inject(AdministrativeService),
  api: ApiService = inject(ApiService)
): Observable<any> => {
  const observables = [
    adminApi.getPeriods(),
    api.getCurrentPeriod(),
		adminApi.getModalityPractices()
  ];
  return forkJoin(observables)
  .pipe(
    map((
      [
        periods,
        currentPeriod,
				modalityPractices
      ]
    ) => {
    return {
      periods,
      currentPeriod,
			modalityPractices
    };
  }));
}
