import { Pipe, PipeTransform } from '@angular/core';
import { DistributiveSubject } from '@utils/interfaces/campus.interfaces';

@Pipe({
  name: 'allTeachersWereSelected',
  standalone: true,
	// FIXME:
	pure: false
})

export class AllTeachersWereSelectedPipe implements PipeTransform {
  transform(subjects: DistributiveSubject[], maxSubjects: number = 0): boolean {
    if (!subjects || !subjects.length) return false;
		// Se asume que la cantidad máxima de asignaturas debe ser menor o igual al número de asignaturas.
		return subjects.filter((subject: DistributiveSubject) => subject.selectedTeacher).length === maxSubjects && maxSubjects > 0;
  }
}
