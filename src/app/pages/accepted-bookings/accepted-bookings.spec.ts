import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceptedBookings } from './accepted-bookings';

describe('AcceptedBookings', () => {
  let component: AcceptedBookings;
  let fixture: ComponentFixture<AcceptedBookings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcceptedBookings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcceptedBookings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
