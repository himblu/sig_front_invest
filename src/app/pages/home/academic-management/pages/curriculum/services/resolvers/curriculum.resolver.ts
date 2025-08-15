import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { forkJoin, map, Observable } from 'rxjs';
import { AdministrativeService } from '@services/administrative.service';
import { ApiService } from '@services/api.service';

export const CurriculumResolver: ResolveFn<any> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  adminApi: AdministrativeService = inject(AdministrativeService),
	api: ApiService = inject(ApiService)
): Observable<any> => {
  const id = route.params['career-course'];
	const observables = [
		adminApi.getSubjectsFromCareer(id),
		api.getOrganizationalUnits(),
		adminApi.getCareer(id)
	];
  return forkJoin(observables)
		.pipe(map(([subjects, organizationUnits, career]) => {
			return {
				subjects,
				organizationUnits,
				career
			};
		}));
}
