import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { OnDestroyMixin, untilComponentDestroyed } from "@w11k/ngx-componentdestroyed";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgIf } from '@angular/common';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'components-input-only-letters',
  templateUrl: './input-only-letters.component.html',
  styleUrls: ['./input-only-letters.component.css'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    NgIf
  ]
})

export class InputOnlyLettersComponent extends OnDestroyMixin implements OnInit  {

  @Input('name') name:string = '';
  @Input('field') field:string = '';
  @Output() data:EventEmitter<string> = new EventEmitter();
  constructor(){
    super();
    }

  ngOnInit(): void {
    this.return();
  }

  async return(){
    await this.nameCampusFormControl.valueChanges
      .pipe(
        untilComponentDestroyed( this )
      )
    .subscribe( resp => this.data.emit(resp || ''));
  }

  matcher = new MyErrorStateMatcher();
  nameCampusFormControl = new FormControl('', [Validators.required, Validators.pattern('[-_a-zA-Z0-9-ñÑÁáéÉíÍóÓúÚ ]*')]);


}
