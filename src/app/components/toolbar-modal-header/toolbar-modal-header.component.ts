import { Component, Input } from '@angular/core';
import { IToolbarCss } from '../../utils/interfaces/others.interfaces';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NgStyle } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-toolbar-modal-header',
  templateUrl: './toolbar-modal-header.component.html',
  styleUrls: ['./toolbar-modal-header.component.css'],
  imports: [
    MatDialogModule,
    MatIconModule,
    NgStyle,
    MatToolbarModule,
    MatButtonModule
  ],
  standalone: true
})

export class ToolbarModalHeaderComponent {
	@Input() title: string;
	@Input() cssToolbar: IToolbarCss;
	@Input() cssCloseButton: IToolbarCss;
	constructor(
	) {
	}
}
