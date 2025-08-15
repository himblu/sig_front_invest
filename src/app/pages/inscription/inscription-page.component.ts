import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { SidebarComponent } from '@shared/sidebar/sidebar.component';


@Component({
  selector: 'app-inscription-page',
  templateUrl: './inscription-page.component.html',
  imports: [
    SharedModule,
    RouterOutlet,
    SidebarComponent
  ],
  standalone: true
})

export class InscriptionPageComponent {

}
