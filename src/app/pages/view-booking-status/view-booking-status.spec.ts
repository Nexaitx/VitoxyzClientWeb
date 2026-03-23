import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBookingStatus } from './view-booking-status';

describe('ViewBookingStatus', () => {
  let component: ViewBookingStatus;
  let fixture: ComponentFixture<ViewBookingStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewBookingStatus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewBookingStatus);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
