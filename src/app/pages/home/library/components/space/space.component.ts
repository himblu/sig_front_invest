import { Component, Inject, inject, OnInit, OnDestroy } from '@angular/core';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { LibrarySpaceDetail, LibraryStudentDetail } from '@utils/interfaces/person.interfaces';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'app-space',
  standalone: true,
  imports: [
		MatDialogModule,
		SpinnerLoaderComponent,
		NgIf,
		MatButtonModule,
		MatIconModule,
		MatRippleModule
	],
  templateUrl: './space.component.html',
  styleUrls: ['./space.component.css']
})

export class SpaceComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public isLoading: boolean = false;
	public librarySpace: LibrarySpaceDetail;
	public selectedStudentCareer: LibraryStudentDetail;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: { item: LibraryStudentDetail, space: LibrarySpaceDetail },
		private dialogRef: MatDialogRef<SpaceComponent>,
	) {
		super();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	ngOnInit(): void {
		this.librarySpace= this.data.space;
		this.selectedStudentCareer= this.data.item;
		setTimeout(() => {
			this.dialogRef.close();
		}, 7000);
	}

}
