import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministrativeService } from '@services/administrative.service';
import { MoodleIntegrationService } from '@services/moodle-integration.service';
import { PipesModule } from 'app/pipes/pipes.module';
import * as moment from 'moment';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-course-moodle-integration',
  templateUrl: './course-moodle-integration.component.html',
  styleUrls: ['./course-moodle-integration.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    PipesModule
  ]
})
export class CourseMoodleIntegrationComponent implements OnInit{

  constructor(
    private Router: Router,
    private ActivatedRoute: ActivatedRoute,
    private Administrative: AdministrativeService,
    private MoodleIntegration: MoodleIntegrationService
  ) {

  }

  @ViewChild('postulantModal', {static: false}) postulantModal: ModalDirective;
  @ViewChild('sectionModal', {static: false}) sectionModal: ModalDirective;

  courseSelected: any = {};
  enrolls: any[] = [];
  enrollOriginals: any[] = [];
  legalizeds: any[] = [];
  courseIDMoodle: any;
  cohortID: any;
  gettingLegalizeds: boolean = true;

  search: any = {};
  founds: any[] = [];
  searched: boolean = false;
  postulantSeleteds: any[] = [];
  userLoged: any;
  filter: any = {};
  nextCourses: any[] = [];

  ngOnInit(): void {
    this.courseSelected = {};
    this.userLoged = sessionStorage.getItem('mail');
    Swal.fire({
      html: '<i class="fa fa-cog fa-spin fa-3x"></i> <br> <h2 class="text-center">Buscando Información del Curso.</h2>',
      showConfirmButton: false,
      showCancelButton: false,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    });
    this.nextCourses = [];
    let params: any = this.ActivatedRoute.snapshot.params;
    this.courseIDMoodle = parseInt(params.courseID);
    this.cohortID = parseInt(params.cohortID);
    this.getInfoCourse();
  }

  goBack() {
    sessionStorage.removeItem('courseSelected');
    this.Router.navigate(['integracion-con-moodle/configuracion']);
  }

  async getInfoCourse() {
    let resultCareerConfig: any = await this.Administrative.getCareerSetting().toPromise();
		//console.log('resultCareerConfig', resultCareerConfig);
    // let body: any = {
    //   // values: [
    //   //   { idnumber: '1720590189' }
    //   // ],
    //   // values: {
    //   //   idnumber: '1720590189'
    //   // },
    //   // criterias: [{ key: 'username', value: 'ccareyes1'}]
    //   criterias: [{ key: 'idnumber', value: '3445566666'}]
    // };
    // let coincidents: any = await this.MoodleIntegration.getUserMoodleByCriteria(body).toPromise();

    // let bodyDelete: any = {
    //   userids: [13933]
    // };
    // let deleteds: any = await this.MoodleIntegration.deleteUserMoodle(bodyDelete).toPromise();

    let anotherCourses: any = await this.MoodleIntegration.getCoursesByID(this.cohortID).toPromise();
    /* let courseInSession = JSON.parse(sessionStorage.getItem('courseSelected'));
    if (courseInSession) {
      this.courseIDMoodle = courseInSession.id;
    } */
    let courses: any = await this.MoodleIntegration.getCourseById(this.courseIDMoodle, this.cohortID).toPromise();
		//console.log('course', courses[0]);
    if (!courses.length) {
      Swal.fire({
        text: 'No existe el curso a ingresar. ¿Que haces aqui?',
        icon: 'warning',
        showCancelButton: false,
        showConfirmButton: true,
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false
      }).then(async (choice) => {
        if (choice.isConfirmed) {
          this.goBack();
        }
      });
      return;
    }

    this.courseSelected = courses[0];
		//console.log('courseSelected', this.courseSelected.id);
    sessionStorage.setItem('courseSelected', JSON.stringify(this.courseSelected));
    /* let parts: any = this.courseSelected.cohortIDNumberMoodle.split('-');
    let categoryID = parts.filter((i: string, k: number) => k < parts.length - 1).join('-');
    let anotherCoursesOfCohort: any[] = anotherCourses.filter((a: any) => a.cohortIDNumberMoodle).filter((a: any) => a.cohortIDNumberMoodle.endsWith(parts[parts.length - 1]));

    let genericCoursesOfCategory: any[] = anotherCourses.filter((a: any) => a.shortname).filter((a: any) => a.shortname.endsWith(categoryID));
    genericCoursesOfCategory = genericCoursesOfCategory.filter((g: any) => g.id !== this.courseSelected.id);


    this.nextCourses = [...anotherCoursesOfCohort, ...genericCoursesOfCategory].filter((g: any) => g.id !== this.courseSelected.id);
    this.nextCourses.sort((a: any, b: any) => a.id - b.id); */
		this.nextCourses= anotherCourses.filter((item: any) => item.id).filter((item: any) => item.id !== this.courseSelected.id);
		//console.log('nextCourses', this.nextCourses);

    let careerAbbr = this.courseSelected.cohortIDNumberMoodle.split('-');
    let careerSelected: any = resultCareerConfig.find((c: any) => c.abrev === careerAbbr[careerAbbr.length - 1]);
    if (careerSelected) {
      this.courseSelected.careerID = careerSelected.careerID;
    }

    if (!this.courseSelected) {
      Swal.fire({
        text: 'El curso no existe. No puedes estar aqui!',
        icon: 'error'
      });
      this.goBack();
      return;
    }
    let bodyQuizzes: any = {
      courseids: [this.courseSelected.id]
    };

    let resultQuizes: any = await this.MoodleIntegration.getQuizesOfListCourses(bodyQuizzes).toPromise();
    let filterQuizes: any = ['final', 'evaluación final', 'evaluacion final'];
    this.courseSelected.quizzes = resultQuizes.quizzes.filter((q: any) => filterQuizes.includes(q.name.toLowerCase()));

    let enrolls: any = await this.MoodleIntegration.getEnrollInCourse(this.courseSelected.admissionPeriodID, this.courseSelected.courseID, this.courseSelected.careerID).toPromise();
		//console.log('enrolls', enrolls);
    this.enrolls = enrolls;
    this.enrolls.map((r: any) => {
      r.score = r.score ? parseFloat(r.score) : r.score;
    });

    let closeSwal = this.enrolls.some((x: any) => x.score);

    // if (closeSwal) {
    //   Swal.close();
    // }
    //console.log(closeSwal);
    this.getGradesOfQuizzes(true);

    this.getPostulantsToEntoll();


    // this.courses = [];
  }

  /* goToNextCourse() {
    let nextCourse: any;
    if (this.nextCourses.length>1) {
      nextCourse = this.nextCourses.find((n: any) => n.id > this.courseSelected.id);
      if (!nextCourse) {
        nextCourse = this.nextCourses[0];
      }
    } else {
      nextCourse = this.nextCourses[0];
    }
    this.Router.navigate(['/integracion-con-moodle/configuracion/curso/', nextCourse.id, this.courseSelected.cohortID]);
    nextCourse.cohortID = this.courseSelected.cohortID;
    this.courseSelected = nextCourse;
    sessionStorage.setItem('courseSelected', JSON.stringify(this.courseSelected));
    this.ngOnInit();
  } */

	public nextCourse(): void {
		let nextCourse;
		if (this.nextCourses.length > 1) {
      nextCourse = this.nextCourses.find((n: any) => n.id > this.courseSelected.id);
      if (!nextCourse) nextCourse = this.nextCourses[0];
    } else nextCourse = this.nextCourses[0];
		//console.log(nextCourse.id);
		sessionStorage.setItem('courseSelected', JSON.stringify(nextCourse));
		let url= '/integracion-con-moodle/configuracion/curso/'+ nextCourse.id +'/'+ this.courseSelected.cohortID;
		location.href= url;
	}

  async getGradesOfQuizzes(isInitialLoad: boolean = false) {
    this.enrolls.map((e: any) => {
      e.quizzes = this.courseSelected.quizzes.map((q: any) => {return {id: q.id, name: q.name, grade: e.score, commentary: e.commentary, gradetopass: q.gradetopass}});
    });
    for (let y = 0; y < this.enrolls.length; y++) {
      const e = this.enrolls[y];
      for (let x = 0; x < e.quizzes.length; x++) {
        const q = e.quizzes[x];
        let bodyQuiz: any = {
          quizid: q.id,
          userid: e.userIDMoodle
        };
        let resultGradeOfUser: any = await this.MoodleIntegration.getBestGradeOfQuiz(bodyQuiz).toPromise();
        if (q.grade) {
          q.grade = q.grade < resultGradeOfUser.grade ? resultGradeOfUser.grade : q.grade;
          q.score = q.grade;
          e.grade = q.grade;
          e.score = e.grade;
        } else {
          q.grade = resultGradeOfUser.grade || 0;
          q.score = resultGradeOfUser.grade || 0;
          e.grade = q.grade;
          e.score = e.grade;
        }
      }
    }
    let toUpdates: any = this.enrolls.map((r: any) => {
      return {
        admissionPeriodID: r.admissionPeriodID,
        postulantID: r.postulantID,
        personID: r.personID,
        levelingClassSectionID: r.levelingClassSectionID,
        score: r.score,
        statusID: r.statusID,
        commentary: r.commentary || 'ACTUALIZACIÓN AUTOMÁTICA',
        userCreated: r.userCreated || this.userLoged
      }
    });
    let bodyUpdateLevelingEnroll = {
      updates: toUpdates
    }

    let resultUpdate: any = await this.MoodleIntegration.updateLevelingEnroll(bodyUpdateLevelingEnroll).toPromise();


    if (isInitialLoad) {
      Swal.close();
    }
  }

  async getPostulantsToEntoll() {
    let body: any = {
      filter: {
        statusFileID: 5,
        text: '%',
        rolID: 7,
        admissionPeriodID: this.courseSelected.admissionPeriodID
      }
    };

    let resultQuantity: any = await this.Administrative.getPostulantByTextQuantity(body).toPromise();

    body.pagination = {
      currentPage: 1,
      recordNumber: resultQuantity.quantity
    };

    /* let resultLegalizeds: any = await this.Administrative.getPostulantByText(body).toPromise();
		console.log('resultLegalizeds', resultLegalizeds); */
    let result: any = await this.MoodleIntegration.getLevelingLegalizedStudents(
			this.courseSelected.admissionPeriodID, this.courseSelected.careerID, this.cohortID, this.courseSelected.courseID
		).toPromise();
    //console.log('getLevelingLegalizeds', result);
    //result = result.filter((r: any) => resultLegalizeds.map((l: any) => l.postulantID).includes(r.postulantID));
    this.gettingLegalizeds = false;
    this.legalizeds = result;
		this.legalizeds.filter((l: any) => !l.flgCourse).map((l: any) => {
      l.selected = true;
    });
    /* this.legalizeds = this.legalizeds.filter((l: any) => l.careerID === this.courseSelected.careerID);
    this.legalizeds.map((l: any) => {
      l.inCourse = this.enrolls.find((e: any) => e.personID === l.personID) !== undefined;
    });  */
    this.validateEnroll();
  }

  validateEnroll() {
    this.filter.enrolleds = this.legalizeds.filter((l: any) => l.selected).length;
  }

  togglePostulant() {
    if (this.postulantModal.isShown) {
      this.postulantModal.hide();
    } else {
      this.postulantModal.config.keyboard = false;
      this.postulantModal.config.ignoreBackdropClick = true;
      this.postulantModal.show();
    }
  }

  toggleSelect(postulant: any) {
    postulant.selected = !postulant.selected;
    this.validateEnroll()
  }

  toggleSelectPostulant(postulant: any) {
    postulant.selected = !postulant.selected;
    if (postulant.selected) {
      this.postulantSeleteds.push(postulant);
    } else {
      this.postulantSeleteds = this.postulantSeleteds.filter((p: any) => p.postulantID !== postulant.postulantID);
    }
  }

  filterPostulant() {
    this.searched = false;
    let text = this.search.text.toLowerCase();
    this.founds = this.legalizeds.filter((l: any) =>
      l.documentNumber.toLowerCase().includes(text)
      || l.fullName.toLowerCase().includes(text)
    );
    this.searched = true;
  }

  enroll() {
    let toEnroll: any[] = JSON.parse(JSON.stringify(this.legalizeds.filter((l: any) => l.selected && !l.inCourse)));
    Swal.fire({
      text: `¿Estas seguro de agregar ${toEnroll.length == 1 ? 'al postulante' : `a los ${toEnroll.length} postulantes`}?`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonColor: '#014898',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        let body: any = {
          news: toEnroll.map((p: any) => {
            p.firstName = p.firstName.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
            p.middleName = p.middleName.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
            let partFirstName: any = p.firstName.toLowerCase().split(' ');
            let partMiddleName: any = p.middleName.toLowerCase().replace(/\s+/g, "");
            let prefixUsername: any = p.firstName.toLowerCase().substr(0,1);
            let newUsername = p.firstName.toLowerCase().substr(0,1);
            if (partFirstName.length > 1) {
              newUsername += partFirstName[1].substr(0,1);
              prefixUsername += partFirstName[1].substr(0,1);
            }
            newUsername += partMiddleName;
            let birthday = moment(p.birthday, 'YYYY-MM-DD');

            newUsername += `${birthday.date()}`.padStart(2,'0');
						let score: any= null;
            let newPassword: any = `${prefixUsername.substr(0,1).toUpperCase()}${prefixUsername.substr(1,1)}${p.documentNumber.substr(0,p.documentNumber.length-1)}-${p.documentNumber.substr(-1)}`;
            return {
              auth: 'manual',
              username: newUsername,
              password: newPassword,
              firstname: `${p.firstName}`.toLowerCase(),
              lastname: `${p.middleName} ${p.lastName}`.toLowerCase(),
              email: `${p.emailDesc}`.toLowerCase(),
              idnumber: `${p.documentNumber}`,
              lang: 'es',
              calendartype: 'gregorian',
              personID: p.personID,
              cohortIDNumberMoodle: this.courseSelected.cohortIDNumberMoodle,
              postulantID: p.postulantID,
              userName: `I${p.documentNumber}`,
              userPassword: p.documentNumber,
              userEmail: `${p.emailDesc}`.toLowerCase(),
              userCreated: this.userLoged,
              levelingClassSectionID: this.courseSelected.levelingClassSectionID,
              admissionPeriodID: this.courseSelected.admissionPeriodID,
              userExistMoodle: p.userExistMoodle,
              userIDMoodle: p.userIDMoodle,
              score: score
            }
          })
        };
        let result: any = await this.MoodleIntegration.createUserMoodle(body).toPromise();
        Swal.fire({
          text: 'Se asignó al postulante al curso',
          icon: 'success',
        });
        toEnroll.map((p: any) => {
          let userResultFound: any = result.find((r: any) => r.personID === p.personID);
          if (userResultFound) {
            p.userIDMoodle = userResultFound.userIDMoodle;
          }
        });
        this.enrolls = this.enrolls.concat(toEnroll);
        this.getGradesOfQuizzes();
        toEnroll = [];
        this.legalizeds.map((l: any) => {
          l.selected = false;
        });
        this.getPostulantsToEntoll();
      }
    })
  }

  toggleEditGrades() {
    this.courseSelected.edit = !this.courseSelected.edit;
    if (this.courseSelected.edit) {
      this.enrollOriginals = JSON.parse(JSON.stringify(this.enrolls));
    } else {
      Swal.fire({
        text: '¿Estas seguro de cambiar a modo NO EDITABLE, no se conservaran los cambios?',
        icon: 'question',
        showCancelButton: true,
        showConfirmButton: true,
        allowEnterKey: false,
        allowOutsideClick: false,
        allowEscapeKey: false
      }).then(async (choice) => {
        if (choice.isConfirmed) {
          this.enrolls = this.enrollOriginals;
        }
        if (choice.isDenied) {
          this.courseSelected.edit = !this.courseSelected.edit;
        }
      });

    }
  }

  changeGrade(enrolled: any, quiz: any) {
    quiz.hasChanged = this.enrollOriginals.find((e: any) => e.personID === enrolled.personID).quizzes.find((q: any) => q.id === quiz.id).grade !== quiz.grade;
  }

  deleteOfCourse(postulant: any) {
    if (postulant.quizzes.filter((q: any) => q.grade).length) {
      Swal.fire({
        text: 'No puedes eliminar el postulante del Curso, ya que tiene nota cargada!',
        icon: 'warning'
      });
      return;
    }
    Swal.fire({
      text: `¿Estas seguro de ELIMINAR a ${postulant.fullName} del curso: ${this.courseSelected.displayname}?`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        let bodyDelete: any = {
          members: [
            {
              cohortid: this.courseSelected.cohortIDMoodle,
              userid: postulant.userIDMoodle
            }
          ],
          enrolls: [postulant].map((p: any) => {
            return {
              admissionPeriodID: p.admissionPeriodID,
              postulantID: p.postulantID,
              personID: p.personID,
              levelingClassSectionID: p.levelingClassSectionID,
              score: p.score,
              statusID: 0,
              userCreated: p.userCreated,
            };
          })
        };
        let deleteds: any = await this.MoodleIntegration.deleteMemberOfCourse(bodyDelete).toPromise();

        this.enrolls = this.enrolls.filter((e: any) => e.personID !== postulant.personID);
        this.getPostulantsToEntoll();
        Swal.fire({
          text: 'Se eliminó al postulante del curso',
          icon: 'success'
        });
      }
    })

  }

  saveGrades() {

    Swal.fire({
      text: '¿Estas seguro de guardar las Notas de los participantes?',
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        let body: any = {
          updates: this.enrolls.map((e: any) => {
            return {
              admissionPeriodID: e.admissionPeriodID,
              postulantID: e.postulantID,
              levelingClassSectionID: e.levelingClassSectionID,
              score: e.quizzes.map((q: any) => parseFloat(q.grade.toFixed(2))).flat()[0],
              commentary: e.quizzes.map((q: any) => q.commentary).flat()[0] || undefined,
              statusID: 1,
              userCreated: this.userLoged || 'MIGRA'
            }
          })
        };
        let result: any = await this.MoodleIntegration.updateLevelingEnroll(body).toPromise();
        if (!result) {
          Swal.fire({
            text: 'Hubo un error en la actualización de Notas',
            icon: 'error'
          });
          return;
        }
        Swal.fire({
          text: 'Se guardaron las notas correctamente',
          icon: 'success'
        });
        this.enrollOriginals = this.enrolls;
        this.courseSelected.edit = false;
      }
    })
  }

}
