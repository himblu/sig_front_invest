import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '@services/common.service';
import { RrhhService } from '@services/rrhh.service';
import { MatTabsModule } from '@angular/material/tabs';
import { InvestigationProjectComponent } from './components/investigation-project/investigation-project.component';
import { BookPublishComponent } from './components/book-publish/book-publish.component';
import { PublishArticleComponent } from './components/publish-article/publish-article.component';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'components-investigation',
  templateUrl: './investigation.component.html',
  styles: [
  ],
  providers:[
    provideNgxMask()
  ],
  standalone: true,
  imports: [
    MatTabsModule,
    InvestigationProjectComponent,
    BookPublishComponent,
    PublishArticleComponent,
    NgxMaskDirective,
  ]
})
export class InvestigationComponent implements OnInit {

  /* *************************************** INPUTS & OUTPUTS ***************************************** */

  /* *************************************** ---------------- ***************************************** */


  /* ************************************ LISTAS GETTERS SETTERS ************************************** */

  /* *********************************** ------------------ ******************************************* */


  /* *********************************** VARIABLES GLOBALES ******************************************* */

  /* *********************************** ------------------ ******************************************* */


  /* *********************************** COSTRUCTOR Y CICLO DE VIDA *********************************** */

		  personID: number = 0;

  constructor( private fb: FormBuilder,
                private common: CommonService,
                private rrhh: RrhhService,
								private activateRoute: ActivatedRoute,
						 ){}

  ngOnInit(): void {
		this.activateRoute.params.subscribe({
		    next: (params: any) => {
		        this.personID = params.id;
						this.addForm();
		    }
		})
  }

  /* *********************************** -------------------------- *********************************** */


  /* *********************************** GETERS Y SETERS ********************************************** */

  /* *********************************** -------------------------- *********************************** */


  /* *********************************** FORMULARIOS DEL FORMULARIO *********************************** */

  investigationFrom: FormGroup;
  investigationBookFrom: FormGroup;

  private addForm(): void {
    this.investigationFrom = this.fb.group({
      dynamics: this.fb.array([])
    });
    this.investigationBookFrom = this.fb.group({
      dynamics: this.fb.array([])
    });
  }

  public myForm1: FormGroup = this.fb.group({
    investigationID:              ['',[Validators.required]],
    personID:                     ['',[Validators.required]],
    projectName:                  ['',[Validators.required]],
    investigationInstitution:     ['',[Validators.required]],
    investigationParticipantsNro: ['',[Validators.required]],
    investigationProjectPositionID: ['',[Validators.required]],
    investigationYearConvocation: ['',[Validators.required]],
    countryID: ['',[Validators.required]],
    user: ['',[Validators.required]],
    urlDocument: [''],
  });

  /* *********************************** FUNCIONES VARIAS ********************************************* */

  /* *********************************** -------------------------- *********************************** */
}
