import {
	ChangeDetectionStrategy,
	Component,
	ContentChildren,
	HostBinding,
	Input,
	QueryList,
	ViewEncapsulation,
} from '@angular/core';
import { NavListItemComponent } from '../nav-list-item/nav-list-item.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { ExpandOnActiveLinkDirective } from '@shared/sidebar/expand-on-active-link.directive';
import { NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	selector: 'app-nav-list',
	styleUrls: ['./nav-list.component.scss'],
	templateUrl: './nav-list.component.html',
	standalone:true,
	imports: [
		MatExpansionModule,
		MatListModule,
		ExpandOnActiveLinkDirective,
		NgIf
	]
})

export class NavListComponent {
	@ContentChildren(NavListItemComponent) public navListItemComponents: QueryList<NavListItemComponent> | null = null;
	@Input() public expandable = false;
	@Input() public title = '';
	@HostBinding('class.nav-list--expandable')
	get expandableClass(): boolean {
		return this.expandable;
	}
}
