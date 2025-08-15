import { Component, OnInit, OnDestroy } from '@angular/core';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { Router } from '@angular/router';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-update-teacher',
  templateUrl: './update-teacher.component.html',
  styleUrls: ['./update-teacher.component.css'],
	standalone: true,
})
export class UpdateTeacherComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	constructor( private router: Router,
		private user: UserService ){
		super();
	}

	public ngOnInit(): void {
		this.router.navigateByUrl(`/talento-humano/editar-docente/${this.user.currentUser.PersonId}`)
	}

	public override ngOnDestroy() {
	super.ngOnDestroy();
	}

}
