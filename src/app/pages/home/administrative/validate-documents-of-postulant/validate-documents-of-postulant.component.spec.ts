import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidateDocumentsOfPostulantComponent } from './validate-documents-of-postulant.component';

describe('ValidateDocumentsOfPostulantComponent', () => {
  let component: ValidateDocumentsOfPostulantComponent;
  let fixture: ComponentFixture<ValidateDocumentsOfPostulantComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ValidateDocumentsOfPostulantComponent]
    });
    fixture = TestBed.createComponent(ValidateDocumentsOfPostulantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
