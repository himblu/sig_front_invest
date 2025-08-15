import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router, RouterStateSnapshot } from '@angular/router';
import { AdministrativeService } from '@services/administrative.service';
import { ApiService } from '@services/api.service';
import { forkJoin, map, Observable, of } from 'rxjs';

export const RegisterPublicationResolver: ResolveFn<any> = (
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
	observables = [
		of([]),
		api.getDeweyCategories(),
		of([]),
		api.getKnowledgeAreas(),
		of([]),
		of([]),
		api.getMajorSchools(),
		api.getPublicationConditions(),
		api.getPublicationIncomeTypes(),
		adminApi.getAllCampuses(),
		api.getPublicationTypes(),
		api.getAvailabilityPublications(),
		of([]),
		api.getSupportTypes(),
	]
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
};
