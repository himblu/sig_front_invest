import { Pipe, PipeTransform } from '@angular/core';
import {
	EvaluatorAdministratorFormValue,
	TeacherFormValue
} from '@utils/interfaces/period.interfaces';
import { CoordinatorList } from '@utils/interfaces/others.interfaces';

@Pipe({
  name: 'selectedEvaluatorAdministrator',
	standalone: true
})

export class SelectedEvaluatorAdministratorPipe implements PipeTransform {
	// Funciona igual que SelectedEvaluatorPipe, pero con coordinadores
	transform(evaluatorAdministrators: any[], coordinator: CoordinatorList): EvaluatorAdministratorFormValue[] {
		evaluatorAdministrators = evaluatorAdministrators as EvaluatorAdministratorFormValue[];
		if (!coordinator || !evaluatorAdministrators.length) return [];
		return evaluatorAdministrators.filter((evaluatorAdministrator: EvaluatorAdministratorFormValue) => {
			return !evaluatorAdministrator.coordinatorsToBeEvaluated.some((coordinatorToBeEvaluated: TeacherFormValue) => coordinatorToBeEvaluated.id === coordinator.teacherID);
		});
	}
}
