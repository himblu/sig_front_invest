import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {AdministrativeService} from '@services/administrative.service';

@Component({
	selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrls: []
})
export class ViewComponent implements OnInit {
	data: any = {};


	constructor(private route: ActivatedRoute, private admin: AdministrativeService) {
	}

	async ngOnInit() {
		const personID = this.route.snapshot.paramMap.get('personID');

		this.admin.getDataStudent(personID).subscribe({
			next: (res: any) => {
				if (res.length > 0) this.data = res[0];
			},
			error: (err: HttpErrorResponse) => {
				console.error(err);
			}
		})

	}
}
