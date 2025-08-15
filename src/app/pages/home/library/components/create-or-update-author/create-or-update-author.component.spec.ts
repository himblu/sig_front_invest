import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrUpdateAuthorComponent } from './create-or-update-author.component';

describe('CreateOrUpdateAuthorComponent', () => {
  let component: CreateOrUpdateAuthorComponent;
  let fixture: ComponentFixture<CreateOrUpdateAuthorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CreateOrUpdateAuthorComponent]
    });
    fixture = TestBed.createComponent(CreateOrUpdateAuthorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
