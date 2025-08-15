import { Pipe, PipeTransform } from '@angular/core';
import { InstrumentTeacher } from '@utils/interfaces/campus.interfaces';
import {
	EvaluatorTeacherFormValue,
	EvaluatorCoordinatorFormValue,
	TeacherFormValue
} from '@utils/interfaces/period.interfaces';

@Pipe({
  name: 'selectedEvaluatorCoordinator',
	standalone: true
})

export class SelectedEvaluatorCoordinatorPipe implements PipeTransform {
	// Funciona igual que SelectedEvaluatorPipe, pero con coordinadores
	transform(evaluatorCoordinators: any[], teacher: InstrumentTeacher): EvaluatorCoordinatorFormValue[] {
		evaluatorCoordinators = evaluatorCoordinators as EvaluatorCoordinatorFormValue[];
		if (!teacher || !evaluatorCoordinators.length) return [];
		return evaluatorCoordinators.filter((evaluatorTeacher: EvaluatorCoordinatorFormValue) => {
			// Check if the teacher is not in the teachersToBeEvaluated list
			return !evaluatorTeacher.teachersToBeEvaluated.some((teacherToBeEvaluated: TeacherFormValue) => teacherToBeEvaluated.id === teacher.teacherID);
		});
	}
}
