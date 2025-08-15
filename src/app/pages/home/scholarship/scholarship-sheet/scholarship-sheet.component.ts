import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministrativeService } from '@services/administrative.service';
import { ApiService } from '@services/api.service';
import { CurrentPeriod } from '@utils/interfaces/others.interfaces';
import { onlyNumbers, ROLE_CODES } from 'app/constants';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-scholarship-sheet',
  templateUrl: './scholarship-sheet.component.html',
  styleUrls: ['./scholarship-sheet.component.css'],
  imports: [
    CommonModule,
    FormsModule
  ],
  standalone: true
})
export class ScholarshipSheetComponent implements OnInit{

  constructor(
    private ActivatedRoute: ActivatedRoute,
    private Administrative: AdministrativeService,
    private Router: Router,
		private api: ApiService
  ) {}

  assignStudentID: number;
  studentID: number;
  sections: any = [
    {id: 0, name: 'Beca', icon: 'fa fa-cog'},
    {id: 1, name: 'Familia', icon: 'fa fa-cog'},
    {id: 2, name: 'Económicos', icon: 'fa fa-cog'},
  ];
  currentPeriod: CurrentPeriod;
  currentAssign: any = {
    addressInfo: {},
    houseHold: {},
    humanDevelopment: {},
		reason: {}
  };

  statusHomeTypes: any[] = [];
  homeZones: any[] = [];
  mobilityTypes: any[] = [];
  houseFloorTypes: any[] = [];
  goods: any[] = [];
  technologicalGoods: any[] = [];

  mainOptions: any[] = [
    {
      code: '01',
      name: 'SI',
      value: true
    },
    {
      code: '02',
      name: 'NO',
      value: false
    },
  ];

  userIsStudent: boolean = false;
	reasonHasError: boolean = false;

  ngOnInit() {
    let params: any = this.ActivatedRoute.snapshot.params;
    this.assignStudentID = +params.assignStudentID;
    this.studentID = +params.studentID;
    this.userIsStudent = parseInt(sessionStorage.getItem('rolID') || '0') === ROLE_CODES.STUDENT;
    if (!this.assignStudentID || !this.studentID) {
      Swal.fire({
        text: 'No debes estar aqui',
        icon: 'warning'
      });
      this.Router.navigate(['/']);
      return;
    } else {
      this.getCurrentPeriod();
    }
  }

	private getCurrentPeriod(): void {
		this.api.getCurrentPeriod().subscribe({
			next: (res: CurrentPeriod) => {
				this.currentPeriod = res;
				this.getTypes();
			}
		});
	}

  async getTypes() {
    let resultStatusHomeType: any = await this.Administrative.getTableTypeByType('ESTADO_TIPO_VIVIENDA').toPromise();
    this.statusHomeTypes = resultStatusHomeType;

    let resultHomeZone: any = await this.Administrative.getTableTypeByType('ZONA_VIVIENDA').toPromise();
    this.homeZones = resultHomeZone;

    let resultMobilityTpes: any = await this.Administrative.getTableTypeByType('TIPO_MOVILIDAD').toPromise();
    this.mobilityTypes = resultMobilityTpes;

    let resultHouseFloorTypes: any = await this.Administrative.getTableTypeByType('TIPO_PISO').toPromise();
    this.houseFloorTypes = resultHouseFloorTypes;

    let resultGoods: any = await this.Administrative.getTableTypeByType('BIEN').toPromise();
    this.goods = resultGoods;

    let resultTechnologicalGoods: any = await this.Administrative.getTableTypeByType('BIEN_TECNOLOGICO').toPromise();
    this.technologicalGoods = resultTechnologicalGoods;
    this.getStudentInfoOfAssign();
  }

  async getStudentInfoOfAssign() {
    let resultAssignScholarship: any = await this.Administrative.getStudentInfoToScholarshipAssign(this.studentID).toPromise();
    let result: any = await this.Administrative.getScholarshipAssignStudentByAssignStudentID(this.assignStudentID).toPromise();
    if (resultAssignScholarship.length) {
      let resultSocioEconomicSheet: any = await this.Administrative.getSocioEconomicInfoToScholarship(this.currentPeriod.periodID, this.studentID).toPromise();
      this.socioeconomicSheet.student = resultAssignScholarship[0] || {};
      this.currentAssign = resultAssignScholarship[0].additionalFields || {addressInfo: {}, houseHold: {}, statusID: resultAssignScholarship[0].statusID, humanDevelopment: {} };

      if (this.currentAssign.addressInfo.houseFloorType) {
        this.houseFloorTypes.filter((h: any) => JSON.parse(this.currentAssign.addressInfo.houseFloorType).includes(h.code)).map((h: any) => {
          h.selected = true;
        })
      }

      if (this.currentAssign.addressInfo.good) {
        this.goods.filter((h: any) => JSON.parse(this.currentAssign.addressInfo.good).includes(h.code)).map((h: any) => {
          h.selected = true;
        })
      }

      if (this.currentAssign.addressInfo.technologicalGood) {
        this.technologicalGoods.filter((h: any) => JSON.parse(this.currentAssign.addressInfo.technologicalGood).includes(h.code)).map((h: any) => {
          h.selected = true;
        })
      }

      this.socioeconomicSheet.student.hasSocioEconomicSheet = (resultSocioEconomicSheet.EducationSkill.length > 0)
        && (resultSocioEconomicSheet.economicData.length || resultSocioEconomicSheet.groupDependency.length);
      this.socioeconomicSheet.student.periodName = this.currentPeriod.periodName;
      this.socioeconomicSheet.scholarship.main = resultAssignScholarship[0];
      this.socioeconomicSheet.groupFamily = resultSocioEconomicSheet.groupFamily;
      this.socioeconomicSheet.groupFamily = this.socioeconomicSheet.groupFamily.filter((g: any) => g.fullNameParents);
      this.socioeconomicSheet.groupFamily.unshift({
        academicInstructionName: 'ESTUDIANTE',
        fullNameParents: resultSocioEconomicSheet.student.fullName,
        professionName: 'ESTUDIANTE',
        relationName: 'INTERESADO',
        isStudent: true
      });

      if (this.currentAssign.houseHold && this.currentAssign.houseHold.isStudent) {
        this.socioeconomicSheet.groupFamily.map((g: any) => {
          g.selected = false;
        })
        this.socioeconomicSheet.groupFamily.filter((g: any) => g.isStudent).map((g: any) => {
          g.selected = true;
        })
      } else {
        this.socioeconomicSheet.groupFamily.filter((g: any) => g.relationName === this.currentAssign.houseHold.relationName && g.fullNameParents === this.currentAssign.houseHold.fullNameParents).map((g: any) => {
          g.selected = true;
        })
      }
      this.socioeconomicSheet.groupDependency = resultSocioEconomicSheet.groupDependency;
      this.socioeconomicSheet.economic = {
        incomes: resultSocioEconomicSheet.economicData.filter((e: any) => e.incomeEgressTypeName === 'INGRESO'),
        totalIncomes: resultSocioEconomicSheet.economicData.filter((e: any) => e.incomeEgressTypeName === 'INGRESO').reduce((m: any, i: any) => { return m + parseFloat(i.mount)}, 0),
        expenses: resultSocioEconomicSheet.economicData.filter((e: any) => e.incomeEgressTypeName === 'EGRESO'),
        totalExpenses: resultSocioEconomicSheet.economicData.filter((e: any) => e.incomeEgressTypeName === 'EGRESO').reduce((m: any, i: any) => { return m + parseFloat(i.mount)}, 0)
      };
      if (resultSocioEconomicSheet.jobExperience.length) {
        this.socioeconomicSheet.scholarship.work = resultSocioEconomicSheet.jobExperience[resultSocioEconomicSheet.jobExperience.length - 1]
      }
      // let resultSocioEconomic: any = await this.Administrative.getSocioeconomicInformation(this.studentID).toPromise();
      // console.log(resultSocioEconomic);
      // if (!resultSocioEconomic) {
      //   Swal.fire({
      //     text: 'No rellenaste la Ficha Socioeconomica',
      //     icon: 'error'
      //   });
      //   return;
      // } else {

      // }
    } else {
      Swal.fire({
        text: 'No existe la Asignación del Beneficio.',
        icon: 'warning'
      });
      this.Router.navigate(['/']);
    }
  }

  socioeconomicSheet: any = {
    student: {},
    scholarship: {
      main: {},
      address: {},
      houseHold: {},
      work: {}
    },
    groupFamily: [],
    groupDependency: [],
    economic: {
      incomes: [],
      expenses: []
    }
  };

  groupFamily: any[] = [];
  civilStatuses: any[] = [];
  occupations: any[] = [];

  addItem(type?: string) {
    if (type) {
      this.socioeconomicSheet.economic[type].push({});
    } else {
      this.socioeconomicSheet.groupFamily.push({});
    }
  }

  deleteItem(item: any, type?: string) {
    if (type) {
      this.socioeconomicSheet.economic[type].splice(this.socioeconomicSheet.economic[type].indexOf(item), 1);
    } else {
      this.socioeconomicSheet.groupFamily.splice(this.socioeconomicSheet.groupFamily.indexOf(item), 1);
    }
  }

  saveConfigQuota() {
    Swal.fire({
      text: '¿Estás seguro de guardar la información ingresada?',
      icon: 'question',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      showCancelButton: true,
      showConfirmButton: true
    }).then(async (choice) => {
      if (choice.isConfirmed) {
      }
    })
  }

	saveScholarshipSheet() {
		const wordCount = this.currentAssign.reason ? this.currentAssign.reason.trim().split(/\s+/).length : 0;

		// Validar si supera las 40 palabras
		if (wordCount > 40) {
			Swal.fire({
				text: 'El motivo de la beca no puede tener más de 40 palabras.',
				icon: 'warning',
				confirmButtonText: 'Entendido'
			});
			return; // Detiene la ejecución si se excede el límite
		}

		Swal.fire({
			text: '¿Estás seguro de guardar la información de la Ficha de Beca?',
			icon: 'question',
			allowEnterKey: false,
			allowEscapeKey: false,
			allowOutsideClick: false,
			showCancelButton: true,
			showConfirmButton: true
		}).then(async (choice) => {
			if (choice.isConfirmed) {
				let additionalFields = {
					addressInfo: {
						statusHomeType: this.currentAssign.addressInfo.statusHomeType,
						houseCoordinates: this.currentAssign.addressInfo.houseCoordinates,
						addressStatus: this.currentAssign.addressInfo.addressStatus,
						addressZone: this.currentAssign.addressInfo.addressZone,
						bedroomsNumber: this.currentAssign.addressInfo.bedroomsNumber,
						mobilityType: this.currentAssign.addressInfo.mobilityType,
						houseFloorType: JSON.stringify(this.houseFloorTypes.filter((h: any) => h.selected).map((h: any) => h.code)),
						good: JSON.stringify(this.goods.filter((h: any) => h.selected).map((h: any) => h.code)),
						technologicalGood: JSON.stringify(this.technologicalGoods.filter((h: any) => h.selected).map((h: any) => h.code)),
					},
					houseHold: this.currentAssign.houseHold,
					humanDevelopment: this.currentAssign.humanDevelopment,
					reason: this.currentAssign.reason
				};

				let body: any = {
					updates: [
						{
							assignStudentID: this.assignStudentID,
							requestID: `${this.studentID}`,
							scholarshipID: this.socioeconomicSheet.student.scholarshipID,
							additionalFields: additionalFields,
							statusID: this.currentAssign.statusID || 1,
							userUpdated: this.studentID
						}
					]
				};

				let result: any = await this.Administrative.updateAssignScholarshipStudent(body).toPromise();
				if (!result) {
					Swal.fire({
						text: 'Hubo un problema al momento de guardar los cambios',
						icon: 'error'
					});
					return;
				}
				Swal.fire({
					text: 'Se guardaron los cambios',
					icon: 'success'
				});
			}
		});
	}


	toggleSelectHouseHold(family: any) {
    if (this.currentAssign.houseHold && this.currentAssign.houseHold.fullNameParents === family.fullNameParents) {
      family.selected = false;
      this.currentAssign.houseHold = undefined;
    } else {
      this.socioeconomicSheet.groupFamily.map((g: any) => {
        g.selected = false;
      });
      family.selected = true;
      this.currentAssign.houseHold = family;
    }
  }

  onlyNumbers(e: any) {
    onlyNumbers(e);
  }

	validateReason() {
		const wordCount = this.currentAssign.reason ? this.currentAssign.reason.trim().split(/\s+/).length : 0;
		this.reasonHasError = wordCount > 40;
	}

}

