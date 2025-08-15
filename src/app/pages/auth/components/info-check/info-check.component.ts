import { Component, Inject, OnDestroy } from '@angular/core';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'app-info-check',
  standalone: true,
  imports: [
		MatButtonModule,
		MatDialogModule,
		MatIconModule,
		MatRippleModule,
	],
  templateUrl: './info-check.component.html',
  styleUrls: ['./info-check.component.css']
})

export class InfoCheckComponent extends OnDestroyMixin implements OnDestroy {

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: { type: boolean },
		private dialogRef: MatDialogRef<InfoCheckComponent>,
	) {
		super();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

}
