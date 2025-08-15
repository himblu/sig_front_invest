import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { ApiService } from '@services/api.service';
import { inject } from '@angular/core';
import { CommonService } from '@services/common.service';
import { forkJoin, map, Observable } from 'rxjs';
import { PaginatedResource } from '@utils/interfaces/person.interfaces';
import { Editorial } from '@utils/interfaces/library.interface';
// import { Country } from '@utils/interfaces/others.interfaces';

export const EditorialResolver: ResolveFn<any> = (
	route: ActivatedRouteSnapshot,
	state: RouterStateSnapshot,
	api: ApiService = inject(ApiService),
	commonApi: CommonService = inject(CommonService),
): Observable<any> => {
	const observables = [
		api.getEditorials(1),
		// commonApi.getCountries()
	];
	return forkJoin(observables)
		.pipe(map(([editorials, countries]): { editorials: PaginatedResource<Editorial>, /* countries: Country[] */ } => {
			return {
				editorials,
				// countries
			};
		}));
}
