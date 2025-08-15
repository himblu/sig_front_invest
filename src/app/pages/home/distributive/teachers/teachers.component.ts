import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CareerDetail, SPGetCareer, StudyPlan } from '@utils/interfaces/campus.interfaces';
import { AdministrativeService } from '@services/administrative.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { NgForOf, NgIf, TitleCasePipe } from '@angular/common';
import { ProgressComponent } from '@components/progress/progress.component';

@Component({
  selector: 'app-teachers',
  templateUrl: './teachers.component.html',
  styles: [
  ],
  standalone: true,
  imports: [
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    NgForOf,
    NgIf,
    ProgressComponent,
    TitleCasePipe,
  ]
})

export class TeachersComponent implements OnInit{

  /* *************************************** INPUTS & OUTPUTS ***************************************** */

  /* *************************************** ---------------- ***************************************** */


  /* ************************************ LISTAS GETTERS SETTERS ************************************** */

  /* *********************************** ------------------ ******************************************* */


  /* *********************************** VARIABLES GLOBALES ******************************************* */

  cargando: boolean = false;
  careerList: SPGetCareer[] = [];
  studyPlanList: StudyPlan[] = [];
  studyPlan: number = 0;
  careerPlan: number = 0;
  careerDetailTable: CareerDetail[] = [];
  teacherTable: any[] = [];
  /* *********************************** ------------------ ******************************************* */


  /* *********************************** COSTRUCTOR Y CICLO DE VIDA *********************************** */

  constructor( private admin: AdministrativeService,
                private fb:FormBuilder){}

  ngOnInit(): void {
    this.loading();
    this.selects.get('studyPlan').valueChanges
    .subscribe( resp => {
      this.studyPlan = resp
      this.materCharging();
    });
  this.selects.get('career').valueChanges
    .subscribe( resp => {
      this.careerPlan = resp;
        this.materCharging();
    });
    this.selects.get('matter').valueChanges
      .subscribe( resp => {
        this.admin.getTeachersExperienceMatterBySubject(resp)
        .subscribe( (resp:any) => {
          console.log(resp);

          this.teacherTable = resp.data;
        })
      })

  }

  /* *********************************** -------------------------- *********************************** */


  /* *********************************** GETERS Y SETERS ********************************************** */

  /* *********************************** -------------------------- *********************************** */


  /* *********************************** FORMULARIOS DEL FORMULARIO *********************************** */

  public selects: FormGroup = this.fb.group({
    studyPlan: [0, [Validators.required, Validators.min(1)]],
    career:    [0, [Validators.required, Validators.min(1)]],
    matter:    [0, [Validators.required, Validators.min(1)]],
  });
  /* *********************************** -------------------------- *********************************** */


  /* *********************************** FUNCIONES VARIAS ********************************************* */
  loading(){
    this.cargando = true;
    this.admin.getStudyPlan()
      .subscribe( plan => {
        this.studyPlanList = plan;
      });
    this.admin.getCareers()
      .subscribe( career => {
        this.careerList = career.data;
      })
  }

  materCharging(){
    if(this.studyPlan > 0 && this.careerPlan > 0)
    this.admin.getMatterPlan(this.studyPlan, this.careerPlan)
      .subscribe( resp => {
        this.careerDetailTable = resp.data;
      });
  }

  teacherUpdate(item:any){
    console.log(item);

  }
  /* *********************************** -------------------------- *********************************** */
}
