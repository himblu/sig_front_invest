import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { MatRippleModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonService } from '@services/common.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-two-input-modal',
	standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatRippleModule,
		MatSelectModule,
		MatFormFieldModule,
		MatInputModule,
		ReactiveFormsModule,
		MatSnackBarModule,
  ],
  templateUrl: './two-input-modal.component.html',
  styleUrls: ['./two-input-modal.component.css']
})

export class TwoInputModalComponent implements OnInit {

	constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<TwoInputModalComponent>,
		@Inject(MAT_DIALOG_DATA) public data: { message: string, label1: string, label2: string, in1: string, in2: string, id: number },
		private common: CommonService,
		private snackBar: MatSnackBar,
  ) {}

	ngOnInit(): void {
	}

	form= this.formBuilder.group({
    in1: [this.data.in1, [Validators.required]],
		in2: [this.data.in2, [Validators.required]],
		id:  [this.data.id]
  });

	submit(form:any) {
		if(form.valid){
			this.dialogRef.close(form);
		}else{
			this.snackBar.open(
				'No pueden haber campos vacíos',
				'',
				{
					horizontalPosition: 'center',
					verticalPosition: 'top',
					duration: 4000,
					panelClass: ['red-snackbar']
				}
			);
		}

  }

}
