import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { AdministrativeService } from '@services/administrative.service';
import { UserService } from '@services/user.service';
import { MaterialComponentModule } from 'app/material-component/material-component.module';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-process-management',
  templateUrl: './process-management.component.html',
  styleUrls: ['./process-management.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialComponentModule,
    ModalModule,
		MatSnackBarModule
  ]
})
export class ProcessManagementComponent implements OnInit {

	public isCreatingFile?: boolean= false;

	private snackBar: MatSnackBar = inject(MatSnackBar);

  constructor(
    private FormBuilder: FormBuilder,
    private Administrative: AdministrativeService,
		private user: UserService
  ) {}

  @ViewChild('processModal', {static: false}) processModal: ModalDirective;
  @ViewChild('fileModal', {static: false}) fileModal: ModalDirective;

  processes: any[] = [];
  fileTypes: any[] = [];
  newProcess: any;
  newFile: any;
  processForm: FormGroup = this.FormBuilder.group({
    otherProcessID: [],
    otherProcessName: [],
		otherProcessDescription: [],
		statusID: [1],
    userCreated: [1]
  });

  executableTypes: any = [
    {
      executableTypeID: 1,
      executableTypeName: 'Imagen'
    },
    {
      executableTypeID: 2,
      executableTypeName: 'PDF'
    },
  ]

  companies: any = [];
  config: any = {};

  ngOnInit() {
    this.getProcess();
    this.getFileTypes();
    this.getCompanies();
  }

  async getCompanies() {
    let result: any = await this.Administrative.getCompanies().toPromise();
    this.companies = result;
  }

  async getFileTypes() {
    let result: any = await this.Administrative.getFileTypes().toPromise();
    this.fileTypes = result;
  }

  async getProcess() {
    let result: any = await this.Administrative.getOtherProcess().toPromise();
    this.processes = result.filter((r: any) => r.statusID === 1);
  }

  toggleProcessModal(item?: any) {
    if (this.processModal.isShown) {
      this.processModal.hide();
    } else {
      this.processModal.config.keyboard = false;
      this.processModal.config.ignoreBackdropClick = true;
      this.processModal.show();
      this.newProcess = {};
      if (item) {
        this.newProcess = JSON.parse(JSON.stringify(item));
        this.newProcess.editing = true;
        this.processForm.patchValue(this.newProcess);
        this.processForm.updateValueAndValidity();
      }
    }
  }

  toggleFileModal(item?: any) {
    if (this.fileModal.isShown) {
      this.fileModal.hide();
    } else {
      this.fileTypes.map((f: any) => {
        f.selected = false;
      });
      this.fileModal.config.keyboard = false;
      this.fileModal.config.ignoreBackdropClick = true;
      this.fileModal.show();
      this.newFile = item;
			this.config.company= undefined;
			this.isCreatingFile= false;
      //console.log(this.newFile);
      this.getFileProcessConfigs();
    }
  }

  async getFileProcessConfigs() {
    let result: any = await this.Administrative.getFileProcessConfig().toPromise();
    this.newFile.configs = result.filter((r: any) => r.otherProcessID === this.newFile.otherProcessID);
    //console.log(this.newProcess);
    this.fileTypes.map((f: any) => {
      let fileFound: any = result.find((r: any) => r.fileTypeID === f.fileTypeID);
      if (fileFound) {
        f.selected = true;
        f.executableTypeID = fileFound.executableTypeID;
        f.fileProcessConfigID = fileFound.fileProcessConfigID;
      }
    });
  }

  saveProcess() {
    Swal.fire({
      text: `¿Estas seguro de guardar el Proceso: ${this.processForm.get('otherProcessName')?.value}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Si, guardar',
      cancelButtonText: 'Cancelar',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then(async (choice) => {
      if (choice.value) {
        let data: any = await this.processForm.value;
        let body: any = {};
        let result: any;
        if (data.otherProcessID) {
          body.updates = [data];
          result = await this.Administrative.updateOtherProcess(body).toPromise();
        } else {
          body.news = [data];
          result = await this.Administrative.saveOtherProcess(body).toPromise();
        }
        if (!result) {
          Swal.fire({
            text: 'Hubo un error al momento de guardar el Proceso.',
            icon: 'error',
          });
          return;
        }
        this.getProcess();
        Swal.fire({
          text: `Se ${this.newProcess.editing ? 'actualizó' : 'guardó'} el Proceso correctamente.`,
          icon: 'success',
        });
        this.toggleProcessModal();
      }
    })
  }

  deleteProcess(process: any) {
    Swal.fire({
      text: `¿Estas seguro de eliminar el Proceso: ${process.otherProcessName}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then(async (choice) => {
      if (choice.value) {
        process.statusID = 0;
        let body: any = {
          updates: [process]
        }
        let result: any = await this.Administrative.updateOtherProcess(body).toPromise();
        if (!result) {
          Swal.fire({
            text: 'Hubo un error al momento de eliminar el Proceso.',
            icon: 'error',
          });
          return;
        }
        this.getProcess();
        Swal.fire({
          text: 'Se eliminó el Proceso correctamente.',
          icon: 'success',
        });
      }
    });
  }

  async toggleSelectFile(file: any) {
    file.selected = !file.selected;
    //console.log('cambiar estado si es para registrar en linea');
    //console.log(file);
    if (file.selected) {
      let body: any = {
        news: [
          {
            otherProcessID: this.newFile.otherProcessID,
            fileTypeID: file.fileTypeID,
            executableTypeID: file.executableTypeID,
          }
        ]
      };
      //console.log(body);
      let result: any = await this.Administrative.saveFileProcessConfig(body).toPromise();
      //console.log(result);
      file.fileProcessConfigID = result[0].fileProcessConfigID;
    } else {
      let body: any = {
        deletes: [
          {
            fileProcessConfigID: file.fileProcessConfigID,
            otherProcessID: this.newFile.otherProcessID,
            fileTypeID: file.fileTypeID,
            executableTypeID: file.executableTypeID,
          }
        ]
      };
      //console.log(body);
      let result: any = await this.Administrative.deleteFileProcessConfig(body).toPromise();
      //console.log(result);
      file.executableTypeID = undefined;
    }
    this.getProcess();
  }

  saveFileProcessConfig() {
    //console.log('cerrar');
    this.toggleFileModal();
    // Swal.fire({
    //   text: '¿Estas seguro de guardar la configuración?',
    //   icon: 'question',
    //   showConfirmButton: true,
    //   showCancelButton: true,
    //   allowEnterKey: false,
    //   allowEscapeKey: false,
    //   allowOutsideClick: false
    // }).then(async (choice) => {
    //   if (choice.isConfirmed) {
    //     this.new
    //     let body
    //   }
    // });
  }

  selectCompany() {
    if(this.config.company) this.config.fileTypes = this.fileTypes.filter((f: any) => f.companyID === this.config.company.companyID);
  }

  public toggleNewFile(name?: string): void {
		if(!this.isCreatingFile) this.isCreatingFile = !this.isCreatingFile;
		else {
			if(name){
				let body= {
					fileTypeName: name,
					fileTypeDesc: name,
					companyID: this.config.company.companyID,
					flgLinkage: 0,
					user: this.user.currentUser.userName
				}
				this.Administrative.postFileType(body).subscribe({
					next: (res) => {
						this.isCreatingFile= false;
						name= '';
						this.getFileTypes();
						this.snackBar.open(
							`Registro exitoso`,
							null,
							{
								horizontalPosition: 'center',
								verticalPosition: 'top',
								duration: 3000,
								panelClass: ['green-snackbar']
							}
						);
						setTimeout(() => {
							this.selectCompany();
						}, 250);
					},
					error: (err: HttpErrorResponse) => {
						//console.log(err);
					}
				})
			}else this.snackBar.open(
				`Ingrese un nombre`,
				null,
				{
					horizontalPosition: 'center',
					verticalPosition: 'top',
					duration: 3000,
					panelClass: ['red-snackbar']
				}
			);
		}
  }

}
