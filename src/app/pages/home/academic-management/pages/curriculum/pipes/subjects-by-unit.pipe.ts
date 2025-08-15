import { Pipe, PipeTransform } from '@angular/core';
import { Subject, Unit } from '@utils/interfaces/campus.interfaces';
import { OrganizationUnit } from '@utils/interfaces/others.interfaces';

@Pipe({
  name: 'subjectsByUnit',
	standalone: true
})
export class SubjectsByUnitPipe implements PipeTransform {

  transform(units: Unit[], organizationUnit?: OrganizationUnit): number {
		if (!organizationUnit) {
			return units.reduce((totalSubjects: number, unit: Unit) => {
				return totalSubjects + unit.rows.reduce((subjectsByRow: number, row: Subject[]) => {
					return subjectsByRow + row.reduce((subjects: number, subject: Subject, i) => {
						let result= (subjects) + (subject.courseID ? 1 : 0);
						return result;
					}, 0);
				}, 0);
			}, 0);
		}
		/*if (!units.filter((unit) => unit.name === organizationUnit.orgUnitID).length) {
			return 0;
		}*/
		//console.log('organizationUnit', organizationUnit);
    return units.filter((unit) => unit.name === organizationUnit.orgUnitID).reduce((totalSubjects: number, unit: Unit) => {
			return totalSubjects + unit.rows.reduce((subjectsByRow: number, row: Subject[]) => {
				return subjectsByRow + row.reduce((subjects: number, subject: Subject, i) => {
					let result= (subjects) + (subject.courseID ? 1 : 0);
					//console.log('subjects', result);
					return result;
				}, 0);
			}, 0);
		}, 0);
  }

}
