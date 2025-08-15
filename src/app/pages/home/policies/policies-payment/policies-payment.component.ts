import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-policies-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './policies-payment.component.html',
  styleUrls: ['./policies-payment.component.css']
})
export class PoliciesPaymentComponent {
  constructor(private router: Router) {}
  ngOnInit() {
    this.router.events
      .pipe(filter(ev => ev instanceof NavigationEnd))
      .subscribe(() => window.scrollTo(0, 0));
  }
}
