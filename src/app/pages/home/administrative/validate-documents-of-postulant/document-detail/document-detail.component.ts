import { CommonModule, NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit, SecurityContext, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { environment } from '@environments/environment';
import { AdministrativeService } from '@services/administrative.service';
import { ApiService } from '@services/api.service';
import { CommonService } from '@services/common.service';
import { FILE_STATE } from '@utils/interfaces/others.interfaces';
import { SPGetPerson2 } from '@utils/interfaces/person.interfaces';
import { MaterialComponentModule } from 'app/material-component/material-component.module';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-document-detail',
  templateUrl: './document-detail.component.html',
  styleUrls: ['./document-detail.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialComponentModule,
    SpinnerLoaderComponent
  ]
})
export class DocumentDetailComponent implements OnInit{

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { postulant: any },
    private FormBuilder: FormBuilder,
    private API: ApiService,
    private Administrative: AdministrativeService,
    public dialogRef: MatDialogRef<DocumentDetailComponent>,
    private sanitizer: DomSanitizer = inject(DomSanitizer),
		private common: CommonService,
  ) {
    // this.viewFile({});
  }

  loading: boolean = true;
  postulant: any;
  documentStates: any[] = [];
  sendMail: boolean = false;

  roleLoged: any;
  financialEntities: any[] = [];
  transactionTypes: any[] = [];
  fileStatuses: any[] = [];
  formInvalid: boolean = true;
  studentAssigned: any;
	personImage: any;

  ngOnInit() {
    this.postulant = this.data.postulant;
    this.postulant.sendEmail = this.postulant.sendEmail == 1 ? true : false;
    this.roleLoged = parseInt(sessionStorage.getItem('rolID'));
    //console.log(this.roleLoged);
    //console.log(this.postulant);
    this.getDocumentsOfPostulant();
    this.getDocumentsStates();
    this.getFinancialEntities();
    this.getTransactionTypes();
    this.getFileStatuses();
    this.getStudentAssigned();
		this.getPersonInfo();
  }

  async getStudentAssigned() {

  }

  async getFileStatuses() {
    let result: any = await this.Administrative.getFileStatuses().toPromise();
    this.fileStatuses = result.filter((r: any) => [3,4].includes(r.statusFileID));
  }

  async getTransactionTypes() {
    let result: any = await this.Administrative.getTransactionTypes().toPromise();
    this.transactionTypes = result;
  }

  async getFinancialEntities() {
    let result: any = await this.Administrative.getFinancialEntities().toPromise();
    this.financialEntities = result;
  }

  async getDocumentsStates() {
    let result: any = await this.API.getDocumentsStates().toPromise();
    this.documentStates = result.filter((state: any) => state.statusFileID === FILE_STATE.APPROVED || state.statusFileID === FILE_STATE.REJECTED);
    //console.log(this.documentStates);
  }

  async getDocumentsOfPostulant() {
    let result: any = await this.Administrative.getFilePostulantByPersonIDAndAdmissionPeriodID(this.postulant.postulantID, this.postulant.admissionPeriodID).toPromise();
    //console.log(result);
    let filesToShow: any = [];
    switch (this.roleLoged) {
      case 8:
        // BIENESTAR
        filesToShow = [10,11,12];
        this.postulant.files = result.filter((r: any) => filesToShow.includes(r.fileTypeID));
        break;
      case 9:
        filesToShow = [13];
        this.postulant.files = result.filter((r: any) => filesToShow.includes(r.fileTypeID));
        break;
      default:
        filesToShow = [10,11,12,13];
        this.postulant.files = result.filter((r: any) => !filesToShow.includes(r.fileTypeID));
        break;
    }
    // if (this.roleLoged === 7 || this.roleLoged === 8) {
    //   this.postulant.files = result.filter((r: any) => r.fileTypeID != 13);
    // }
    // if (this.roleLoged === 9) {
    //   this.postulant.files = result.filter((r: any) => r.fileTypeID == 13);
    // }
    this.postulant.files.map((f: any) => {
      f.url = `${environment.url}/${f.pathFile}`;
      if (f.statusFileID === 3) {
        f.newStatusFileID = f.statusFileID;
      }
      if (f.statusFileID === 4) {
        f.newStatusFileID = f.statusFileID;
      }
    });
    this.postulant.isApproved = this.postulant.files.every((f: any) => f.statusFileID === 3);
    let profilePhoto = this.postulant.files.find((f: any) => f.fileTypeID === 6);
    //console.log(profilePhoto);
    if (profilePhoto && profilePhoto.statusFileID === 3) {
      this.postulant.photo = profilePhoto.url;
    }
    this.loading = false;
  }

  async saveDocuments() {
    //console.log(this.postulant);
    //console.log(this.postulant.files);
    // return;
    let bodyPostulant: any = {
      updates: [this.postulant]
    };
    let resultUpdatePostulant: any = await this.Administrative.updatePostulant(bodyPostulant).toPromise();
    this.postulant.files.map((f: any) => {
      f.statusFileID = f.newStatusFileID;
      f.flag_current = 'A';
      f.sendMail = this.postulant.sendMail;
    });
    let body: any = {
      updates: this.postulant.files.filter((f: any) => f.newStatusFileID)
    };
    let result: any = await this.Administrative.updateFilePostulant(body).toPromise();
    if (!result) {
      Swal.fire({
        text: 'Hubo un error comunicate con T.I.',
        icon: 'error'
      });
      return;
    }

    if (this.postulant.sendEmail) {
      let bodySendEmail: any = {
        personFullName: this.postulant.personFullName,
        email: `${this.postulant.emailDesc}`.toLowerCase(),
        context: {files: this.postulant.files }
      };
      let resultSendMail: any = this.Administrative.sendEmailValidateDocumentsOfPostulant(bodySendEmail).toPromise();
    }

    Swal.fire({
      text: 'Se guardaron los cambios acerca de los Documentos del Postulante',
      icon: 'success'
    });
    this.dialogRef.close();
  }

  validForm(item?: any) {
    if (item) {
      let statusFileSelected: any = this.fileStatuses.find((f: any) => f.statusFileID === item.newStatusFileID);
      if (statusFileSelected) {
        item.statusFileDesc = statusFileSelected.statusFileDesc;
      }
    }
    this.formInvalid = this.postulant.files.filter((f: any) => (f.newStatusFileID === 4 && !f.commentary) || !f.newStatusFileID).length > 0;
  }

  async viewFile(file: any) {
    //console.log(file);
    let parts = file.pathFile.split('/');
		let fileName = parts[parts.length - 1];
    let fileBlob: any = await this.API.getPersonImage(this.postulant.personID, fileName).toPromise();
    //console.log(fileBlob);
    if (fileBlob.size > 4) {
      const blob: Blob = new Blob([fileBlob], {type: fileBlob.type});

      const url = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob)));
      if (url) {
        window.open(url, '_blank');
      }
    }
    // if (fileBlob.s)
    // .subscribe({
		// 	next: (res) => {
		// 		this.createImageFromBlob(res);
		// 	},
		// 	error: (_err: HttpErrorResponse) => {
		// 	}
    // });
	}

	private getPersonInfo(): void {
		this.common.getPerson(this.postulant.personID).subscribe({
			next: (res) => {
				console.log('currentPerson', res);
				if(res.avatar) this.getPersonImage(res);
				else this.personImage= null;
			},
			error: (_err: HttpErrorResponse) => {
			}
    });
	}

	private getPersonImage(currentPerson: SPGetPerson2): void {
		if(currentPerson.avatar !== "default.png"){
			let rute;
			if(currentPerson.avatar.includes('upload/files/itca/docs/students/')) rute= currentPerson.avatar.replace('upload/files/itca/docs/students/', '');
			else rute= currentPerson.avatar.replace('upload/files/itca/images/students/', '');
			this.API.getPersonImage(this.postulant.personID, rute).subscribe({
				next: (res) => {
					this.createImageFromBlob(res);
				},
				error: (_err: HttpErrorResponse) => {
				}
			});
		}
	}

	private createImageFromBlob(image: Blob) {
		let reader = new FileReader();
		reader.addEventListener("load", () => {
				this.personImage = reader.result;
		}, false);

		if (image) {
				reader.readAsDataURL(image);
		}
	}

}
