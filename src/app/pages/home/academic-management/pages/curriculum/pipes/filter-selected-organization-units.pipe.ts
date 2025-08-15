import { Pipe, PipeTransform } from '@angular/core';
import { Unit } from '@utils/interfaces/campus.interfaces';
import { OrganizationUnit } from '@utils/interfaces/others.interfaces';

@Pipe({
  name: 'filterSelectedOrganizationUnits',
  standalone: true
})
export class FilterSelectedOrganizationUnitsPipe implements PipeTransform {

  transform(units: Unit[], organizationUnits: OrganizationUnit[]): OrganizationUnit[] {
		const selectedUnits: number[] = units.map((unit: Unit) => unit.name);
    return organizationUnits.filter((organizationUnit: OrganizationUnit) => !selectedUnits.includes(organizationUnit.orgUnitID));
  }

}
