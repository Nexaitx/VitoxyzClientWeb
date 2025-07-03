import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Authorization } from './authorization';

describe('Authorization', () => {
  let component: Authorization;
  let fixture: ComponentFixture<Authorization>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Authorization]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Authorization);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
