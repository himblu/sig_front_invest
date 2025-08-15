import { Component, OnInit, OnDestroy } from '@angular/core';
import { OnDestroyMixin } from '@w11k/ngx-componentdestroyed';
import { ButtonMenuComponent } from '@components/button-menu/button-menu.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-campus',
  templateUrl: './campus.component.html',
  styleUrls: ['./campus.component.css'],
  standalone: true,
  imports: [
    ButtonMenuComponent,
		MatIconModule
  ]
})

export class CampusComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	constructor(){
		super();
	}

	public ngOnInit(): void{

	}

	public override ngOnDestroy() {
    super.ngOnDestroy();
  }

}
