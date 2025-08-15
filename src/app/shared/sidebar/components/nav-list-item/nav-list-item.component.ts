import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	Output,
} from '@angular/core';
import { AppRoutingModule } from 'app/app-routing.module';
import { RouterLink, RouterModule } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
	changeDetection: ChangeDetectionStrategy.OnPush,
	selector: 'app-nav-list-item',
	templateUrl: './nav-list-item.component.html',
	standalone: true,
	imports: [
		AppRoutingModule,
		RouterLink,
		NgIf
	]
})

export class NavListItemComponent {
	@Input() link: string | null = null;
	@Input() target: '_self' | '_blank' | '_parent' | '_top' | null = null;
	@Output() isActive = new EventEmitter<boolean>();

	get isExternalLink(): boolean {
		return /^(http:\/\/|https:\/\/)/i.test(this.link ?? '');
	}
}
