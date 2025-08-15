import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { NgForOf, NgIf } from '@angular/common';
import { ModulesComponent } from './components/modules/modules.component';
import { UserRolesComponent } from './components/user-roles/user-roles.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MenuSettingsComponent } from './components/menu-settings/menu-settings.component';
import { UsersComponent } from './components/users/users.component';
import { ExternalAdminComponent } from '../external-admin/external-admin.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
	standalone: true,
	imports: [
    //NgForOf,
    NgIf,
    ReactiveFormsModule,
		ModulesComponent,
		UserRolesComponent,
		MatTabsModule,
		//MenuSettingsComponent,
		UsersComponent,
		ExternalAdminComponent
  ],
})
export class SettingsComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	charging: boolean = false;

  constructor( private fb: FormBuilder )
	{
		super();
	}

  public ngOnInit(): void {

  }

	public override ngOnDestroy() {
    super.ngOnDestroy();
  }

}
