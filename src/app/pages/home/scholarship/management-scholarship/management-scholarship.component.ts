import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, SecurityContext, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { Subscription, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ApiService } from '@services/api.service';
import { Period } from '@utils/interfaces/period.interfaces';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '@environments/environment';
import { HttpResponse } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-management-scholarship',
  templateUrl: './management-scholarship.component.html',
  styleUrls: ['./management-scholarship.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    TabsModule,
    ModalModule,
		MatPaginatorModule,
		ReactiveFormsModule,
		MatButtonModule,
		MatFormFieldModule,
		MatSelectModule,
		MatTooltipModule,
		MatIconModule,
  ],
  standalone: true
})
export class ManagementScholarshipComponent implements OnInit {

  constructor(
    private Administrative: AdministrativeService,
    private Common: CommonService,
		private api: ApiService,
		private fb: FormBuilder
  ) {}

  @ViewChild('scholarshipModal', {static: false}) scholarshipModal: ModalDirective;
  @ViewChild('scholarshipTypeModal', {static: false}) scholarshipTypeModal: ModalDirective;
  @ViewChild('requirementModal', {static: false}) requirementModal: ModalDirective;
	@ViewChild('paginator', { static: true }) public paginator!: MatPaginator;

	public filtersForm!: FormGroup;
	public scholarshipPageIndex: number = 1;
	public scholarshipTypesPageIndex: number = 1;
  public pageSize: number = 10;
	public scholarshipLength: number = 0;
  public scholarshipTypesLength: number = 0;
  public pageEvent!: PageEvent;
  public pageSizeOptions: number[] = [5, 10, 25, 50, 100];
	public periods: Period[] = [];

	private getPdfContentSubscription!: Subscription;
	private sanitizer: DomSanitizer = inject(DomSanitizer);

  scholarships: any[] = [];
  scholarshipTypes: any[] = [];
  academicPeriods: any[] = [];
  modalities: any[] = [];
  allSchools: any[] = [];
  schools: any[] = [];
  careers: any[] = [];
  requirements: any[] = [];

  statuses: any[] = [
    {
      statusID: 0,
      statusName: 'Inactivo'
    },
    {
      statusID: 1,
      statusName: 'Activo'
    },
  ];

  conditions: any[] = [
    {
      conditionID: '<',
      conditionName: 'MENOR QUE'
    },
    {
      conditionID: '<=',
      conditionName: 'MENOR o IGUAL QUE'
    },
    {
      conditionID: '>',
      conditionName: 'MAYOR QUE'
    },
    {
      conditionID: '>=',
      conditionName: 'MAYOR o IGUAL QUE'
    },
    {
      conditionID: '=',
      conditionName: 'IGUAL QUE'
    },
  ];


  newScholarship: any = {};
  scholarshipSelected: any = {};
  newScholarshipType: any = {};
  newRequirement: any;
  userID: number= +sessionStorage.getItem('userId');

  foundeds: any[] = [];

  ngOnInit() {
		this.initFiltersForm();
		this.getPeriods();
    this.getScholarships();
    this.getScholarshipTypes();
    this.getAcademicPeriods();
    this.getModalities();
    this.getSchools();
  }

	private initFiltersForm(): void {
		this.filtersForm= this.fb.group({
			periodID: 0,
		})
	}

  async getAcademicPeriods() {
    let result: any = await this.Administrative.getPeriods().toPromise();
    //console.log(result);
    this.academicPeriods = result;
  }

  async getModalities() {
    let result: any = await this.Administrative.getModalities().toPromise();
    this.modalities = result.data;
  }

  async getSchools() {
    let result: any = await this.Administrative.getCareerAll().toPromise();
    this.allSchools = result;
  }

  getCareers() {
    if (this.newScholarship.schoolID) {
      let schoolFound: any = this.allSchools.find((s: any) => s.schoolID === this.newScholarship.schoolID);
      if (schoolFound) {
        this.careers = schoolFound.careers;
      }
    }
  }

	public getPeriods():void{
		this.api.getPeriods().subscribe({
      next: (res) => {
				this.periods = res.data;
      }
    });
	}

  async getScholarships() {
    this.Administrative.getScholarship(this.filtersForm.get('periodID').value, this.scholarshipPageIndex, this.pageSize).subscribe({
      next: (res) => {
        //console.log('getScholarship', res);
        this.scholarships = res.data;
        this.scholarshipLength = res.count;
      },
      error: (err) => {
        //console.log(err);
      }
    });
  }

	public changePageScholarship(event: PageEvent): PageEvent {
		this.scholarshipPageIndex = event.pageIndex+1;
    this.pageSize = event.pageSize;
		this.getScholarships();
    return event;
	}

  async getScholarshipTypes() {
		this.Administrative.getScholarshipTypes(this.scholarshipTypesPageIndex, this.pageSize).subscribe({
      next: (res) => {
        //console.log('getScholarship', res);
        this.scholarshipTypes = res.data;
        this.scholarshipTypesLength = res.count;
      },
      error: (err) => {
        //console.log(err);
      }
    });
  }

	public changePageScholarshipTypes(event: PageEvent): PageEvent {
		this.scholarshipTypesPageIndex = event.pageIndex+1;
    this.pageSize = event.pageSize;
		this.getScholarshipTypes();
    return event;
	}

  toggleScholarship(scholarship?: any, scholarshipID?: number) {
    if (scholarshipID) {
      Swal.fire({
        text: '¿Estas seguro de eliminar la Beca?',
        icon: 'question',
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
        showConfirmButton: true,
        showCancelButton: true
      }).then(async (choice) => {
        if (choice.isConfirmed) {
          scholarship.statusID = 0;
          let body: any = {
            updates: [scholarship]
          };
          let result: any = await this.Administrative.updateScholarships(body).toPromise();
          if (!result) {
            Swal.fire({
              text: 'Hubo un error al momento de eliminar el item',
              icon: 'error'
            });
            return;
          }
          Swal.fire({
            text: 'Se realizaron los cambios',
            icon: 'success'
          });
          this.getScholarships();
        }
      })
    } else {
      if (!this.scholarshipTypes.length) {
        Swal.fire({
          text: 'No se tienen registrado ningún Tipo de Beca. ¿Deseas registrar un Tipo de Beca?',
          icon: 'warning',
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
          showCancelButton: true,
          showConfirmButton: true
        }).then((choice) => {
          if (choice.isConfirmed) {
            this.toggleScholarshipType();
          }
        });
      } else {
        if (this.scholarshipModal.isShown) {
          this.scholarshipModal.hide();
        } else {
          this.scholarshipModal.config.keyboard = false;
          this.scholarshipModal.config.ignoreBackdropClick = true;
          this.scholarshipModal.show();
          this.newScholarship = {};
          if (scholarship) {
						//console.log(scholarship);
            this.newScholarship = scholarship;
            this.getCareers();
						this.selectModality(true);
						let careers: any[] = [];
						careers.push(scholarship.careerID);
						this.newScholarship.careers= careers;
            this.newScholarship.editing = true;
          }
        }
      }
    }
  }

  toggleScholarshipType(scholarshipType?: any, scholarshipTypeID?: number) {
    if (scholarshipTypeID) {
      Swal.fire({
        text: '¿Estas seguro de eliminar el Tipo de Beca?',
        icon: 'question',
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
        showConfirmButton: true,
        showCancelButton: true
      }).then(async (choice) => {
        if (choice.isConfirmed) {
          scholarshipType.statusID = 0;
          let body: any = {
            updates: [scholarshipType]
          };
          let result: any = await this.Administrative.updateScholarshipTypes(body).toPromise();
          if (!result) {
            Swal.fire({
              text: 'Hubo un error al momento de eliminar el item',
              icon: 'error'
            });
            return;
          }
          Swal.fire({
            text: 'Se realizaron los cambios',
            icon: 'success'
          });
          this.getScholarshipTypes();
        }
      })
    } else {
      if (this.scholarshipTypeModal.isShown) {
        this.scholarshipTypeModal.hide();
      } else {
        this.scholarshipTypeModal.config.keyboard = false;
        this.scholarshipTypeModal.config.ignoreBackdropClick = true;
        this.scholarshipTypeModal.show();
        this.newScholarshipType = {};
        if (scholarshipType) {
          this.newScholarshipType = scholarshipType;
          this.newScholarshipType.editing = true;
        }
      }
    }
  }

  toggleIsIndividual() {
    this.newScholarship.isIndividual = !this.newScholarship.isIndividual;
    this.foundeds = [];
    this.newScholarship.studentToSearch = undefined;
  }

  saveScholarship() {
    Swal.fire({
      text: `¿Estas seguro de guardar los cambios?`,
      icon: 'question',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      showConfirmButton: true,
      showCancelButton: true
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        let body: any = {};
        let result: any;
        if (!this.newScholarship.editing) {
          this.newScholarship.statusID = 1;
          if (!this.newScholarship.isIndividual) {
            body.news = this.newScholarship.careers.map((c: any) => {
              return {
                scholarshipTypeID: this.newScholarship.scholarshipTypeID,
                name: this.newScholarship.name,
                description: this.newScholarship.description,
                discountPercentage: this.newScholarship.discountPercentage,
                isIndividual: this.newScholarship.isIndividual,
                academicPeriod: this.newScholarship.academicPeriod,
                modalityID:  this.newScholarship.modalityID,
                schoolID:  this.newScholarship.schoolID,
                careerID: c,
                studentID: this.newScholarship.studentID,
                statusID: this.newScholarship.statusID || '1',
                userCreated: this.newScholarship.userCreated || 'MIGRA'
              }
            })
          } else {
            body.news = [this.newScholarship];
          }
          result = await this.Administrative.saveScholarships(body).toPromise();
        } else {
          body.updates = [this.newScholarship];
          result = await this.Administrative.updateScholarships(body).toPromise();
        }
        if (!result) {
          Swal.fire({
            text: 'Hubo un error al momento de guardar los cambios',
            icon: 'error'
          });
          return;
        }
        Swal.fire({
          text: 'Se guardaron los cambios correctamente',
          icon: 'success'
        });
        this.toggleScholarship();
        this.getScholarships();
      }
    })
  }

  saveScholarshipType() {
    Swal.fire({
      text: `¿Estas seguro de guardar los cambios?`,
      icon: 'question',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      showConfirmButton: true,
      showCancelButton: true
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        let body: any = {};
        let result: any;
        if (!this.newScholarshipType.editing) {
          this.newScholarshipType.statusID = 1;
          this.newScholarship.userCreated = this.userID;
          body.news = [this.newScholarshipType];
          result = await this.Administrative.saveScholarshipTypes(body).toPromise();
        } else {
          this.newScholarship.userUpdated = this.userID;
          body.updates = [this.newScholarshipType];
          result = await this.Administrative.updateScholarshipTypes(body).toPromise();
        }
        if (!result) {
          Swal.fire({
            text: 'Hubo un error al momento de guardar los cambios',
            icon: 'error'
          });
          return;
        }
        Swal.fire({
          text: 'Se guardaron los cambios correctamente',
          icon: 'success'
        });
        this.toggleScholarshipType();
        this.getScholarshipTypes();
      }
    })
  }

  async toggleRequirement(scholarship?: any) {
    if (this.requirementModal.isShown) {
      this.requirementModal.hide();
    } else {
      this.requirementModal.config.keyboard = false;
      this.requirementModal.config.ignoreBackdropClick = true;
      this.requirementModal.show();
      this.scholarshipSelected = scholarship;
      this.getRequirementsByScholarship();
    }
  }

  async getRequirementsByScholarship() {
    let result: any = await this.Administrative.getScholarshipRequirementsByScholarshipID(this.scholarshipSelected.scholarshipID).toPromise();
    //console.log(result);
    this.requirements = result;
  }

  addRequirement(requirement?: any) {
    if (this.newRequirement) {
      this.newRequirement = undefined;
    } else {
      if (requirement) {
        this.newRequirement = requirement;
        this.newRequirement.editing = true;
      } else {
        this.newRequirement = {
          scholarshipID: this.scholarshipSelected.scholarshipID
        };
      }
    }
  }

  saveRequirement() {
    Swal.fire({
      text: '¿Estas seguro de guardar los cambios?',
      icon: 'question',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      showCancelButton: true,
      showConfirmButton: true
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        let body: any = {};
        let result: any;
        if (!this.newRequirement.editing) {
          this.newRequirement.statusID = 1;
          body.news = [this.newRequirement]
          result = await this.Administrative.saveScholarshipRequirements(body).toPromise();
        } else {
          body.updates = [this.newRequirement];
          result = await this.Administrative.updateScholarshipRequirements(body).toPromise();
        }
        if (!result) {
          Swal.fire({
            text: 'Hubo errores al momento de guardar los cambios',
            icon: 'success'
          });
          return;
        }
        Swal.fire({
          text: 'Se guardaron los cambios',
          icon: 'success'
        });
        this.getRequirementsByScholarship();
        this.addRequirement();
      }
    })
  }

  async searchStudent() {
    let result: any = await this.Common.getPersonByDocumentNumber(this.newScholarship.studentToSearch).toPromise();
    //console.log(result);
    if (result) {
      let resultCareer: any = await this.Administrative.getCareerByPerson(result.personID).toPromise();
      let careers = resultCareer.filter((r: any) => r.currentCareer === 'Y');
      result.hasManyCareers = careers.length > 1;
      result.careers = careers;
      if (!result.hasManyCareers) {
        result.studentID = careers[0].studentID;
      }
      this.foundeds = [result];
    } else {
      Swal.fire({
        text: 'No existe ninguna persona con ese Número de Documento',
        icon: 'error'
      });
    }
  }

  selectToAssign(found: any, career?: any) {
    if (career) {
      this.newScholarship.studentID = career.studentID;
    } else {
      this.newScholarship.studentID = found.identity;
    }
  }

  toggleAllCareers() {
    this.newScholarship.allCareers = !this.newScholarship.allCareers;
    if (this.newScholarship.allCareers) {
      this.newScholarship.careers = this.careers.map((c: any) => c.careerID);
    } else {
      this.newScholarship.careers = [];
    }
  }

  async selectModality(isEditing?: boolean) {
    if(!isEditing) this.newScholarship.schoolID = undefined;
    if (this.newScholarship.academicPeriod && this.newScholarship.modalityID) {
      let result: any = await this.Administrative.getSchoolsByModality(this.newScholarship.academicPeriod, this.newScholarship.modalityID).toPromise();
      //console.log(result);
      this.schools = result;
    }
  }

	public openFile(relativeRoute: string): void {
		const route: string = `${environment.url}/${relativeRoute}`;
		if (this.getPdfContentSubscription) this.getPdfContentSubscription.unsubscribe();
		this.getPdfContentSubscription = this.api.getPdfContent(route).subscribe((res: HttpResponse<Blob>) => {
			if (res.body) {
				let contentType: string | null | undefined = res.headers.get('content-type');
				// Porque el tipo de variable que recibe el type es string o undefined. No recibe null.
				if (!contentType) {
					contentType = undefined;
				}
				const blob: Blob = new Blob([res.body], { type: contentType });
				const url = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob)));
				if (url) {
					window.open(url, '_blank');
				}
			}
		});
	}

}
