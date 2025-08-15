import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.css']
})
export class TermsComponent {
  constructor(private router: Router) {}
    ngOnInit() {
      this.router.events
        .pipe(filter(ev => ev instanceof NavigationEnd))
        .subscribe(() => window.scrollTo(0, 0));
    }
}
