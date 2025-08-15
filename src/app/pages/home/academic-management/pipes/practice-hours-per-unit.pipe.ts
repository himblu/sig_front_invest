import { Pipe, PipeTransform } from '@angular/core';
import { PracticeHour } from '@utils/interfaces/campus.interfaces';

@Pipe({
  name: 'practiceHoursPerUnit',
  standalone: true
})

export class PracticeHoursPerUnitPipe implements PipeTransform {
	transform(value: PracticeHour[][]): number {
		if (!value || value.length === 0) {
			return 0;
		}
		return value.reduce((totalHours, practiceHours) => {
			const hoursInArray = practiceHours.filter(p => p.hours).reduce((sum, practiceHour) => {
				const hours = +practiceHour.hours || 0;
				return sum + hours;
			}, 0);
			return totalHours + hoursInArray;
		}, 0);
	}
}
