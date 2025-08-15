import { Pipe, PipeTransform } from '@angular/core';
import { PracticeHour } from '@utils/interfaces/campus.interfaces';

@Pipe({
  name: 'practiceHours',
  standalone: true
})

export class PracticeHoursPipe implements PipeTransform {
	transform(practiceHour: PracticeHour): number {
		//console.log(practiceHour);
		if (!practiceHour) {
			return 0;
		}
		return +practiceHour.hours;
	}
}
