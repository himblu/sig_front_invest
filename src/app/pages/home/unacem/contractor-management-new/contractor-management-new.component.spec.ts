import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractorManagementNewComponent } from './contractor-management-new.component';

describe('ContractorManagementNewComponent', () => {
  let component: ContractorManagementNewComponent;
  let fixture: ComponentFixture<ContractorManagementNewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ContractorManagementNewComponent]
    });
    fixture = TestBed.createComponent(ContractorManagementNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
