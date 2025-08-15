import { Pipe, PipeTransform } from '@angular/core';
import { StudentActivities } from '@utils/interfaces/campus.interfaces';
import { Partial, SubComponentType } from '@utils/interfaces/period.interfaces';

@Pipe({
  name: 'filterPartials',
	standalone: true,
})
export class filterPartialsPipe implements PipeTransform {

  transform(activities: SubComponentType[], componentID: number): unknown {
		//console.log('componentID', componentID);
    if(componentID === 1002){
			let activity = activities[0] as object;
			let arr=[];
			arr.push(activity);
			return arr;
		}else{
			return activities;
		}
  }

}
