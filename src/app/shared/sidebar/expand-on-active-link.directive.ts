import { Directive, Input, QueryList, AfterContentInit } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { from } from 'rxjs';
import { NavListItemComponent } from './components/nav-list-item/nav-list-item.component';
import { filter, mergeMap } from 'rxjs/operators';

@Directive({
	selector: '[appExpandOnActiveLink]',
	exportAs: 'expandOnActiveLink',
	standalone: true
})

export class ExpandOnActiveLinkDirective implements AfterContentInit {
	@Input() public navListItemComponents: QueryList<NavListItemComponent> | null = null;

	constructor(private panel: MatExpansionPanel) {
	}

	ngAfterContentInit(): void {
		const navListItems = this.navListItemComponents?.toArray();
		if (navListItems) {
			from(navListItems)
				.pipe(
					mergeMap((item) => item.isActive),
					filter((isActive: boolean) => isActive)
				)
				.subscribe(() => {
					// Looks like there's a bug in `mat-drawer` component
					// that prevents `mat-expansion-panel` from expanding
					// This little' fella fixes it :)
					setTimeout(() => this.panel.open(), 0);
				});
		}
	}
}
