import { Pipe, PipeTransform } from '@angular/core';
import { Subject, Unit } from '@utils/interfaces/campus.interfaces';
import { OrganizationUnit } from '@utils/interfaces/others.interfaces';

@Pipe({
  name: 'totalHoursPerUnitByOrganizationUnit',
	standalone: true
})
export class TotalHoursPerUnitByOrganizationUnitPipe implements PipeTransform {

  transform(units: Unit[], organizationUnit?: OrganizationUnit): number {
		if (!organizationUnit) {
			return units.reduce((totalSubjects: number, unit: Unit) => {
				return totalSubjects + unit.rows.reduce((subjectsByRow: number, row: Subject[]) => {
					return subjectsByRow + row.reduce((subjects: number, subject: Subject) => {
						const unsupervisedHours = +subject.unsupervisedHours || 0;
						const faceToFaceHours = +subject.faceToFaceHours || 0;
						const experimentalHours = +subject.experimentalHours || 0;

						return subjects + unsupervisedHours + faceToFaceHours + experimentalHours;
					}, 0);
				}, 0);
			}, 0);
		}
    return units.filter((unit) => unit.name === organizationUnit.orgUnitID).reduce((totalSubjects: number, unit: Unit) => {
			return totalSubjects + unit.rows.reduce((subjectsByRow: number, row: Subject[]) => {
				return subjectsByRow + row.reduce((subjects: number, subject: Subject) => {
					const unsupervisedHours = +subject.unsupervisedHours || 0;
					const faceToFaceHours = +subject.faceToFaceHours || 0;
					const experimentalHours = +subject.experimentalHours || 0;

					return subjects + unsupervisedHours + faceToFaceHours + experimentalHours;
				}, 0);
			}, 0);
		}, 0);
  }

}
