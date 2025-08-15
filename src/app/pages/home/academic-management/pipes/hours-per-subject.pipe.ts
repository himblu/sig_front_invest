import { Pipe, PipeTransform } from '@angular/core';
import { Subject } from '@utils/interfaces/campus.interfaces';

@Pipe({
  name: 'hoursPerSubject',
  standalone: true
})

export class HoursPerSubjectPipe implements PipeTransform {
  transform(value: Subject, ...args: unknown[]): number {
    // return value.unsupervisedHours + value.faceToFaceHours + value.experimentalHours;
    const unsupervisedHours = +value.unsupervisedHours || 0;
    const faceToFaceHours = +value.faceToFaceHours || 0;
    const experimentalHours = +value.experimentalHours || 0;
    return unsupervisedHours + faceToFaceHours + experimentalHours;
  }
}
