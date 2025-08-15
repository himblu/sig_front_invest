import { Component } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

@Component({
  selector: 'shared-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.css']
})

export class BreadcrumbsComponent {
  titulo: string;
  modulo: string;
  constructor ( private router: Router){
    this.routesCharge();
  }

  routesCharge(){
    this.router.events
      .pipe(
        filter( (event): event is ActivationEnd => event instanceof ActivationEnd ),
        filter( (event: ActivationEnd) => event.snapshot.firstChild === null ),
        map( (event: ActivationEnd) => event.snapshot.data )
      )
      .subscribe( ({title, module}) => {
        this.titulo = title;
        this.modulo = module;
      })
  }
}
