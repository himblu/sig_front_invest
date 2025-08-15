import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrUpdateEditorialComponent } from './create-or-update-editorial.component';

describe('CreateOrUpdateEditorialComponent', () => {
  let component: CreateOrUpdateEditorialComponent;
  let fixture: ComponentFixture<CreateOrUpdateEditorialComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CreateOrUpdateEditorialComponent]
    });
    fixture = TestBed.createComponent(CreateOrUpdateEditorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
