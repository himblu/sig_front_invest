import { Pipe, PipeTransform } from '@angular/core';
import { ApprovalRequest } from '@utils/interfaces/campus.interfaces';

@Pipe({
  name: 'filterEventsByState',
	standalone: true,
})
export class FilterEventsByStatePipe implements PipeTransform {

  transform(events: ApprovalRequest[], state: number): ApprovalRequest[] {
    return events.filter((event:ApprovalRequest) => {
			let currentState: string;
			if(state === 1){
				currentState = 'REVISION'
			}else if( state === 2){
				currentState = 'APROBADO'
			}else if (state === 3){
				currentState = 'RECHAZADO'
			}
			return event.stateApproval === currentState;
		});
  }

}
