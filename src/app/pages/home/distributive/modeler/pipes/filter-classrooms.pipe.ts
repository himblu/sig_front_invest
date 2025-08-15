import { Pipe, PipeTransform } from '@angular/core';
import { ClassRoom } from '@utils/interfaces/campus.interfaces';

@Pipe({
  name: 'filterClassrooms',
	standalone: true
})

export class FilterClassroomsPipe implements PipeTransform {
	transform(classrooms: ClassRoom[], showSpecialRooms: boolean): ClassRoom[] {
		if (!classrooms && !classrooms.length) {
			return [];
		}

		if (showSpecialRooms) {
			return classrooms.filter(classroom => {
				return !classroom.classroomName.toLowerCase().includes('aula de clase');
			});
		} else {
			return classrooms.filter(classroom => {
				return classroom.classroomName.toLowerCase().includes('aula de clase');
			});
		}
	}
}
