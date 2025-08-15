import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { forkJoin, map, Observable } from 'rxjs';
import { ApiService } from '@services/api.service';
import { Paginated } from '@utils/interfaces/others.interfaces';
import { Period } from '@utils/interfaces/period.interfaces';
import { AdministrativeService } from '@services/administrative.service';

export const EnrolledStudentReportResolver: ResolveFn<any> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  api: ApiService = inject(ApiService),
	admin: AdministrativeService = inject(AdministrativeService)

): Observable<any> => {
  const observables = [
    api.getPeriods(),
    api.getFileStatuses(),
		admin.getCycles(),
		admin.getParallels(),
		admin.getCareerByActivePeriod(),
		admin.getCurrentPeriodItca()
  ];
  return forkJoin(observables)
  .pipe(
    map((
      [
        periods,
        fileStatuses,
				cycles,
				parallels,
				careers,
				currentPeriod
      ]
    ) => {
    return {
      periods: (periods as Paginated<Period>).data,
      fileStatuses,
			cycles,
			parallels,
			careers,
			currentPeriod
    };
  }));
}
