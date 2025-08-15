import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { MoodleIntegrationService } from '@services/moodle-integration.service';
import { RrhhService } from '@services/rrhh.service';
import { buildPagination, RECORD_NUMBERS } from 'app/constants';
import { PipesModule } from 'app/pipes/pipes.module';
import * as moment from 'moment';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule, TabsetComponent } from 'ngx-bootstrap/tabs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-category-moodle-integration',
  templateUrl: './category-moodle-integration.component.html',
  styleUrls: ['./category-moodle-integration.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ModalModule,
    FormsModule,
    TabsModule,
    PipesModule
  ]
})
export class CategoryMoodleIntegrationComponent implements OnInit {

  constructor(
    private Router: Router, //
    private Administrative: AdministrativeService,
    private MoodleIntegration: MoodleIntegrationService,
    private Common: CommonService,
    private RRHH: RrhhService,
  ) {

  }

  @ViewChild('categoryModal', {static: false}) categoryModal: ModalDirective;
  @ViewChild('cohortModal', {static: false}) cohortModal: ModalDirective;
  @ViewChild('courseModal', {static: false}) courseModal: ModalDirective;
  @ViewChild('migrateCourseModal', {static: false}) migrateCourseModal: ModalDirective;
  @ViewChild('relationCourseModal', {static: false}) relationCourseModal: ModalDirective;

  @ViewChild('categoryTabs', { static: false }) categoryTabs?: TabsetComponent;
  @ViewChild('configNivelationTabs', { static: false }) configNivelationTabs?: TabsetComponent;

  @ViewChild('admissionPeriodModal', {static: false}) admissionPeriodModal: ModalDirective;

  newCategory: any = {};
  newCohort: any = {};
  categories: any[] = [];
  courses: any[] = [];
  allAdmissionPeriods: any[] = [];
  admissionPeriodsFiltereds: any[] = [];
  showCategories: boolean = false;
  showPeriods: boolean = false;
  branchs: any[] = [];
  enrollPeriods: any[] = [];
  careerSettings: any[] = [];
  filter: any = {};
  categoryFilter: any = {};
  userLoged: any;
  currentDate: any;
  newCourse: any = {};
  courseConfig: any = {};
  showButtonsConfigCourse: boolean = false;
  migrating: boolean = false;
  relationating: boolean = false;
  rowNumbers: number[] = RECORD_NUMBERS;
  categorySelected: any = {};
  persons: any[] = [];
  body: any = {
    pagination: {
      currentPage: 1,
    },
    filter: {}
  };

  pages: number[] = [];
  personID: number = 0;
  newAdmissionPeriod: any = {};
  levels: any[] = [];

  ngOnInit() {
    this.body.pagination.numberRow = this.rowNumbers[0];
    this.openInitLoader();
    this.currentDate = moment();
    this.userLoged = sessionStorage.getItem('mail');
    this.personID = +sessionStorage.getItem('personID');
    this.getAdmissionPeriods();
    this.getLevels();
    this.getCategories();
    // this.closeSwal();
    this.getBranchs();
    this.getEnrollPeriods();
    this.getCareerSetting();
    this.getPersonToSyncWithMoodle();
  }

  async getLevels() {
    let result: any = await this.Administrative.getLevels().toPromise();
    //console.log(result);
    this.levels = result.data;
  }

  resetSearch() {
    this.body.pagination.currentPage = 1;
    this.getPersonToSyncWithMoodle();
  }

  async getPersonToSyncWithMoodle() {
    let result: any = await this.Administrative.getPersonToSyncWithMoodle(this.body).toPromise();
    //console.log(result);
    if (result.length) {
      this.body.pagination.totalRecords = result[0].count;
      this.pages = buildPagination(this.body.pagination.totalRecords, this.body.pagination.numberRow);
      //console.log(this.pages);
      this.persons = result;
      this.persons.filter((p: any) => !p.personFullName).map((p: any) => {
        p.exclude = true;
      });
      this.persons.filter((p: any) => !p.exclude).map((p: any) => {
        let partFirstName: any = p.firstname.toLowerCase().split(' ');
        let partMiddleName: any = p.personFullName.toLowerCase().split(' ');
        let prefixUsername: any = p.firstname.toLowerCase().substr(0,1);
        let newUsername = p.firstname.toLowerCase().substr(0,1);
        if (partFirstName.length > 1) {
          newUsername += partFirstName[1].substr(0,1);
          prefixUsername += partFirstName[1].substr(0,1);
        }
        newUsername += partMiddleName[0];
        let birthday = moment(p.birthday, 'YYYY-MM-DD');
        //console.log(birthday.date());
        newUsername += `${birthday.date()}`.padStart(2,'0');
        let newPassword: any = `${prefixUsername.substr(0,1).toUpperCase()}${prefixUsername.substr(1,1)}${p.idnumber.substr(0,p.idnumber.length-1)}-${p.idnumber.substr(-1)}`;
        // console.log(newUsername);
        // console.log(newPassword);
        p.username = newUsername;
        p.password = newPassword;
        p.selected = true;
      });
    } else {
      this.body.pagination.totalRecords = 0;
      this.persons = [];
    }
    this.countPersons();
  }

  async getCareerSetting() {
    let result: any = await this.Administrative.getCareerSetting().toPromise();
    this.careerSettings = result;
		//console.log(this.careerSettings);
  }

  async getBranchs() {
    let result: any = await this.RRHH.getCampus().toPromise();
    this.branchs = result;
    //console.log(result);
  }

  async getEnrollPeriods() {
    let result: any = await this.Administrative.getPeriods().toPromise();
    this.enrollPeriods = result;
    //console.log(result);
  }

  async getAdmissionPeriods() {
    let body = {
      text: '%'
    };
    let result: any = await this.Administrative.getAdmissionPeriodByIDTextLevelID(body).toPromise();
    this.allAdmissionPeriods = result;
    this.allAdmissionPeriods.map((a: any) => {
      a.initDate = a.admissionStart;
      a.endDate = a.admissionEnd;
    })
    this.admissionPeriodsFiltereds = this.allAdmissionPeriods.filter((p: any) => this.currentDate.isBetween(moment(p.admissionStart, 'YYYY-MM-DD'), moment(p.admissionEnd, 'YYYY-MM-DD')) && p.flagSettingCareer === 1);
    //console.log(this.admissionPeriodsFiltereds);
  }

  async openInitLoader() {
    Swal.fire({
      html: '<i class="fa fa-cog fa-spin fa-3x"></i> <br> <h2 class="text-center">Cargando Información necesaria.</h2>',
      showConfirmButton: false,
      showCancelButton: false,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    });
    let body: any = {
      // values: [
      //   { idnumber: '1720590189' }
      // ],
      // values: {
      //   idnumber: '1720590189'
      // },
      // criterias: [{ key: 'username', value: 'ccareyes1'}]
      criterias: [{ key: 'idnumber', value: '0704130624'}]
    };
    let coincidents: any = await this.MoodleIntegration.getUserMoodleByCriteria(body).toPromise();
    //console.log('><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<coincidents>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><');
    //console.log(coincidents);

    let bodyDelete: any = {
      userids: [13941]
    };
    let deleteds: any = await this.MoodleIntegration.deleteUserMoodle(bodyDelete).toPromise();
    //console.log(deleteds);


  }

  closeSwal() {
    Swal.close();
  }

  async getCategories() {
    let result: any = await this.MoodleIntegration.getCategories().toPromise();
    // console.log('categories', result);
    this.categories = result;
    this.categories.sort((a: any, b: any) => b.id - a.id);
    this.getCohorts();
  }

  async getCohorts() {
    let resultCohorts: any = await this.MoodleIntegration.getCohorts().toPromise();
    //console.log('resultCohorts', resultCohorts);
    this.categories.map((c: any) => {
      c._idnumber = c.idnumber;
			if(c.idnumber.includes('-M')) c.idnumber = `${c.name.substr(0,3)}-M-${c.name.substr(-5)}`.toUpperCase();
      else c.idnumber = `${c.name.substr(0,3)}-${c.name.substr(-5)}`.toUpperCase();
      c.cohorts = resultCohorts.filter((h: any) => h.idnumber.startsWith(c.idnumber));
    });
    this.getCourses();
  }

  async getCourses() {
    let result: any = await this.MoodleIntegration.getCourses().toPromise();
    this.courses = result;
		//console.log('courses', this.courses);
    this.categories.map((c: any) => {
      let coursesGenerics = this.courses.filter((z: any) => z.shortname.endsWith(`-${c.idnumber}`));
      coursesGenerics.map((z: any) => {
        z.isGeneric = true;
      });
      c.courses = this.courses.filter((x: any) => x.categoryid === c.id);
      this.verifyCoursesToMigrateOrRelationate(c);
      c.cohorts.map((x: any) => {
        x.courses = coursesGenerics;
        // Agregando cursos genericos
        let coursesOfCohorts = this.courses.filter((y: any) => y.shortname.endsWith(`-${x.idnumber}`));
        coursesOfCohorts.map((c: any) => {
          c.cohortID = x.cohortID;
          c.cohortIDNumber = x.idnumber;
          c.cohortName = x.name;
        });
        x.courses = x.courses.concat(coursesOfCohorts);

      });
    });
    //console.log('categories', this.categories);
    this.closeSwal();
  }

  verifyCoursesToMigrateOrRelationate(category: any) {
    category.courseToMigrate = category.courses.filter((y: any) => !y.migrated);
    category.courseToRelationate = category.courses.filter((y: any) => !y.relationed);
  }

  toggleShowCategories() {
    this.showCategories =  !this.showCategories;
  }

  toggleShowPeriods() {
    this.showPeriods =  !this.showPeriods;
  }

  toggleCategoryModal(category?: any) {
    if (this.categoryModal.isShown) {
      this.categoryModal.hide();
    } else {
      this.categoryModal.config.keyboard = false;
      this.categoryModal.config.ignoreBackdropClick = true;
      this.newCategory = {
        categoryID: this.categories.length + 1,
      };
      if (category) {
        this.newCategory = JSON.parse(JSON.stringify(category));
        // this.newCategory.editing = true;
        // console.log(this.newCategory)
        this.newCategory.editing = this.newCategory.hasOwnProperty('admissionPeriodID') && this.newCategory.admissionPeriodID !== undefined ? true : false;
      }
      this.categoryModal.show();
    }
  }

  config(category: any) {
    this.Router.navigate([`integracion-con-moodle/categoria/${category.categoryID}/cursos`]);
  }

  async getCareerAdmissionPeriod() {
    this.careerSettings.map((c: any) => {
      c.activate = false;
    });
    if (this.filter.branchID && this.filter.periodID && this.filter.admissionPeriodID) {
      let result: any = await this.Administrative.getCareerPeriodAdmissionPeriod(this.filter.branchID, this.filter.periodID, this.filter.admissionPeriodID).toPromise();
      //console.log(result, this.careerSettings);
      let pattern = (x: any) => `${x.modalityID}-${x.schoolID}-${x.careerID}-${x.abrev}`;
      let list = result.map((c: any) => pattern(c));
      this.careerSettings.map((c: any) => {
        let careerFound = result.find((x: any) => pattern(x) === pattern(c));
        if (careerFound) {
          if(careerFound.statusID) c.activate = true;
          c.careerPeriodID = careerFound.careerPeriodID;
        }
      });
			//console.log(this.careerSettings);
    }
  }

  saveCategory() {
    Swal.fire({
      title: `¿Estas seguro de ${!this.newCategory.editing ? 'crear' : 'editar'} la Categoria?`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        this.newCategory.userCreated = 'MIGRA';
        let body: any;
        let result: any;
        if (!this.newCategory.editing) {
          body = {
            news: [this.newCategory]
          };
          result = await this.MoodleIntegration.createCategories(body).toPromise();
        } else {
          body = {
            updates: [this.newCategory]
          };
          result = await this.MoodleIntegration.updateCategories(body).toPromise();
        }
        if (!result) {
          Swal.fire({
            title: `Hubo un problema al ${!this.newCategory.editing ? 'crear' : 'actualizar'} la Categoria`,
            icon: 'success',
          });
        }
        this.categories.push(this.newCategory);

        Swal.fire({
          title: `Se ${!this.newCategory.editing ? 'creó' : 'actualizó'} la Categoria`,
          icon: 'success',
        });
        this.getCategories();
        this.toggleCategoryModal();
      }
    })
  }

  delete(category: any) {
    Swal.fire({
      title: '¿Estas seguro de eliminar la Categoria?',
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        // this.categories.push(this.newCategory);
        this.categories.splice(this.categories.indexOf(category), 1);
        Swal.fire({
          title: `Se eliminó la Categoria`,
          icon: 'success',
        });
        this.getCategories();
      }
    })
  }

  async toggleShowDetail(c: any) {
    c.showDetail = !c.showDetail;
    if (c.showDetail) {
      let result: any = await this.Administrative.getCareerAdmissionPeriod(this.categoryFilter.branchID, c.admissionPeriodID).toPromise();
      //console.log(result);
      result.map((r: any) => {
        r.selected = true;
        // hacer logica para creados
      });
      c.careerSettings = result;
      //console.log(c);
    }
  }

  async toggleCohortModal(category?: any, item?: any) {
    if (this.cohortModal.isShown) {
      this.cohortModal.hide();
    } else {
      this.cohortModal.config.ignoreBackdropClick = true;
      this.cohortModal.config.keyboard = false;
      this.cohortModal.show();
      //console.log(category);
      this.newCohort = {
        categorytype: {
          type: 'idnumber',
          value: category._idnumber,
          // value: category.name
        },
        categoryId: category.categoryId,
        categoryIdNumber: category._idnumber,
        careerSettings: category.careerSettings
      };
      this.newCohort.careerSettings.map((c: any) => {
        c.seleted = true;
      })
      this.newCohort.careerSettings.map((c: any) => {
        let cohortFound = category.cohorts.find((x: any) => x.idnumber.endsWith(`-${c.abrev}`));
        if (cohortFound) {
          c.created = true;
          c.selected = false;
        }
      });
      this.countsRecords();
    }
  }

  toggleSelectToCreate(career: any) {
    career.selected = !career.selected;
    this.countsRecords();
  }

  countsRecords() {
    this.newCohort.quantitySelecteds = this.newCohort.careerSettings.filter((c: any) => c.selected).length;
    this.newCohort.quantityCreateds = this.newCohort.careerSettings.filter((c: any) => c.created).length;
  }

  saveCohort() {
    Swal.fire({
      title: '¿Estas seguro de crear el Cohorte?',
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        let toCreate: any = this.newCohort.careerSettings.filter((c: any) => c.selected);
        for (let i = 0; i < toCreate.length; i++) {
          let career: any = toCreate[i];
          career.creating = true;
          career.categorytype = {
            type: 'idnumber',
            value: this.newCohort.categoryIdNumber,
            // value: category.name
          };
          career.categoryId = this.newCohort.categoryId;
          career.name = `${this.newCohort.categoryIdNumber}-${career.abrev}`;
          career.name = `COHORTE DE ${career.careerName}`.toUpperCase();
          career.idnumber = `${this.newCohort.categoryIdNumber}-${career.abrev}`;
          career.userCreated = this.userLoged;
          let body: any = {
            news: [career]
          };
          let result: any = await this.MoodleIntegration.createCohorts(body).toPromise();
          //console.log(result);
          career.creating = false;
          career.created = true;
        }
        this.countsRecords();
        // if (!result) {
        //   Swal.fire({
        //     title: `Se ${!this.newCohort.editing ? 'creó' : 'actualizó'} la Categoria`,
        //     icon: 'success',
        //   });
        // }

        Swal.fire({
          title: `Se crearon los cohortes`,
          icon: 'success',
        });
        this.getCohorts();
        this.toggleCohortModal();
      }
    })
  }

  async toggleActivate(career: any) {
    career.activate = !career.activate;
    //console.log(career);
    if (career.activate) {
      let newCareerPeriod: any = {
        news: [
          {
            careerID: career.careerID,
            periodID: this.filter.periodID,
            periodAcademic: this.filter.periodID,
            branchID: this.filter.branchID,
            modalityID: career.modalityID,
            levelID: career.levelID,
            schoolID: career.schoolID,
            populationMin: 0,
            abrev: career.abrev,
            userCreated: this.userLoged,
            admissionPeriodID: this.filter.admissionPeriodID
          }
        ]
      };
      let result: any = await this.Administrative.postCareerAdmissionPeriod(newCareerPeriod).toPromise();
      career.careerPeriodID = result.careerPeriod[0].careerPeriodID;
      //console.log(result);
    } else {
      if (career.careerPeriodID) {
        let updateCareerPeriod: any = {
          updates: [
            {
              careerPeriodID: career.careerPeriodID,
              careerID: career.careerID,
              periodID: this.filter.periodID,
              periodAcademic: this.filter.periodID,
              branchID: this.filter.branchID,
              modalityID: career.modalityID,
              levelID: career.levelID,
              schoolID: career.schoolID,
              populationMin: 0,
              statusID: 0,
              abrev: career.abrev,
              userCreated: this.userLoged,
              admissionPeriodID: this.filter.admissionPeriodID
            }
          ]
        };
        let result: any = await this.Administrative.updateCareerAdmissionPeriod(updateCareerPeriod).toPromise();
      }
    }
  }

  toggleCourse(category?: any, isGeneric: boolean = false, cohort?: any) {
    if (this.courseModal.isShown) {
      this.courseModal.hide();
    } else {
      this.courseModal.config.keyboard = false;
      this.courseModal.config.ignoreBackdropClick = true;
      this.courseModal.show();
      this.courseConfig = {
        isGeneric: isGeneric
      };
      if (!this.courseConfig.isGeneric) {
        this.courseConfig.cohort = cohort;
      }
    }
    //console.log(category);
  }

  toggleShowCourses(cohort: any) {
    cohort.showCourses = !cohort.showCourses;
  }

  resetNewCourse() {
    this.newCourse = {};
  }

  selectTab(index: number) {
    this.showButtonsConfigCourse = index == 1;
  }

  toggleMigrateCourse(category?: any) {
    if (this.migrateCourseModal.isShown) {
      this.migrateCourseModal.hide();
    } else {
      this.categorySelected = category;
      this.migrateCourseModal.config.keyboard = false;
      this.migrateCourseModal.config.ignoreBackdropClick = true;
      this.migrateCourseModal.show();
    }
  }

  toggleRelationateCourse(category?: any) {
		//console.log(category);
    if (this.relationCourseModal.isShown) {
      this.relationCourseModal.hide();
    } else {
      this.categorySelected = category;
      this.relationCourseModal.config.keyboard = false;
      this.relationCourseModal.config.ignoreBackdropClick = true;
      this.relationCourseModal.show();
    }
  }

  toggleSelectecCourse(course: any, courses: any) {
    course.selected = !course.selected;
    this.verifyCoursesSelecteds(this.categorySelected, courses);
  }

  verifyCoursesSelecteds(category: any, courses: any) {
    category.existsSomeSelected = courses.some((c: any) => c.selected);
  }


  migrateCourses() {
    let coursesToMigrate: any = this.categorySelected.courseToMigrate.filter((c: any) => c.selected);
    Swal.fire({
      text: `¿Estas seguro de migrar los ${coursesToMigrate.length} cursos?`,
      icon: 'question',
      allowOutsideClick: false,
      allowEnterKey: false,
      allowEscapeKey: false,
      showConfirmButton: true,
      showCancelButton: true
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        this.migrating = true;
        let body: any = {
          news: coursesToMigrate.map((c: any) => {
            return {
              courseName: c.shortname,
              courseDesc: c.displayname,
              userCreated: this.userLoged,
            };
          })
        };

        let result: any = await this.MoodleIntegration.createLevelingCycleCourse(body).toPromise();
        //console.log(result);
        this.categorySelected.courses.map((c: any) => {
          let courseMigrate: any = result.find((x: any) => x.courseName === c.shortname);
          if (courseMigrate) {
            c.courseID = courseMigrate.courseID;
          }
        });

        //console.log(this.categorySelected);
        this.migrating = false;
        if (!result) {
          Swal.fire({
            text: 'Hubo un error al relacionar los cursos',
            icon: 'error'
          });
          return;
        }
        Swal.fire({
          text: 'Se relacionó correctamente los cursos',
          icon: 'success'
        });
        coursesToMigrate.map((c: any) => {
          c.selected = false;
          c.migrated = true;
        });
        this.verifyCoursesToMigrateOrRelationate(this.categorySelected);
        this.toggleMigrateCourse();
      }
    })

  }

  relationateCourses() {
    let coursesToRelationate: any = this.categorySelected.courseToRelationate.filter((c: any) => c.selected);
    Swal.fire({
      text: `¿Estas seguro de relacionar los ${coursesToRelationate.length} cursos?`,
      icon: 'question',
      allowOutsideClick: false,
      allowEnterKey: false,
      allowEscapeKey: false,
      showConfirmButton: true,
      showCancelButton: true
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        this.relationating = true;
        let body: any = {
          news: [
            ...this.categorySelected.courses.filter((c: any) => c.isGeneric && !c.relationed).map((c: any) => {
              let coursesGenerics: any = this.categorySelected.cohorts.map((x: any) => {
                return {
                  courseID: c.courseID,
                  admissionPeriodID: this.categorySelected.admissionPeriodID,
                  cohortID: x.cohortID,
                  idNumberMoodle: c.shortname,
                  userCreated: this.userLoged
                };
              })
              return coursesGenerics;
            }).flat(),
            ...coursesToRelationate.filter((c: any) => !c.isGeneric).map((c: any) => {
              return {
                courseID: c.courseID,
                admissionPeriodID: this.categorySelected.admissionPeriodID,
                cohortID: c.cohortID,
                idNumberMoodle: c.shortname,
                userCreated: this.userLoged
              }
            })
          ]
        };
        //console.log(body);
        let result: any = await this.MoodleIntegration.createLevelingClassSection(body).toPromise();
        //console.log(result);
        this.relationating = false;
        if (!result) {
          Swal.fire({
            text: 'Hubo un error al migrar los cursos',
            icon: 'error'
          });
          return;
        }
        Swal.fire({
          text: 'Se migró correctamente los cursos',
          icon: 'success'
        });
        coursesToRelationate.map((c: any) => {
          c.selected = false;
          c.relationed = true;
        });
        this.verifyCoursesToMigrateOrRelationate(this.categorySelected);
        this.toggleRelationateCourse();
      }
    })

  }

  goToInfo(course: any, cohort: any) {
    Swal.fire({
      text: '¿Estas seguro de ir a la Configuración del Curso?',
      icon: 'success',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      showConfirmButton: true,
      showCancelButton: true
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        this.Router.navigate([`integracion-con-moodle/configuracion/curso/${course.id}/${cohort.cohortID}`]);
      }
    });
  }

  toggleSelectPerson(person: any) {
    person.selected = !person.selected;
    this.countPersons();
  }

  countPersons() {
    this.body.selecteds = this.persons.filter((p: any) => p.selected).length;
  }

  changePage(page?: number) {
    if (page) {
      this.body.pagination.currentPage = page;
    }
    this.getPersonToSyncWithMoodle();
  }

  sync() {
    Swal.fire({
      text: `¿Estas seguro de sincronizar con Moodle los ${this.body.selecteds} estudiantes?`,
      icon: 'question',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#014898',
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        this.body.validating = true;
        //console.log(this.persons);
        let toValidate: any[] = this.persons.filter((p: any) => p.selected);
        for (let x = 0; x < toValidate.length; x++) {
          let student: any = toValidate[x];
          student.coincidents = [];
          student.validating = true;
          for (let s = 0; s < student.emails.length; s++) {
            let email = student.emails[s];
            let body: any = {
              criterias: [{ key: 'email', value: email}]
            };
            let coincidents: any = await this.MoodleIntegration.getUserMoodleByCriteria(body).toPromise();
            if (coincidents.users.length) {
              coincidents.users.map((c: any) => {
                c.emailToValidate = email;
              });
              student.coincidents = student.coincidents.concat(coincidents.users);
            }
          }
          if (student.coincidents.length) {
            //console.log(student);
            student.id = Math.max(student.coincidents.map((c: any) => c.id));
            let coincidentFound = student.coincidents.find((c: any) => c.id === student.id);
            if (coincidentFound) {
              student.userEmail = coincidentFound.emailToValidate;
              student.username = coincidentFound.username;
              student.password = student.idnumber;
            }
            let body: any = {
              news: [
                {
                  personID: student.personID,
                  userName: student.username,
                  userPassword: student.password,
                  userEmail: student.userEmail,
                  userIDMoodle: student.id,
                  userCreated: this.personID
                }
              ]

            };

            //console.log(body);
            let result: any = await this.MoodleIntegration.createUserMoodleIntegration(body).toPromise();
            if (!result.length) {
              student.error = true;
            }
            if (!student.error) {
              student.selected = false;
              student.exclude = true;
            }
            student.validated = true;
          }
          student.validating = false;
        }
        this.body.validating = false;
        Swal.fire({
          text: 'Se validaron los usuarios actuales',
          icon: 'success'
        });
        this.getPersonToSyncWithMoodle();
        // let body: any = {
        //   news: toValidate.filter((v: any) => v.id).map((v: any) => {
        //     return {
        //       personID: v.personID,
        //       userName: v.username,
        //       userPassword: v.password,
        //       userEmail: v.userEmail,
        //       userIDMoodle: v.id,
        //       userCreated: this.personID
        //     }
        //   })
        // };

        // console.log(body);

        // let result: any = await this.MoodleIntegration.createUserMoodle(body).toPromise();
      }
    })
  }

  toggleAdmissionPeriod(admissionPeriod?: any) {
    if (this.admissionPeriodModal.isShown) {
      this.admissionPeriodModal.hide();
    } else {
      this.admissionPeriodModal.config.keyboard = false;
      this.admissionPeriodModal.config.ignoreBackdropClick = true;
      this.newAdmissionPeriod = {};
      if (admissionPeriod) {
        this.newAdmissionPeriod = admissionPeriod;
        this.newAdmissionPeriod.editing = true;
      }else{
				this.newAdmissionPeriod.editing = false;
			}
      this.admissionPeriodModal.show();
    }
  }

  addAdmissionPeriod() {
    //console.log(this.newAdmissionPeriod);
    Swal.fire({
      text: '¿Estas seguro de guardar el Periodo de Admisión?',
      icon: 'question',
      showCancelButton: true,
      showConfirmButton: true,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        let result: any;
        let body: any = {};
        if (this.newAdmissionPeriod.editing) {
          body= {
            news: [this.newAdmissionPeriod]
          };
          result = await this.Administrative.saveAdmissionPeriod(body).toPromise();
        } else {
          body = {
            news: [this.newAdmissionPeriod]
          };
          result = await this.Administrative.saveAdmissionPeriod(body).toPromise();
        }
        if (!result) {
          Swal.fire({
            text: 'Hubo un error.',
            icon: 'error'
          });
          return;
        }
        Swal.fire({
          text: `${result[0].message}`,
          icon: 'success'
        });
        this.toggleAdmissionPeriod();
        this.getAdmissionPeriods();
      }
    })
  }

  passPostulant(category: any) {
    //console.log(category);
    Swal.fire({
      text: '¿Estas seguro de pasar los Postulantes?',
      icon: 'question',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      showConfirmButton: true,
      showCancelButton: true
    }).then( async(choice) => {
      if (choice.isConfirmed) {
        let result: any = await this.Administrative.postPassPostulant(category.admissionPeriodID).toPromise();
        if (!result) {
          Swal.fire({
            text: 'Hubo un error',
            icon: 'error'
          });
          return;
        }
        Swal.fire({
          text: 'Operación procesada correctamente',
          icon: 'success'
        });
      }
    })
  }

}
