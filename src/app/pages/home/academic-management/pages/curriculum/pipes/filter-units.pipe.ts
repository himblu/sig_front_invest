import { Pipe, PipeTransform } from '@angular/core';
import { AttendanceTeacher } from '@utils/interfaces/campus.interfaces';
import { OrganizationUnit } from '@utils/interfaces/others.interfaces';

@Pipe({
  name: 'filterUnits',
	standalone: true,
})
export class FilterUnits implements PipeTransform {

  transform(units:OrganizationUnit[], isForPracticeHours:boolean): OrganizationUnit[] {
    return units.filter((item:OrganizationUnit) => {
				return item.isForPracticeHours === isForPracticeHours;
		});
  }

}
