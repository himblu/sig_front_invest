import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-policies-shipping',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './policies-shipping.component.html',
  styleUrls: ['./policies-shipping.component.css']
})
export class PoliciesShippingComponent {
  constructor(private router: Router) {}
    ngOnInit() {
      this.router.events
        .pipe(filter(ev => ev instanceof NavigationEnd))
        .subscribe(() => window.scrollTo(0, 0));
    }
}
