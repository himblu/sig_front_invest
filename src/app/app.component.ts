import { Component, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { map } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private router: Router = inject(Router);
  private titleService: Title = inject(Title);

  constructor() {
    this.onNavigationEnd();
  }

  private onNavigationEnd(): void {
    this.router.events
      .pipe(
        map((event) => {
          let route: ActivatedRoute = this.router.routerState.root;
          let routeTitle = '';
          while (route!.firstChild) {
            route = route.firstChild;
          }
          if (route.snapshot.data['title']) {
            routeTitle = route!.snapshot.data['title'];
          }
          return { routeTitle, event };
        })
      )
    .subscribe((res) => {
      if (res.event instanceof NavigationEnd) {
        if (res.routeTitle) {
          this.titleService.setTitle(`${res.routeTitle} | SIG`);
        }
      }
    });
  }
}
