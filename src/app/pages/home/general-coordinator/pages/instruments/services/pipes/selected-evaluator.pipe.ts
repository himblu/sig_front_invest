import { Pipe, PipeTransform } from '@angular/core';
import { InstrumentTeacher } from '@utils/interfaces/campus.interfaces';
import { EvaluatorTeacherFormValue, TeacherFormValue } from '@utils/interfaces/period.interfaces';

@Pipe({
  name: 'selectedEvaluator',
	standalone: true
})

export class SelectedEvaluatorPipe implements PipeTransform {
	// Para mostrar a los docentes evaluadores que aún no tienen al docente a evaluar.
	// Cada docente a evaluar puede ser evaluado por uno o más docentes evaluadores.
	// Este pipe sirve para no mostrar a los docentes evaluadores en el listado (menú more_vert) que tienen los docentes
	// a evaluar.
	// Ejemplo: Evaluador1 y Evaluador2 se muestran para Docente1 y Docente2.
	// Si Docente1 ya está en la lista de Evaluador1, Docente1 tendrá solamente a Evaluador2 en las opciones.
	transform(evaluatorTeachers: any[], teacher: InstrumentTeacher): EvaluatorTeacherFormValue[] {
		evaluatorTeachers = evaluatorTeachers as EvaluatorTeacherFormValue[];
		if (!teacher || !evaluatorTeachers.length) return [];
		return evaluatorTeachers.filter((evaluatorTeacher: EvaluatorTeacherFormValue) => {
			// Check if the teacher is not in the teachersToBeEvaluated list
			return !evaluatorTeacher.teachersToBeEvaluated.some((teacherToBeEvaluated: TeacherFormValue) => teacherToBeEvaluated.id === teacher.teacherID);
		});
	}
}
