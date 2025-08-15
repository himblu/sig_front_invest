import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { forkJoin, map, Observable } from 'rxjs';
import { ApiService } from '@services/api.service';
import { Paginated } from '@utils/interfaces/others.interfaces';
import { Period } from '@utils/interfaces/period.interfaces';

export const WelfareReportResolver: ResolveFn<any> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  api: ApiService = inject(ApiService)
): Observable<any> => {
  const observables = [
    api.getPeriods(),
    api.getFileStatuses()
  ];
  return forkJoin(observables)
  .pipe(
    map((
      [
        periods,
        fileStatuses
      ]
    ) => {
    return {
      periods: (periods as Paginated<Period>).data,
      fileStatuses
    };
  }));
}
