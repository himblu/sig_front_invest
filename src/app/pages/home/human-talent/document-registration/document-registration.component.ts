import { ChangeDetectorRef, Component, inject, SecurityContext, ViewChild, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule, ValidationErrors,
  Validators
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { PersonDocument, SPGetFileState, StudentDocument, ValidateStatus } from '@utils/interfaces/others.interfaces';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { map, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministrativeService } from '@services/administrative.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonService } from '@services/common.service';
import { User } from '@utils/models/user.models';
import { UserService } from '@services/user.service';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { ApiService } from '@services/api.service';
import Swal from 'sweetalert2';
import { DomSanitizer } from '@angular/platform-browser';
import { RrhhService } from '@services/rrhh.service';
import { HttpErrorResponse } from '@angular/common/http';

const MAX_FILE_SIZE = 5 * 1048576;


@Component({
  selector: 'app-document-registration',
  standalone: true,
  templateUrl: './document-registration.component.html',
  styleUrls: ['./document-registration.component.css'],
	imports: [
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    NgForOf,
    NgIf,
    MatSnackBarModule,
    MatTooltipModule,
    NgClass,
    NgxMaskDirective
  ],
})
export class DocumentRegistrationComponent extends OnDestroyMixin implements OnInit, OnDestroy {

  public documentsForm: FormGroup;
	public documents: PersonDocument[] = [];

	@ViewChild('input') input!: ElementRef <Input>;

  private formBuilder: FormBuilder = inject(FormBuilder);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private admin: AdministrativeService = inject(AdministrativeService);
  private snackBar: MatSnackBar = inject(MatSnackBar);
  private userService: UserService = inject(UserService);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private api: ApiService = inject(ApiService);
  private router: Router = inject(Router);
	private sanitizer: DomSanitizer = inject(DomSanitizer);
	private common: CommonService = inject(CommonService);
	private rrhh: RrhhService = inject(RrhhService);

  constructor() {
    super();
  }

	ngOnInit(): void {
		this.getFiles();
  }

	public override ngOnDestroy() {
    super.ngOnDestroy();
  }

	public getFiles(): void {
		this.rrhh.getFilesByPerson(this.userService.currentUser.PersonId).subscribe({
			next: (res) => {
				console.log(res);
				this.documents = res;
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	public onChangeInput(files: FileList, input: HTMLInputElement, item: PersonDocument): void{
		if (files) {
			if(files[0].size > MAX_FILE_SIZE){
				input.value='';
				this.snackBar.open(
          `Máximo 5MB permitido`,
          null,
          {
            horizontalPosition: 'center',
            verticalPosition: 'top',
            duration: 4000,
            panelClass: ['red-snackbar']
          }
        );
			 }else{
				setTimeout(() =>{
					const blob = new Blob([files[0]], { type: 'application/pdf' });
					const url = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob)));
						if (url) {
							window.open(url, '_blank');
						}
				}, 0);

				Swal
				.fire({
						icon: 'question',
						title: "El archivo es correcto?",
						showCancelButton: true,
						confirmButtonText: "Si",
						cancelButtonText: "No",
				})
				.then(result => {
					if(result.value){
						const file: File = files.item(0);
						const fileReader = new FileReader();
						if (file) {
							this.submitFile(file, item);
						}
					}else{
						input.value='';
						this.snackBar.open(
							`Cargue el archivo nuevamente`,
							null,
							{
								horizontalPosition: 'center',
								verticalPosition: 'top',
								duration: 4000,
								panelClass: ['red-snackbar']
							}
						);
					}
				});
			}
		}
	}

	public submitFile(file: File, item: PersonDocument): void {
		this.rrhh.putCollaboratorDocs(file, item.docEmpleadoID, item.fileTypeID, item.sequenceNro, this.userService.currentUser.PersonId).subscribe({
			next: (res: any) => {
				//console.log(res);
				this.common.message(`${res[0].message}`,'','success','#86bc57');
				this.getFiles();
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

}
