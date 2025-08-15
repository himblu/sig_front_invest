import { Pipe, PipeTransform } from '@angular/core';
import { Subject } from '@utils/interfaces/campus.interfaces';

@Pipe({
  name: 'filterSubjectToPracticeHour',
	standalone: true,
})
export class FilterSubjectToPracticeHourPipe implements PipeTransform {

  transform(subjects:Subject[], period:number, updateTakenSubjectsPipe:boolean): Subject[] {
		//console.log(subjects, period);
		if(!subjects || !period){
			return [];
		}
		return subjects.filter((subject:Subject)=> subject.cycle === period);
  }

}
