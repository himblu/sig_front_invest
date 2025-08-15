import { Pipe, PipeTransform } from '@angular/core';
import { Subject } from '@utils/interfaces/campus.interfaces';

@Pipe({
  name: 'hoursPerUnit',
  standalone: true
})

export class HoursPerUnitPipe implements PipeTransform {

  transform(value: Subject[][]): number {
    if (!value || value.length === 0) {
      return 0;
    }

    return value.reduce((totalHours, subjects) => {
      const hoursInArray = subjects.filter(s => s.courseID).reduce((sum, subject) => {
        const unsupervisedHours = +subject.unsupervisedHours || 0;
        const faceToFaceHours = +subject.faceToFaceHours || 0;
        const experimentalHours = +subject.experimentalHours || 0;

        return sum + unsupervisedHours + faceToFaceHours + experimentalHours;
       }, 0);
      return totalHours + hoursInArray;
    }, 0);
  }

}
