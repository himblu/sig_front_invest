import { ActivatedRouteSnapshot, ResolveFn, Router, RouterStateSnapshot } from '@angular/router';
import { ApiService } from '@services/api.service';
import { inject } from '@angular/core';
import { AdministrativeService } from '@services/administrative.service';
import { forkJoin, map, Observable, of } from 'rxjs';

export const SetInstrumentResolver: ResolveFn<any> = (
		_route: ActivatedRouteSnapshot = inject(ActivatedRouteSnapshot),
		_state: RouterStateSnapshot = inject(RouterStateSnapshot),
		_router: Router = inject(Router),
		api: ApiService = inject(ApiService),
		adminApi: AdministrativeService = inject(AdministrativeService),
) => {
		let observables: Observable<any>[] = [];
		observables = [
			adminApi.getAllCampuses(),
			// adminApi.getAdministrativeStaff(),
			adminApi.getInstrumentEvaluationComponent(),
			adminApi.getInstrumentEvaluationType(),
			adminApi.getInstrumentEvaluationActivity(),
			adminApi.getInstrumentEvaluationComponent()
		];
		return forkJoin(observables)
			.pipe(
				map(([
					campuses,
		      // administrativeStaff,
					components,
					instrumentEvaluationTypes,
					instrumentEvaluationActivities,
					instrumentEvaluationComponents
	      ]) => {
					return {
						campuses,
            // administrativeStaff,
            components,
						instrumentEvaluationTypes,
						instrumentEvaluationActivities,
						instrumentEvaluationComponents
					};
				})
			);
	};
