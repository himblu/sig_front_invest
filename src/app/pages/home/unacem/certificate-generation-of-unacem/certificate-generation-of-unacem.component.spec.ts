import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateGenerationOfUnacemComponent } from './certificate-generation-of-unacem.component';

describe('CertificateGenerationOfUnacemComponent', () => {
  let component: CertificateGenerationOfUnacemComponent;
  let fixture: ComponentFixture<CertificateGenerationOfUnacemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CertificateGenerationOfUnacemComponent]
    });
    fixture = TestBed.createComponent(CertificateGenerationOfUnacemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
