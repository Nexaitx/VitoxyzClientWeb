import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingTextBanner } from './booking-text-banner';

describe('BookingTextBanner', () => {
  let component: BookingTextBanner;
  let fixture: ComponentFixture<BookingTextBanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingTextBanner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingTextBanner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
