import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { User } from '@utils/models/user.models';

@Injectable({
	providedIn: 'root'
})

export class UserService {
	private user = new BehaviorSubject<User>(new User(null));
	constructor(
		private router: Router
	) {
	}

	public get currentUser(): User {
		try {
			const user = new User(this.parseJWT(this.getToken()));
			if (user.PersonId && user.userName) {
				this.user.next(user);
				return this.user.value;
			}
			return null;
		} catch (e) {
			this.logout();
			return null;
		}
	}

	public logout(): void {
		this.router.navigate(['/autenticacion/iniciar-sesion']).then();
	}

	public getToken(): string {
		return sessionStorage.getItem('token');
	}

	public parseJWT(token: string): any {
		const base64Url = token.split('.')[1];
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const jsonPayload: any = decodeURIComponent(atob(base64).split('').map((c) => {
			return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
		}).join(''));
		return JSON.parse(jsonPayload);
	}
}
