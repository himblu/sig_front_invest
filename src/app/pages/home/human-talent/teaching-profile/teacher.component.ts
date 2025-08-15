import { Component, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideNgxMask } from 'ngx-mask';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { AcademicTrainingComponent } from '@components/academic-training/academic-training.component';
import { WorkExperienceComponent } from '@components/work-experience/work-experience.component';
import { TrainingComponent } from '@components/training/training.component';
import { InvestigationComponent } from '@components/investigation/investigation.component';
import { ProfilePictureComponent } from '@components/profile-picture/profile-picture.component';
import { SocietyLinkageComponent } from '@components/society-linkage/society-linkage.component';
import { ReferencesComponent } from '@components/references/references.component';
import { QualitiesComponent } from '@components/qualities/qualities.component';
import { CommonService } from '@services/common.service';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';

@Component({
  selector: 'app-teacher',
  templateUrl: './teacher.component.html',
  styles: [
  ],
  standalone: true,
  imports: [
    MatStepperModule,
    ReactiveFormsModule,
    AcademicTrainingComponent,
    WorkExperienceComponent,
    TrainingComponent,
    InvestigationComponent,
    ProfilePictureComponent,
    SocietyLinkageComponent,
    ReferencesComponent,
    //QualitiesComponent,
  ],
  providers: [
    provideNgxMask()
  ]
})
export class TeacherComponent {

  @ViewChild('stepper', { static: true }) private stepper: MatStepper;

  firstFormGroup = this.fb.group({
    firstCtrl: [false, [Validators.required, Validators.requiredTrue]],
  });
  secondFormGroup = this.fb.group({
    secondCtrl: ['', Validators.required],
  });
  thirdFormGroup = this.fb.group({
    thirdCtrl: ['', Validators.required],
  });
  fourthFormGroup = this.fb.group({
    fourthCtrl: ['', Validators.required],
  });
  fifthFormGroup = this.fb.group({
    fifthCtrl: ['', Validators.required],
  });
  sixthFormGroup = this.fb.group({
    sixthCtrl: ['', Validators.required],
  });
  seventhFormGroup = this.fb.group({
    seventhCtrl: ['', Validators.required],
  });
  eightFormGroup = this.fb.group({
    eightCtrl: ['', Validators.required],
  });
  isEditable: boolean = true;
	//isEditableSiguiente: boolean = false;
  personID: number = 0;


  constructor(
    private fb: FormBuilder,
    private common: CommonService,
    private activeParams: ActivatedRoute
    ){}

  ngOnInit(): void {
    this.common.nextStep.subscribe({
      next: (res) => {
        console.log('res in ',res);

        if(res){
          if(res){
            this.stepper.next();
          }
        }
      }
    })
    this.activeParams.params.subscribe({
      next: (res:any) => {
        if(res){
          this.personID = res.id;
        }
      }
    })

  }


  valid( valid: boolean, form: string ){
    this.firstFormGroup.get(`${form}`)?.setValue(valid);
  }
  chargeID( personID: number ){
    this.personID = personID;
  }

	cambiarEditableDatos( term: boolean){
		/*console.log('antes', this.isEditableSiguiente)
		this.isEditableSiguiente = term;
		console.log('despues', this.isEditableSiguiente)*/
	}

}
