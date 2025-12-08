import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewStaffBookingHistory } from './view-staff-booking-history';

describe('ViewStaffBookingHistory', () => {
  let component: ViewStaffBookingHistory;
  let fixture: ComponentFixture<ViewStaffBookingHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewStaffBookingHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewStaffBookingHistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
