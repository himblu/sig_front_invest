import {inject} from '@angular/core';
import {ActivatedRouteSnapshot, ResolveFn, Router, RouterStateSnapshot} from '@angular/router';
import {AdministrativeService} from '@services/administrative.service';
import {ApiService} from '@services/api.service';
import {PublicationView} from '@utils/interfaces/library.interface';
import {catchError, forkJoin, map, Observable, of, switchMap} from 'rxjs';

export const UpdatePublicationResolver: ResolveFn<any> = (
	route: ActivatedRouteSnapshot,
	state: RouterStateSnapshot,
	api: ApiService = inject(ApiService),
	adminApi: AdministrativeService = inject(AdministrativeService),
	router: Router = inject(Router)
) => {
	// Publication or null
	// Dewey Categories
	// Dewey Subcategories or null
	// Knowledge Areas
	// Knowledge Subareas or null
	// Knowledge Specific Subareas or null
	// Major Schools
	// Publication Conditions
	// Publication Income Types
	// Campuses
	// Publication Types
	// Availability Publications
	let observables: Observable<any>[] = [];
	// const publicationId = route.paramMap.get('id');
	const publicationId: string = route.params['id'];

	if (!publicationId) {
		console.warn('Id was not provided');
		return router.navigate(['/']).then();
	}
	return api.getPublication(publicationId).pipe(
		switchMap((value: PublicationView) => {
			observables = [
				of(value),
				api.getDeweyCategories(),
				api.getDeweySubcategories(value.deweyCategoryID),
				api.getKnowledgeAreas(),
				// api.getKnowledgeSubareas(value.knowledgeAreaID),
				// api.getKnowledgeSpecificSubareas(value.subAreaKnowledgeID),
				api.getMajorSchools(),
				api.getPublicationConditions(),
				api.getPublicationIncomeTypes(),
				adminApi.getAllCampuses(),
				api.getPublicationTypes(),
				api.getAvailabilityPublications(),
				of([]),
				api.getSupportTypes(),
				of([]),
				of([]),
			];
			observables.splice(4, 0, value.knowledgeAreaID ? api.getKnowledgeSubareas(value.knowledgeAreaID) : of([]));
			observables.splice(5, 0, value.specificSubAreaKnowledgeDesc ? api.getKnowledgeSpecificSubareas(value.subAreaKnowledgeID) : of([]));
			observables.push(api.getPublicationStock(publicationId));
			return forkJoin(observables)
				.pipe(
					map(([
								 publication,
								 deweyCategories,
								 deweySubcategories,
								 knowledgeAreas,
								 knowledgeSubareas,
								 knowledgeSpecificSubareas,
								 schools,
								 publicationsCondition,
								 incomeTypes,
								 campuses,
								 publicationTypes,
								 availabilityPublications,
								 publicationStock,
								 supportTypes,
							 ]) => {
						return {
							publication,
							deweyCategories,
							deweySubcategories,
							knowledgeAreas,
							knowledgeSubareas,
							knowledgeSpecificSubareas,
							schools,
							publicationsCondition,
							incomeTypes,
							campuses,
							publicationTypes,
							availabilityPublications,
							publicationStock,
							supportTypes
						};
					})
				);
		}),
		catchError((_err) => {
			console.log(_err);
			return router.navigate(['/404']);
		})
	);
};
