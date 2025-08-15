import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatRippleModule
  ],
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css']
})

export class ConfirmationComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) {
  }
}
