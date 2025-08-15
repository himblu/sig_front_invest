import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { alphaNumeric, alphaNumericToEmail, onlyLetters, onlyNumbers } from 'app/constants';
import { WidgetSearchPersonComponent } from 'app/widgets/widget-search-person/widget-search-person.component';
import * as moment from 'moment';
import { BsModalRef, BsModalService, ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contractor-management-new',
  templateUrl: './contractor-management-new.component.html',
  styleUrls: ['./contractor-management-new.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    TabsModule,
		SpinnerLoaderComponent
  ]
})
export class ContractorManagementNewComponent implements OnInit {

	public isLoading: boolean= false;

  constructor(
    private Administrative: AdministrativeService,
    private ModalService: BsModalService,
    private ActivatedRoute: ActivatedRoute,
    private Router: Router,
    private ElementRef: ElementRef,
    private Common: CommonService
  ) {}

  @ViewChild('inBulkModal', {static: false}) inBulkModal: ModalDirective;

  persons: any[] = [];
  professions: any[] = [];
  newContractor: any = {};
  newCollaborators: any[] = [];
  newResponsibles: any[] = [];
  documentTypes: any[] = [];
  modal: any = {};
  fileInBulk: any;
  searchPersonModal: BsModalRef;
  userID: any;
  onlyRead: boolean = false;
  rolID: number = 0;

  async ngOnInit() {
    this.userID = sessionStorage.getItem('userId');
    let resultMain: any = await this.Administrative.getContractorResponsibleMainByUserID(this.userID).toPromise();
    this.onlyRead = resultMain.length > 0;
    let params: any = this.ActivatedRoute.snapshot.params;
    this.rolID = +sessionStorage.getItem('rolID');
    let contractorID: any = params.contractorID;
    switch (true) {
      case contractorID !== 'nuevo' && !isNaN(parseInt(contractorID)):
        //console.log('detalle de contratista');
        let result: any = await this.Administrative.getContractorByID(contractorID).toPromise();
        //console.log(result);
        this.newContractor = result[0];
        let resultResponsibles: any = await this.Administrative.getContractorResponsibleByContractorID(contractorID).toPromise();
        this.newResponsibles = resultResponsibles;

        let resultCollaborators: any = await this.Administrative.getContractorCollaboratorByContractorID(contractorID).toPromise();
        this.newCollaborators = resultCollaborators;
        this.validateResponsible();
        break;
      case contractorID === 'nuevo':
        //console.log('nuevo');
        break;
      case contractorID !== 'nuevo' && isNaN(parseInt(contractorID)):
        Swal.fire({
          text: '¡No puedes estar aqui!',
          icon: 'error'
        });
        this.Router.navigate([`/unacem/administracion-de-contratistas`])
        return;
      default:
        break;
    }
    this.getProfessions();
    this.getDocumentTypes();
  }

  back() {
    this.Router.navigate([`/unacem/administracion-de-contratistas`]);
  }

  async getDocumentTypes() {
    let result: any = await this.Administrative.getAllTypesDocuments().toPromise();
    this.documentTypes = result.filter((r: any) => [1,4].includes(r.typeDocId));
  }

  async getProfessions() {
    let result: any = await this.Administrative.getProfessions().toPromise();
    this.professions = result;
  }

  toggleAddItem(list: any, item?: any) {
    if (item) {
      if (item.responsibleID) {
        //console.log('BD');
      } else {
        list.splice(list.indexOf(item), 1);
      }
    } else {
      list.push({});
    }
  }

  searchPerson(list: any) {
    this.searchPersonModal = this.ModalService.show(WidgetSearchPersonComponent, {class: 'modal-lg'});
    this.searchPersonModal.content.onClose.subscribe((data: any) => {
      if (data) {
        let personSelected = data;
        //console.log(personSelected);
        let mapFilter: any = (i: any) => `${i.personID}-${i.username || i.userName}`;
        if (!list.map((i: any) => mapFilter(i)).includes(mapFilter(data))) {
          list.push({
            personID: personSelected.personID,
            personFullName: personSelected.PersonFullName,
            username: personSelected.userName,
            userName: personSelected.userName,
            numberPhone: personSelected.numberPhone,
            userID: personSelected.userID || personSelected.userId,
            users: [JSON.parse(JSON.stringify(personSelected))],
            newRecord: false
          });
        } else {
          Swal.fire({
            text: 'La persona con el nombre de usuario seleccionado ya esta INCLUIDA en la lista en mención',
            icon: 'error'
          });
          return;
        }
      }
    });
  }

  deleteItem(list: any, item: any) {
    if (item.responsibleID) {
      //console.log('BD');
    }
    list.splice(list.indexOf(item), 1);
  }

  toggleInBulk(list?: string, listTitle?: string) {
    if (this.inBulkModal.isShown) {
      this.inBulkModal.hide();
    } else {
      this.inBulkModal.config.keyboard = false;
      this.inBulkModal.config.ignoreBackdropClick = true;
      this.inBulkModal.show();
      this.fileInBulk = undefined;
      this.modal = {
        title: listTitle,
        list: list,
        uploadList: []
      };
    }
  }

  toggleIsMain(item: any) {
    this.newResponsibles.map((i: any) => {
      i.isMain = false;
    });
    item.isMain = true;
    this.validateResponsible();
  }

  validateResponsible() {
    this.newContractor.haveMainResponsible = this.newResponsibles.some((r: any) => r.isMain === true || r.isMain === 1);
  }

  addToList() {
    switch (this.modal.list) {
      case 'newCollaborators':
        this.newCollaborators = this.newCollaborators.concat(JSON.parse(JSON.stringify(this.modal.uploadList.filter((d: any) => !d.exclude))));
        break;
      case 'newResponsibles':
        this.newResponsibles = this.newResponsibles = this.newResponsibles.concat(JSON.parse(JSON.stringify(this.modal.uploadList)));
        break;
      default:
        break;
    }
    this.modal.uploadList = [];
    /* console.log(this.newCollaborators);
    console.log(this.newResponsibles);
    console.log(this.modal); */
    this.toggleInBulk();
  }

  selectDocumentType() {
    if (this.newContractor.billingDocumentType) {
      let documentTypeSelected: any = this.documentTypes.find((d: any) => d.typeDocId === this.newContractor.billingDocumentType);
      if (documentTypeSelected) {
        this.newContractor.typeDocLong = documentTypeSelected.typeDocLong;
      }
    }
  }

  async uploadFormatXLSX() {
    //console.log('Subir archivo');
    Swal.fire({
      html: '<i class="fa fa-cog fa-spin fa-3x"></i> <br> <h2 class="text-center">Construyendo la información importada.</h2>',
      showConfirmButton: false,
      showCancelButton: false,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    });
    const file: HTMLInputElement = this.ElementRef.nativeElement.querySelector(`#file-in-bulk`)
    let fileCount: number = file.files.length;
    let formData = new FormData();
    if (fileCount > 0) {
      formData.append('file', file.files.item(0));
      let data: any = await this.Administrative.uploadInBuilk(formData).toPromise();
      //console.log('uploadInBuilk', data);
      data.map((d: any) => {
        let collaboratorFound = this.newCollaborators.find((c: any) => c.personID === d.personID && c.userID === d.userID);
        if (collaboratorFound) {
          d.exclude = true;
        }
      });
      this.modal.uploadList = data;
      Swal.close();
    }
  }

  selectUser(item: any) {
    if (item.userName) {
      let userSelected = item.users.find((u: any) => u.userName === item.userName);
      if (userSelected) {
        item.userID = userSelected.userID;
        item.personID = userSelected.personID;
      }
    }
  }

  saveChanges() {
    Swal.fire({
      text: `¿Estas seguro de grabar la información del Contratista?`,
      icon: 'question',
      allowEnterKey: false,
      allowEscapeKey: false,
      confirmButtonColor: '#014898',
      allowOutsideClick: false,
      showConfirmButton: true,
      showCancelButton: true,
      cancelButtonText: 'Cancelar'
    }).then(async (choice) => {
      if (choice.isConfirmed) {
				this.isLoading= true;
        let personExists: any[] = [];
        let personExistsInCollaborators: any = this.newCollaborators.filter((r: any) => !r.newRecord && !personExists.map((n: any) => n.personDocumentNumber).includes(r.personDocumentNumber));
        personExists = personExists.concat(personExistsInCollaborators);
        let personExistsInResponsibles: any = this.newResponsibles.filter((r: any) => !r.newRecord && !personExists.map((n: any) => n.personDocumentNumber).includes(r.personDocumentNumber))
        personExists = personExists.concat(personExistsInResponsibles);

        for (let i = 0; i < personExists.length; i++) {
          let person = personExists[i];
          let bodyRol: any = {
            p_userID: person.userID,
            p_rolID: 24,
            p_user: 'INSCRIPCIÓN'
          };
          let resultRol: any = await this.Administrative.postRoles(bodyRol).toPromise();
        }

        // Insertar Personas
        let newPersons: any[] = [];
        let personsInResponsibles = this.newResponsibles.filter((r: any) => r.newRecord && !newPersons.map((n: any) => n.personDocumentNumber).includes(r.personDocumentNumber));
        newPersons = newPersons.concat(personsInResponsibles);
        let personsInCollaborators = this.newCollaborators.filter((r: any) => r.newRecord && !newPersons.map((n: any) => n.personDocumentNumber).includes(r.personDocumentNumber))
        newPersons = newPersons.concat(personsInCollaborators);
				//console.log('newPersons', newPersons);

        let results: any[] = [];
        if (newPersons.length) {
          newPersons.map((p: any) => {
            p.userId = p.userName;
            p.personEmail = p.emailDesc;
            p.typePersonCode = 'N';
            p.userOrigin = 'MIGRA';
            p.userCreated = 'MIGRA';
            p.userRol = 24;
						p.sendEmail= 1;
          });
          for (let x = 0; x < newPersons.length; x++) {
            const person = newPersons[x];
            let bodyPerson: any = {
              news: [person]
            };
            let resultPerson: any = await this.Common.savePersonJSON(bodyPerson).toPromise();
            //console.log('resultPerson', resultPerson);
            person.personID = resultPerson[0].personID;
            person.userID = resultPerson[0].userID;
            results = results.concat(resultPerson);
          }
        }

        results.map((t: any) => {
          let responsibleSelected: any = this.newResponsibles.find((r: any) => r.personDocumentNumber === t.personDocumentNumber);
          if (responsibleSelected) {
            responsibleSelected.personID = t.personID;
            responsibleSelected.userID = t.userID;
          }

          let collaboratorSelected: any = this.newCollaborators.find((r: any) => r.personDocumentNumber === t.personDocumentNumber);
          if (collaboratorSelected) {
            collaboratorSelected.personID = t.personID;
            collaboratorSelected.userID = t.userID;
          }
        });

        /* console.log(newPersons);
        console.log("-------------------------------------------------------------------------");
        console.log(this.newResponsibles); */

        // return;

        let bodyPhone: any = {
          news: newPersons.map((p: any) => {
            return {
              phoneTypeID: 2,
              operatorID: 2,
              personId: p.personID,
              sequenceNro: 0,
              numberPhone: p.numberPhone,
              numberReferences: null,
              comentary: null,
              statusID: 1,
              dateCreated: moment().format('YYYY-MM-DD'),
              userCreated: 'MIGRA',
              userOrigin: 'MIGRA'
            }
          })
        };

        let resultPhone: any = await this.Common.savePhoneJSON(bodyPhone).toPromise();

        let bodyEmail: any = {
          news: newPersons.map((p: any) => {
            return {
              emailTypeID: 1,
              personID: p.personID,
              sequenceNro: 1,
              emailDesc: p.emailDesc,
              statusID: 1,
              userCreated: 'MIGRA',
              userOrigin: 'ec2_user',
              version: 0
            }
          })
        };

        let resultEmail: any = await this.Common.saveEmailJSON(bodyEmail).toPromise();
        let body: any = {};
        let result: any;
        if (this.newContractor.contractorID) {
          body.updates = [this.newContractor];
          result = await this.Administrative.updateContractor(body).toPromise();
        } else {
          this.newContractor.createBy = this.userID;
          body.news = [this.newContractor];
          result = await this.Administrative.postContractor(body).toPromise();
        }


        if (!result) {
					this.isLoading= false;
          Swal.fire({
            text: 'Hubo un error al insertar al Contratista',
            icon: 'error'
          });
          return;
        }
        if (this.newCollaborators.length) {
          this.newCollaborators.map((c: any) => {
            c.contractorID = result[0].contractorID;
          });

          let bodyCollaborators: any = {};
          let resultCollaborator: any;
          if (this.newCollaborators.filter((c: any) => !c.collaboratorID).length) {
            bodyCollaborators.news = this.newCollaborators.filter((c: any) => !c.collaboratorID);
            resultCollaborator = await this.Administrative.postContractorCollaborator(bodyCollaborators).toPromise();
          }

          if (this.newCollaborators.filter((c: any) => c.collaboratorID).length) {
            bodyCollaborators.updates = this.newCollaborators.filter((c: any) => c.collaboratorID);
            resultCollaborator = await this.Administrative.updateContractorCollaborator(bodyCollaborators).toPromise();
          }

          if (!resultCollaborator) {
						this.isLoading= false;
            Swal.fire({
              text: 'Hubo un error al insertar a los colaboradores',
              icon: 'error'
            });
            return;
          }
        }

        if (this.newResponsibles.length) {
          this.newResponsibles.map((r: any) => {
            r.contractorID = result[0].contractorID;
          });

          let bodyResponsible: any = {};
          let resultResponsible: any;
          if (this.newResponsibles.filter((r: any) => !r.responsibleID).length) {
            bodyResponsible.news = this.newResponsibles.filter((r: any) => !r.responsibleID);
            resultResponsible = await this.Administrative.postContractorResponsible(bodyResponsible).toPromise();
          }
          if (this.newResponsibles.filter((r: any) => r.responsibleID).length) {
            bodyResponsible.updates = this.newResponsibles.filter((r: any) => r.responsibleID);
            resultResponsible = await this.Administrative.updateContractorResponsible(bodyResponsible).toPromise();
          }

          if (!resultResponsible) {
						this.isLoading= false;
            Swal.fire({
              text: 'Hubo un error al insertar a los responsables',
              icon: 'error'
            });
            return;
          }
        }

        Swal.fire({
          text: 'Se agrego al contratista correctamente',
          icon: 'success'
        });
        // this.getContractors();
				this.isLoading= false;
        this.Router.navigate([`/unacem/administracion-de-contratistas`]);
        // this.ngOnInit();
      }
    })
  }

  onlyNumbers(e: any) {
    onlyNumbers(e);
  }

  onlyLetters(e: any) {
    onlyLetters(e);
  }

  alphaNumeric(e: any) {
    alphaNumeric(e);
  }

  alphaNumericToEmail(e: any) {
    alphaNumericToEmail(e);
  }
}
