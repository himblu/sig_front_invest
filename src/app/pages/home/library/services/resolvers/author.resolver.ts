import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { forkJoin, map, Observable } from 'rxjs';
import { ApiService } from '@services/api.service';
import { CommonService } from '@services/common.service';
import { inject } from '@angular/core';
import { PaginatedResource } from '@utils/interfaces/person.interfaces';
import { Author } from '@utils/interfaces/library.interface';
// import { Country } from '@utils/interfaces/others.interfaces';

export const AuthorResolver: ResolveFn<any> = (
	route: ActivatedRouteSnapshot,
	state: RouterStateSnapshot,
	api: ApiService = inject(ApiService),
	commonApi: CommonService = inject(CommonService),
): Observable<any> => {
	const observables = [
		api.getAuthors(1),
		// commonApi.getCountries()
	];
	return forkJoin(observables)
		.pipe(map(([authors, countries]): { authors: PaginatedResource<Author>, /* countries: Country[] */ } => {
			return {
				authors,
				// countries
			};
		}));
}
