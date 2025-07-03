import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewStaff } from './view-staff';

describe('ViewStaff', () => {
  let component: ViewStaff;
  let fixture: ComponentFixture<ViewStaff>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewStaff]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewStaff);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
