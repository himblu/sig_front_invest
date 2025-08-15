import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from "@w11k/ngx-componentdestroyed";
import { debounceTime } from "rxjs";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'components-input-search',
  templateUrl: './input-search.component.html',
  styleUrls: ['./input-search.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ]
})

export class InputSearchComponent extends OnDestroyMixin implements OnInit {

  @Output() return: EventEmitter<string> = new EventEmitter();
	@Input() label: string;

  constructor(){
    super();
  }
  ngOnInit(): void {
		if(this.label==''||this.label==null){
			this.label='Busqueda'
		}
    this.shearchFormControl.valueChanges
      .pipe(
        untilComponentDestroyed( this ),
        debounceTime(800)
      )
      .subscribe( resp => {
        this.return.emit(resp || '');
      })
  }

  shearchFormControl = new FormControl('');

}
